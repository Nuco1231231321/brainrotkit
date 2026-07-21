import { gameplayClips } from "@/lib/create-studio";

export const gameplayBackgrounds = gameplayClips;

export type GameplayBackgroundId = (typeof gameplayBackgrounds)[number]["id"];

const legacyBackgroundIds: Record<string, GameplayBackgroundId> = {
  "voxel-rush": "subway-neon",
  "pixel-platform": "subway-city",
  "snow-sprint": "temple-cliffs",
  "night-drive": "trackmania-stadium",
  "marble-flow": "temple-ruins",
};

export function normalizeGameplayBackgroundId(value: unknown): GameplayBackgroundId {
  const candidate = typeof value === "string" ? legacyBackgroundIds[value] ?? value : "";
  if (gameplayBackgrounds.some((background) => background.id === candidate)) {
    return candidate as GameplayBackgroundId;
  }
  return gameplayBackgrounds[0].id;
}

export function getGameplayBackground(id: unknown) {
  const normalized = normalizeGameplayBackgroundId(id);
  return gameplayBackgrounds.find((background) => background.id === normalized) ?? gameplayBackgrounds[0];
}
