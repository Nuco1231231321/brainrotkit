export type GameFamily = "subway" | "temple" | "trackmania";

export type GameplayClip = {
  id: string;
  family: GameFamily;
  name: string;
  description: string;
  videoSrc: string;
  posterSrc: string;
  durationSeconds: number;
  startOffsetSeconds: number;
  license: string;
  sourceUrl: string;
};

export const gameFamilies: Array<{
  id: GameFamily;
  label: string;
  hint: string;
}> = [
  { id: "subway", label: "Subway", hint: "Fast runner footage with constant forward motion" },
  { id: "temple", label: "Temple Run", hint: "Obstacle runs with readable center framing" },
  { id: "trackmania", label: "Trackmania", hint: "High-speed racing footage and clean camera flow" },
];

export const gameplayClips = [
  {
    id: "subway-neon",
    family: "subway",
    name: "Neon rails",
    description: "Bright rail runner footage with dense obstacle timing.",
    videoSrc: "/api/gameplay/subway-neon/",
    posterSrc: "/gameplay/posters/subway-neon.png",
    durationSeconds: 60,
    startOffsetSeconds: 0,
    license: "Provided preset",
    sourceUrl: "https://cdn.revid.ai/subway_surfers/LOW_RES/2.mp4",
  },
  {
    id: "subway-city",
    family: "subway",
    name: "City sprint",
    description: "Classic city runner footage with a clear center lane.",
    videoSrc: "/api/gameplay/subway-city/",
    posterSrc: "/gameplay/posters/subway-city.png",
    durationSeconds: 60,
    startOffsetSeconds: 0,
    license: "Provided preset",
    sourceUrl: "https://cdn.revid.ai/subway_surfers/LOW_RES/1.mp4",
  },
  {
    id: "subway-china",
    family: "subway",
    name: "Lantern run",
    description: "A colorful city route with strong vertical composition.",
    videoSrc: "/api/gameplay/subway-china/",
    posterSrc: "/gameplay/posters/subway-china.png",
    durationSeconds: 60,
    startOffsetSeconds: 0,
    license: "Provided preset",
    sourceUrl: "https://cdn.revid.ai/subway_surfers/china_surfer_low.mp4",
  },
  {
    id: "temple-cliffs",
    family: "temple",
    name: "Cliff escape",
    description: "Temple runner footage with quick turns and drops.",
    videoSrc: "/api/gameplay/temple-cliffs/",
    posterSrc: "/gameplay/posters/temple-run-cliffs.png",
    durationSeconds: 60,
    startOffsetSeconds: 0,
    license: "Provided preset",
    sourceUrl: "https://cdn.revid.ai/backgrounds/tr/clip4_lowres.mp4",
  },
  {
    id: "temple-jungle",
    family: "temple",
    name: "Jungle chase",
    description: "Green jungle route with steady central movement.",
    videoSrc: "/api/gameplay/temple-jungle/",
    posterSrc: "/gameplay/posters/temple-run-jungle.png",
    durationSeconds: 60,
    startOffsetSeconds: 0,
    license: "Provided preset",
    sourceUrl: "https://cdn.revid.ai/backgrounds/tr/clip3_lowres.mp4",
  },
  {
    id: "temple-ruins",
    family: "temple",
    name: "Ruins rush",
    description: "Warm stone ruins with strong obstacle contrast.",
    videoSrc: "/api/gameplay/temple-ruins/",
    posterSrc: "/gameplay/posters/temple-run-ruins.png",
    durationSeconds: 60,
    startOffsetSeconds: 0,
    license: "Provided preset",
    sourceUrl: "https://cdn.revid.ai/backgrounds/tr/clip2_lowres.mp4",
  },
  {
    id: "trackmania-snow",
    family: "trackmania",
    name: "Snow circuit",
    description: "Cold high-speed circuit with a clean horizon line.",
    videoSrc: "/api/gameplay/trackmania-snow/",
    posterSrc: "/gameplay/posters/trackmania-snow.png",
    durationSeconds: 60,
    startOffsetSeconds: 0,
    license: "Provided preset",
    sourceUrl: "https://cdn.revid.ai/backgrounds/trackmania/video_lowres_4.mp4",
  },
  {
    id: "trackmania-stadium",
    family: "trackmania",
    name: "Stadium line",
    description: "White stadium track with rapid forward motion.",
    videoSrc: "/api/gameplay/trackmania-stadium/",
    posterSrc: "/gameplay/posters/trackmania-stadium.png",
    durationSeconds: 60,
    startOffsetSeconds: 0,
    license: "Provided preset",
    sourceUrl: "https://cdn.revid.ai/backgrounds/trackmania/video_lowres_2.mp4",
  },
] as const satisfies readonly GameplayClip[];

