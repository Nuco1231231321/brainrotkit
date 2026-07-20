import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/cloudflare";
import { createSignedMediaUrl } from "@/lib/storage";
import { getSessionUserId } from "@/lib/session";

type AssetRow = { storage_path: string; content_type: string };

export async function GET(request: Request, context: { params: Promise<{ assetId: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { assetId } = await context.params;
  const db = await getDatabase();
  const asset = await db.prepare(
    `SELECT storage_path, content_type FROM media_assets WHERE id = ? AND user_id = ?`,
  ).bind(assetId, userId).first<AssetRow>();
  if (!asset) return NextResponse.json({ error: "Media asset not found." }, { status: 404 });
  const signedUrl = await createSignedMediaUrl(asset.storage_path, 3_600);
  const requestUrl = new URL(request.url);
  const download = requestUrl.searchParams.get("download") === "1";
  const stream = requestUrl.searchParams.get("stream") === "1";
  if (!download && !stream) return NextResponse.redirect(signedUrl, 302);
  const source = await fetch(signedUrl);
  if (!source.ok || !source.body) {
    return NextResponse.json({ error: "Media download is temporarily unavailable." }, { status: 502 });
  }
  const filename = asset.storage_path.split("/").pop()?.replace(/[^a-zA-Z0-9._-]/g, "-") ?? "brainrotkit-output";
  const headers = new Headers({
    "Cache-Control": "private, no-store",
    "Content-Type": asset.content_type,
    "X-Content-Type-Options": "nosniff",
  });
  if (download) headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  const contentLength = source.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);
  return new Response(source.body, { status: 200, headers });
}
