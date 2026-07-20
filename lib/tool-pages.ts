export type ToolKind = "video" | "italian" | "voice" | "pdf" | "text";

export type ToolPageConfig = {
  slug: string;
  kind: ToolKind;
  title: string;
  metaTitle: string;
  description: string;
  summary: string;
  primaryKeyword: string;
  eyebrow: string;
  inputLabel: string;
  inputPlaceholder: string;
  outputLabel: string;
  estimatedCredits: number;
  useCases: { title: string; description: string }[];
  steps: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  related: { label: string; href: string }[];
};

export const toolPages: Record<string, ToolPageConfig> = {
  "italian-brainrot-generator": {
    slug: "italian-brainrot-generator",
    kind: "italian",
    title: "Italian Brainrot Generator",
    metaTitle: "Italian Brainrot Generator – Make Characters",
    description:
      "Use the Italian Brainrot Generator to create an original character, catchphrase, voice and vertical video for TikTok, Shorts or Reels from one idea online.",
    summary:
      "Combine an animal, object and personality. Get a character concept you can edit before rendering.",
    primaryKeyword: "italian brainrot generator",
    eyebrow: "Character Studio",
    inputLabel: "Character concept",
    inputPlaceholder:
      "A dramatic espresso machine crossed with a racing pigeon...",
    outputLabel: "Character card and 9:16 video",
    estimatedCredits: 12,
    useCases: [
      {
        title: "Original characters",
        description: "Turn a loose idea into a named character, lore and catchphrase.",
      },
      {
        title: "Short-form series",
        description: "Keep the same visual setup while remixing scenes and dialogue.",
      },
      {
        title: "Meme reactions",
        description: "Build a fast response around a trend without copying protected characters.",
      },
      {
        title: "Voice-led posts",
        description: "Pair the character with a preset voice and editable narration.",
      },
    ],
    steps: [
      {
        title: "Describe the combination",
        description: "Add the animal, object, mood and setting that define the character.",
      },
      {
        title: "Review the character card",
        description: "Edit the name, lore, voice and catchphrase before video rendering.",
      },
      {
        title: "Render and remix",
        description: "Create a vertical clip, then download it or reuse the character in another video.",
      },
    ],
    faqs: [
      {
        question: "What does the Italian Brainrot Generator create?",
        answer:
          "The Italian Brainrot Generator creates an original character name, visual direction, short lore, catchphrase and voice from one concept. Use the Italian Brainrot maker to download a character image, generate a voice line or create a 9:16 video for TikTok, YouTube Shorts and Instagram Reels.",
      },
      {
        question: "Can I edit the result before making a video?",
        answer:
          "Yes. Edit the name, lore, dialogue, voice and visual direction before rendering. If the first idea is close, change only the weak part before creating the final output.",
      },
      {
        question: "Does it copy existing characters?",
        answer:
          "No. The tool is for original combinations of animals, objects, personalities and settings. Prompts should not request an exact copy of a protected character or a real person. BrainrotKit templates do not include unlicensed official characters, logos or celebrity voice copies.",
      },
      {
        question: "Can I download only the character image?",
        answer:
          "Yes. Download the image without rendering a video, or save it and add voice and animation later. Image, voice and video are separate outputs, so you only spend credits on the format you want to publish.",
      },
      {
        question: "Which video format does the Italian Brainrot Generator use?",
        answer:
          "The default video is a 9:16 MP4 for TikTok, YouTube Shorts and Instagram Reels. Gameplay Mode supports 15, 30, 45 and 60 seconds; AI Motion supports 5 or 15 seconds and is priced separately.",
      },
      {
        question: "Can a failed step be retried?",
        answer:
          "Yes. Retry the failed image, voice or video while keeping the completed name, lore, script and media. If BrainrotKit cannot deliver a usable result, the credits reserved for that generation are returned to your account.",
      },
    ],
    related: [
      { label: "Italian Brainrot Voice", href: "/italian-brainrot-voice-generator" },
      { label: "Text to Brainrot", href: "/text-to-brainrot" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  "italian-brainrot-voice-generator": {
    slug: "italian-brainrot-voice-generator",
    kind: "voice",
    title: "Italian Brainrot Voice Generator",
    metaTitle: "Italian Brainrot Voice Generator – Make Audio",
    description:
      "Use the Italian Brainrot Voice Generator to turn text into stylized audio, adjust speed, pitch and intensity, then download the generated narration.",
    summary:
      "Paste a line, choose a voice and tune speed, pitch and intensity before generating audio.",
    primaryKeyword: "italian brainrot voice generator",
    eyebrow: "Voice Lab",
    inputLabel: "Voice script",
    inputPlaceholder: "Mamma mia, the algorithm has chosen chaos today...",
    outputLabel: "Voice preview and downloadable audio",
    estimatedCredits: 2,
    useCases: [
      {
        title: "Character dialogue",
        description: "Test a catchphrase before committing to a full video render.",
      },
      {
        title: "Meme narration",
        description: "Create punchy narration with editable timing and intensity.",
      },
      {
        title: "Video voiceover",
        description: "Add the completed audio to a new video or one you already started.",
      },
      {
        title: "Language variants",
        description: "Prepare alternate voice versions for different audience segments.",
      },
    ],
    steps: [
      {
        title: "Paste the line",
        description: "Use a short catchphrase for a fast preview or a longer script for full audio.",
      },
      {
        title: "Tune the performance",
        description: "Choose a preset, accent, speed, pitch and emotional intensity.",
      },
      {
        title: "Download or send to video",
        description: "Download the generated audio or use the narration in a Brainrot video.",
      },
    ],
    faqs: [
      {
        question: "Can I preview a voice before spending more credits?",
        answer:
          "Yes. Use a short Italian Brainrot voice preview to compare pacing, pronunciation and intensity before generating the full audio. The interface shows the character count and estimated credits first, so you can adjust the script or voice preset before committing to the longer request.",
      },
      {
        question: "Which controls are available?",
        answer:
          "The Italian Brainrot Voice Generator includes voice preset, language or accent, speed, pitch and intensity controls. Speed changes the rhythm, pitch changes the perceived weight of the voice and intensity makes the performance more restrained or exaggerated. Preview the line after each meaningful change.",
      },
      {
        question: "Can I download the audio?",
        answer:
          "Yes. Download the completed audio from the project page. Your history keeps the source text, selected preset and performance settings so you can regenerate the line or create another version.",
      },
      {
        question: "Does this include voice cloning?",
        answer:
          "No. The Italian Brainrot voice generator uses provided presets and does not accept uploaded samples for cloning. It is not for imitating celebrities, public figures or another person without consent. Choose a preset by tone and performance, not identity.",
      },
      {
        question: "What happens with long text?",
        answer:
          "If the script is too long for one natural voice result, shorten it, split it into audio clips or open Text to Brainrot. Separate scenes give you more control over pacing, pauses and visuals.",
      },
      {
        question: "Can I add the voice to a video?",
        answer:
          "Yes. Use completed Italian Brainrot text to speech audio as a voiceover reference for a new video without retyping the script.",
      },
    ],
    related: [
      { label: "Italian Brainrot Generator", href: "/italian-brainrot-generator" },
      { label: "AI Brainrot Video", href: "/" },
      { label: "Text to Brainrot", href: "/text-to-brainrot" },
    ],
  },
  "pdf-to-brainrot": {
    slug: "pdf-to-brainrot",
    kind: "pdf",
    title: "PDF to Brainrot",
    metaTitle: "PDF to Brainrot – Turn Notes into Videos",
    description:
      "Use PDF to Brainrot to turn notes, slides and scanned study material into editable summaries, quizzes and vertical videos with generated voice online.",
    summary:
      "Upload a PDF, review the extracted outline and decide what becomes a scene before rendering.",
    primaryKeyword: "pdf to brainrot",
    eyebrow: "Study Converter",
    inputLabel: "Upload PDF",
    inputPlaceholder: "Choose a PDF up to 25 MB",
    outputLabel: "Editable outline and study video",
    estimatedCredits: 13,
    useCases: [
      {
        title: "Exam revision",
        description: "Compress a chapter into short scenes that are easier to review.",
      },
      {
        title: "Lecture notes",
        description: "Turn notes into a short narrated explainer.",
      },
      {
        title: "Quiz videos",
        description: "Create question, pause and reveal scenes from the source material.",
      },
      {
        title: "Research summaries",
        description: "Review the extracted outline before creating a concise overview.",
      },
    ],
    steps: [
      {
        title: "Upload and extract",
        description: "Upload a readable PDF; scanned pages are recognized with OCR.",
      },
      {
        title: "Check the outline",
        description: "Review the recognized content, summary depth and scene structure.",
      },
      {
        title: "Edit and render",
        description: "Correct the script, select a template and create the final vertical video.",
      },
    ],
    faqs: [
      {
        question: "What PDF files are supported?",
        answer:
          "PDF to Brainrot accepts text PDFs and scanned PDFs that OCR can read, up to 25 MB and 80 pages. Unlock password-protected files and repair damaged documents before uploading them so the text can be extracted into an outline.",
      },
      {
        question: "Can I review extracted text before generating?",
        answer:
          "Yes. PDF to Brainrot shows the recognized outline and an editable scene script before video rendering. Review names, dates, formulas and important claims, especially after OCR. Correcting the source at this stage prevents an extraction mistake from becoming part of the final study video.",
      },
      {
        question: "What happens to my PDF after upload?",
        answer:
          "Original PDF uploads are deleted within 24 hours and are not used to train BrainrotKit models. You can keep the script and final video. Deleting your work queues the source file, intermediate media and generated output for removal.",
      },
      {
        question: "Are password-protected PDFs supported?",
        answer:
          "No. Unlock an encrypted or password-protected PDF before uploading it. The file validator explains when a document cannot be read, so you can provide an accessible copy without spending video rendering credits on a source that has not been extracted successfully.",
      },
      {
        question: "Does a failed extraction use video credits?",
        answer:
          "No. Failed file validation, text extraction or OCR does not use the credits reserved for video rendering. If voice or rendering later fails before delivering a usable result, the reserved credits are returned.",
      },
      {
        question: "Can I make a quiz instead of a summary?",
        answer:
          "Yes. Choose Quiz to create a question, pause and answer-reveal structure. Study produces a concise revision format, Explain uses a step-by-step narrative and Story follows a chronological or cause-and-effect sequence. You can edit the resulting outline before creating the video.",
      },
    ],
    related: [
      { label: "Text to Brainrot", href: "/text-to-brainrot" },
      { label: "AI Brainrot Video", href: "/" },
      { label: "Data Deletion", href: "/data-deletion" },
    ],
  },
  "text-to-brainrot": {
    slug: "text-to-brainrot",
    kind: "text",
    title: "Text to Brainrot",
    metaTitle: "Text to Brainrot – Create AI Videos from Text",
    description:
      "Use Text to Brainrot to turn articles, stories, comment threads or scripts into editable AI videos with hooks, scenes, generated voices and templates.",
    summary:
      "Paste source text, choose the platform and edit every hook and scene before rendering.",
    primaryKeyword: "text to brainrot",
    eyebrow: "Script Converter",
    inputLabel: "Source text",
    inputPlaceholder: "Paste an article, story, comment thread or rough script...",
    outputLabel: "Editable scenes and 9:16 video",
    estimatedCredits: 10,
    useCases: [
      {
        title: "Story narration",
        description: "Break long stories into paced scenes with generated voice.",
      },
      {
        title: "Comment videos",
        description: "Convert a comment thread into a hook, setup and payoff.",
      },
      {
        title: "Article recaps",
        description: "Condense the key points and keep the source structure editable.",
      },
      {
        title: "Hook testing",
        description: "Remix the opening while preserving confirmed scenes.",
      },
    ],
    steps: [
      {
        title: "Add the source",
        description: "Paste the text and choose the audience, tone, platform and duration.",
      },
      {
        title: "Edit the scenes",
        description: "Change the hook, reorder scenes and replace individual visuals or narration.",
      },
      {
        title: "Render the video",
        description: "Preview the expected credit cost, then create and download the result.",
      },
    ],
    faqs: [
      {
        question: "What kind of text can I use?",
        answer:
          "Text to Brainrot accepts articles, stories, comment threads, scripts, notes and original ideas that can be divided into short scenes. Use material you have permission to process and publish. Clear source text with one main topic produces a more coherent hook and scene plan.",
      },
      {
        question: "Can I edit the script before rendering?",
        answer:
          "Yes. Edit the hook, scene order, narration, visual direction and voice before the final render. The source stays visible while you revise, so you can check that the shorter video still represents the original meaning.",
      },
      {
        question: "Will regenerating one scene replace the others?",
        answer:
          "No. Regenerating one scene keeps the approved scenes unchanged. Test another visual, narration line or ending without rebuilding the entire text to Brainrot video, and keep the original version when you make a remix.",
      },
      {
        question: "Which video sizes are available?",
        answer:
          "The default format is 9:16 for TikTok, YouTube Shorts and Instagram Reels. Gameplay Mode supports 15, 30, 45 and 60 seconds, while AI Motion is available for 5 or 15-second source clips.",
      },
      {
        question: "How are credits estimated?",
        answer:
          "The credit estimate updates from video duration, template, voice choice and output quality. You see the expected cost before confirming the render. Credits are reserved during processing, charged after a successful output and returned if BrainrotKit cannot deliver a usable result.",
      },
      {
        question: "Can I turn the result into another style?",
        answer:
          "Yes. Create another project version to test a different hook, voice, template or ending while keeping the completed download in your project history.",
      },
    ],
    related: [
      { label: "PDF to Brainrot", href: "/pdf-to-brainrot" },
      { label: "Brainrot Voice", href: "/italian-brainrot-voice-generator" },
      { label: "Templates", href: "/templates" },
    ],
  },
};

export function getToolPage(slug: string) {
  return toolPages[slug];
}
