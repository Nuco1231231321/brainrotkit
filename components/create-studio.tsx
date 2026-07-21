"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import {
  clipsForFamily,
  gameFamilies,
  getGameplayClip,
  studioCharacters,
  type GameFamily,
  type GameplayClip,
  type StudioCharacter,
} from "@/lib/create-studio";

type StudioMode = "story" | "debate";

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

export function CreateStudio() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [family, setFamily] = useState<GameFamily>("voxel");
  const familyClips = useMemo(() => clipsForFamily(family), [family]);
  const [clipId, setClipId] = useState(familyClips[0]?.id ?? "voxel-1");
  const clip = getGameplayClip(clipId);
  const [mode, setMode] = useState<StudioMode>("debate");
  const [selectedHostIds, setSelectedHostIds] = useState<string[]>(["nova", "riff"]);
  const hosts = useMemo(
    () => studioCharacters.filter((host) => selectedHostIds.includes(host.id)).slice(0, 2),
    [selectedHostIds],
  );
  const [script, setScript] = useState("Why do people open ten tabs instead of finishing the one task that would actually move their life forward?");
  const [duration, setDuration] = useState(15);
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [captionStyle, setCaptionStyle] = useState("TikTok Classic");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [scriptBusy, setScriptBusy] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [captionIndex, setCaptionIndex] = useState(0);
  const [charOffset, setCharOffset] = useState({ x: 0, y: 0 });
  const [captionOffset, setCaptionOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ target: "char" | "caption"; startX: number; startY: number; originX: number; originY: number } | null>(null);

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

  useEffect(() => {
    if (!lines.length) return;
    const timer = window.setInterval(() => {
      setCaptionIndex((current) => (current + 1) % lines.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [lines]);

  const speakSample = useCallback((host: StudioCharacter) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setNotice("Voice preview needs a browser that supports speech synthesis.");
      return;
    }
    window.speechSynthesis.cancel();
    if (playingVoiceId === host.id) {
      setPlayingVoiceId(null);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(host.voiceSample);
    utterance.rate = host.voicePreset === "Soft Study" ? 0.95 : 1.05;
    utterance.pitch = host.voicePreset === "Opera Max" ? 0.85 : host.voicePreset === "Soft Study" ? 1.1 : 1;
    utterance.onend = () => setPlayingVoiceId(null);
    setPlayingVoiceId(host.id);
    window.speechSynthesis.speak(utterance);
  }, [playingVoiceId]);

  function toggleHost(id: string) {
    setSelectedHostIds((current) => {
      if (current.includes(id)) {
        const next = current.filter((item) => item !== id);
        return next.length ? next : current;
      }
      if (mode === "story") return [id];
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
          projectType: "text",
          tone: "Fast-paced",
        }),
      });
      if (response.status === 401) {
        requestAuthDialog({ returnTo: "/create", hasDraft: true });
        setNotice("Sign in to use AI script generation. A local draft is still available.");
        setScript(localScriptFromTopic(script, mode, hosts));
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
          type: "text",
          sourceText: script,
          durationSeconds: duration,
          settings: {
            renderMode: "gameplay",
            contentFormat: mode,
            backgroundId: clip.id,
            gameplayClipId: clip.id,
            gameplayVideoSrc: clip.videoSrc,
            gameplayStartOffset: String(clip.startOffsetSeconds),
            template: "Gameplay",
            voice: hosts[0]?.voicePreset ?? "Milano Rush",
            tone: "Fast-paced",
            aspectRatio,
            captionStyle,
            goal: "TikTok",
            scriptSource: "provisional",
          },
        }),
      });
      if (response.status === 401) {
        requestAuthDialog({ returnTo: "/create", hasDraft: true });
        setNotice("Sign in to create and export the video.");
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

  const activeLine = lines[captionIndex] ?? lines[0];

  return (
    <main id="main-content" className="create-studio create-v2">
      <header className="create-v2-header page-shell">
        <h1>Create a new video</h1>
        <p>Write or generate a script, choose the gameplay and voices, then open the editor.</p>
        <nav className="create-tool-tabs" aria-label="Creation tools">
          <Link href="/create" className="active" aria-current="page"><Gamepad2 aria-hidden="true" size={16} /> Gameplay video</Link>
          <Link href="/pdf-to-brainrot"><FileText aria-hidden="true" size={16} /> PDF to video</Link>
          <Link href="/italian-brainrot-generator"><UserRound aria-hidden="true" size={16} /> Character video</Link>
          <Link href="/italian-brainrot-voice-generator"><Mic2 aria-hidden="true" size={16} /> Voice</Link>
        </nav>
      </header>

      <div className="create-v2-workspace page-shell">
        <section className="create-v2-form" aria-label="Video settings">
        <section className="create-v2-product-row" aria-label="Selected workflow">
          <div>
            <Gamepad2 aria-hidden="true" size={19} />
            <span><strong>Gameplay video</strong><small>Real gameplay, editable script, generated voices and captions.</small></span>
          </div>
          <div className="create-v2-orientation" role="group" aria-label="Aspect ratio">
            <button type="button" aria-pressed={aspectRatio === "9:16"} className={aspectRatio === "9:16" ? "active" : undefined} onClick={() => setAspectRatio("9:16")}>Portrait</button>
            <button type="button" aria-pressed={aspectRatio === "16:9"} className={aspectRatio === "16:9" ? "active" : undefined} onClick={() => setAspectRatio("16:9")}>Landscape</button>
            <button type="button" aria-pressed={aspectRatio === "1:1"} className={aspectRatio === "1:1" ? "active" : undefined} onClick={() => setAspectRatio("1:1")}>Square</button>
          </div>
        </section>

        <section className="create-v2-script" aria-labelledby="create-script-title">
          <header>
            <div><h2 id="create-script-title">Script</h2><p>Write your script or use AI to expand an idea.</p></div>
            <button type="button" className="create-v2-ai-button" disabled={scriptBusy} onClick={() => void generateScriptWithAi()}>
              {scriptBusy ? <LoaderCircle className="spin" size={16} /> : <WandSparkles aria-hidden="true" size={16} />}
              {scriptBusy ? "Writing" : "AI script writer"}
            </button>
          </header>
          <textarea
            value={script}
            maxLength={4_000}
            onChange={(event) => setScript(event.target.value)}
            rows={9}
            placeholder={mode === "debate" ? "Write an idea, or format dialogue as Nova: line / Riff: line" : "Write or paste your script here…"}
          />
          <div className="create-v2-script-meta"><span>{script.length.toLocaleString()} / 4,000</span><span>Editable again before voice generation</span></div>
        </section>

        <h2 className="create-v2-customize-title">Customize options</h2>
        <div className="create-v2-options">
          <section className="create-v2-option-section" aria-labelledby="gameplay-option-title">
            <div className="create-v2-section-heading">
              <div><h3 id="gameplay-option-title">Choose gameplay</h3><p>Pick a category, then a licensed clip of at least one minute.</p></div>
              <span>{familyClips.length} available</span>
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

          <section className="create-v2-option-section" aria-labelledby="host-option-title">
            <div className="create-v2-section-heading">
              <div><h3 id="host-option-title">Original hosts and voices</h3><p>Select one narrator or two hosts. Every voice can be previewed.</p></div>
              <div className="create-v2-mode" role="group" aria-label="Script mode">
                <button type="button" className={mode === "story" ? "active" : undefined} aria-pressed={mode === "story"} onClick={() => { setMode("story"); setSelectedHostIds([selectedHostIds[0] ?? "nova"]); }}>Story</button>
                <button type="button" className={mode === "debate" ? "active" : undefined} aria-pressed={mode === "debate"} onClick={() => { setMode("debate"); setSelectedHostIds(["nova", "riff"]); }}>Debate</button>
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
                      <small>{host.voicePreset}</small>
                    </button>
                    <button type="button" className="create-host-play" onClick={() => speakSample(host)} aria-label={`Preview ${host.name}`}>
                      {playingVoiceId === host.id ? <Pause aria-hidden="true" size={14} /> : <Play aria-hidden="true" size={14} />}
                      <span>0:03</span>
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="create-v2-option-section create-v2-export-settings" aria-labelledby="export-option-title">
            <div className="create-v2-section-heading"><div><h3 id="export-option-title">Output settings</h3><p>Choose the final duration and caption treatment.</p></div></div>
            <div>
              <label>Duration<select value={duration} onChange={(event) => setDuration(Number(event.target.value))}><option value={15}>15 seconds</option><option value={30}>30 seconds</option><option value={45}>45 seconds</option><option value={60}>60 seconds</option></select></label>
              <label>Captions<select value={captionStyle} onChange={(event) => setCaptionStyle(event.target.value)}><option>TikTok Classic</option><option>Bold Box</option><option>Study Clean</option><option>No captions</option></select></label>
            </div>
          </section>
        </div>

        <div className="create-studio-export">
          {notice ? <p className="create-studio-notice" role="status">{notice}</p> : null}
          <button type="button" className="create-v2-generate" disabled={exportBusy} onClick={() => void createAndOpenEditor()}>
            {exportBusy ? <LoaderCircle className="spin" size={18} /> : <WandSparkles aria-hidden="true" size={18} />}
            {exportBusy ? "Opening editor" : "Create video"}
          </button>
          <p className="form-disclosure">Estimated cost is confirmed in the editor before voice generation.</p>
        </div>
        </section>

        <aside className="create-v2-live" aria-label="Live preview">
          <div className="create-v2-live-toolbar"><span><i aria-hidden="true" /> Live preview</span><span>{aspectRatio} · 720p</span></div>
          <div className="create-v2-live-canvas">
            <div className="create-preview-stage" data-aspect={aspectRatio} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
              <video ref={videoRef} key={clip.id} className="create-preview-video" src={clip.videoSrc} poster={clip.posterSrc} muted loop playsInline autoPlay />
              <div className="create-preview-scrim" />
              <div className="create-preview-hosts" style={{ transform: `translate(${charOffset.x}px, ${charOffset.y}px)` }} onPointerDown={(event) => onPointerDown("char", event)}>
                {(hosts.length ? hosts : studioCharacters.slice(0, 1)).map((host) => <div key={host.id} className="create-preview-host-chip" style={{ borderColor: host.color }}><span style={{ background: host.color }} /><strong>{host.name}</strong></div>)}
                <small>Drag hosts</small>
              </div>
              <div className="create-preview-caption" style={{ transform: `translate(${captionOffset.x}px, ${captionOffset.y}px)` }} onPointerDown={(event) => onPointerDown("caption", event)}>
                {activeLine ? <><em style={{ color: activeLine.color }}>{activeLine.speaker}</em><p>{activeLine.text}</p></> : <p>Your script preview</p>}
                <small>Drag captions</small>
              </div>
              <div className="create-preview-meta"><span>{clip.name}</span><span>{duration}s</span></div>
            </div>
          </div>
          <div className="create-v2-preview-copy"><Check aria-hidden="true" size={16} /><span><strong>Everything updates live</strong><small>Gameplay, hosts, script, captions and aspect ratio reflect the left-side settings.</small></span></div>
          <dl className="create-v2-preview-facts">
            <div><dt>Gameplay</dt><dd>{clip.name}</dd></div>
            <div><dt>Hosts</dt><dd>{hosts.map((host) => host.name).join(" · ") || "—"}</dd></div>
            <div><dt>Captions</dt><dd>{captionStyle}</dd></div>
            <div><dt>Licence</dt><dd><a href={clip.sourceUrl} target="_blank" rel="noreferrer">{clip.license}</a></dd></div>
          </dl>
        </aside>
      </div>
    </main>
  );
}

function ClipCard({ clip, active, onSelect }: { clip: GameplayClip; active: boolean; onSelect: () => void }) {
  return (
    <button type="button" role="option" className={`create-clip-card${active ? " active" : ""}`} onClick={onSelect} aria-selected={active}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={clip.posterSrc} alt="" loading="lazy" />
      {active ? <Check className="create-clip-check" aria-hidden="true" size={16} /> : null}
      <div>
        <strong>{clip.name}</strong>
        <span>{clip.description}</span>
        <small>{Math.floor(clip.durationSeconds / 60)}:{(clip.durationSeconds % 60).toString().padStart(2, "0")} · {clip.license}</small>
      </div>
    </button>
  );
}
