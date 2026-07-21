/**
 * Create-studio gameplay catalog.
 *
 * Legal rule: no Minecraft / GTA / Subway Surfers recordings.
 * Families map to the same user jobs with open-source / CC footage only.
 * Long clips are reused with different start offsets so each card feels distinct.
 */
export type GameFamily = "voxel" | "city" | "runner";

export type GameplayClip = {
  id: string;
  family: GameFamily;
  name: string;
  description: string;
  videoSrc: string;
  posterSrc: string;
  durationSeconds: number;
  /** Seek into a long source so one file can power multiple cards. */
  startOffsetSeconds: number;
  license: string;
  sourceUrl: string;
};

export const gameFamilies: Array<{
  id: GameFamily;
  label: string;
  hint: string;
}> = [
  {
    id: "voxel",
    label: "Voxel",
    hint: "Minecraft-style sandbox motion — open worlds only",
  },
  {
    id: "city",
    label: "City",
    hint: "Chase / open-world energy — no GTA footage",
  },
  {
    id: "runner",
    label: "Runner",
    hint: "Endless downhill & platform speed — no Subway Surfers footage",
  },
];

const SRC = {
  mineclone: {
    video: "https://upload.wikimedia.org/wikipedia/commons/9/92/MineClone2_-_Release_0.84_-_The_Very_Nice_Release.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/MineClone2_-_Release_0.84_-_The_Very_Nice_Release.webm/440px--MineClone2_-_Release_0.84_-_The_Very_Nice_Release.webm.jpg",
    duration: 86,
    license: "CC BY 3.0",
    source: "https://commons.wikimedia.org/wiki/File:MineClone2_-_Release_0.84_-_The_Very_Nice_Release.webm",
  },
  supertux: {
    video: "https://upload.wikimedia.org/wikipedia/commons/2/24/Gameplay_of_SuperTux_%288_Minutes%29.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Gameplay_of_SuperTux_%288_Minutes%29.webm/440px--Gameplay_of_SuperTux_%288_Minutes%29.webm.jpg",
    duration: 475,
    license: "GPL",
    source: "https://commons.wikimedia.org/wiki/File:Gameplay_of_SuperTux_(8_Minutes).webm",
  },
  tuxIngo: {
    video: "https://upload.wikimedia.org/wikipedia/commons/d/de/Tux_Racer_gameplay_%28Ingo%27s_Speedway%29.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Tux_Racer_gameplay_%28Ingo%27s_Speedway%29.webm/440px--Tux_Racer_gameplay_%28Ingo%27s_Speedway%29.webm.jpg",
    duration: 65,
    license: "GPL",
    source: "https://commons.wikimedia.org/wiki/File:Tux_Racer_gameplay_(Ingo%27s_Speedway).webm",
  },
  tuxDaggers: {
    video: "https://upload.wikimedia.org/wikipedia/commons/3/33/Tux_Racer_gameplay_%28Path_of_Daggers%29.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Tux_Racer_gameplay_%28Path_of_Daggers%29.webm/440px--Tux_Racer_gameplay_%28Path_of_Daggers%29.webm.jpg",
    duration: 63,
    license: "GPL",
    source: "https://commons.wikimedia.org/wiki/File:Tux_Racer_gameplay_(Path_of_Daggers).webm",
  },
  zeroAd: {
    video: "https://upload.wikimedia.org/wikipedia/commons/b/bc/0_A.D._-_Gameplay-Test_15052019_Full-HD.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/0_A.D._-_Gameplay-Test_15052019_Full-HD.webm/440px--0_A.D._-_Gameplay-Test_15052019_Full-HD.webm.jpg",
    duration: 145,
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:0_A.D._-_Gameplay-Test_15052019_Full-HD.webm",
  },
  red1: {
    video: "https://upload.wikimedia.org/wikipedia/commons/3/34/Red_Eclipse_1%2C5_Gameplay_1.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Red_Eclipse_1%2C5_Gameplay_1.webm/440px--Red_Eclipse_1%2C5_Gameplay_1.webm.jpg",
    duration: 138,
    license: "CC BY 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Red_Eclipse_1,5_Gameplay_1.webm",
  },
  red2: {
    video: "https://upload.wikimedia.org/wikipedia/commons/c/c6/Red_Eclipse_1%2C5_Gameplay_2.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Red_Eclipse_1%2C5_Gameplay_2.webm/440px--Red_Eclipse_1%2C5_Gameplay_2.webm.jpg",
    duration: 649,
    license: "CC BY 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Red_Eclipse_1,5_Gameplay_2.webm",
  },
  fez: {
    video: "https://upload.wikimedia.org/wikipedia/commons/4/47/FEZ_trial_gameplay_HD.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/FEZ_trial_gameplay_HD.webm/440px--FEZ_trial_gameplay_HD.webm.jpg",
    duration: 390,
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:FEZ_trial_gameplay_HD.webm",
  },
  giga: {
    video: "https://upload.wikimedia.org/wikipedia/commons/6/60/Gigalomania_-_Gameplay_%28PC%E2%A7%B8UHD%29_%28kgLUlxtxfh8%29.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Gigalomania_-_Gameplay_%28PC%E2%A7%B8UHD%29_%28kgLUlxtxfh8%29.webm/440px--Gigalomania_-_Gameplay_%28PC%E2%A7%B8UHD%29_%28kgLUlxtxfh8%29.webm.jpg",
    duration: 641,
    license: "GPLv2",
    source: "https://commons.wikimedia.org/wiki/File:Gigalomania_-_Gameplay_(PC%E2%A7%B8UHD)_(kgLUlxtxfh8).webm",
  },
  physics: {
    video: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Fantastic_Contraption_raw_gameplay_highlights.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Fantastic_Contraption_raw_gameplay_highlights.webm/440px--Fantastic_Contraption_raw_gameplay_highlights.webm.jpg",
    duration: 223,
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Fantastic_Contraption_raw_gameplay_highlights.webm",
  },
  scp: {
    video: "https://upload.wikimedia.org/wikipedia/commons/7/7e/SCP-_Secret_Laboratory_-_Tutorial_playthrough_-_The_basics.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/SCP-_Secret_Laboratory_-_Tutorial_playthrough_-_The_basics.webm/440px--SCP-_Secret_Laboratory_-_Tutorial_playthrough_-_The_basics.webm.jpg",
    duration: 91,
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:SCP-_Secret_Laboratory_-_Tutorial_playthrough_-_The_basics.webm",
  },
  original: {
    video: "/showcase/moonbound-cart-dash.mp4",
    poster: "/showcase/moonbound-cart-dash-poster.png",
    duration: 15,
    license: "BrainrotKit original",
    source: "https://brainrotkit.com/",
  },
} as const;

