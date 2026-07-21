/**
 * Real gameplay sources used by the browser compositor.
 *
 * We intentionally keep the source page and licence next to the media URL so
 * the editor can show provenance before a creator exports a publishable clip.
 * These are open/licensed recordings, not copied footage from a competitor.
 */
export const gameplayBackgrounds = [
  {
    id: "voxel-rush",
    name: "Voxel Rush",
    description: "Open voxel sandbox footage with forward movement and depth.",
    videoSrc: "https://upload.wikimedia.org/wikipedia/commons/9/92/MineClone2_-_Release_0.84_-_The_Very_Nice_Release.webm",
    posterSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/MineClone2_-_Release_0.84_-_The_Very_Nice_Release.webm/500px--MineClone2_-_Release_0.84_-_The_Very_Nice_Release.webm.jpg",
    durationSeconds: 86,
    license: "CC BY 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:MineClone2_-_Release_0.84_-_The_Very_Nice_Release.webm",
  },
  {
    id: "pixel-platform",
    name: "Pixel Platform",
    description: "SuperTux platforming with readable motion and clean silhouettes.",
    videoSrc: "https://upload.wikimedia.org/wikipedia/commons/2/24/Gameplay_of_SuperTux_%288_Minutes%29.webm",
    posterSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Gameplay_of_SuperTux_%288_Minutes%29.webm/500px--Gameplay_of_SuperTux_%288_Minutes%29.webm.jpg",
    durationSeconds: 475,
    license: "GPL",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Gameplay_of_SuperTux_(8_Minutes).webm",
  },
  {
    id: "snow-sprint",
    name: "Snow Sprint",
    description: "Tux Racer downhill movement built for fast vertical crops.",
    videoSrc: "https://upload.wikimedia.org/wikipedia/commons/d/de/Tux_Racer_gameplay_%28Ingo%27s_Speedway%29.webm",
    posterSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Tux_Racer_gameplay_%28Ingo%27s_Speedway%29.webm/500px--Tux_Racer_gameplay_%28Ingo%27s_Speedway%29.webm.jpg",
    durationSeconds: 65,
    license: "GPL",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Tux_Racer_gameplay_(Ingo%27s_Speedway).webm",
  },
  {
    id: "snow-sprint-trail",
    name: "Snow Sprint Trail",
    description: "A second Tux Racer route with a wider camera and steady pace.",
    videoSrc: "https://upload.wikimedia.org/wikipedia/commons/3/33/Tux_Racer_gameplay_%28Path_of_Daggers%29.webm",
    posterSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Tux_Racer_gameplay_%28Path_of_Daggers%29.webm/500px--Tux_Racer_gameplay_%28Path_of_Daggers%29.webm.jpg",
    durationSeconds: 63,
    license: "GPL",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Tux_Racer_gameplay_(Path_of_Daggers).webm",
  },
  {
    id: "ancient-strategy",
    name: "Ancient Strategy",
    description: "0 A.D. real-time strategy footage with dense scene changes.",
    videoSrc: "https://upload.wikimedia.org/wikipedia/commons/b/bc/0_A.D._-_Gameplay-Test_15052019_Full-HD.webm",
    posterSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/0_A.D._-_Gameplay-Test_15052019_Full-HD.webm/500px--0_A.D._-_Gameplay-Test_15052019_Full-HD.webm.jpg",
    durationSeconds: 145,
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:0_A.D._-_Gameplay-Test_15052019_Full-HD.webm",
  },
  {
    id: "arena-fps",
    name: "Arena FPS",
    description: "Red Eclipse arena movement with high contrast and camera speed.",
    videoSrc: "https://upload.wikimedia.org/wikipedia/commons/3/34/Red_Eclipse_1%2C5_Gameplay_1.webm",
    posterSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Red_Eclipse_1%2C5_Gameplay_1.webm/500px--Red_Eclipse_1%2C5_Gameplay_1.webm.jpg",
    durationSeconds: 138,
    license: "CC BY 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Red_Eclipse_1,5_Gameplay_1.webm",
  },
  {
    id: "arena-fps-extended",
    name: "Arena FPS Extended",
    description: "A longer Red Eclipse run for scripts that need more breathing room.",
    videoSrc: "https://upload.wikimedia.org/wikipedia/commons/c/c6/Red_Eclipse_1%2C5_Gameplay_2.webm",
    posterSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Red_Eclipse_1%2C5_Gameplay_2.webm/500px--Red_Eclipse_1%2C5_Gameplay_2.webm.jpg",
    durationSeconds: 649,
    license: "CC BY 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Red_Eclipse_1,5_Gameplay_2.webm",
  },
  {
    id: "surreal-platform",
    name: "Surreal Platform",
    description: "FEZ platforming with camera rotation and a slower visual rhythm.",
    videoSrc: "https://upload.wikimedia.org/wikipedia/commons/4/47/FEZ_trial_gameplay_HD.webm",
    posterSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/FEZ_trial_gameplay_HD.webm/500px--FEZ_trial_gameplay_HD.webm.jpg",
    durationSeconds: 390,
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:FEZ_trial_gameplay_HD.webm",
  },
  {
    id: "rts-sandbox",
    name: "RTS Sandbox",
    description: "Gigalomania strategy gameplay with a long, continuous map view.",
    videoSrc: "https://upload.wikimedia.org/wikipedia/commons/6/60/Gigalomania_-_Gameplay_%28PC%E2%A7%B8UHD%29_%28kgLUlxtxfh8%29.webm",
    posterSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Gigalomania_-_Gameplay_%28PC%E2%A7%B8UHD%29_%28kgLUlxtxfh8%29.webm/500px--Gigalomania_-_Gameplay_%28PC%E2%A7%B8UHD%29_%28kgLUlxtxfh8%29.webm.jpg",
    durationSeconds: 641,
    license: "GPLv2",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Gigalomania_-_Gameplay_(PC%E2%A7%B8UHD)_(kgLUlxtxfh8).webm",
  },
  {
    id: "physics-lab",
    name: "Physics Lab",
    description: "Fantastic Contraption builds with satisfying object motion.",
    videoSrc: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Fantastic_Contraption_raw_gameplay_highlights.webm",
    posterSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Fantastic_Contraption_raw_gameplay_highlights.webm/500px--Fantastic_Contraption_raw_gameplay_highlights.webm.jpg",
    durationSeconds: 223,
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Fantastic_Contraption_raw_gameplay_highlights.webm",
  },
  {
    id: "containment-lab",
    name: "Containment Lab",
    description: "SCP: Secret Laboratory first-person movement with strong depth cues.",
    videoSrc: "https://upload.wikimedia.org/wikipedia/commons/7/7e/SCP-_Secret_Laboratory_-_Tutorial_playthrough_-_The_basics.webm",
    posterSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/SCP-_Secret_Laboratory_-_Tutorial_playthrough_-_The_basics.webm/500px--SCP-_Secret_Laboratory_-_Tutorial_playthrough_-_The_basics.webm.jpg",
    durationSeconds: 91,
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:SCP-_Secret_Laboratory_-_Tutorial_playthrough_-_The_basics.webm",
  },
  {
    id: "cinematic-dash",
    name: "Original Loop",
    description: "BrainrotKit's original local loop for offline demos and fallback testing.",
    videoSrc: "/showcase/moonbound-cart-dash.mp4",
    posterSrc: "/showcase/moonbound-cart-dash-poster.png",
    durationSeconds: 15,
    license: "BrainrotKit original",
    sourceUrl: "https://brainrotkit.com/",
  },
] as const;

export type GameplayBackgroundId = (typeof gameplayBackgrounds)[number]["id"];

const legacyBackgroundIds: Record<string, GameplayBackgroundId> = {
  "night-drive": "arena-fps",
  "marble-flow": "physics-lab",
};

export function normalizeGameplayBackgroundId(value: unknown): GameplayBackgroundId {
  const candidate = typeof value === "string" ? legacyBackgroundIds[value] ?? value : "";
  if (gameplayBackgrounds.some((background) => background.id === candidate)) {
    return candidate as GameplayBackgroundId;
  }
  return "voxel-rush";
}

export function getGameplayBackground(id: unknown) {
  const normalized = normalizeGameplayBackgroundId(id);
  return gameplayBackgrounds.find((background) => background.id === normalized) ?? gameplayBackgrounds[0];
}
