"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Check,
  FileText,
  Gamepad2,
  LoaderCircle,
  Mic2,
  Pause,
  Play,
  UserRound,
  WandSparkles,
} from "lucide-react";
import { requestAuthDialog } from "@/components/auth-dialog";
import { StudioSelect } from "@/components/studio-select";
import { extractPdfText } from "@/lib/pdf-client";
import {
  clipsForFamily,
  gameFamilies,
  getGameplayClip,
  studioCharacters,
  type GameFamily,
  type GameplayClip,
  type StudioCharacter,
} from "@/lib/create-studio";
import type { ToolKind } from "@/lib/tool-pages";

type StudioMode = "story" | "debate";

export type CreateStudioConfig = {
  kind: ToolKind;
  title: string;
  summary: string;
  path: string;
  inputPlaceholder?: string;
};

const toolTabs = [
  { href: "/", label: "Gameplay video", icon: Gamepad2, kinds: ["video", "text"] as ToolKind[] },
  { href: "/pdf-to-brainrot", label: "PDF to video", icon: FileText, kinds: ["pdf"] as ToolKind[] },
  { href: "/italian-brainrot-generator", label: "Character video", icon: UserRound, kinds: ["italian"] as ToolKind[] },
  { href: "/italian-brainrot-voice-generator", label: "Voice", icon: Mic2, kinds: ["voice"] as ToolKind[] },
];

function localScriptFromTopic(topic: string, mode: StudioMode, hosts: StudioCharacter[]) {
  const cleaned = topic.replace(/\s+/g, " ").trim();
  const subject = cleaned || "why people put off the thing they care about";
  if (mode === "debate" && hosts.length >= 2) {
    const [a, b] = hosts;
    return [
      `${a.name}: Everyone says ${subject}, but that is not the real reason.`,
      `${b.name}: Bold claim. What is the actual reason then?`,
      `${a.name}: Starting feels risky, so the brain picks a smaller reward.`,
      `${b.name}: Then make the first move almost too small to avoid.`,
    ].join("\n");
  }
  return [
    `Everyone says ${subject}, but the real reason is not what they think.`,
    `Starting feels risky, so people choose a smaller reward instead.`,
    `The fix is simple: make the first move almost too small to skip.`,
  ].join(" ");
}

