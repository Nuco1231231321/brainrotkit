/**
 * Create-studio gameplay catalog.
 *
 * Legal rule: include only footage with an explicit open or Creative Commons licence.
 * GTA and Subway labels describe the creator's intended pacing, not copied game assets.
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
    label: "Minecraft",
    hint: "Minecraft and open voxel sandbox footage",
  },
  {
    id: "city",
    label: "GTA",
    hint: "Licensed driving and chase footage with GTA-style pacing",
  },
  {
    id: "runner",
    label: "Subway S",
    hint: "Licensed runner and platform footage with Subway-style pacing",
  },
];

const SRC = {
  mineclone: {
    video: "https://upload.wikimedia.org/wikipedia/commons/9/92/MineClone2_-_Release_0.84_-_The_Very_Nice_Release.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/MineClone2_-_Release_0.84_-_The_Very_Nice_Release.webm/500px--MineClone2_-_Release_0.84_-_The_Very_Nice_Release.webm.jpg",
    duration: 86,
    license: "CC BY 3.0",
    source: "https://commons.wikimedia.org/wiki/File:MineClone2_-_Release_0.84_-_The_Very_Nice_Release.webm",
  },
  minecraftTrails: {
    video: "https://upload.wikimedia.org/wikipedia/commons/5/54/Minecraft_Trails_and_Tales_Update.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Minecraft_Trails_and_Tales_Update.webm/500px--Minecraft_Trails_and_Tales_Update.webm.jpg",
    duration: 117,
    license: "CC BY 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Minecraft_Trails_and_Tales_Update.webm",
  },
  projectCars: {
    video: "https://upload.wikimedia.org/wikipedia/commons/0/03/Project_CARS_-_Career_Mode_Trailer.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Project_CARS_-_Career_Mode_Trailer.webm/500px--Project_CARS_-_Career_Mode_Trailer.webm.jpg",
    duration: 302,
    license: "CC BY 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Project_CARS_-_Career_Mode_Trailer.webm",
  },
  projectCarsNight: {
    video: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Project_CARS_-_PS4-XB1-PC-Wii_U_-_Scary_Nightime_Racing_%28Halloween_Trailer%29.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Project_CARS_-_PS4-XB1-PC-Wii_U_-_Scary_Nightime_Racing_%28Halloween_Trailer%29.webm/500px--Project_CARS_-_PS4-XB1-PC-Wii_U_-_Scary_Nightime_Racing_%28Halloween_Trailer%29.webm.jpg",
    duration: 102,
    license: "CC BY 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Project_CARS_-_PS4-XB1-PC-Wii_U_-_Scary_Nightime_Racing_(Halloween_Trailer).webm",
  },
  superTuxKart: {
    video: "https://upload.wikimedia.org/wikipedia/commons/0/03/SuperTuxKart_2.x_GP_with_24%25_handicap_and_road_tracks_%28open_source_Mario_Kart-like_Linux_game%29.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/SuperTuxKart_2.x_GP_with_24%25_handicap_and_road_tracks_%28open_source_Mario_Kart-like_Linux_game%29.webm/500px--SuperTuxKart_2.x_GP_with_24%25_handicap_and_road_tracks_%28open_source_Mario_Kart-like_Linux_game%29.webm.jpg",
    duration: 2262,
    license: "CC BY 3.0",
    source: "https://commons.wikimedia.org/wiki/File:SuperTuxKart_2.x_GP_with_24%25_handicap_and_road_tracks_(open_source_Mario_Kart-like_Linux_game).webm",
  },
  kartBenchmark: {
    video: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Benchmark_SuperTux_Kart_Base_Profile_2025.07.04_-_10.19.10.02.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Benchmark_SuperTux_Kart_Base_Profile_2025.07.04_-_10.19.10.02.webm/500px--Benchmark_SuperTux_Kart_Base_Profile_2025.07.04_-_10.19.10.02.webm.jpg",
    duration: 71,
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Benchmark_SuperTux_Kart_Base_Profile_2025.07.04_-_10.19.10.02.webm",
  },
  supertux: {
    video: "https://upload.wikimedia.org/wikipedia/commons/2/24/Gameplay_of_SuperTux_%288_Minutes%29.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Gameplay_of_SuperTux_%288_Minutes%29.webm/500px--Gameplay_of_SuperTux_%288_Minutes%29.webm.jpg",
    duration: 475,
    license: "GPL",
    source: "https://commons.wikimedia.org/wiki/File:Gameplay_of_SuperTux_(8_Minutes).webm",
  },
  tuxIngo: {
    video: "https://upload.wikimedia.org/wikipedia/commons/d/de/Tux_Racer_gameplay_%28Ingo%27s_Speedway%29.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Tux_Racer_gameplay_%28Ingo%27s_Speedway%29.webm/500px--Tux_Racer_gameplay_%28Ingo%27s_Speedway%29.webm.jpg",
    duration: 65,
    license: "GPL",
    source: "https://commons.wikimedia.org/wiki/File:Tux_Racer_gameplay_(Ingo%27s_Speedway).webm",
  },
  tuxDaggers: {
    video: "https://upload.wikimedia.org/wikipedia/commons/3/33/Tux_Racer_gameplay_%28Path_of_Daggers%29.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Tux_Racer_gameplay_%28Path_of_Daggers%29.webm/500px--Tux_Racer_gameplay_%28Path_of_Daggers%29.webm.jpg",
    duration: 63,
    license: "GPL",
    source: "https://commons.wikimedia.org/wiki/File:Tux_Racer_gameplay_(Path_of_Daggers).webm",
  },
  zeroAd: {
    video: "https://upload.wikimedia.org/wikipedia/commons/b/bc/0_A.D._-_Gameplay-Test_15052019_Full-HD.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/0_A.D._-_Gameplay-Test_15052019_Full-HD.webm/500px--0_A.D._-_Gameplay-Test_15052019_Full-HD.webm.jpg",
    duration: 145,
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:0_A.D._-_Gameplay-Test_15052019_Full-HD.webm",
  },
  red1: {
    video: "https://upload.wikimedia.org/wikipedia/commons/3/34/Red_Eclipse_1%2C5_Gameplay_1.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Red_Eclipse_1%2C5_Gameplay_1.webm/500px--Red_Eclipse_1%2C5_Gameplay_1.webm.jpg",
    duration: 138,
    license: "CC BY 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Red_Eclipse_1,5_Gameplay_1.webm",
  },
  red2: {
    video: "https://upload.wikimedia.org/wikipedia/commons/c/c6/Red_Eclipse_1%2C5_Gameplay_2.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Red_Eclipse_1%2C5_Gameplay_2.webm/500px--Red_Eclipse_1%2C5_Gameplay_2.webm.jpg",
    duration: 649,
    license: "CC BY 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Red_Eclipse_1,5_Gameplay_2.webm",
  },
  fez: {
    video: "https://upload.wikimedia.org/wikipedia/commons/4/47/FEZ_trial_gameplay_HD.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/FEZ_trial_gameplay_HD.webm/500px--FEZ_trial_gameplay_HD.webm.jpg",
    duration: 390,
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:FEZ_trial_gameplay_HD.webm",
  },
  giga: {
    video: "https://upload.wikimedia.org/wikipedia/commons/6/60/Gigalomania_-_Gameplay_%28PC%E2%A7%B8UHD%29_%28kgLUlxtxfh8%29.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Gigalomania_-_Gameplay_%28PC%E2%A7%B8UHD%29_%28kgLUlxtxfh8%29.webm/500px--Gigalomania_-_Gameplay_%28PC%E2%A7%B8UHD%29_%28kgLUlxtxfh8%29.webm.jpg",
    duration: 641,
    license: "GPLv2",
    source: "https://commons.wikimedia.org/wiki/File:Gigalomania_-_Gameplay_(PC%E2%A7%B8UHD)_(kgLUlxtxfh8).webm",
  },
  physics: {
    video: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Fantastic_Contraption_raw_gameplay_highlights.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Fantastic_Contraption_raw_gameplay_highlights.webm/500px--Fantastic_Contraption_raw_gameplay_highlights.webm.jpg",
    duration: 223,
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Fantastic_Contraption_raw_gameplay_highlights.webm",
  },
  scp: {
    video: "https://upload.wikimedia.org/wikipedia/commons/7/7e/SCP-_Secret_Laboratory_-_Tutorial_playthrough_-_The_basics.webm",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/SCP-_Secret_Laboratory_-_Tutorial_playthrough_-_The_basics.webm/500px--SCP-_Secret_Laboratory_-_Tutorial_playthrough_-_The_basics.webm.jpg",
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
  // Minecraft: the original game where reuse is explicitly licensed, plus MineClone.
  clip("voxel-1", "voxel", "Minecraft Trails", "Minecraft exploration and landscape movement.", SRC.minecraftTrails, 0),
  clip("voxel-2", "voxel", "Minecraft Caves", "A later cave-and-mob segment from the same licensed source.", SRC.minecraftTrails, 55),
  clip("voxel-3", "voxel", "MineClone Explore", "Open voxel sandbox forward motion.", SRC.mineclone, 0),
  clip("voxel-4", "voxel", "MineClone Depth", "A deeper MineClone segment with denser blocks.", SRC.mineclone, 35),

  // GTA: driving/chase alternatives with matching motion, not copied GTA recordings.
  clip("city-1", "city", "Career Drive", "Fast road footage with chase-style camera energy.", SRC.projectCars, 0),
  clip("city-2", "city", "Track Pursuit", "A later racing segment with sustained forward motion.", SRC.projectCars, 120),
  clip("city-3", "city", "Night Drive", "High-contrast night driving and quick turns.", SRC.projectCarsNight, 0),
  clip("city-4", "city", "Road Kart", "Long open-source road-racing gameplay.", SRC.superTuxKart, 0),
  clip("city-5", "city", "Road Kart Extended", "A later route from the same 37-minute source.", SRC.superTuxKart, 300),
  clip("city-6", "city", "Kart Benchmark", "A compact one-minute racing run.", SRC.kartBenchmark, 0),

  // Subway S: runner/platform alternatives with matching continuous movement.
  clip("runner-1", "runner", "Ice Speedway", "Downhill forward rush with constant motion.", SRC.tuxIngo, 0),
  clip("runner-2", "runner", "Path of Daggers", "A second downhill route with obstacle rhythm.", SRC.tuxDaggers, 0),
  clip("runner-3", "runner", "Side Sprint", "Long platform run with clean side-scrolling action.", SRC.supertux, 60),
  clip("runner-4", "runner", "Side Sprint Extended", "A later platform section for longer scripts.", SRC.supertux, 240),
  clip("runner-5", "runner", "Rotate Run", "Platform motion with camera rotation and depth.", SRC.fez, 90),
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
