import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const homeFaqs = [
  {
    question: "What does an AI Brainrot video generator make?",
    answer:
      "An AI Brainrot video generator turns your prompt, script, PDF or character idea into a vertical video. You get an editable hook, scenes, generated voice and visual template before the final render.",
  },
  {
    question: "How do I make an AI Brainrot video?",
    answer:
      "Paste text, upload a PDF or describe an idea in the AI Brainrot video generator. Choose a template, voice and duration, edit the generated hook and scenes, then check the credits and confirm the render.",
  },
  {
    question: "Can I turn a PDF into a Brainrot study video?",
    answer:
      "Yes. PDF to Brainrot turns the points you approve into a summary, explainer, quiz or story. Correct names, dates, formulas and OCR mistakes before creating a video from lecture notes, readings or revision guides.",
  },
  {
    question: "Can I edit the video before downloading it?",
    answer:
      "Yes. Rewrite the hook and narration, change scene directions, switch the voice or choose another visual template before rendering.",
  },
  {
    question: "Is the AI Brainrot video generator free?",
    answer:
      "You receive 10 starter credits after Google sign-in, enough for one 15-second Gameplay video. Paid plans add credits for longer videos or AI Motion.",
  },
  {
    question: "Can I make videos for TikTok, Shorts and Reels?",
    answer:
      "Yes. The default 9:16 format fits TikTok, Shorts and Reels. Gameplay supports 15, 30, 45 or 60 seconds; AI Motion supports 5 or 15 seconds.",
  },
  {
    question: "What happens if my video fails to generate?",
    answer:
      "Retry the failed scene, voice or render without rebuilding completed parts. If BrainrotKit cannot deliver a usable output, the credits reserved for that generation return to your account.",
  },
  {
    question: "Are my prompts and PDF files used for model training?",
    answer:
      "No. Private prompts and PDFs are not used to train BrainrotKit models. Original PDFs are deleted within 24 hours. Deleting your work queues its source, intermediate media and final output for removal.",
  },
  {
    question: "Does BrainrotKit support voice cloning?",
    answer:
      "No. You cannot upload a sample or clone a real person's voice. Choose a provided voice preset, then adjust its speed, pitch and intensity for your character or narration.",
  },
];

export function HomeSeoContent() {
  return (
    <div className="home-seo-content">
      <section className="seo-answer-section narrow-shell" aria-labelledby="what-is-heading">
        <div>
          <p className="eyebrow">One input, one finished short</p>
          <h2 id="what-is-heading">Turn what you have into a Brainrot video</h2>
        </div>
        <div className="seo-prose">
          <p>
            The <strong>AI Brainrot video generator</strong> turns an idea, article, comment thread, script or PDF into a vertical short with an editable hook, narration, scenes, voice and visual style.
          </p>
          <p>
            Use the <strong>AI Brainrot generator</strong> to rewrite the opening, change a voice, replace a scene or adjust the pace before rendering.
          </p>
        </div>
      </section>

      <section className="seo-table-section page-shell" aria-labelledby="source-options-heading">
        <div className="section-heading">
          <h2 id="source-options-heading">Start with the content you already have</h2>
          <p>Choose the input that matches your task and the file you want at the end.</p>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th scope="col">You have</th><th scope="col">You get</th><th scope="col">Use it for</th><th scope="col">Start here</th></tr>
            </thead>
            <tbody>
              <tr><th scope="row">Text or script</th><td>Hook, scenes, generated voice and a 9:16 video</td><td>Stories, articles and comments</td><td><Link href="/text-to-brainrot">Text to Brainrot</Link></td></tr>
              <tr><th scope="row">PDF or notes</th><td>Checked outline, summary or quiz, and study video</td><td>Revision and explainers</td><td><Link href="/pdf-to-brainrot">PDF to Brainrot</Link></td></tr>
              <tr><th scope="row">Character idea</th><td>Name, image direction, lore, voice and video</td><td>Italian Brainrot series</td><td><Link href="/italian-brainrot-generator">Italian generator</Link></td></tr>
              <tr><th scope="row">Dialogue</th><td>Tuned voice preset and downloadable narration</td><td>Character lines and voiceovers</td><td><Link href="/italian-brainrot-voice-generator">Voice generator</Link></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="seo-answer-section narrow-shell" aria-labelledby="workflow-detail-heading">
        <div>
          <p className="eyebrow">From source to download</p>
          <h2 id="workflow-detail-heading">How to make your first video</h2>
        </div>
        <ol className="seo-step-list">
          <li><span>01</span><div><h3>Add your source</h3><p>Describe the idea, paste text or upload a PDF, then choose a platform and duration.</p></div></li>
          <li><span>02</span><div><h3>Check the hook and scenes</h3><p>Read the opening and scene order. Correct names, dates, formulas or OCR errors before rendering.</p></div></li>
          <li><span>03</span><div><h3>Choose the voice and look</h3><p>Pick a voice and visual template, then fix any line or scene direction.</p></div></li>
          <li><span>04</span><div><h3>Check the cost and export</h3><p>Confirm credits, compose the MP4 in your browser and download it.</p></div></li>
        </ol>
      </section>

      <section className="seo-benefit-section page-shell" aria-labelledby="control-heading">
        <div className="section-heading lime">
          <h2 id="control-heading">Change what matters before you pay</h2>
          <p>You should know what will be rendered, what it costs and what you can fix.</p>
        </div>
        <ul>
          <li><CheckCircle2 aria-hidden="true" size={18} /><div><h3>See the cost first</h3><p>Duration, template, voice and quality update the estimate before you confirm.</p></div></li>
          <li><CheckCircle2 aria-hidden="true" size={18} /><div><h3>Read every line</h3><p>The hook and narration stay visible and editable before you publish.</p></div></li>
          <li><CheckCircle2 aria-hidden="true" size={18} /><div><h3>Retry one part</h3><p>Retry a failed scene or voice while keeping completed work.</p></div></li>
          <li><CheckCircle2 aria-hidden="true" size={18} /><div><h3>Find every version</h3><p>Keep drafts, videos and remixes together for later downloads.</p></div></li>
        </ul>
      </section>

      <section className="seo-answer-section narrow-shell" aria-labelledby="who-for-heading">
        <div>
          <p className="eyebrow">Creator and study use cases</p>
          <h2 id="who-for-heading">What can you make with an AI Brainrot generator?</h2>
        </div>
        <div className="seo-prose">
          <p>
            Use the <strong>brainrot video generator</strong> to turn a story, reaction, comment thread or product idea into a 9:16 short for TikTok, Shorts or Reels.
          </p>
          <p>
            For study, turn notes into an explanation, revision video or quiz while checking the facts. For entertainment, create an original Italian Brainrot character or voice line.
          </p>
          <Link href="/templates" className="inline-arrow-link">Browse video templates <ArrowRight aria-hidden="true" size={15} /></Link>
        </div>
      </section>

      <section className="seo-trust-section narrow-shell" aria-labelledby="trust-heading">
        <div className="section-heading">
          <h2 id="trust-heading">Know what you pay for and what you can publish</h2>
          <p>Check the output rules before you generate.</p>
        </div>
        <div className="seo-prose columns">
          <p>
            Starter credits cover one 15-second Gameplay video. Paid plans cover longer projects or AI Motion. You see the estimate first, and reserved credits return when a usable result cannot be delivered.
          </p>
          <p>
            Upload or paste only material you have permission to use. BrainrotKit avoids unlicensed character packs and real-person voice cloning. Private inputs are not used for training, and original PDFs are deleted within 24 hours.
          </p>
        </div>
      </section>
    </div>
  );
}
