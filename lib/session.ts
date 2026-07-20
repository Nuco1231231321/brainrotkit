import "server-only";
import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const sessionCookieName = "__Host-brainrotkit_session";
export const sessionMaxAgeSeconds = 30 * 24 * 60 * 60;

type SessionEnvironment = CloudflareEnv & {
  AUTH_SECRET?: string;
};

async function getSessionSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as SessionEnvironment).AUTH_SECRET ?? null;
  } catch {
    return null;
  }
}

function bytesToHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (value) => value.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(value: string) {
  if (!/^[a-f0-9]{64}$/i.test(value)) return null;
  const bytes = new Uint8Array(32);
  for (let index = 0; index < value.length; index += 2) {
    bytes[index / 2] = Number.parseInt(value.slice(index, index + 2), 16);
  }
  return bytes;
}

async function importSessionKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(userId: string) {
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(userId)) {
    throw new Error("Cannot create a session for an invalid user identifier.");
  }
  const secret = await getSessionSecret();
  if (!secret) throw new Error("AUTH_SECRET is required to create a BrainrotKit session.");

  const expiresAt = Math.floor(Date.now() / 1000) + sessionMaxAgeSeconds;
  const payload = `${userId}.${expiresAt}`;
  const signature = await crypto.subtle.sign(
    "HMAC",
    await importSessionKey(secret),
    new TextEncoder().encode(payload),
  );
  return `${payload}.${bytesToHex(signature)}`;
}

export async function verifySessionToken(token: string | null | undefined) {
  if (!token) return null;
  const [userId, expiresAtValue, signatureValue, ...extra] = token.split(".");
  if (extra.length || !userId || !expiresAtValue || !signatureValue) return null;
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(userId)) return null;

  const expiresAt = Number(expiresAtValue);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return null;
  const signature = hexToBytes(signatureValue);
  if (!signature) return null;

  const secret = await getSessionSecret();
  if (!secret) return null;
  const payload = `${userId}.${expiresAtValue}`;
  const valid = await crypto.subtle.verify(
    "HMAC",
    await importSessionKey(secret),
    signature,
    new TextEncoder().encode(payload),
  );
  return valid ? userId : null;
}

export async function getSessionUserId() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(sessionCookieName)?.value);
}