export type StudioCharacter = {
  id: string;
  name: string;
  role: string;
  voicePreset: string;
  voiceSample: string;
  voiceSampleSrc: string;
  voiceSampleDuration: string;
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
    voiceSampleSrc: "/voices/milano-rush.wav",
    voiceSampleDuration: "0:03",
    color: "#d1fe17",
    tagline: "Fast and energetic",
  },
  {
    id: "riff",
    name: "Riff",
    role: "challenger",
    voicePreset: "Opera Max",
    voiceSample: "That sounds confident. Prove it in one sentence.",
    voiceSampleSrc: "/voices/opera-max.wav",
    voiceSampleDuration: "0:03",
    color: "#ff6b9d",
    tagline: "Deep and dramatic",
  },
  {
    id: "zero",
    name: "Miles",
    role: "narrator",
    voicePreset: "Calm Narrator",
    voiceSample: "Three facts. One twist. No filler.",
    voiceSampleSrc: "/voices/calm-narrator.wav",
    voiceSampleDuration: "0:03",
    color: "#f3c977",
    tagline: "Steady documentary voice",
  },
  {
    id: "soft",
    name: "Soft Study",
    role: "teacher",
    voicePreset: "Soft Study",
    voiceSample: "Here is the one idea that actually sticks under pressure.",
    voiceSampleSrc: "/voices/soft-study.wav",
    voiceSampleDuration: "0:04",
    color: "#9ce6f3",
    tagline: "Calm and measured",
  },
  {
    id: "maeve",
    name: "Maeve",
    role: "storyteller",
    voicePreset: "Dublin Spark",
    voiceSample: "Here is the twist nobody sees coming.",
    voiceSampleSrc: "/voices/dublin-spark.wav",
    voiceSampleDuration: "0:03",
    color: "#7dd3a8",
    tagline: "Bright Irish storyteller",
  },
  {
    id: "mason",
    name: "Tara",
    role: "announcer",
    voicePreset: "Warm Radio",
    voiceSample: "Tonight, one small decision changes everything.",
    voiceSampleSrc: "/voices/warm-radio.wav",
    voiceSampleDuration: "0:04",
    color: "#f0a35c",
    tagline: "Warm broadcast voice",
  },
  {
    id: "tessa",
    name: "Tessa",
    role: "storyteller",
    voicePreset: "Cape Story",
    voiceSample: "Let me tell you the part that matters most.",
    voiceSampleSrc: "/voices/cape-story.wav",
    voiceSampleDuration: "0:03",
    color: "#c4a7ff",
    tagline: "Warm South African read",
  },
  {
    id: "aman",
    name: "Aman",
    role: "explainer",
    voicePreset: "Delhi Drive",
    voiceSample: "Watch closely, because the answer is simpler than it looks.",
    voiceSampleSrc: "/voices/delhi-drive.wav",
    voiceSampleDuration: "0:04",
    color: "#77d8ff",
    tagline: "Clear Indian English",
  },
  {
    id: "whisper",
    name: "Kathy",
    role: "narrator",
    voicePreset: "Quiet Story",
    voiceSample: "Keep listening. The quiet detail changes the whole story.",
    voiceSampleSrc: "/voices/quiet-story.wav",
    voiceSampleDuration: "0:04",
    color: "#b7bcc7",
    tagline: "Soft natural narration",
  },
  {
    id: "alice",
    name: "Alice",
    role: "character",
    voicePreset: "Italian Spark",
    voiceSample: "Questo e il momento in cui tutto cambia.",
    voiceSampleSrc: "/voices/italian-spark.wav",
    voiceSampleDuration: "0:03",
    color: "#ff8b72",
    tagline: "Expressive Italian voice",
  },
];

export function clipsForFamily(family: GameFamily) {
  return gameplayClips.filter((clip) => clip.family === family);
}

export function findGameplayClip(id: string | null | undefined) {
  return gameplayClips.find((clip) => clip.id === id);
}

export function getGameplayClip(id: string | null | undefined) {
  return findGameplayClip(id) ?? gameplayClips[0];
}
