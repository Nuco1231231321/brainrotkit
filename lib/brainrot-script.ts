export type ContentFormat = "story" | "debate" | "study";
export type StudyMode = "explain" | "quiz" | "summary";
export type DialogueEmotion = "neutral" | "excited" | "skeptical" | "angry" | "surprised" | "calm";

export type BrainrotSpeaker = {
  id: string;
  name: string;
  role: "narrator" | "host" | "challenger" | "teacher" | "student";
  voicePreset: string;
  captionColor: string;
};

export type BrainrotDialogueTurn = {
  id: string;
  speakerId: string;
  text: string;
  emotion: DialogueEmotion;
  sceneId?: string;
};

export type BrainrotSourceReference = {
  label: string;
  excerpt: string;
};

export type BrainrotScene = {
  id: string;
  label: string;
  narration: string;
  imagePrompt: string;
  motionPrompt: string;
};

export type BrainrotScript = {
  version: 2;
  contentFormat: ContentFormat;
  studyMode?: StudyMode;
  title: string;
  hook: string;
  narration: string;
  voiceDirection: string;
  speakers: BrainrotSpeaker[];
  dialogue: BrainrotDialogueTurn[];
  sourceReferences?: BrainrotSourceReference[];
  scenes: BrainrotScene[];
};

const fallbackColors = ["#d1fe17", "#77d8ff", "#ff9f68", "#c4a7ff"];
const emotionValues: DialogueEmotion[] = ["neutral", "excited", "skeptical", "angry", "surprised", "calm"];

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function asContentFormat(value: unknown, fallback: ContentFormat): ContentFormat {
  return value === "debate" || value === "study" || value === "story" ? value : fallback;
}

function asStudyMode(value: unknown): StudyMode | undefined {
  return value === "quiz" || value === "summary" || value === "explain" ? value : undefined;
}

function asEmotion(value: unknown): DialogueEmotion {
  return emotionValues.includes(value as DialogueEmotion) ? value as DialogueEmotion : "neutral";
}

function fallbackSpeakers(format: ContentFormat): BrainrotSpeaker[] {
  if (format === "debate") {
    return [
      { id: "speaker-nova", name: "Nova", role: "host", voicePreset: "Milano Rush", captionColor: fallbackColors[0] },
      { id: "speaker-riff", name: "Riff", role: "challenger", voicePreset: "Opera Max", captionColor: fallbackColors[1] },
    ];
  }
  return [{
    id: "speaker-narrator",
    name: format === "study" ? "Study Guide" : "Narrator",
    role: format === "study" ? "teacher" : "narrator",
    voicePreset: format === "study" ? "Soft Study" : "Milano Rush",
    captionColor: fallbackColors[0],
  }];
}

function normalizeSpeakers(value: unknown, format: ContentFormat): BrainrotSpeaker[] {
  if (!Array.isArray(value)) return fallbackSpeakers(format);
  const speakers = value.slice(0, 4).map((item, index) => {
    const record = item as Record<string, unknown>;
    const fallback = fallbackSpeakers(format)[Math.min(index, fallbackSpeakers(format).length - 1)];
    return {
      id: cleanText(record.id, 60) || fallback.id,
      name: cleanText(record.name, 48) || fallback.name,
      role: record.role === "host" || record.role === "challenger" || record.role === "teacher" || record.role === "student" || record.role === "narrator"
        ? record.role
        : fallback.role,
      voicePreset: cleanText(record.voicePreset, 60) || fallback.voicePreset,
      captionColor: /^#[0-9a-f]{6}$/i.test(String(record.captionColor ?? ""))
        ? String(record.captionColor)
        : fallbackColors[index % fallbackColors.length],
    } satisfies BrainrotSpeaker;
  });
  const unique = speakers.filter((speaker, index, list) => list.findIndex((item) => item.id === speaker.id) === index);
  if (format === "debate" && unique.length < 2) return fallbackSpeakers(format);
  return unique.length ? unique : fallbackSpeakers(format);
}

