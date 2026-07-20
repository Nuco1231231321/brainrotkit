/** Canonical user path for “get a video I can download”. */

export type OperationStep = {
  id: string;
  title: string;
  detail: string;
  state: "done" | "current" | "next";
};

export function publicCreatePath(kind: "video" | "text" | "pdf" | "italian" | "voice"): OperationStep[] {
  if (kind === "voice") {
    return [
      { id: "source", title: "1. Paste a line", detail: "Add at least 8 characters.", state: "current" },
      { id: "project", title: "2. Create project", detail: "Sign in if needed, then open the editor.", state: "next" },
      { id: "generate", title: "3. Generate audio", detail: "Confirm credits once. Download when ready.", state: "next" },
    ];
  }
  return [
    { id: "source", title: "1. Add your source", detail: "Text, PDF or idea — keep one clear topic.", state: "current" },
    { id: "project", title: "2. Create project", detail: "AI writes an editable script in the editor.", state: "next" },
    { id: "generate", title: "3. Generate narration", detail: "Confirm once. Voice is created for every line.", state: "next" },
    { id: "export", title: "4. Export MP4", detail: "Gameplay + captions compose in your browser.", state: "next" },
  ];
}

export function editorOperationPath(input: {
  isVoice: boolean;
  status: string;
  outputIsFinal: boolean;
  hasNarration: boolean;
}): OperationStep[] {
  const { isVoice, status, outputIsFinal, hasNarration } = input;
  if (isVoice) {
    return [
      { id: "script", title: "Script ready", detail: "Edit the line before generating.", state: status === "draft" || status === "failed" ? "current" : "done" },
      {
        id: "generate",
        title: "Generate audio",
        detail: "One confirmation reserves credits.",
        state: status === "processing" ? "current" : status === "completed" ? "done" : status === "draft" || status === "failed" ? "next" : "next",
      },
      {
        id: "download",
        title: "Download",
        detail: "Save the finished audio file.",
        state: status === "completed" ? "current" : "next",
      },
    ];
  }

  const scriptDone = true;
  const assetsDone = status === "completed" || status === "processing" || hasNarration;
  const exportDone = outputIsFinal;

  return [
    {
      id: "script",
      title: "1. Review script",
      detail: "Fix the hook and dialogue before spending credits.",
      state: status === "draft" || status === "failed" ? "current" : "done",
    },
    {
      id: "generate",
      title: "2. Generate narration",
      detail: status === "processing" ? "Job running — you can leave safely." : "Creates voice (and motion assets if AI Motion).",
      state: status === "processing" ? "current" : assetsDone && !exportDone && status === "completed" ? "done" : status === "draft" || status === "failed" ? "next" : scriptDone ? "next" : "next",
    },
    {
      id: "export",
      title: "3. Export final MP4",
      detail: "Composes gameplay, captions and voice in the browser.",
      state: exportDone ? "done" : status === "completed" ? "current" : "next",
    },
  ];
}

export const sampleSources = {
  video: "Why do people open ten tabs instead of finishing the one task that would actually move their life forward?",
  text: "Everyone claims multitasking makes them productive. The real reason people bounce between apps is that starting the hard task feels risky, so the brain picks a smaller reward instead.",
  idea: "Two hosts argue about whether cold showers build discipline or just make people feel busy for five minutes.",
  italian: "A cobalt espresso-machine owl racing a red scooter through midnight Rome while shouting opera tips.",
  voice: "Mamma mia, the algorithm chose chaos today — and we are not soft-launching our way out of it.",
} as const;