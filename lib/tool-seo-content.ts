export type ToolSeoSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export const toolSeoContent: Record<string, ToolSeoSection[]> = {
  "italian-brainrot-generator": [
    {
      title: "What can you make with an Italian Brainrot Generator?",
      paragraphs: [
        "An Italian Brainrot generator combines your animal, object, personality and setting into an original character. You receive more than a random name: the result includes visual direction, short lore, a catchphrase, a voice choice and an optional vertical video. Edit each part before creating the final image or video.",
        "Use the Italian Brainrot generator when you want a character you can reuse across several posts. Keep the same name, look and voice, then change the dialogue or setting for the next episode. This makes a short series feel connected without forcing you to recreate the character every time.",
      ],
    },
    {
      title: "How to get a stronger character",
      paragraphs: [
        "Give the Italian Brainrot character generator one clear combination, one behavior and one setting. Explain what should be funny, strange or memorable about the contrast. A focused idea such as a dramatic espresso machine mixed with a racing pigeon produces a clearer result than a long list of unrelated details.",
      ],
      bullets: [
        "Combine one recognizable animal or creature with one object, food or machine.",
        "Choose one personality: dramatic, chaotic, confident or mysterious.",
        "Add a setting that makes the joke or catchphrase easier to understand.",
        "Choose the language, voice and duration before you create the video version.",
      ],
    },
    {
      title: "Edit the character before you download it",
      paragraphs: [
        "The Italian Brainrot maker is for original ideas, not copied characters or celebrity voices. Change the generated name, rewrite the lore, replace the image direction, adjust the catchphrase or choose another voice before you render the short video.",
        "Download the character image by itself, create a voice line or render a vertical MP4. Gameplay Mode assembles longer videos in the browser, while AI Motion supplies a short 480p motion source. If generation fails, retry the project while retaining completed image or audio assets.",
      ],
    },
  ],
  "italian-brainrot-voice-generator": [
    {
      title: "Turn a line into an Italian Brainrot voice",
      paragraphs: [
        "An Italian Brainrot voice generator turns your written dialogue into stylized character narration. Paste a catchphrase or short script, choose a preset and adjust the delivery before creating and downloading the final audio.",
        "Use Italian Brainrot text to speech when the voice carries the joke or character. Generate a short preview to check pronunciation, pacing and intensity before you create the full line. You can hear the script without paying for a complete video render first.",
      ],
    },
    {
      title: "Make the delivery fit the line",
      paragraphs: [
        "Choose a Brainrot voice preset that matches the character, then tune speed, pitch and intensity. Speed controls rhythm, pitch makes the voice feel lighter or heavier, and intensity changes how restrained or exaggerated it sounds. Keep the first test short so you can compare several deliveries quickly.",
      ],
      bullets: [
        "Compare several presets with the same short line.",
        "Check the character count and estimated credits before generating.",
        "Split a long script when different sections need different pacing.",
        "Add the selected audio to a video without pasting the script again.",
      ],
    },
    {
      title: "Download the audio",
      paragraphs: [
        "Brainrot text to speech uses provided presets and does not accept uploaded samples for voice cloning. Choose a preset for its tone and performance, not because it claims to copy a celebrity, public figure or protected character.",
        "Your saved audio keeps the source text, preset, speed and intensity settings. Regenerate the line or download the stored audio from the project page.",
      ],
    },
  ],
  "pdf-to-brainrot": [
    {
      title: "Turn a PDF into a short study video",
      paragraphs: [
        "PDF to Brainrot turns lecture notes, readings and study guides into an editable short-video outline. Upload the document, then choose a summary, explainer, quiz or story. Inspect the extracted points before they become narration and scene directions.",
        "A useful PDF to Brainrot result should be accurate, not merely fast. Review the recognized content, choose the summary depth, audience and duration, and remove details that do not belong in the video. This prevents an extraction mistake from becoming a polished but inaccurate explanation.",
      ],
    },
    {
      title: "Check text PDFs and scanned pages",
      paragraphs: [
        "Text PDFs can be read directly, while scanned pages need OCR. After extraction, check names, formulas, dates and section titles that OCR may have misunderstood. Unlock password-protected files and repair damaged PDFs before uploading them.",
      ],
      bullets: [
        "Choose Study for concise revision and key points.",
        "Choose Explain for a step-by-step narrative.",
        "Choose Quiz for a question, pause and answer reveal.",
        "Choose Story for chronological or cause-and-effect material.",
      ],
    },
    {
      title: "Correct the facts before rendering",
      paragraphs: [
        "The Brainrot PDF page keeps the extracted outline visible while you edit the scene script. Change the number of scenes or replace an unclear explanation before you create the voice or video. A failed extraction does not use rendering credits.",
        "Original PDFs are deleted within 24 hours and are not used to train BrainrotKit models. Deleting your work queues the source, intermediate media and final output for removal. Only upload documents you have permission to use, especially when they contain private or copyrighted information.",
      ],
    },
  ],
  "text-to-brainrot": [
    {
      title: "Turn your text into a paced short video",
      paragraphs: [
        "Text to Brainrot turns an article, story, comment thread, script or rough idea into an editable short video. Paste the source, choose the platform and audience, then create a hook and scenes for a 15, 30, 45 or 60-second Gameplay video, or choose a 5 or 15-second AI Motion source.",
        "A good text to Brainrot video is not one long voiceover on a random background. Each scene should support one part of the story with matching narration and visuals. You can change the voice, pace and template before rendering.",
      ],
    },
    {
      title: "Build a clear hook and scene order",
      paragraphs: [
        "Paste the useful source information instead of unrelated fragments. Choose the goal, tone, audience and platform so the hook fits the viewer. Then rewrite narration, reorder scenes, remove repeated points and replace any visual that does not support its line.",
      ],
      bullets: [
        "Use Story for personal stories, threads and dramatic sequences.",
        "Use Explain for articles, product ideas and educational topics.",
        "Use a faster hook and shorter scenes for TikTok and Reels.",
        "Keep approved scenes while regenerating only the weak part.",
      ],
    },
    {
      title: "Review the text to AI Brainrot video before export",
      paragraphs: [
        "Your text to AI Brainrot video combines the approved script with a visual template and selected voice. Before rendering, check the ratio, Gameplay or AI Motion mode, duration and estimated credits. The browser then exports a final MP4 with exact captions.",
        "Save the result so you can download, edit or remix it later. If one scene, voice or render fails, retry that part without overwriting the rest. Test another hook or ending without rebuilding the entire video.",
      ],
    },
  ],
};
