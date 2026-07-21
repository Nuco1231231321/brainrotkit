import { findGameplayClip, type GameplayClip } from "@/lib/create-studio";
import { createSignedMediaUrl } from "@/lib/storage";

const gameplayStoragePrefix = "presets/gameplay";

function storagePathForClip(clipId: string) {
  return `${gameplayStoragePrefix}/${clipId}.mp4`;
}

async function fetchVideo(request: Request, sourceUrl: string) {
  const range = request.headers.get("range");
  return fetch(sourceUrl, {
    redirect: "follow",
    headers: range ? { Range: range } : undefined,
  });
}

async function fetchStoredVideo(request: Request, clip: GameplayClip) {
  try {
    const signedUrl = await createSignedMediaUrl(storagePathForClip(clip.id), 3_600);
    const response = await fetchVideo(request, signedUrl);
    if (response.ok) return { response, source: "supabase" } as const;
    console.warn(`Supabase gameplay ${clip.id} returned ${response.status}; using the source CDN.`);
  } catch (error) {
    console.warn(`Supabase gameplay ${clip.id} is unavailable; using the source CDN.`, error);
  }

  return { response: await fetchVideo(request, clip.sourceUrl), source: "source-cdn" } as const;
}

function copyVideoHeaders(source: Response, storageSource: "supabase" | "source-cdn") {
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    "Content-Type": source.headers.get("content-type") || "video/mp4",
    "X-Content-Type-Options": "nosniff",
    "X-Gameplay-Source": storageSource,
  });
  for (const name of ["accept-ranges", "content-length", "content-range", "etag", "last-modified"]) {
    const value = source.headers.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}

export async function GET(request: Request, context: { params: Promise<{ clipId: string }> }) {
  const { clipId } = await context.params;
  const clip = findGameplayClip(clipId);
  if (!clip) return Response.json({ error: "Gameplay preset not found." }, { status: 404 });

  const { response, source } = await fetchStoredVideo(request, clip);
  if (!response.ok || !response.body) {
    return Response.json(
      { error: `Gameplay preset is unavailable (source status ${response.status}).` },
      { status: 502 },
    );
  }

  return new Response(response.body, {
    status: response.status,
    headers: copyVideoHeaders(response, source),
  });
}
