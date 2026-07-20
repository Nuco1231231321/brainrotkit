"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Clapperboard, FileText, Gamepad2, ImagePlus, LockKeyhole, Sparkles, Volume2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { requestAuthDialog } from "@/components/auth-dialog";
import { GameplayPicker } from "@/components/gameplay-picker";
import { draftStorageKey, type SavedDraft } from "@/lib/adapters";
import { sampleSources } from "@/lib/operation-path";
import { normalizeGameplayBackgroundId } from "@/lib/gameplay-backgrounds";
import { extractPdfText } from "@/lib/pdf-client";
import { aiMotionDurations, creditCostForRender, gameplayDurations, type RenderMode } from "@/lib/render-modes";
import type { ToolKind } from "@/lib/tool-pages";
import type { ContentFormat, StudyMode } from "@/lib/brainrot-script";

type ToolFormProps = {
  kind: ToolKind;
  sourcePath: string;
  inputLabel: string;
  inputPlaceholder: string;
  estimatedCredits: number;
};

type FormError = { field: "source" | "file" | "safety"; message: string } | null;
type FileStatus = { state: "idle" | "reading" | "ready" | "error"; message: string };

const templateOptions = ["Parkour", "Gameplay", "Satisfying loop", "Study explainer", "Meme slides"];
const voiceOptions = ["Milano Rush", "Opera Max", "Narrator Zero", "Soft Study"];