function parseScriptLines(script: string, hosts: StudioCharacter[]) {
  return script
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const match = line.match(/^([A-Za-z0-9 .'-]+):\s*(.+)$/);
      if (match) {
        const host = hosts.find((item) => item.name.toLowerCase() === match[1].trim().toLowerCase());
        return { speaker: host?.name ?? match[1].trim(), color: host?.color ?? "#d1fe17", text: match[2].trim() };
      }
      const host = hosts[index % Math.max(hosts.length, 1)] ?? studioCharacters[0];
      return { speaker: host.name, color: host.color, text: line };
    });
}

function buildPreviewCaptions(lines: ReturnType<typeof parseScriptLines>) {
  return lines.flatMap((line) => {
    const words = line.text.split(/\s+/).filter(Boolean);
    const captions = [];
    for (let index = 0; index < words.length; index += 4) {
      captions.push({ ...line, text: words.slice(index, index + 4).join(" ") });
    }
    return captions;
  });
}

function defaultMode(kind: ToolKind): StudioMode {
  if (kind === "pdf") return "story";
  if (kind === "italian" || kind === "voice") return "story";
  return "story";
}

function defaultHosts(kind: ToolKind): string[] {
  if (kind === "pdf" || kind === "voice" || kind === "italian") return ["soft"];
  return ["nova"];
}

function projectTypeFor(kind: ToolKind) {
  if (kind === "video") return "text";
  return kind;
}

export function CreateStudio({ config }: { config: CreateStudioConfig }) {
  const router = useRouter();
  const pathname = usePathname();
  const videoRef = useRef<HTMLVideoElement>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const [family, setFamily] = useState<GameFamily>("subway");
  const familyClips = useMemo(() => clipsForFamily(family), [family]);
  const [clipId, setClipId] = useState(familyClips[0]?.id ?? "subway-neon");
  const clip = getGameplayClip(clipId);
  const [mode, setMode] = useState<StudioMode>(defaultMode(config.kind));
  const [selectedHostIds, setSelectedHostIds] = useState<string[]>(defaultHosts(config.kind));
  const hosts = useMemo(
    () => studioCharacters.filter((host) => selectedHostIds.includes(host.id)).slice(0, 2),
    [selectedHostIds],
  );
  const [script, setScript] = useState(
    config.kind === "italian"
      ? "A cobalt espresso-machine owl racing a red scooter through midnight Rome."
      : config.kind === "voice"
        ? "Three facts. One twist. No filler. Here is why that idea actually sticks."
        : "Why do people open ten tabs instead of finishing the one task that would actually move their life forward?",
  );
  const [fileName, setFileName] = useState("");
  const [fileStatus, setFileStatus] = useState("");
  const [duration, setDuration] = useState(config.kind === "pdf" ? 45 : 15);
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [captionStyle, setCaptionStyle] = useState(config.kind === "pdf" ? "Study Clean" : "TikTok Classic");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [scriptBusy, setScriptBusy] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [captionIndex, setCaptionIndex] = useState(0);
  const [charOffset, setCharOffset] = useState({ x: 0, y: 0 });
  const [captionOffset, setCaptionOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ target: "char" | "caption"; startX: number; startY: number; originX: number; originY: number } | null>(null);
  const showGameplay = config.kind !== "voice";
  const isHomepage = config.path === "/";

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !clip) return;
    const applyOffset = () => {
      try {
        if (clip.startOffsetSeconds > 0 && video.duration > clip.startOffsetSeconds) {
          video.currentTime = clip.startOffsetSeconds;
        }
      } catch {
        // ignore seek race
      }
      void video.play().catch(() => undefined);
    };
    video.load();
    video.addEventListener("loadedmetadata", applyOffset);
    return () => video.removeEventListener("loadedmetadata", applyOffset);
  }, [clip]);

  const lines = useMemo(() => parseScriptLines(script, hosts.length ? hosts : studioCharacters.slice(0, 1)), [script, hosts]);
  const previewCaptions = useMemo(() => buildPreviewCaptions(lines), [lines]);

  useEffect(() => {
    if (!previewCaptions.length) return;
    const beatDuration = Math.max(650, Math.min(2_200, duration * 1_000 / previewCaptions.length));
    const timer = window.setInterval(() => {
      setCaptionIndex((current) => (current + 1) % previewCaptions.length);
    }, beatDuration);
    return () => window.clearInterval(timer);
  }, [duration, previewCaptions.length]);

  useEffect(() => () => {
    voiceAudioRef.current?.pause();
  }, []);

  const speakSample = useCallback((host: StudioCharacter) => {
    voiceAudioRef.current?.pause();
    if (playingVoiceId === host.id) {
      voiceAudioRef.current = null;
      setPlayingVoiceId(null);
      return;
    }
    const audio = new Audio(host.voiceSampleSrc);
    audio.preload = "auto";
    audio.onended = () => {
      voiceAudioRef.current = null;
      setPlayingVoiceId(null);
    };
    audio.onerror = () => {
      voiceAudioRef.current = null;
      setPlayingVoiceId(null);
      setNotice(`Could not play the ${host.voicePreset} sample.`);
    };
    voiceAudioRef.current = audio;
    setPlayingVoiceId(host.id);
    void audio.play().catch(() => {
      voiceAudioRef.current = null;
      setPlayingVoiceId(null);
      setNotice("Voice preview could not start in this browser.");
    });
  }, [playingVoiceId]);

  function toggleHost(id: string) {
    setSelectedHostIds((current) => {
      if (current.includes(id)) {
        const next = current.filter((item) => item !== id);
        return next.length ? next : current;
      }
      if (mode === "story" || config.kind === "voice") return [id];
      return [...current, id].slice(-2);
    });
  }

  function selectFamily(nextFamily: GameFamily) {
    setFamily(nextFamily);
    const firstClip = clipsForFamily(nextFamily)[0];
    if (firstClip) setClipId(firstClip.id);
  }

  async function generateScriptWithAi() {
    setScriptBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/script/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceText: script,
          durationSeconds: duration,
          contentFormat: mode,
          projectType: projectTypeFor(config.kind),
          tone: "Fast-paced",
        }),
      });
      if (response.status === 401) {
        requestAuthDialog({ returnTo: config.path, hasDraft: true });
        setNotice("Sign in required for AI script generation.");
        return;
      }
      const payload = await response.json() as {
        script?: { dialogue?: Array<{ text: string; speakerId?: string }>; speakers?: Array<{ id: string; name: string }>; narration?: string };
        error?: string;
      };
      if (!response.ok || !payload.script) throw new Error(payload.error ?? "Script generation failed.");
      if (payload.script.dialogue?.length) {
        const named = payload.script.dialogue.map((turn) => {
          const speaker = payload.script?.speakers?.find((item) => item.id === turn.speakerId);
          return speaker ? `${speaker.name}: ${turn.text}` : turn.text;
        });
        setScript(named.join("\n"));
      } else if (payload.script.narration) {
        setScript(payload.script.narration);
      }
      setNotice("AI script ready. Edit any line before export.");
    } catch (error) {
      setScript(localScriptFromTopic(script, mode, hosts));
      setNotice(error instanceof Error ? error.message : "Fell back to a local draft script.");
    } finally {
      setScriptBusy(false);
    }
  }

  async function createAndOpenEditor() {
    if (config.kind === "pdf" && (!fileName || script.trim().length < 8)) {
      setNotice("Upload a PDF and wait for extraction before creating.");
      return;
    }
    if (script.trim().length < 8) {
      setNotice("Add a script of at least 8 characters.");
      return;
    }
    setExportBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: projectTypeFor(config.kind),
          sourceText: script,
          sourceFileName: config.kind === "pdf" ? fileName : null,
          durationSeconds: duration,
          settings: {
            renderMode: config.kind === "italian" ? "ai-motion" : "gameplay",
            contentFormat: config.kind === "pdf" ? "study" : mode,
            backgroundId: showGameplay ? clip.id : "subway-neon",
            gameplayClipId: clip.id,
            gameplayVideoSrc: clip.videoSrc,
            gameplayStartOffset: String(clip.startOffsetSeconds),
            template: "Gameplay",
            voice: hosts[0]?.voicePreset ?? "Milano Rush",
            tone: "Fast-paced",
            aspectRatio,
            captionStyle,
            goal: config.kind === "pdf" ? "Study" : "TikTok",
            scriptSource: "provisional",
          },
        }),
      });
      if (response.status === 401) {
        requestAuthDialog({ returnTo: config.path, hasDraft: true });
        setNotice("Sign in required to generate.");
        return;
      }
      const payload = await response.json() as { projectId?: string; error?: string };
      if (!response.ok || !payload.projectId) throw new Error(payload.error ?? "Project could not be created.");
      router.push(`/app/projects/${encodeURIComponent(payload.projectId)}`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not open the editor.");
    } finally {
      setExportBusy(false);
    }
  }

  function onPointerDown(target: "char" | "caption", event: React.PointerEvent) {
    event.preventDefault();
    const origin = target === "char" ? charOffset : captionOffset;
    dragRef.current = {
      target,
      startX: event.clientX,
      startY: event.clientY,
      originX: origin.x,
      originY: origin.y,
    };
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent) {
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;
    const next = {
      x: Math.max(-120, Math.min(120, dragRef.current.originX + dx)),
      y: Math.max(-160, Math.min(160, dragRef.current.originY + dy)),
    };
    if (dragRef.current.target === "char") setCharOffset(next);
    else setCaptionOffset(next);
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  const activeLine = previewCaptions[captionIndex] ?? previewCaptions[0];
  const scriptTitle = config.kind === "pdf" ? "PDF source" : config.kind === "italian" ? "Character concept" : config.kind === "voice" ? "Voice script" : "Script";
  const ctaLabel = config.kind === "voice" ? "Create voice project" : "Create video";

  return (
    <div className={`create-studio create-v2${isHomepage ? " home-console" : ""}`}>
      <header className="create-v2-header page-shell">
        <h1>{config.title}</h1>
        <p>{config.summary}</p>
        <nav className="create-tool-tabs" aria-label="Creation tools">
          {toolTabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.kinds.includes(config.kind) || pathname === tab.href;
            return (
              <Link key={tab.href} href={tab.href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined}>
                <Icon aria-hidden="true" size={16} /> {tab.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <div className="create-v2-workspace page-shell">
        <section className="create-v2-form" aria-label="Video settings">
          <section className="create-v2-script" aria-labelledby="create-script-title">
            <header>
              <div>
                <h2 id="create-script-title">{scriptTitle}</h2>
                <p>
                  {config.kind === "pdf"
                    ? "Upload a PDF, then edit the extracted text before export."
                    : "Write your script or use AI. Sign in is required to generate."}
                </p>
              </div>
              {config.kind !== "pdf" ? (
                <button type="button" className="create-v2-ai-button" disabled={scriptBusy} onClick={() => void generateScriptWithAi()}>
                  {scriptBusy ? <LoaderCircle className="spin" size={16} /> : <WandSparkles aria-hidden="true" size={16} />}
                  {scriptBusy ? "Writing" : "AI script writer"}
                </button>
              ) : null}
            </header>

            {config.kind === "pdf" ? (
              <label className="create-pdf-upload">
                <FileText aria-hidden="true" size={18} />
                <span>{fileName || "Drop a PDF here or click to browse"}</span>
                <small>{fileStatus || "PDF up to 25 MB. Extraction stays in your browser."}</small>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    setFileName(file?.name ?? "");
                    setScript("");
                    if (!file) return;
                    setFileStatus("Reading PDF…");
                    try {
                      const text = await extractPdfText(file);
                      setScript(text.slice(0, 4000));
                      setFileStatus(`${text.length.toLocaleString()} characters extracted.`);
                    } catch (error) {
                      setFileStatus(error instanceof Error ? error.message : "PDF could not be read.");
                    }
                  }}
                />
              </label>
            ) : null}

            <textarea
              value={script}
              maxLength={4_000}
              onChange={(event) => setScript(event.target.value)}
              rows={config.kind === "pdf" ? 7 : 9}
              placeholder={config.inputPlaceholder ?? (mode === "debate" ? "Write an idea, or format dialogue as Nova: line / Riff: line" : "Write or paste your script here…")}
            />
            <div className="create-v2-script-meta">
              <span>{script.length.toLocaleString()} / 4,000</span>
              <span>Sign in required to generate</span>
            </div>
          </section>

          {showGameplay ? (
            <>
              <h2 className="create-v2-customize-title">Customize options</h2>
              <div className="create-v2-options">
                <section className="create-v2-option-section" aria-labelledby="host-option-title">
                  <div className="create-v2-section-heading">
                    <div>
                      <h3 id="host-option-title">Choose a voice</h3>
                      <p>Preview 10 distinct presets. Debate mode can use two voices.</p>
                    </div>
                    {config.kind !== "italian" && config.kind !== "voice" ? (
                      <div className="create-v2-mode" role="group" aria-label="Script mode">
                        <button type="button" className={mode === "story" ? "active" : undefined} aria-pressed={mode === "story"} onClick={() => { setMode("story"); setSelectedHostIds([selectedHostIds[0] ?? "nova"]); }}>Story</button>
                        <button type="button" className={mode === "debate" ? "active" : undefined} aria-pressed={mode === "debate"} onClick={() => { setMode("debate"); setSelectedHostIds(["nova", "riff"]); }}>Debate</button>
                      </div>
                    ) : null}
                  </div>
                  <div className="create-host-grid">
                    {studioCharacters.map((host) => {
                      const active = selectedHostIds.includes(host.id);
                      return (
                        <article key={host.id} className={active ? "active" : undefined}>
                          <button type="button" className="create-host-select" onClick={() => toggleHost(host.id)} aria-pressed={active}>
                            <span className="create-host-swatch" style={{ background: host.color }} />
                            <strong>{host.name}</strong>
                            <small>{host.tagline}</small>
                          </button>
                          <button type="button" className="create-host-play" onClick={() => speakSample(host)} aria-label={`Preview ${host.name}`}>
                            {playingVoiceId === host.id ? <Pause aria-hidden="true" size={14} /> : <Play aria-hidden="true" size={14} />}
                            <span>{host.voiceSampleDuration}</span>
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </section>

                <section className="create-v2-option-section" aria-labelledby="gameplay-option-title">
                  <div className="create-v2-section-heading">
                    <div>
                      <h3 id="gameplay-option-title">Choose gameplay</h3>
                      <p>Eight local presets are ready to loop, crop and export without another network request.</p>
                    </div>
                    <span>8 presets</span>
                  </div>
                  <div className="segmented-control create-family-tabs" role="tablist" aria-label="Game family">
                    {gameFamilies.map((item) => (
                      <button key={item.id} type="button" role="tab" aria-selected={family === item.id} className={family === item.id ? "active" : undefined} onClick={() => selectFamily(item.id)}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <div className="create-clip-grid" role="listbox" aria-label="Gameplay clips">
                    {familyClips.map((item) => <ClipCard key={item.id} clip={item} active={clipId === item.id} onSelect={() => setClipId(item.id)} />)}
                  </div>
                </section>

                <section className="create-v2-option-section create-v2-export-settings" aria-labelledby="export-option-title">
                  <div className="create-v2-section-heading"><div><h3 id="export-option-title">Output settings</h3><p>Choose the final duration and caption treatment.</p></div></div>
                  <div>
                    <div className="studio-select-field"><span>Duration</span><StudioSelect label="Duration" value={String(duration)} onValueChange={(value) => setDuration(Number(value))} options={[{ value: "15", label: "15 seconds" }, { value: "30", label: "30 seconds" }, { value: "45", label: "45 seconds" }, { value: "60", label: "60 seconds" }]} /></div>
                    <div className="studio-select-field"><span>Captions</span><StudioSelect label="Captions" value={captionStyle} onValueChange={setCaptionStyle} options={[{ value: "TikTok Classic", label: "TikTok Classic" }, { value: "Bold Box", label: "Bold Box" }, { value: "Study Clean", label: "Study Clean" }, { value: "No captions", label: "No captions" }]} /></div>
                    <div className="studio-select-field"><span>Aspect ratio</span><StudioSelect label="Aspect ratio" value={aspectRatio} onValueChange={setAspectRatio} options={[{ value: "9:16", label: "Portrait 9:16" }, { value: "1:1", label: "Square 1:1" }, { value: "16:9", label: "Landscape 16:9" }]} /></div>
                  </div>
                </section>
              </div>
            </>
          ) : (
            <div className="create-v2-options" style={{ marginTop: 24 }}>
              <section className="create-v2-option-section" aria-labelledby="host-option-title">
                <div className="create-v2-section-heading">
                  <div>
                    <h3 id="host-option-title">Voice preset</h3>
                    <p>Preview 10 distinct presets, then generate the selected voice in the editor.</p>
                  </div>
                </div>
                <div className="create-host-grid">
                  {studioCharacters.map((host) => {
                    const active = selectedHostIds.includes(host.id);
                    return (
                      <article key={host.id} className={active ? "active" : undefined}>
                        <button type="button" className="create-host-select" onClick={() => toggleHost(host.id)} aria-pressed={active}>
                          <span className="create-host-swatch" style={{ background: host.color }} />
                          <strong>{host.name}</strong>
                          <small>{host.tagline}</small>
                        </button>
                        <button type="button" className="create-host-play" onClick={() => speakSample(host)} aria-label={`Preview ${host.name}`}>
                          {playingVoiceId === host.id ? <Pause aria-hidden="true" size={14} /> : <Play aria-hidden="true" size={14} />}
                          <span>{host.voiceSampleDuration}</span>
                        </button>
                      </article>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          <div className="create-studio-export">
            {notice ? <p className="create-studio-notice" role="status">{notice}</p> : null}
            <button type="button" className="create-v2-generate" disabled={exportBusy} onClick={() => void createAndOpenEditor()}>
              {exportBusy ? <LoaderCircle className="spin" size={18} /> : <WandSparkles aria-hidden="true" size={18} />}
              {exportBusy ? "Opening editor" : ctaLabel}
            </button>
            <p className="form-disclosure">You must sign in to generate. Estimated cost is confirmed in the editor before voice generation.</p>
          </div>
        </section>

        <aside className="create-v2-live" aria-label="Live preview">
          <div className="create-v2-live-toolbar"><span><i aria-hidden="true" /> Live preview</span><span>{aspectRatio} · 720p</span></div>
          <div className="create-v2-live-canvas">
            <div className="create-preview-stage" data-aspect={aspectRatio} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
              {showGameplay ? (
                <video ref={videoRef} key={clip.id} className="create-preview-video" src={clip.videoSrc} poster={clip.posterSrc} muted loop playsInline autoPlay />
              ) : (
                <div className="create-preview-voice-stage" aria-hidden="true">
                  <Mic2 size={42} />
                  <strong>Voice preview</strong>
                </div>
              )}
              <div className="create-preview-scrim" />
              <div className="create-preview-hosts" style={{ transform: `translate(${charOffset.x}px, ${charOffset.y}px)` }} onPointerDown={(event) => onPointerDown("char", event)}>
                {(hosts.length ? hosts : studioCharacters.slice(0, 1)).map((host) => <div key={host.id} className="create-preview-host-chip" style={{ borderColor: host.color }}><span style={{ background: host.color }} /><strong>{host.name}</strong></div>)}
                <small>Drag hosts</small>
              </div>
              {captionStyle !== "No captions" ? (
                <div className="create-preview-caption" data-style={captionStyle} style={{ transform: `translate(${captionOffset.x}px, ${captionOffset.y}px)` }} onPointerDown={(event) => onPointerDown("caption", event)}>
                  {activeLine ? <><em style={{ color: activeLine.color }}>{activeLine.speaker}</em><p>{activeLine.text}</p></> : <p>Your script preview</p>}
                  <small>Drag captions</small>
                </div>
              ) : null}
              <div className="create-preview-meta"><span>{showGameplay ? clip.name : "Voice"}</span><span>{duration}s</span></div>
            </div>
          </div>
          <div className="create-v2-preview-copy"><Check aria-hidden="true" size={16} /><span><strong>Everything updates live</strong><small>Gameplay, hosts, script and captions update as you change the left panel.</small></span></div>
          <dl className="create-v2-preview-facts">
            {showGameplay ? <div><dt>Gameplay</dt><dd>{clip.name}</dd></div> : null}
            <div><dt>Hosts</dt><dd>{hosts.map((host) => host.name).join(" · ") || "—"}</dd></div>
            <div><dt>Captions</dt><dd>{captionStyle}</dd></div>
            {showGameplay ? <div><dt>Source</dt><dd><a href={clip.sourceUrl} target="_blank" rel="noreferrer">{clip.license}</a></dd></div> : null}
          </dl>
        </aside>
      </div>
    </div>
  );
}

function ClipCard({ clip, active, onSelect }: { clip: GameplayClip; active: boolean; onSelect: () => void }) {
  return (
    <button type="button" role="option" className={`create-clip-card${active ? " active" : ""}`} onClick={onSelect} aria-selected={active}>
      <video src={clip.videoSrc} poster={clip.posterSrc} muted loop playsInline autoPlay={active} preload="metadata" aria-hidden="true" />
      {active ? <Check className="create-clip-check" aria-hidden="true" size={16} /> : null}
      <div>
        <strong>{clip.name}</strong>
        <span>{clip.description}</span>
        <small>{Math.floor(clip.durationSeconds / 60)}:{(clip.durationSeconds % 60).toString().padStart(2, "0")} · {clip.license}</small>
      </div>
    </button>
  );
}
