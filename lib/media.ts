export type MediaAsset = {
  id: string;
  src: string;
  videoSrc?: string;
  audioSrc?: string;
  alt: string;
  title: string;
  type: "creator" | "study" | "italian" | "voice";
  sourceLabel: string;
  description: string;
  duration: string;
  href: string;
  ctaLabel: string;
};

export const mediaAssets: MediaAsset[] = [
  {
    id: "moonbound-cart-dash",
    src: "/showcase/moonbound-cart-dash-poster.png",
    videoSrc: "/showcase/moonbound-cart-dash.mp4",
    alt: "Real BrainrotKit output showing a small robot carrying a cart beneath a moonlit city",
    title: "Moonbound Cart Dash",
    type: "creator",
    sourceLabel: "Text to video",
    description: "A one-line story became a voiced vertical MP4 with a saved visual and downloadable result.",
    duration: "0:05",
    href: "/text-to-brainrot",
    ctaLabel: "Create from text",
  },
  {
    id: "retrieval-practice",
    src: "/api/showcase/retrieval-practice-poster",
    videoSrc: "/api/showcase/retrieval-practice-video",
    alt: "Real BrainrotKit study video showing a student astronaut inside a glowing brain-shaped library",
    title: "Retrieval Practice",
    type: "study",
    sourceLabel: "PDF to study video",
    description: "A real PDF was extracted in the browser, reduced to one clear lesson and rendered as a five-second explainer.",
    duration: "0:05",
    href: "/pdf-to-brainrot",
    ctaLabel: "Create from PDF",
  },
  {
    id: "turbo-tostino",
    src: "/api/showcase/turbo-tostino-poster",
    videoSrc: "/api/showcase/turbo-tostino-video",
    alt: "Real BrainrotKit character video showing a cobalt espresso-machine owl riding a red scooter",
    title: "Turbo Tostino",
    type: "italian",
    sourceLabel: "Original character video",
    description: "An original espresso owl concept became a consistent character, narration and cinematic vertical video.",
    duration: "0:05",
    href: "/italian-brainrot-generator",
    ctaLabel: "Create a character",
  },
  {
    id: "vox-macchiato-voice-lab",
    src: "/showcase/vox-macchiato-voice-cover.jpg",
    audioSrc: "/api/showcase/vox-macchiato-audio",
    alt: "Original chrome microphone and espresso-machine character in a dark recording studio with a lime audio waveform",
    title: "Vox Macchiato Voice Lab",
    type: "voice",
    sourceLabel: "Text to voice",
    description: "An original line became a saved WAV narration with a real generated voice and downloadable file.",
    duration: "0:04",
    href: "/italian-brainrot-voice-generator",
    ctaLabel: "Create a voice",
  },
];
