import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/cloudflare";
import { createSignedMediaUrl } from "@/lib/storage";

type AssetRow = { storage_path: string; content_type: string };

const showcaseAssetIds: Record<string, string> = {
  "moonbound-cart-dash-poster": "e6b80761-230e-4934-a4e0-959d6b00b5a9",
  "moonbound-cart-dash-video": "3bc6b7cb-b872-44fe-8fd3-069970f78b86",
  "retrieval-practice-poster": "1c9dc03a-a0cc-4675-80eb-b98000123954",
  "retrieval-practice-video": "80bda919-906d-4823-92fb-39a91c8da4ad",
  "turbo-tostino-poster": "8ab0eff4-d75a-4b2c-a3c4-95888b728098",
  "turbo-tostino-video": "92fe492f-9701-4396-9d55-ae01d189b373",
  "vox-macchiato-audio": "a10c2773-2563-4d7a-bcab-ef0861b9de45",
};

export async function GET(_request: Request, context: { params: Promise<{ asset: string }> }) {
  const { asset } = await context.params;
  const assetId = showcaseAssetIds[asset];
  if (!assetId) return NextResponse.json({ error: "Showcase asset not found." }, { status: 404 });

  const db = await getDatabase();
  const storedAsset = await db.prepare(
    "SELECT storage_path, content_type FROM media_assets WHERE id = ?",
  ).bind(assetId).first<AssetRow>();
  if (!storedAsset) return NextResponse.json({ error: "Showcase asset is unavailable." }, { status: 404 });

  const signedUrl = await createSignedMediaUrl(storedAsset.storage_path, 3_600);
  const response = NextResponse.redirect(signedUrl, 302);
  response.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=300");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}
