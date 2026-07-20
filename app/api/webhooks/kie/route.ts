import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/cloudflare";
import { getKieWebhookSecret, parseKieTaskData, type KieTaskRecord } from "@/lib/kie";
import { processKieTaskUpdate } from "@/lib/generation";

async function hmacSignature(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
}

async function payloadHash(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (item) => item.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  const bodyText = await request.text();
  let body: { data?: unknown; taskId?: unknown; task_id?: unknown };
  try {
    body = JSON.parse(bodyText) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid webhook JSON." }, { status: 400 });
  }

  const data = body.data ?? body;
  let task: KieTaskRecord;
  try {
    task = parseKieTaskData(data);
    const timestamp = request.headers.get("X-Webhook-Timestamp") ?? "";
    const signature = request.headers.get("X-Webhook-Signature") ?? "";
    const timestampSeconds = Number(timestamp);
    if (!/^\d+$/.test(timestamp) || !Number.isSafeInteger(timestampSeconds) || Math.abs(Math.floor(Date.now() / 1_000) - timestampSeconds) > 300) {
      return NextResponse.json({ error: "Webhook timestamp is invalid." }, { status: 401 });
    }
    const expected = await hmacSignature(`${task.taskId}.${timestamp}`, await getKieWebhookSecret());
    if (!constantTimeEqual(expected, signature)) return NextResponse.json({ error: "Webhook signature is invalid." }, { status: 401 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook validation failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const db = await getDatabase();
  const hash = await payloadHash(bodyText);
  const inserted = await db.prepare(
      `INSERT OR IGNORE INTO provider_events (id, provider_task_id, payload_hash, state, status, created_at)
        VALUES (?, ?, ?, ?, 'processing', ?)`,
    ).bind(crypto.randomUUID(), task.taskId, hash, task.state, Date.now()).run();
  if (inserted.meta.changes !== 1) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    await processKieTaskUpdate(task);
    await db.prepare(
      `UPDATE provider_events SET status = 'processed', processed_at = ? WHERE payload_hash = ?`,
    ).bind(Date.now(), hash).run();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook processing failed.";
    await db.prepare(
      `UPDATE provider_events SET status = 'failed', error = ?, processed_at = ? WHERE payload_hash = ?`,
    ).bind(message.slice(0, 500), Date.now(), hash).run();
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