function clip(
  id: string,
  family: GameFamily,
  name: string,
  description: string,
  src: (typeof SRC)[keyof typeof SRC],
  startOffsetSeconds = 0,
): GameplayClip {
  return {
    id,
    family,
    name,
    description,
    videoSrc: src.video,
    posterSrc: src.poster,
    durationSeconds: src.duration,
    startOffsetSeconds,
    license: src.license,
    sourceUrl: src.source,
  };
}

export const gameplayClips: GameplayClip[] = [
  // Voxel × 7
  clip("voxel-1", "voxel", "MineClone Explore", "Open voxel sandbox forward motion.", SRC.mineclone, 0),
  clip("voxel-2", "voxel", "MineClone Depth", "Deeper caves and denser blocks.", SRC.mineclone, 40),
  clip("voxel-3", "voxel", "Pixel Cavern A", "SuperTux platform sprint.", SRC.supertux, 0),
  clip("voxel-4", "voxel", "Pixel Cavern B", "Mid-run platforming segment.", SRC.supertux, 120),
  clip("voxel-5", "voxel", "Rotate Worlds", "Surreal block camera shifts.", SRC.fez, 0),
  clip("voxel-6", "voxel", "Block Strategy", "Long continuous map motion.", SRC.giga, 30),
  clip("voxel-7", "voxel", "Contraption Lab", "Satisfying drops and builds.", SRC.physics, 0),

  // City × 7
  clip("city-1", "city", "Neon Arena", "Fast first-person chase energy.", SRC.red1, 0),
  clip("city-2", "city", "Arena Extended", "Longer chase for 45–60s scripts.", SRC.red2, 0),
  clip("city-3", "city", "Arena Mid", "Mid-run urban combat pace.", SRC.red2, 180),
  clip("city-4", "city", "Containment Halls", "Corridor depth and FOV push.", SRC.scp, 0),
  clip("city-5", "city", "Battlefield Sweep", "Wide camera across dense scenes.", SRC.zeroAd, 0),
  clip("city-6", "city", "Strategy Streets", "Open map energy without cars.", SRC.giga, 200),
  clip("city-7", "city", "Night Complex", "Later Red Eclipse segment.", SRC.red2, 360),

  // Runner × 7
  clip("runner-1", "runner", "Ice Speedway", "Downhill rush — endless energy.", SRC.tuxIngo, 0),
  clip("runner-2", "runner", "Path of Daggers", "Second downhill route.", SRC.tuxDaggers, 0),
  clip("runner-3", "runner", "Side Sprint A", "Long platform run open.", SRC.supertux, 60),
  clip("runner-4", "runner", "Side Sprint B", "Later platform segment.", SRC.supertux, 240),
  clip("runner-5", "runner", "Drop Factory", "Falling objects, constant motion.", SRC.physics, 40),
  clip("runner-6", "runner", "Rotate Run", "FEZ mid-run camera rolls.", SRC.fez, 90),
  clip("runner-7", "runner", "Cart Dash", "Original BrainrotKit vertical loop.", SRC.original, 0),
];

export type StudioCharacter = {
  id: string;
  name: string;
  role: string;
  voicePreset: string;
  voiceSample: string;
  color: string;
  tagline: string;
};

export const studioCharacters: StudioCharacter[] = [
  {
    id: "nova",
    name: "Nova",
    role: "host",
    voicePreset: "Milano Rush",
    voiceSample: "Everyone thinks they know the answer. They are wrong.",
    color: "#d1fe17",
    tagline: "Sets the claim",
  },
  {
    id: "riff",
    name: "Riff",
    role: "challenger",
    voicePreset: "Opera Max",
    voiceSample: "That sounds confident. Prove it in one sentence.",
    color: "#ff6b9d",
    tagline: "Pushes back hard",
  },
  {
    id: "soft",
    name: "Soft Study",
    role: "teacher",
    voicePreset: "Soft Study",
    voiceSample: "Here is the one idea that actually sticks under pressure.",
    color: "#9ce6f3",
    tagline: "Calm explainer",
  },
  {
    id: "zero",
    name: "Narrator Zero",
    role: "narrator",
    voicePreset: "Narrator Zero",
    voiceSample: "Three facts. One twist. No filler.",
    color: "#f3c977",
    tagline: "Cold open voice",
  },
];

export function clipsForFamily(family: GameFamily) {
  return gameplayClips.filter((clip) => clip.family === family);
}

export function getGameplayClip(id: string | null | undefined) {
  return gameplayClips.find((clip) => clip.id === id) ?? clipsForFamily("voxel")[0];
}