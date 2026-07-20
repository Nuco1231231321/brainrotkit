export const gameplayBackgrounds = [
  {
    id: "voxel-rush",
    name: "Voxel Rush",
    description: "First-person block jumps with constant forward motion.",
    videoSrc: null as string | null,
  },
  {
    id: "night-drive",
    name: "Night Drive",
    description: "Fast road movement, passing gates and city lights.",
    videoSrc: null as string | null,
  },
  {
    id: "marble-flow",
    name: "Marble Flow",
    description: "A clean satisfying loop with falling marbles and moving rails.",
    videoSrc: null as string | null,
  },
  {
    id: "cinematic-dash",
    name: "Cinematic Dash",
    description: "Real generated vertical loop — denser motion than pure code backgrounds.",
    videoSrc: "/showcase/moonbound-cart-dash.mp4" as string | null,
  },
] as const;

export type GameplayBackgroundId = (typeof gameplayBackgrounds)[number]["id"];

export function normalizeGameplayBackgroundId(value: unknown): GameplayBackgroundId {
  if (gameplayBackgrounds.some((background) => background.id === value)) {
    return value as GameplayBackgroundId;
  }
  return "voxel-rush";
}

export function getGameplayBackground(id: unknown) {
  const normalized = normalizeGameplayBackgroundId(id);
  return gameplayBackgrounds.find((background) => background.id === normalized) ?? gameplayBackgrounds[0];
}