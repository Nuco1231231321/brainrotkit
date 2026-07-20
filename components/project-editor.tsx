"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, Check, Clock3, Download, FileText, Layers3, Mic2, Plus, Save, Sparkles, Trash2, UserRound, WandSparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GameplayPicker } from "@/components/gameplay-picker";
import { GameplayPreview } from "@/components/gameplay-preview";
import { VideoComposer } from "@/components/video-composer";
import type { BrainrotDialogueTurn } from "@/lib/brainrot-script";
import { normalizeGameplayBackgroundId } from "@/lib/gameplay-backgrounds";
import type { BrainrotScene } from "@/lib/kie";
import type { ProjectDetail, ProjectSettings, ProjectStatus } from "@/lib/projects";
import { creditCostForRender, getRenderMode, type RenderMode } from "@/lib/render-modes";
import { editorOperationPath } from "@/lib/operation-path";

type EditorTab = "source" | "character" | "script" | "scenes" | "voice" | "style";

function editorTabs(project: ProjectDetail): EditorTab[] {
  if (project.type === "pdf") return ["source", "script", "scenes", "voice", "style"];
  if (project.type === "italian") return ["character", "script", "scenes", "voice", "style"];
  if (project.type === "voice") return ["script", "voice"];
  return ["script", "scenes", "voice", "style"];
}

function setting(settings: ProjectSettings, key: string, fallback: string) {
  const value = settings[key];
  return typeof value === "string" && value ? value : fallback;
}

function stepLabel(kind: "image" | "voice" | "video") {
  return kind === "image" ? "Create visual" : kind === "voice" ? "Create voice" : "Render video";
}

function stepActivity(kind: "image" | "voice" | "video", status: string) {
  if (status === "completed") return kind === "image" ? "Visual saved" : kind === "voice" ? "Narration saved" : "Video saved";
  if (status === "failed") return "Needs attention";
  if (status === "finalizing") return "Saving the finished file";
  if (status === "submitted" || status === "processing") {
    return kind === "image" ? "Building the key visual" : kind === "voice" ? "Recording the narration" : "Animating the final video";
  }
  return "Waiting for the previous stage";
}

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function downloadUrl(url: string) {
  return `${url}${url.includes("?") ? "&" : "?"}download=1`;
}

