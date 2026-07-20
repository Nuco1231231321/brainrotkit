export type RenderMode = "gameplay" | "ai-motion";

export const gameplayDurations = [15, 30, 45, 60] as const;
export const aiMotionDurations = [5, 15] as const;

export function getRenderMode(settings: Record<string, unknown> | undefined): RenderMode {
  return settings?.renderMode === "ai-motion" ? "ai-motion" : "gameplay";
}

export function creditCostForRender(input: {
  type: string;
  durationSeconds: number;
  renderMode?: RenderMode;
}) {
  if (input.type === "voice") return 2;
  if (input.renderMode === "ai-motion") return input.durationSeconds <= 5 ? 10 : 35;
  if (input.durationSeconds <= 15) return 8;
  if (input.durationSeconds <= 30) return 15;
  if (input.durationSeconds <= 45) return 22;
  return 28;
}

export function isAllowedDuration(renderMode: RenderMode, durationSeconds: number) {
  return renderMode === "ai-motion"
    ? aiMotionDurations.includes(durationSeconds as (typeof aiMotionDurations)[number])
    : gameplayDurations.includes(durationSeconds as (typeof gameplayDurations)[number]);
}