export function ToolForm({
  kind,
  sourcePath,
  inputLabel,
  inputPlaceholder,
  estimatedCredits,
}: ToolFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"text" | "pdf" | "idea" | ToolKind>(
    kind === "video" ? "text" : kind,
  );
  const [sourceText, setSourceText] = useState("");
  const [fileName, setFileName] = useState("");
  const [template, setTemplate] = useState(templateOptions[0]);
  const [voice, setVoice] = useState(voiceOptions[0]);
  const [duration, setDuration] = useState(kind === "pdf" ? "45" : kind === "text" ? "30" : "15");
  const [renderMode, setRenderMode] = useState<RenderMode>("gameplay");
  const [contentFormat, setContentFormat] = useState<ContentFormat>(kind === "pdf" ? "study" : "story");
  const [studyMode, setStudyMode] = useState<StudyMode>("explain");
  const [backgroundId, setBackgroundId] = useState("voxel-rush");
  const [goal, setGoal] = useState(kind === "pdf" ? "Study" : "TikTok");
  const [personality, setPersonality] = useState("Chaotic");
  const [speed, setSpeed] = useState("1");
  const [pitch, setPitch] = useState("0");
  const [intensity, setIntensity] = useState("65");
  const [language, setLanguage] = useState("English (US)");
  const [audience, setAudience] = useState("General");
  const [tone, setTone] = useState("Fast-paced");
  const [hookStyle, setHookStyle] = useState("Curiosity");
  const [summaryDepth, setSummaryDepth] = useState("Balanced");
  const [sceneCount, setSceneCount] = useState("6");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [safetyAccepted, setSafetyAccepted] = useState(false);
  const [error, setError] = useState<FormError>(null);
  const [fileStatus, setFileStatus] = useState<FileStatus>({ state: "idle", message: "" });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStartedAt, setSubmissionStartedAt] = useState<number | null>(null);
  const [submissionElapsed, setSubmissionElapsed] = useState(0);
  const submittingRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    const restoreTimer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(draftStorageKey);
        if (saved) {
          const draft = JSON.parse(saved) as SavedDraft;
          if (draft.sourcePath === sourcePath) {
            const fields = draft.fields;
            if (typeof fields.sourceText === "string") setSourceText(fields.sourceText);
            if (typeof fields.fileName === "string") setFileName(fields.fileName);
            if (typeof fields.template === "string") setTemplate(fields.template);
            if (typeof fields.voice === "string") setVoice(fields.voice);
            if (typeof fields.renderMode === "string") {
              const restoredMode = fields.renderMode === "ai-motion" ? "ai-motion" : "gameplay";
              setRenderMode(restoredMode);
              if (typeof fields.duration === "string") {
                setDuration(restoredMode === "gameplay" && fields.duration === "5" ? "15" : fields.duration);
              }
            } else if (typeof fields.duration === "string") {
              setDuration(fields.duration === "5" && kind !== "voice" ? "15" : fields.duration);
            }
            if (fields.contentFormat === "story" || fields.contentFormat === "debate" || fields.contentFormat === "study") setContentFormat(fields.contentFormat);
            if (fields.studyMode === "explain" || fields.studyMode === "quiz" || fields.studyMode === "summary") setStudyMode(fields.studyMode);
            if (typeof fields.backgroundId === "string") setBackgroundId(normalizeGameplayBackgroundId(fields.backgroundId));
            if (typeof fields.goal === "string") setGoal(fields.goal);
            if (typeof fields.personality === "string") setPersonality(fields.personality);
            if (typeof fields.speed === "string") setSpeed(fields.speed);
            if (typeof fields.pitch === "string") setPitch(fields.pitch);
            if (typeof fields.intensity === "string") setIntensity(fields.intensity);
            if (typeof fields.language === "string") setLanguage(fields.language);
            if (typeof fields.audience === "string") setAudience(fields.audience);
            if (typeof fields.tone === "string") setTone(fields.tone);
            if (typeof fields.hookStyle === "string") setHookStyle(fields.hookStyle);
            if (typeof fields.summaryDepth === "string") setSummaryDepth(fields.summaryDepth);
            if (typeof fields.sceneCount === "string") setSceneCount(fields.sceneCount);
            if (typeof fields.aspectRatio === "string") setAspectRatio(fields.aspectRatio);
            if (typeof fields.safetyAccepted === "boolean") setSafetyAccepted(fields.safetyAccepted);
            if (draft.projectType === "pdf") setMode("pdf");
            if (typeof fields.sourceText === "string" && fields.sourceText.length >= 8 && typeof fields.fileName === "string" && fields.fileName) {
              setFileStatus({ state: "ready", message: "Extracted text restored from your saved draft." });
            }
          }
        }
      } catch {
        window.localStorage.removeItem(draftStorageKey);
      }
    }, 0);

    fetch("/api/account", { cache: "no-store", signal: controller.signal })
      .then((response) => setIsAuthenticated(response.ok))
      .catch(() => undefined);
    return () => {
      window.clearTimeout(restoreTimer);
      controller.abort();
    };
  }, [kind, sourcePath]);

  useEffect(() => {
    if (!isSubmitting || submissionStartedAt === null) return;
    const updateElapsed = () => setSubmissionElapsed(Math.max(0, Math.floor((Date.now() - submissionStartedAt) / 1_000)));
    const timer = window.setInterval(updateElapsed, 1_000);
    return () => window.clearInterval(timer);
  }, [isSubmitting, submissionStartedAt]);

  const activeKind = mode === "pdf" ? "pdf" : kind;
  const creditEstimate = useMemo(() => {
    if (kind === "voice") return estimatedCredits;
    return creditCostForRender({ type: activeKind, durationSeconds: Number(duration), renderMode });
  }, [activeKind, duration, estimatedCredits, kind, renderMode]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    const needsFile = activeKind === "pdf";
    if ((needsFile && (!fileName || sourceText.trim().length < 8)) || (!needsFile && sourceText.trim().length < 8)) {
      setError({
        field: needsFile ? "file" : "source",
        message: needsFile ? "Choose a PDF and wait for text extraction to finish." : "Add at least 8 characters so the video has enough direction.",
      });
      return;
    }
    if (kind === "italian" && !safetyAccepted) {
      setError({ field: "safety", message: "Confirm that your character idea is original before continuing." });
      return;
    }

    const draft: SavedDraft = {
      sourcePath,
      projectType: activeKind,
      savedAt: new Date().toISOString(),
      fields: {
        sourceText,
        fileName,
        template,
        voice,
        duration,
        renderMode,
        contentFormat: activeKind === "pdf" ? "study" : contentFormat,
        studyMode,
        backgroundId,
        goal,
        personality,
        speed,
        pitch,
        intensity,
        language,
        audience,
        tone,
        hookStyle,
        summaryDepth,
        sceneCount,
        aspectRatio,
        safetyAccepted,
      },
    };
    window.localStorage.setItem(draftStorageKey, JSON.stringify(draft));
    if (!isAuthenticated) {
      requestAuthDialog({ returnTo: sourcePath, hasDraft: true });
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setSubmissionStartedAt(Date.now());
    setSubmissionElapsed(0);
    setError(null);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeKind,
          sourceText,
          sourceFileName: needsFile ? fileName : null,
          durationSeconds: Number(duration),
          settings: {
            template,
            voice,
            goal,
            personality,
            speed,
            pitch,
            intensity,
            language,
            audience,
            tone,
            hookStyle,
            summaryDepth,
            sceneCount,
            aspectRatio,
            safetyAccepted,
            renderMode,
            contentFormat: activeKind === "pdf" ? "study" : contentFormat,
            studyMode,
            backgroundId,
          },
        }),
      });
      const payload = await response.json() as { projectId?: string; error?: string };
      if (response.status === 401) {
        setIsAuthenticated(false);
        requestAuthDialog({ returnTo: sourcePath, hasDraft: true });
        return;
      }
      if (!response.ok || !payload.projectId) throw new Error(payload.error ?? "Project could not be created.");
      window.localStorage.removeItem(draftStorageKey);
      router.push(`/app/projects/${encodeURIComponent(payload.projectId)}`);
    } catch (submitError) {
      setError({ field: needsFile ? "file" : "source", message: submitError instanceof Error ? submitError.message : "Project could not be created." });
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
      setSubmissionStartedAt(null);
      setSubmissionElapsed(0);
    }
  }

  const sourceLabel = kind === "video" && mode === "idea" ? "Video idea" : inputLabel;
  const sourcePlaceholder = kind === "video" && mode === "idea"
    ? "Describe the hook, story or character you want to turn into a short video..."
    : inputPlaceholder;
  const submissionStage = submissionElapsed < 2 ? 0 : submissionElapsed < 9 ? 1 : 2;
  const submissionSteps = ["Save source and settings", "Write the editable script", "Open the project editor"];
  const sampleKey = kind === "voice" ? "voice" : kind === "italian" ? "italian" : kind === "text" ? "text" : mode === "idea" ? "idea" : "video";
  const sampleText = sampleSources[sampleKey];

  return (
    <form className={`tool-form${isSubmitting ? " is-submitting" : ""}`} onSubmit={handleSubmit} noValidate aria-busy={isSubmitting || fileStatus.state === "reading"}>
      {kind === "video" ? (
        <div className="segmented-control" role="group" aria-label="Source type">
          {(["text", "pdf", "idea"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={mode === item ? "active" : undefined}
              onClick={() => {
                setMode(item);
                if (item === "pdf") setContentFormat("study");
                if (item !== "pdf" && contentFormat === "study") setContentFormat("story");
                setError(null);
              }}
              aria-pressed={mode === item}
            >
              {item === "pdf" ? "PDF" : item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>
      ) : null}

      {activeKind === "pdf" ? (
        <div className="field-group">
          <label htmlFor={`${kind}-file`}>{inputLabel}</label>
          <label className="upload-dropzone" htmlFor={`${kind}-file`}>
            <FileText aria-hidden="true" size={22} />
            <span>{fileName || "Choose a PDF"}</span>
            <small id={`${kind}-file-help`}>PDF up to 25 MB. Text and scanned pages are supported.</small>
            <input
              id={`${kind}-file`}
              type="file"
              accept="application/pdf"
              aria-describedby={`${kind}-file-help${error?.field === "file" ? ` ${kind}-file-error` : ""}`}
              aria-invalid={error?.field === "file"}
              disabled={fileStatus.state === "reading" || isSubmitting}
              onChange={async (event) => {
                const file = event.target.files?.[0];
                setFileName(file?.name ?? "");
                setSourceText("");
                setError(null);
                if (!file) {
                  setFileStatus({ state: "idle", message: "" });
                  return;
                }
                setFileStatus({ state: "reading", message: "Reading PDF…" });
                try {
                  const extractedText = await extractPdfText(file, (progress) => {
                    setFileStatus({
                      state: "reading",
                      message: progress.stage === "ocr"
                        ? `Scanning page ${progress.current} of ${progress.total} with OCR…`
                        : `Reading page ${progress.current} of ${progress.total}…`,
                    });
                  });
                  setSourceText(extractedText);
                  setFileStatus({ state: "ready", message: `${extractedText.length.toLocaleString()} characters extracted in your browser.` });
                } catch (extractionError) {
                  const message = extractionError instanceof Error ? extractionError.message : "The PDF could not be read.";
                  setFileStatus({ state: "error", message });
                  setError({ field: "file", message });
                }
              }}
            />
          </label>
          {fileStatus.state === "reading" ? (
            <div className="file-operation-status" role="status" aria-live="polite">
              <span className="operation-pulse" aria-hidden="true"><i /><i /><i /></span>
              <div><strong>{fileStatus.message}</strong><span>Extraction runs in this browser before any project is created.</span></div>
            </div>
          ) : null}
          {fileStatus.state === "ready" ? <p className="file-ready-status" role="status"><Check aria-hidden="true" size={14} /> {fileStatus.message}</p> : null}
          {error?.field === "file" ? <p className="inline-error field-error" id={`${kind}-file-error`} role="alert">{error.message}</p> : null}
        </div>
      ) : (
        <div className="field-group prompt-field">
          <div className="field-label-row">
            <label htmlFor={`${kind}-source`}>{sourceLabel}</label>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setSourceText(sampleText);
                setError(null);
              }}
            >
              Try a sample
            </button>
          </div>
          <textarea
            id={`${kind}-source`}
            value={sourceText}
            onChange={(event) => {
              setSourceText(event.target.value);
              setError(null);
            }}
            placeholder={sourcePlaceholder}
            rows={kind === "voice" ? 5 : 7}
            aria-describedby={`${kind}-source-help${error?.field === "source" ? ` ${kind}-source-error` : ""}`}
            aria-invalid={error?.field === "source"}
          />
          <div className="field-meta" id={`${kind}-source-help`}>
            <span>{sourceText.length.toLocaleString()} characters</span>
            <span>{kind === "voice" ? "Short preview recommended" : "Your draft stays on this device"}</span>
          </div>
          {error?.field === "source" ? <p className="inline-error field-error" id={`${kind}-source-error`} role="alert">{error.message}</p> : null}
        </div>
      )}

      <div className="advanced-control-stack">
      {kind !== "voice" && kind !== "italian" ? (
        <fieldset className="render-mode-fieldset">
          <legend>Content format</legend>
          <div className="segmented-control" role="group" aria-label="Content format">
            {(["story", "debate", "study"] as const).map((format) => (
              <button
                key={format}
                type="button"
                className={(activeKind === "pdf" ? "study" : contentFormat) === format ? "active" : undefined}
                aria-pressed={(activeKind === "pdf" ? "study" : contentFormat) === format}
                disabled={activeKind === "pdf" && format !== "study"}
                onClick={() => setContentFormat(format)}
              >
                {format[0].toUpperCase() + format.slice(1)}
              </button>
            ))}
          </div>
          <p>{(activeKind === "pdf" ? "study" : contentFormat) === "debate"
            ? "Two original hosts alternate short turns with distinct voices and caption colors."
            : (activeKind === "pdf" ? "study" : contentFormat) === "study"
              ? "Source-grounded teaching with page references when the PDF provides page markers."
              : "One narrator moves from hook to conflict, payoff and a concise ending."}</p>
        </fieldset>
      ) : null}

      {kind !== "voice" && kind !== "italian" && (activeKind === "pdf" || contentFormat === "study") ? (
        <div className="field-group">
          <label htmlFor={`${kind}-study-mode`}>Study mode</label>
          <select id={`${kind}-study-mode`} value={studyMode} onChange={(event) => setStudyMode(event.target.value as StudyMode)}>
            <option value="explain">Explain the core concept</option>
            <option value="quiz">Ask, pause, then reveal</option>
            <option value="summary">Summarize the key points</option>
          </select>
        </div>
      ) : null}
      {kind === "italian" ? (
        <div className="field-grid two">
          <div className="field-group">
            <label htmlFor="personality">Personality</label>
            <select id="personality" value={personality} onChange={(event) => setPersonality(event.target.value)}>
              <option>Chaotic</option>
              <option>Dramatic</option>
              <option>Confident</option>
              <option>Mysterious</option>
            </select>
          </div>
          <div className="field-group">
            <label htmlFor="setting">Setting</label>
            <select id="setting" defaultValue="Night city">
              <option>Night city</option>
              <option>Italian plaza</option>
              <option>Arcade arena</option>
              <option>Kitchen chaos</option>
            </select>
          </div>
        </div>
      ) : null}

      <div className="field-group">
        <label htmlFor={`${kind}-template`}>{kind === "voice" ? "Voice preset" : "Template"}</label>
        <div className="option-row">
          <div className="option-leading" aria-hidden="true">
            {kind === "voice" ? <Volume2 size={18} /> : <ImagePlus size={18} />}
          </div>
          <select
            id={`${kind}-template`}
            value={kind === "voice" ? voice : template}
            onChange={(event) => kind === "voice" ? setVoice(event.target.value) : setTemplate(event.target.value)}
          >
            {(kind === "voice" ? voiceOptions : templateOptions).map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {kind !== "voice" ? (
        <fieldset className="render-mode-fieldset">
          <legend>Video mode</legend>
          <div className="render-mode-options">
            <button type="button" className={renderMode === "gameplay" ? "active" : undefined} aria-pressed={renderMode === "gameplay"} onClick={() => { setRenderMode("gameplay"); if (duration === "5") setDuration("15"); }}>
              <Gamepad2 aria-hidden="true" size={18} />
              <span><strong>Gameplay</strong><small>15–60 sec · original moving backgrounds</small></span>
            </button>
            <button type="button" className={renderMode === "ai-motion" ? "active" : undefined} aria-pressed={renderMode === "ai-motion"} onClick={() => { setRenderMode("ai-motion"); if (duration !== "5" && duration !== "15") setDuration("15"); }}>
              <Clapperboard aria-hidden="true" size={18} />
              <span><strong>AI Motion</strong><small>5–15 sec · premium motion</small></span>
            </button>
          </div>
          <p>{renderMode === "gameplay" ? "Uses a continuous original gameplay loop, generated narration and animated word captions. No unrelated image or AI movie is added." : "Generates a full-screen AI motion clip, then adds the approved narration and exact captions in your browser."}</p>
        </fieldset>
      ) : null}

      {kind !== "voice" && renderMode === "gameplay" ? (
        <GameplayPicker value={backgroundId} onChange={setBackgroundId} caption={sourceText || "Your story starts here"} />
      ) : null}

      {kind === "voice" ? (
        <div className="range-grid">
          <div className="field-group">
            <label htmlFor="speed">Speed <span>{Number(speed).toFixed(1)}x</span></label>
            <input id="speed" type="range" min="0.7" max="1.2" step="0.1" value={speed} onChange={(event) => setSpeed(event.target.value)} />
          </div>
          <div className="field-group">
            <label htmlFor="pitch">Pitch <span>{Number(pitch) > 0 ? "+" : ""}{pitch}</span></label>
            <input id="pitch" type="range" min="-4" max="4" step="1" value={pitch} onChange={(event) => setPitch(event.target.value)} />
          </div>
        </div>
      ) : (
        <div className="field-grid two">
          <div className="field-group">
            <label htmlFor={`${kind}-goal`}>Goal</label>
            <select id={`${kind}-goal`} value={goal} onChange={(event) => setGoal(event.target.value)}>
              {(kind === "pdf" ? ["Study", "Explain", "Quiz", "Story"] : ["TikTok", "YouTube Shorts", "Instagram Reels", "Study"]).map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>
          <div className="field-group">
            <label htmlFor={`${kind}-duration`}>Duration</label>
            <select id={`${kind}-duration`} value={duration} onChange={(event) => setDuration(event.target.value)}>
              {(renderMode === "ai-motion" ? aiMotionDurations : gameplayDurations).map((seconds) => <option key={seconds} value={seconds}>{seconds} seconds</option>)}
            </select>
          </div>
        </div>
      )}

      {kind === "italian" ? (
        <label className="check-row">
          <input type="checkbox" checked={safetyAccepted} aria-describedby={error?.field === "safety" ? `${kind}-safety-error` : undefined} aria-invalid={error?.field === "safety"} onChange={(event) => { setSafetyAccepted(event.target.checked); if (event.target.checked) setError(null); }} />
          <span>This is an original character idea and does not impersonate a real person.</span>
        </label>
      ) : null}
      {error?.field === "safety" ? <p className="inline-error field-error" id={`${kind}-safety-error`} role="alert">{error.message}</p> : null}

      <details className="advanced-disclosure">
        <summary>More settings</summary>
        <div className="advanced-fields">
          <div className="field-grid two">
            <div className="field-group">
              <label htmlFor={`${kind}-language`}>Language</label>
              <select id={`${kind}-language`} value={language} onChange={(event) => setLanguage(event.target.value)}>
                <option>English (US)</option><option>English (UK)</option><option>Italian</option><option>Spanish</option>
              </select>
            </div>
            <div className="field-group">
              <label htmlFor={`${kind}-audience`}>Audience</label>
              <select id={`${kind}-audience`} value={audience} onChange={(event) => setAudience(event.target.value)}>
                <option>General</option><option>Students</option><option>Creators</option><option>Fans</option>
              </select>
            </div>
          </div>

          {kind === "voice" ? (
            <div className="field-group">
              <label htmlFor={`${kind}-intensity`}>Intensity <span>{intensity}%</span></label>
              <input id={`${kind}-intensity`} type="range" min="0" max="100" value={intensity} onChange={(event) => setIntensity(event.target.value)} />
            </div>
          ) : null}

          {activeKind === "pdf" ? (
            <div className="field-grid two">
              <div className="field-group"><label htmlFor="pdf-depth">Summary depth</label><select id="pdf-depth" value={summaryDepth} onChange={(event) => setSummaryDepth(event.target.value)}><option>Concise</option><option>Balanced</option><option>Detailed</option></select></div>
              <div className="field-group"><label htmlFor="pdf-scenes">Scenes</label><select id="pdf-scenes" value={sceneCount} onChange={(event) => setSceneCount(event.target.value)}><option value="4">4 scenes</option><option value="6">6 scenes</option><option value="8">8 scenes</option></select></div>
            </div>
          ) : null}

          {kind === "text" || (kind === "video" && activeKind !== "pdf") ? (
            <div className="field-grid two">
              <div className="field-group"><label htmlFor={`${kind}-tone`}>Tone</label><select id={`${kind}-tone`} value={tone} onChange={(event) => setTone(event.target.value)}><option>Fast-paced</option><option>Funny</option><option>Dramatic</option><option>Educational</option></select></div>
              <div className="field-group"><label htmlFor={`${kind}-hook`}>Hook style</label><select id={`${kind}-hook`} value={hookStyle} onChange={(event) => setHookStyle(event.target.value)}><option>Curiosity</option><option>Bold claim</option><option>Question</option><option>Cold open</option></select></div>
            </div>
          ) : null}

          {kind !== "voice" ? (
            <div className="field-group"><label htmlFor={`${kind}-voice`}>Voice</label><select id={`${kind}-voice`} value={voice} onChange={(event) => setVoice(event.target.value)}>{voiceOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
          ) : null}

          {kind !== "voice" ? (
            <div className="field-group"><label htmlFor={`${kind}-ratio`}>Aspect ratio</label><select id={`${kind}-ratio`} value={aspectRatio} onChange={(event) => setAspectRatio(event.target.value)}><option>9:16</option><option>1:1</option><option>16:9</option></select></div>
          ) : null}
        </div>
      </details>
      </div>

      <div className="estimate-row">
        <span><LockKeyhole aria-hidden="true" size={14} /> {isAuthenticated ? "Saved to your private workspace" : "Sign in required to generate"}</span>
        <strong>{creditEstimate} credits estimated</strong>
      </div>

      <button className="button-primary generate-button" type="submit" disabled={isSubmitting || fileStatus.state === "reading"} aria-busy={isSubmitting || fileStatus.state === "reading"}>
        {isSubmitting || fileStatus.state === "reading" ? <span className="button-thinking" aria-hidden="true"><i /><i /><i /></span> : <Sparkles aria-hidden="true" size={18} />}
        {isSubmitting ? "Creating project" : fileStatus.state === "reading" ? "Reading PDF" : kind === "voice" ? "Create voice project" : "Create project"}
        <span>{creditEstimate}</span>
      </button>
      {isSubmitting ? (
        <div className="project-creation-status" role="status" aria-live="polite">
          <div className="project-creation-heading">
            <div><span className="operation-pulse" aria-hidden="true"><i /><i /><i /></span><strong>Creating your project</strong></div>
            <span>{submissionElapsed}s elapsed</span>
          </div>
          <ol>
            {submissionSteps.map((step, index) => (
              <li className={index < submissionStage ? "complete" : index === submissionStage ? "active" : "pending"} key={step}>
                <span>{index < submissionStage ? <Check aria-hidden="true" size={12} /> : index + 1}</span>
                <strong>{step}</strong>
              </li>
            ))}
          </ol>
          <p>{submissionElapsed >= 12 ? "Still working. Keep this page open; the request has not been submitted twice." : "Your draft is safe. Keep this page open while the script is prepared."}</p>
        </div>
      ) : null}
      <p className="form-disclosure">
        {kind === "voice"
          ? "Path: create project → generate audio → download. Credits are confirmed before generation."
          : renderMode === "gameplay"
            ? "Path: create project (script) → generate narration → export MP4 in your browser (gameplay + captions)."
            : "Path: create project (script) → generate motion assets → export MP4 in your browser."}
      </p>
    </form>
  );
}