export function ProjectEditor({
  initialProject,
  availableCredits,
  estimatedCredits,
}: {
  initialProject: ProjectDetail;
  availableCredits: number;
  estimatedCredits: number;
}) {
  const [project, setProject] = useState(initialProject);
  const tabs = useMemo(() => editorTabs(project), [project]);
  const [tab, setTab] = useState<EditorTab>(tabs[0]);
  const [title, setTitle] = useState(project.title);
  const [hook, setHook] = useState(project.script.hook);
  const [narration, setNarration] = useState(project.script.narration);
  const [scenes, setScenes] = useState<BrainrotScene[]>(project.script.scenes);
  const [dialogue, setDialogue] = useState<BrainrotDialogueTurn[]>(project.script.dialogue);
  const [speakerVoices, setSpeakerVoices] = useState<Record<string, string>>(() => Object.fromEntries(project.script.speakers.map((speaker, index) => [
    speaker.id,
    index === 0 ? setting(project.settings, "voice", speaker.voicePreset) : setting(project.settings, `voice:${speaker.id}`, speaker.voicePreset),
  ])));
  const [voicePreset, setVoicePreset] = useState(setting(project.settings, "voice", "Milano Rush"));
  const [voiceSpeed, setVoiceSpeed] = useState(setting(project.settings, "speed", "1"));
  const [voiceIntensity, setVoiceIntensity] = useState(setting(project.settings, "intensity", "65"));
  const [template, setTemplate] = useState(setting(project.settings, "template", "Parkour"));
  const [captionStyle, setCaptionStyle] = useState(setting(project.settings, "captionStyle", "TikTok Classic"));
  const [aspectRatio, setAspectRatio] = useState(setting(project.settings, "aspectRatio", "9:16"));
  const [renderMode, setRenderMode] = useState<RenderMode>(getRenderMode(project.settings));
  const [backgroundId, setBackgroundId] = useState(normalizeGameplayBackgroundId(setting(project.settings, "backgroundId", "voxel-rush")));
  const [saveState, setSaveState] = useState<"saved" | "saving" | "failed">("saved");
  const [notice, setNotice] = useState("");
  const [noticeTone, setNoticeTone] = useState<"info" | "success" | "error">("info");
  const [requestPending, setRequestPending] = useState(false);
  const [displayedCredits, setDisplayedCredits] = useState(availableCredits);
  const [pollState, setPollState] = useState<"connected" | "retrying">("connected");
  const initialGenerationTime = initialProject.job?.createdAt
    ?? (initialProject.status === "processing" ? initialProject.updatedAt : null);
  const [generationRequestedAt, setGenerationRequestedAt] = useState<number | null>(initialGenerationTime);
  const [clockNow, setClockNow] = useState(initialGenerationTime ?? 0);
  const mounted = useRef(false);
  const saveVersion = useRef(0);

  const settings = useMemo<ProjectSettings>(() => ({
    ...project.settings,
    voice: voicePreset,
    speed: voiceSpeed,
    intensity: voiceIntensity,
    template,
    captionStyle,
    aspectRatio,
    renderMode,
    backgroundId,
    ...Object.fromEntries(Object.entries(speakerVoices).map(([speakerId, preset]) => [`voice:${speakerId}`, preset])),
  }), [aspectRatio, backgroundId, captionStyle, project.settings, renderMode, speakerVoices, template, voiceIntensity, voicePreset, voiceSpeed]);
  const calculatedCredits = creditCostForRender({ type: project.type, durationSeconds: project.durationSeconds, renderMode });
  const confirmedCredits = Number.isFinite(calculatedCredits) ? calculatedCredits : estimatedCredits;

  async function saveProject(showNotice = false) {
    if (project.status === "processing") return project;
    const version = ++saveVersion.current;
    setSaveState("saving");
    const response = await fetch(`/api/projects/${encodeURIComponent(project.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, hook, narration, scenes, dialogue, speakers: project.script.speakers, studyMode: project.script.studyMode, sourceReferences: project.script.sourceReferences, settings }),
    });
    const payload = await response.json() as { project?: ProjectDetail; error?: string };
    if (!response.ok || !payload.project) {
      if (version === saveVersion.current) setSaveState("failed");
      throw new Error(payload.error ?? "Project could not be saved.");
    }
    if (version === saveVersion.current) {
      setProject(payload.project);
      setSaveState("saved");
      if (showNotice) {
        setNoticeTone("success");
        setNotice("Project saved to your account.");
      }
    }
    return payload.project;
  }

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (project.status === "processing") return;
    const timer = window.setTimeout(() => {
      void saveProject().catch(() => undefined);
    }, 900);
    return () => window.clearTimeout(timer);
    // The editable fields intentionally define this save boundary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, hook, narration, scenes, dialogue, speakerVoices, voicePreset, voiceSpeed, voiceIntensity, template, captionStyle, aspectRatio, renderMode, backgroundId]);

  useEffect(() => {
    if (project.status !== "processing" && !requestPending) return;
    const timer = window.setInterval(() => setClockNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [project.status, requestPending]);

  useEffect(() => {
    if (project.status !== "processing") return;
    let active = true;
    let timer: number | undefined;
    async function poll() {
      try {
        const response = await fetch(`/api/projects/${encodeURIComponent(project.id)}`, { cache: "no-store" });
        const payload = await response.json() as { project?: ProjectDetail };
        if (!active || !response.ok || !payload.project) {
          if (active) setPollState("retrying");
          timer = window.setTimeout(poll, 8_000);
          return;
        }
        setPollState("connected");
        setProject(payload.project);
        if (payload.project.job?.createdAt) setGenerationRequestedAt(payload.project.job.createdAt);
        if (payload.project.status === "processing") timer = window.setTimeout(poll, 4_000);
        if (payload.project.status === "completed") {
          setNoticeTone("success");
          setNotice(payload.project.type === "voice"
            ? "Your audio is ready to download."
            : "Narration is ready — final MP4 export starts automatically for Gameplay mode.");
          window.dispatchEvent(new Event("brainrotkit:account-refresh"));
        }
        if (payload.project.status === "failed") {
          setDisplayedCredits((credits) => credits + confirmedCredits);
          setNoticeTone("error");
          setNotice(payload.project.errorMessage ?? "Generation failed. Reserved credits were returned.");
          window.dispatchEvent(new Event("brainrotkit:account-refresh"));
        }
      } catch {
        if (active) {
          setPollState("retrying");
          timer = window.setTimeout(poll, 8_000);
        }
      }
    }
    timer = window.setTimeout(poll, 2_000);
    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [confirmedCredits, project.id, project.status]);

  function updateScene(id: string, field: keyof Pick<BrainrotScene, "narration" | "imagePrompt" | "motionPrompt">, value: string) {
    const nextScenes = scenes.map((scene) => scene.id === id ? { ...scene, [field]: value } : scene);
    setScenes(nextScenes);
    if (field === "narration" && project.script.contentFormat !== "debate") {
      const nextNarration = nextScenes.map((scene) => scene.narration.trim()).filter(Boolean).join(" ");
      setNarration(nextNarration);
      setDialogue((turns) => turns.length ? [{ ...turns[0], text: nextNarration }, ...turns.slice(1)] : turns);
    }
  }

  function updateDialogueTurn(id: string, field: keyof Pick<BrainrotDialogueTurn, "speakerId" | "text" | "emotion">, value: string) {
    const nextDialogue = dialogue.map((turn) => turn.id === id ? { ...turn, [field]: value } : turn) as BrainrotDialogueTurn[];
    setDialogue(nextDialogue);
    setNarration(nextDialogue.map((turn) => turn.text.trim()).filter(Boolean).join(" "));
  }

  function addDialogueTurn() {
    if (dialogue.length >= 24) return;
    const speaker = project.script.speakers[dialogue.length % Math.max(1, project.script.speakers.length)] ?? project.script.speakers[0];
    const next = [...dialogue, { id: crypto.randomUUID(), speakerId: speaker?.id ?? "speaker-narrator", text: "Add the next line.", emotion: "neutral" as const }];
    setDialogue(next);
    setNarration(next.map((turn) => turn.text.trim()).filter(Boolean).join(" "));
  }

  function removeDialogueTurn(id: string) {
    if (dialogue.length <= 1) return;
    const next = dialogue.filter((turn) => turn.id !== id);
    setDialogue(next);
    setNarration(next.map((turn) => turn.text.trim()).filter(Boolean).join(" "));
  }

  function addScene() {
    if (scenes.length >= 8) {
      setNoticeTone("info");
      setNotice("A project can contain up to 8 scenes.");
      return;
    }
    const number = scenes.length + 1;
    const nextScenes = [...scenes, {
      id: crypto.randomUUID(),
      label: `Scene ${number}`,
      narration: "Add narration for this scene.",
      imagePrompt: "Describe the vertical scene composition, subject and lighting.",
      motionPrompt: "Describe the subject action and camera movement.",
    }];
    setScenes(nextScenes);
    setNarration(nextScenes.map((scene) => scene.narration.trim()).filter(Boolean).join(" "));
  }

  function moveScene(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= scenes.length) return;
    const nextScenes = [...scenes];
    [nextScenes[index], nextScenes[nextIndex]] = [nextScenes[nextIndex], nextScenes[index]];
    setScenes(nextScenes);
    setNarration(nextScenes.map((scene) => scene.narration.trim()).filter(Boolean).join(" "));
  }

  function deleteScene(id: string) {
    if (scenes.length <= 1) return;
    const nextScenes = scenes.filter((scene) => scene.id !== id);
    setScenes(nextScenes);
    setNarration(nextScenes.map((scene) => scene.narration.trim()).filter(Boolean).join(" "));
  }

  async function startGeneration() {
    setRequestPending(true);
    const requestedAt = Date.now();
    setGenerationRequestedAt(requestedAt);
    setClockNow(requestedAt);
    setNoticeTone("info");
    setNotice("");
    try {
      const saved = project.status === "failed" && saveState === "saved" ? project : await saveProject();
      const response = await fetch(`/api/projects/${encodeURIComponent(saved.id)}/generate`, { method: "POST" });
      const payload = await response.json() as { error?: string; jobId?: string };
      if (!response.ok) throw new Error(payload.error ?? "Generation could not be started.");
      setProject({ ...saved, status: "processing", outputUrl: null, outputIsFinal: false });
      setGenerationRequestedAt(requestedAt);
      setPollState("connected");
      setDisplayedCredits((credits) => Math.max(0, credits - confirmedCredits));
      window.dispatchEvent(new Event("brainrotkit:account-refresh"));
      setNotice("Generation started. Leaving this page will not stop the job.");
    } catch (generationError) {
      setGenerationRequestedAt(null);
      setNoticeTone("error");
      setNotice(generationError instanceof Error ? generationError.message : "Generation could not be started.");
    } finally {
      setRequestPending(false);
    }
  }

  const isVoice = project.type === "voice";
  const generationState: ProjectStatus = project.status;
  const outputFormat = isVoice ? "Audio" : "Browser-composed MP4";
  const renderLabel = isVoice ? "Generate audio" : renderMode === "ai-motion" ? "Generate motion assets" : "Generate narration";
  const statusHeading = generationState === "completed" ? (isVoice || project.outputIsFinal ? "Ready to download" : "Ready to export") : generationState === "processing" ? "Generation in progress" : generationState === "failed" ? "Generation needs attention" : "Ready to render";
  const missingCredits = Math.max(confirmedCredits - displayedCredits, 0);
  const plannedVoiceCount = project.script.contentFormat === "debate" ? Math.max(1, dialogue.length) : 1;
  const plannedSteps = [
    ...(renderMode === "ai-motion" || project.type === "italian"
      ? [{ kind: "image" as const, status: "pending" as const, sequence: 0, progress: 0, errorMessage: null }]
      : []),
    ...Array.from({ length: plannedVoiceCount }, (_, index) => ({
      kind: "voice" as const,
      status: "pending" as const,
      sequence: (renderMode === "ai-motion" || project.type === "italian" ? 1 : 0) + index,
      progress: 0,
      errorMessage: null,
    })),
    ...(renderMode === "ai-motion"
      ? [{ kind: "video" as const, status: "pending" as const, sequence: plannedVoiceCount + 1, progress: 0, errorMessage: null }]
      : []),
  ];
  const generationSteps = project.job?.steps ?? plannedSteps;
  const currentStep = generationSteps.find((step) => ["submitted", "processing", "finalizing"].includes(step.status))
    ?? generationSteps.find((step) => step.status === "pending")
    ?? generationSteps.at(-1);
  const generationElapsed = generationRequestedAt ? Math.max(0, Math.floor((clockNow - generationRequestedAt) / 1_000)) : 0;
  const voiceStepIndex = currentStep?.kind === "voice" ? generationSteps.filter((step) => step.kind === "voice" && step.sequence <= currentStep.sequence).length - 1 : -1;
  const currentSpeaker = voiceStepIndex >= 0 ? project.script.speakers.find((speaker) => speaker.id === dialogue[voiceStepIndex]?.speakerId) : null;
  const outputDimensions = aspectRatio === "1:1" ? "720 × 720" : aspectRatio === "16:9" ? "1280 × 720" : "720 × 1280";
  const currentStepLabel = requestPending ? "Submitting one job" : currentStep ? currentStep.kind === "voice" && plannedVoiceCount > 1 ? `Voice ${voiceStepIndex + 1}: ${currentSpeaker?.name ?? "Speaker"}` : stepLabel(currentStep.kind) : "Preparing generation";
  const currentStepActivity = requestPending ? "Saving your latest edits and reserving credits" : currentStep ? stepActivity(currentStep.kind, currentStep.status) : "Preparing the first stage";
  const operationSteps = editorOperationPath({
    isVoice,
    status: generationState,
    outputIsFinal: Boolean(project.outputIsFinal),
    hasNarration: Boolean(project.narrationUrl),
  });

  return (
    <div className="editor-page">
      <header className="editor-heading">
        <div><Link href="/app">Projects</Link><span>/</span><input aria-label="Project name" value={title} disabled={generationState === "processing"} onChange={(event) => setTitle(event.target.value)} /></div>
        <div className={`save-state ${saveState}`} aria-live="polite">
          {saveState === "saving" ? <><Save aria-hidden="true" size={13} /> Saving</> : saveState === "failed" ? <><span>Save failed</span><button type="button" onClick={() => void saveProject(true).catch((error) => { setNoticeTone("error"); setNotice(error.message); })}>Retry</button></> : <><Check aria-hidden="true" size={13} /> Saved to account</>}
        </div>
      </header>

      <main id="main-content" className="editor-grid">
        <h1 className="sr-only">{title} project editor</h1>
        <section className="editor-controls" aria-label="Project controls">
          <div className="editor-tabs" role="group" aria-label="Editor sections">
            {tabs.map((item) => <button key={item} type="button" aria-pressed={tab === item} className={tab === item ? "active" : undefined} onClick={() => setTab(item)}>{item}</button>)}
          </div>

          {tab === "source" ? <div className="settings-stack"><div className="control-section-title"><div><FileText aria-hidden="true" size={16} /><h2>Extracted PDF text</h2></div></div><p className="control-help">Review the extracted source used to build this project.</p><textarea value={project.sourceText} readOnly rows={16} aria-label="Extracted PDF text" /></div> : null}
          {tab === "character" ? <div className="settings-stack"><div className="control-section-title"><div><UserRound aria-hidden="true" size={16} /><h2>Original character brief</h2></div></div><p className="control-help">This source brief anchors the character, voice and visual direction.</p><textarea value={project.sourceText} readOnly rows={12} aria-label="Character source brief" /></div> : null}

          {tab === "script" ? (
            <div className="settings-stack">
              <div className="control-section-title"><div><Layers3 aria-hidden="true" size={16} /><h2>{isVoice ? "Voice script" : "Narration"}</h2></div></div>
              {!isVoice ? <label>Hook<textarea value={hook} disabled={generationState === "processing"} onChange={(event) => setHook(event.target.value)} rows={4} /></label> : null}
              {!isVoice && project.script.contentFormat === "debate" ? (
                <div className="scene-editor dialogue-editor">
                  <div className="control-section-title"><div><Mic2 aria-hidden="true" size={16} /><h3>Dialogue turns</h3></div><button type="button" aria-label="Add dialogue turn" disabled={generationState === "processing"} onClick={addDialogueTurn}><Plus aria-hidden="true" size={16} /></button></div>
                  <p className="control-help">Each turn is rendered as a separate voice segment, then joined in this order.</p>
                  {dialogue.map((turn, index) => (
                    <article key={turn.id}>
                      <div className="scene-number"><span>{String(index + 1).padStart(2, "0")}</span><strong>Turn {index + 1}</strong><button type="button" className="danger" aria-label={`Remove turn ${index + 1}`} disabled={generationState === "processing" || dialogue.length <= 1} onClick={() => removeDialogueTurn(turn.id)}><Trash2 aria-hidden="true" size={13} /></button></div>
                      <div className="field-grid two"><label>Speaker<select value={turn.speakerId} disabled={generationState === "processing"} onChange={(event) => updateDialogueTurn(turn.id, "speakerId", event.target.value)}>{project.script.speakers.map((speaker) => <option key={speaker.id} value={speaker.id}>{speaker.name}</option>)}</select></label><label>Emotion<select value={turn.emotion} disabled={generationState === "processing"} onChange={(event) => updateDialogueTurn(turn.id, "emotion", event.target.value)}><option value="neutral">Neutral</option><option value="excited">Excited</option><option value="skeptical">Skeptical</option><option value="angry">Angry</option><option value="surprised">Surprised</option><option value="calm">Calm</option></select></label></div>
                      <label>Line<textarea value={turn.text} disabled={generationState === "processing"} onChange={(event) => updateDialogueTurn(turn.id, "text", event.target.value)} rows={3} /></label>
                    </article>
                  ))}
                </div>
              ) : <label>Final narration<textarea value={narration} disabled={generationState === "processing"} onChange={(event) => { const value = event.target.value; setNarration(value); setDialogue((turns) => turns.length ? [{ ...turns[0], text: value }, ...turns.slice(1)] : turns); }} rows={14} /></label>}
              {project.script.contentFormat === "study" && project.script.sourceReferences?.length ? <div className="source-reference-list"><strong>Source references</strong>{project.script.sourceReferences.map((reference) => <p key={`${reference.label}-${reference.excerpt}`}><b>{reference.label}</b> {reference.excerpt}</p>)}</div> : null}
            </div>
          ) : null}

          {tab === "scenes" ? (
            <div className="scene-editor">
              <div className="control-section-title"><div><Layers3 aria-hidden="true" size={16} /><h2>Scenes</h2></div><button type="button" aria-label="Add scene" disabled={generationState === "processing"} onClick={addScene}><Plus aria-hidden="true" size={16} /></button></div>
              <p className="control-help">{project.script.contentFormat === "debate" ? "Scenes control the visual backdrop; edit dialogue turns separately for the spoken order." : "Scene order and narration become the final voice and caption order. Changes save automatically."}</p>
              {scenes.map((scene, index) => (
                <article key={scene.id}>
                  <div className="scene-number"><span>{String(index + 1).padStart(2, "0")}</span><strong>{scene.label}</strong><div className="scene-actions"><button type="button" title="Move scene up" aria-label={`Move ${scene.label} up`} disabled={generationState === "processing" || index === 0} onClick={() => moveScene(index, -1)}><ArrowUp aria-hidden="true" size={13} /></button><button type="button" title="Move scene down" aria-label={`Move ${scene.label} down`} disabled={generationState === "processing" || index === scenes.length - 1} onClick={() => moveScene(index, 1)}><ArrowDown aria-hidden="true" size={13} /></button><AlertDialog.Root><AlertDialog.Trigger asChild><button type="button" className="danger" title="Delete scene" aria-label={`Delete ${scene.label}`} disabled={generationState === "processing" || scenes.length === 1}><Trash2 aria-hidden="true" size={13} /></button></AlertDialog.Trigger><AlertDialog.Portal><AlertDialog.Overlay className="dialog-overlay" /><AlertDialog.Content className="dialog-content"><AlertDialog.Title>Delete {scene.label}?</AlertDialog.Title><AlertDialog.Description>This removes its narration and visual direction from the final video.</AlertDialog.Description><div className="dialog-actions"><AlertDialog.Cancel asChild><button type="button" className="button-secondary">Keep scene</button></AlertDialog.Cancel><AlertDialog.Action asChild><button type="button" className="button-danger" onClick={() => deleteScene(scene.id)}>Delete scene</button></AlertDialog.Action></div></AlertDialog.Content></AlertDialog.Portal></AlertDialog.Root></div></div>
                  <label>Narration<textarea value={scene.narration} disabled={generationState === "processing"} onChange={(event) => updateScene(scene.id, "narration", event.target.value)} rows={3} /></label>
                  <details className="advanced-disclosure"><summary>Visual direction</summary><div className="settings-stack"><label>Image prompt<textarea value={scene.imagePrompt} disabled={generationState === "processing"} onChange={(event) => updateScene(scene.id, "imagePrompt", event.target.value)} rows={3} /></label><label>Motion prompt<textarea value={scene.motionPrompt} disabled={generationState === "processing"} onChange={(event) => updateScene(scene.id, "motionPrompt", event.target.value)} rows={3} /></label></div></details>
                </article>
              ))}
            </div>
          ) : null}

          {tab === "voice" ? <div className="settings-stack"><div className="control-section-title"><div><Mic2 aria-hidden="true" size={16} /><h2>Voice</h2></div></div>{project.script.speakers.map((speaker) => <label key={speaker.id}>{speaker.name}<select value={speakerVoices[speaker.id] ?? speaker.voicePreset} disabled={generationState === "processing"} onChange={(event) => { const value = event.target.value; setSpeakerVoices((current) => ({ ...current, [speaker.id]: value })); if (speaker.id === project.script.speakers[0]?.id) setVoicePreset(value); }}><option>Milano Rush</option><option>Opera Max</option><option>Narrator Zero</option><option>Soft Study</option></select></label>)}<label>Speed <span>{Number(voiceSpeed).toFixed(1)}x</span><input type="range" min="0.7" max="1.2" step="0.1" value={voiceSpeed} disabled={generationState === "processing"} onChange={(event) => setVoiceSpeed(event.target.value)} /></label><label>Intensity <span>{voiceIntensity}%</span><input type="range" min="0" max="100" value={voiceIntensity} disabled={generationState === "processing"} onChange={(event) => setVoiceIntensity(event.target.value)} /></label></div> : null}

          {tab === "style" ? <div className="settings-stack"><div className="control-section-title"><div><WandSparkles aria-hidden="true" size={16} /><h2>Style and export</h2></div></div>{renderMode === "ai-motion" ? <label>Visual template<select value={template} disabled={generationState === "processing"} onChange={(event) => setTemplate(event.target.value)}><option>Parkour</option><option>Gameplay</option><option>Satisfying loop</option><option>Study explainer</option><option>Meme slides</option></select></label> : null}{!isVoice ? <><fieldset className="render-mode-fieldset"><legend>Render mode</legend><div className="render-mode-options"><button type="button" className={renderMode === "gameplay" ? "active" : undefined} aria-pressed={renderMode === "gameplay"} disabled={generationState === "processing"} onClick={() => setRenderMode("gameplay")}><span><strong>Gameplay</strong><small>Original moving background · lowest cost</small></span></button><button type="button" className={renderMode === "ai-motion" ? "active" : undefined} aria-pressed={renderMode === "ai-motion"} disabled={generationState === "processing"} onClick={() => { if (project.durationSeconds === 5 || project.durationSeconds === 15) setRenderMode("ai-motion"); else setNotice("AI Motion supports 5 or 15 seconds. Change the duration in a new project to use it."); }}><span><strong>AI Motion</strong><small>Premium generated scene · less predictable</small></span></button></div><p>{renderMode === "gameplay" ? "Gameplay keeps motion continuous while the narration and captions carry the story." : "AI Motion creates a visual-first clip. Review every scene before spending credits."}</p></fieldset>{renderMode === "gameplay" ? <GameplayPicker value={backgroundId} onChange={setBackgroundId} disabled={generationState === "processing"} caption={hook} /> : null}</> : null}<label>Caption style<select value={captionStyle} disabled={generationState === "processing"} onChange={(event) => setCaptionStyle(event.target.value)}><option>TikTok Classic</option><option>Bold Box</option><option>Study Clean</option><option>No captions</option></select></label><p className="control-help">The final export highlights each spoken word and keeps captions inside the Shorts safe area.</p><div className="aspect-control" role="group" aria-label="Aspect ratio">{["9:16", "1:1", "16:9"].map((ratio) => <button key={ratio} className={aspectRatio === ratio ? "active" : undefined} aria-pressed={aspectRatio === ratio} disabled={generationState === "processing"} type="button" onClick={() => setAspectRatio(ratio)}>{ratio}</button>)}</div></div> : null}
        </section>

        <section className="editor-preview" aria-label={isVoice ? "Audio preview" : "Video preview"}>
          <div className="editor-preview-toolbar"><span>{isVoice ? "Audio output" : "Preview"}</span><span>{generationState}</span></div>
          <div className="editor-canvas">
            <div className={`editor-video${isVoice ? " voice-output" : ""}`}>
              {!isVoice && (project.outputIsFinal ? project.outputUrl : project.motionUrl) ? <video src={(project.outputIsFinal ? project.outputUrl : project.motionUrl) ?? undefined} poster={project.posterUrl ?? undefined} controls preload="metadata" /> : null}
              {!isVoice && renderMode === "gameplay" && !(project.outputIsFinal ? project.outputUrl : project.motionUrl) ? <GameplayPreview backgroundId={backgroundId} caption={hook} /> : null}
              {!isVoice && renderMode === "ai-motion" && !(project.outputIsFinal ? project.outputUrl : project.motionUrl) && project.posterUrl ? <Image src={project.posterUrl} alt={`${project.title} generated poster`} fill sizes="420px" unoptimized /> : null}
              {!isVoice && renderMode === "ai-motion" && !(project.outputIsFinal ? project.outputUrl : project.motionUrl) && !project.posterUrl ? <div className="editor-output-placeholder"><Sparkles aria-hidden="true" size={28} /><span>Your generated preview will appear here</span></div> : null}
              {isVoice && project.outputUrl ? <div className="audio-output"><strong>{project.title}</strong><audio src={project.outputUrl} controls preload="metadata" /></div> : null}
              {isVoice && !project.outputUrl ? <div className="audio-output"><Mic2 aria-hidden="true" size={28} /><strong>Your generated audio will appear here</strong></div> : null}
              {generationState === "processing" || requestPending ? (
                <div className="editor-generation-overlay" role="status" aria-live="polite" aria-atomic="true">
                  <div className="editor-generation-kicker"><span className="operation-pulse" aria-hidden="true"><i /><i /><i /></span>{currentStepLabel}</div>
                  <strong>{currentStepActivity}</strong>
                  <div className="editor-generation-meta">
                    <span><Clock3 aria-hidden="true" size={14} /> {formatElapsed(generationElapsed)} elapsed</span>
                    <span>{pollState === "retrying" ? "Reconnecting automatically" : "Status updates are live"}</span>
                  </div>
                  <p>{generationElapsed >= 60 ? "This stage can take a few minutes. You may leave; the job continues in your account." : "Keep this page open for live updates, or return to Projects and come back later."}</p>
                </div>
              ) : null}
            </div>
          </div>
          <div className="editor-playback"><span>{isVoice && project.outputUrl ? "Output ready" : !isVoice && project.outputIsFinal ? "Final MP4 saved" : project.status === "completed" && !isVoice ? "Assets ready · export final below" : "No generated output yet"}</span><span>0:{String(project.durationSeconds).padStart(2, "0")}</span></div>
        </section>

        <aside className="render-panel" aria-label="Generate and export">
          <div className="render-panel-heading"><div><p>Project status</p><h2>{statusHeading}</h2></div><span className={generationState}>{generationState}</span></div>
          <ol className="operation-path" aria-label="How to finish this video">
            {operationSteps.map((step) => (
              <li key={step.id} className={step.state}>
                <strong>{step.title}</strong>
                <span>{step.detail}</span>
              </li>
            ))}
          </ol>
          <dl className="render-specs"><div><dt>Format</dt><dd>{outputFormat}</dd></div><div><dt>Duration</dt><dd>{project.durationSeconds} sec</dd></div><div><dt>Quality</dt><dd>{isVoice ? "Generated audio" : renderMode === "gameplay" ? `${outputDimensions} local export` : `480p source + ${outputDimensions} export`}</dd></div><div><dt>Cost</dt><dd>{confirmedCredits} credits</dd></div><div><dt>Balance</dt><dd>{displayedCredits} credits</dd></div></dl>
          <div className="render-progress"><p>Generation stages</p>{generationSteps.map((step, index) => { const state = step.status === "completed" ? "complete" : step.status === "failed" ? "failed" : ["submitted", "processing", "finalizing"].includes(step.status) ? "active" : "pending"; const voiceIndex = step.kind === "voice" ? generationSteps.slice(0, index + 1).filter((candidate) => candidate.kind === "voice").length - 1 : -1; const speaker = voiceIndex >= 0 ? project.script.speakers.find((candidate) => candidate.id === dialogue[voiceIndex]?.speakerId) : null; const label = step.kind === "voice" && plannedVoiceCount > 1 ? `Voice ${voiceIndex + 1}: ${speaker?.name ?? "Speaker"}` : stepLabel(step.kind); return <div className={state} key={`${step.kind}-${step.sequence}`}><span>{state === "complete" ? <Check aria-hidden="true" size={12} /> : index + 1}</span><div><strong>{label}{state === "active" && step.progress > 0 ? ` (${Math.round(step.progress)}%)` : ""}</strong><small>{stepActivity(step.kind, step.status)}</small></div></div>; })}</div>

          {requestPending ? <div className="generation-state-card processing" role="status"><strong>Submitting one generation job</strong><span>Saving your edits and reserving {confirmedCredits} credits. The button stays locked to prevent duplicate requests.</span></div> : null}
          {generationState === "processing" && !requestPending ? <div className="generation-state-card processing" role="status"><strong>{currentStepActivity}</strong><span>{formatElapsed(generationElapsed)} elapsed. You can return to Projects; the job continues safely in the background.</span></div> : null}
          {generationState === "failed" ? <div className="generation-state-card failed" role="alert"><strong>Generation failed</strong><span>{project.errorMessage ?? "Reserved BrainrotKit credits were returned. Review the project before retrying."}</span></div> : null}
          {generationState === "completed" ? <div className="generation-state-card completed" role="status"><strong>{isVoice || project.outputIsFinal ? "Your result is ready" : "Your assets are ready"}</strong><span>{isVoice || project.outputIsFinal ? "Preview the output and download the stored file." : "Export the final video below. Captions and narration are added locally without another AI charge."}</span></div> : null}
          {generationState === "draft" && missingCredits > 0 ? <div className="generation-state-card insufficient" role="alert"><strong>You need {missingCredits} more credits</strong><span>Your edits remain saved while you add credits.</span></div> : null}
          {notice ? <p className={`integration-notice ${noticeTone}`} role={noticeTone === "error" ? "alert" : "status"}>{notice}</p> : null}

          {(generationState === "draft" || generationState === "failed") && missingCredits === 0 ? (
            <AlertDialog.Root>
              <AlertDialog.Trigger asChild><button type="button" className="button-primary render-button" disabled={requestPending || saveState === "saving"}><Sparkles aria-hidden="true" size={17} /> {generationState === "failed" ? `Retry ${isVoice ? "audio" : "render"}` : renderLabel}<span>{confirmedCredits}</span></button></AlertDialog.Trigger>
              <AlertDialog.Portal><AlertDialog.Overlay className="dialog-overlay" /><AlertDialog.Content className="dialog-content"><AlertDialog.Title>{generationState === "failed" ? "Retry generation?" : `${renderLabel}?`}</AlertDialog.Title><AlertDialog.Description>This reserves {confirmedCredits} BrainrotKit credits. A system failure returns the reservation. Confirm once; the request will not be submitted twice.</AlertDialog.Description><div className="dialog-actions"><AlertDialog.Cancel asChild><button className="button-secondary" type="button">Keep editing</button></AlertDialog.Cancel><AlertDialog.Action asChild><button className="button-primary" type="button" onClick={() => void startGeneration()}>Confirm once</button></AlertDialog.Action></div></AlertDialog.Content></AlertDialog.Portal>
            </AlertDialog.Root>
          ) : null}
          {(generationState === "draft" || generationState === "failed") && missingCredits > 0 ? <Link className="button-primary render-button" href={`/pricing?returnTo=${encodeURIComponent(`/app/projects/${project.id}`)}`}>Get {missingCredits} more credits</Link> : null}
          {generationState === "processing" ? <Link href="/app" className="button-primary render-button">Return to projects</Link> : null}
          {generationState === "completed" && isVoice && project.outputUrl ? <a className="button-primary render-button" href={downloadUrl(project.outputUrl)}><Download aria-hidden="true" size={15} /> Download audio</a> : null}
          {!isVoice && generationState === "completed" && project.outputIsFinal && project.outputUrl ? <a className="button-primary render-button" href={downloadUrl(project.outputUrl)}><Download aria-hidden="true" size={15} /> Download MP4</a> : null}
          {!isVoice && generationState === "completed" && project.narrationUrl && (renderMode === "gameplay" || project.posterUrl) ? <VideoComposer projectId={project.id} title={project.title} script={project.script} posterUrl={project.posterUrl} audioUrl={project.narrationUrl} audioSegments={project.audioSegments} motionVideoUrl={renderMode === "ai-motion" ? project.motionUrl : null} durationSeconds={project.durationSeconds} captionStyle={captionStyle} backgroundId={backgroundId} aspectRatio={aspectRatio} autoStart={renderMode === "gameplay"} onProjectSaved={(saved) => setProject(saved)} /> : null}
          <button className="button-secondary export-button" type="button" disabled={saveState === "saving"} onClick={() => void saveProject(true).catch((error) => { setNoticeTone("error"); setNotice(error.message); })}><Save aria-hidden="true" size={15} /> Save now</button>
          <p className="render-disclosure">One confirmation creates one provider job. Failed system jobs return reserved BrainrotKit credits.</p>
        </aside>
      </main>
    </div>
  );
}