function normalizeScenes(value: unknown, narration: string): BrainrotScene[] {
  const scenes = Array.isArray(value)
    ? value.slice(0, 8).map((item, index) => {
      const record = item as Record<string, unknown>;
      return {
        id: cleanText(record.id, 80) || `scene-${index + 1}`,
        label: cleanText(record.label, 48) || `Scene ${index + 1}`,
        narration: cleanText(record.narration, 700),
        imagePrompt: cleanText(record.imagePrompt, 1_200),
        motionPrompt: cleanText(record.motionPrompt, 1_200),
      } satisfies BrainrotScene;
    }).filter((scene) => scene.narration)
    : [];
  if (scenes.length) return scenes;
  return [{
    id: "scene-1",
    label: "Scene 1",
    narration,
    imagePrompt: "A clear vertical composition with one original focal subject, no text or logos.",
    motionPrompt: "A readable subject action with a gentle camera move that supports the narration.",
  }];
}

function normalizeDialogue(value: unknown, speakers: BrainrotSpeaker[], scenes: BrainrotScene[], narration: string) {
  const speakerIds = new Set(speakers.map((speaker) => speaker.id));
  const dialogue = Array.isArray(value)
    ? value.slice(0, 24).map((item, index) => {
      const record = item as Record<string, unknown>;
      const scene = scenes[index % Math.max(1, scenes.length)];
      const speakerId = cleanText(record.speakerId, 60);
      return {
        id: cleanText(record.id, 80) || `turn-${index + 1}`,
        speakerId: speakerIds.has(speakerId) ? speakerId : speakers[0].id,
        text: cleanText(record.text ?? record.narration, 700),
        emotion: asEmotion(record.emotion),
        sceneId: cleanText(record.sceneId, 80) || scene?.id,
      } satisfies BrainrotDialogueTurn;
    }).filter((turn) => turn.text)
    : [];
  if (dialogue.length) return dialogue;
  return [{
    id: "turn-1",
    speakerId: speakers[0].id,
    text: narration,
    emotion: "neutral" as const,
    sceneId: scenes[0]?.id,
  }];
}

export function scriptNarration(script: Pick<BrainrotScript, "dialogue" | "narration">) {
  const dialogueText = script.dialogue.map((turn) => turn.text.trim()).filter(Boolean).join(" ").trim();
  return dialogueText || script.narration.trim();
}

export function normalizeBrainrotScript(value: unknown, fallbackFormat: ContentFormat = "story"): BrainrotScript {
  const record = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const contentFormat = asContentFormat(record.contentFormat, fallbackFormat);
  const title = cleanText(record.title, 80) || "Untitled Brainrot";
  const hook = cleanText(record.hook, 1_200) || title;
  const legacyNarration = cleanText(record.narration, 4_000) || hook;
  const speakers = normalizeSpeakers(record.speakers, contentFormat);
  const scenes = normalizeScenes(record.scenes, legacyNarration);
  const dialogue = normalizeDialogue(record.dialogue, speakers, scenes, legacyNarration);
  const narration = scriptNarration({ dialogue, narration: legacyNarration });
  const references = Array.isArray(record.sourceReferences)
    ? record.sourceReferences.slice(0, 12).map((item) => {
      const reference = item as Record<string, unknown>;
      return { label: cleanText(reference.label, 80), excerpt: cleanText(reference.excerpt, 400) };
    }).filter((item) => item.label && item.excerpt)
    : undefined;
  return {
    version: 2,
    contentFormat,
    studyMode: asStudyMode(record.studyMode) ?? (contentFormat === "study" ? "explain" : undefined),
    title,
    hook,
    narration,
    voiceDirection: cleanText(record.voiceDirection, 240) || "Fast, clear and expressive narration with short pauses between beats.",
    speakers,
    dialogue,
    sourceReferences: references,
    scenes,
  };
}

export function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function wordLimitForDuration(durationSeconds: number, format: ContentFormat) {
  const wordsPerSecond = format === "study" ? 2.5 : format === "debate" ? 2.8 : 2.7;
  return Math.max(12, Math.ceil(durationSeconds * wordsPerSecond));
}

export function defaultContentFormat(projectType: string, settings?: Record<string, unknown>): ContentFormat {
  if (projectType === "pdf" || settings?.contentFormat === "study") return "study";
  if (settings?.contentFormat === "debate") return "debate";
  return "story";
}
