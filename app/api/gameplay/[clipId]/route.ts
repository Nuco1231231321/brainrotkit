import { findGameplayClip } from "@/lib/create-studio";
import { createSignedMediaUrl } from "@/lib/storage";

const gameplayStoragePrefix = "presets/gameplay";

function storagePathForClip(clipId: string) {
  return `${gameplayStoragePrefix}/${clipId}.mp4`;
}

async function resolveGameplayUrl(clipId: string, sourceUrl: string) {
  try {
    return {
      source: "supabase" as const,
      url: await createSignedMediaUrl(storagePathForClip(clipId), 3_600),
    };
  } catch (error) {
    console.warn(`Supabase gameplay ${clipId} is unavailable; using the source CDN.`, error);
    return { source: "source-cdn" as const, url: sourceUrl };
  }
}

export async function GET(_request: Request, context: { params: Promise<{ clipId: string }> }) {
  const { clipId } = await context.params;
  const clip = findGameplayClip(clipId);
  if (!clip) return Response.json({ error: "Gameplay preset not found." }, { status: 404 });

  const target = await resolveGameplayUrl(clip.id, clip.sourceUrl);
  return new Response(null, {
    status: 302,
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=300",
      Location: target.url,
      "X-Content-Type-Options": "nosniff",
      "X-Gameplay-Source": target.source,
    },
  });
}
