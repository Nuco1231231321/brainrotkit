"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Clapperboard,
  LoaderCircle,
  Pause,
  Play,
  Type,
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
  const [topic, setTopic] = useState("why people open ten tabs instead of finishing one hard task");
  const [script, setScript] = useState(() => localScriptFromTopic("why people open ten tabs instead of finishing one hard task", "debate", studioCharacters.slice(0, 2)));
  const [duration, setDuration] = useState(15);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [scriptBusy, setScriptBusy] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [captionIndex, setCaptionIndex] = useState(0);
  const [charOffset, setCharOffset] = useState({ x: 0, y: 0 });
  const [captionOffset, setCaptionOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ target: "char" | "caption"; startX: number; startY: number; originX: number; originY: number } | null>(null);

  useEffect(() => {
    const next = clipsForFamily(family)[0];
    if (next) setClipId(next.id);
  }, [family]);

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

  async function generateScriptWithAi() {
    setScriptBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/script/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceText: topic,
          durationSeconds: duration,
          contentFormat: mode,
          projectType: "text",
          tone: "Fast-paced",
        }),
      });
      if (response.status === 401) {
        requestAuthDialog({ returnTo: "/create", hasDraft: true });
        setNotice("Sign in to use AI script generation. A local draft is still available.");
        setScript(localScriptFromTopic(topic, mode, hosts));
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
      setScript(localScriptFromTopic(topic, mode, hosts));
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
            aspectRatio: "9:16",
            captionStyle: "TikTok Classic",
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
    <main id="main-content" className="create-studio">
      <header className="create-studio-hero page-shell">
        <div>
          <p className="eyebrow">Core video path</p>
          <h1>Create</h1>
          <p>Pick a legal gameplay loop, original hosts, write or AI-generate a script, preview live, then export.</p>
        </div>
        <div className="create-studio-hero-meta">
          <span>Fixed game assets</span>
          <span>Voice preview</span>
          <span>Live preview</span>
          <span>Browser export</span>
        </div>
      </header>

      <div className="create-studio-layout page-shell">
        <section className="create-studio-controls" aria-label="Create controls">
          <div className="create-studio-block">
            <div className="create-studio-block-title">
              <strong>1. Game family</strong>
              <small>Open-source style packs — not Minecraft / GTA / Subway Surfers rips</small>
            </div>
            <div className="segmented-control create-family-tabs" role="tablist" aria-label="Game family">
              {gameFamilies.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={family === item.id}
                  className={family === item.id ? "active" : undefined}
                  onClick={() => setFamily(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="create-studio-hint">{gameFamilies.find((item) => item.id === family)?.hint}</p>
          </div>

          <div className="create-studio-block">
            <div className="create-studio-block-title">
              <strong>2. Background video</strong>
              <small>{familyClips.length} clips · most over 1 minute</small>
            </div>
            <div className="create-clip-grid" role="listbox" aria-label="Gameplay clips">
              {familyClips.map((item) => (
                <ClipCard key={item.id} clip={item} active={clipId === item.id} onSelect={() => setClipId(item.id)} />
              ))}
            </div>
          </div>

          <div className="create-studio-block">
            <div className="create-studio-block-title">
              <strong>3. Original hosts</strong>
              <small>{mode === "debate" ? "Pick up to 2" : "Pick 1 narrator"}</small>
            </div>
            <div className="segmented-control" role="group" aria-label="Script mode">
              <button type="button" className={mode === "debate" ? "active" : undefined} onClick={() => { setMode("debate"); setSelectedHostIds(["nova", "riff"]); }}>
                Debate
              </button>
              <button type="button" className={mode === "story" ? "active" : undefined} onClick={() => { setMode("story"); setSelectedHostIds([selectedHostIds[0] ?? "nova"]); }}>
                Story
              </button>
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
                      {playingVoiceId === host.id ? <Pause size={14} /> : <Play size={14} />}
                      <span>0:03</span>
                    </button>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="create-studio-block">
            <div className="create-studio-block-title">
              <strong>4. Script</strong>
              <small>AI generate or write manually</small>
            </div>
            <label className="field-group">
              <span>Topic / source</span>
              <textarea value={topic} onChange={(event) => setTopic(event.target.value)} rows={2} placeholder="What should the short be about?" />
            </label>
            <div className="create-script-actions">
              <button type="button" className="button-secondary compact" onClick={() => setScript(localScriptFromTopic(topic, mode, hosts))}>
                <Type size={14} /> Local draft
              </button>
              <button type="button" className="button-primary compact" disabled={scriptBusy} onClick={() => void generateScriptWithAi()}>
                {scriptBusy ? <LoaderCircle className="spin" size={14} /> : <WandSparkles size={14} />}
                AI generate
              </button>
              <label className="create-duration">
                Duration
                <select value={duration} onChange={(event) => setDuration(Number(event.target.value))}>
                  <option value={15}>15s</option>
                  <option value={30}>30s</option>
                  <option value={45}>45s</option>
                  <option value={60}>60s</option>
                </select>
              </label>
            </div>
            <label className="field-group">
              <span>Editable script</span>
              <textarea
                value={script}
                onChange={(event) => setScript(event.target.value)}
                rows={8}
                placeholder={mode === "debate" ? "Nova: line\nRiff: line" : "Paste or generate narration…"}
              />
            </label>
          </div>

          <div className="create-studio-export">
            {notice ? <p className="create-studio-notice" role="status">{notice}</p> : null}
            <button type="button" className="button-primary generate-button" disabled={exportBusy} onClick={() => void createAndOpenEditor()}>
              {exportBusy ? <LoaderCircle className="spin" size={18} /> : <Clapperboard size={18} />}
              {exportBusy ? "Opening editor" : "Create & open editor"}
              <span>{duration}s</span>
            </button>
            <p className="form-disclosure">
              Path: gameplay loop + hosts + script → editor → generate voice → export MP4. Image generation stays a later asset step, not the default wait.
            </p>
          </div>
        </section>

        <aside className="create-studio-preview" aria-label="Live preview">
          <div className="create-preview-phone">
            <div className="create-preview-stage" onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
              <video
                ref={videoRef}
                key={clip.id}
                className="create-preview-video"
                src={clip.videoSrc}
                poster={clip.posterSrc}
                muted
                loop
                playsInline
                autoPlay
              />
              <div className="create-preview-scrim" />
              <div
                className="create-preview-hosts"
                style={{ transform: `translate(${charOffset.x}px, ${charOffset.y}px)` }}
                onPointerDown={(event) => onPointerDown("char", event)}
              >
                {(hosts.length ? hosts : studioCharacters.slice(0, 1)).map((host) => (
                  <div key={host.id} className="create-preview-host-chip" style={{ borderColor: host.color }}>
                    <span style={{ background: host.color }} />
                    <strong>{host.name}</strong>
                  </div>
                ))}
                <small>Drag hosts</small>
              </div>
              <div
                className="create-preview-caption"
                style={{ transform: `translate(${captionOffset.x}px, ${captionOffset.y}px)` }}
                onPointerDown={(event) => onPointerDown("caption", event)}
              >
                {activeLine ? (
                  <>
                    <em style={{ color: activeLine.color }}>{activeLine.speaker}</em>
                    <p>{activeLine.text}</p>
                  </>
                ) : (
                  <p>Your script preview</p>
                )}
                <small>Drag captions</small>
              </div>
              <div className="create-preview-meta">
                <span>{clip.name}</span>
                <span>{Math.max(1, Math.floor(clip.durationSeconds / 60))}m+</span>
              </div>
            </div>
            <div className="create-preview-footer">
              <Check size={14} /> Live preview uses the selected loop. Export burns final captions after voice generation.
            </div>
            <dl className="create-preview-facts">
              <div>
                <dt>Background</dt>
                <dd>{clip.name}</dd>
              </div>
              <div>
                <dt>License</dt>
                <dd>{clip.license}</dd>
              </div>
              <div>
                <dt>Hosts</dt>
                <dd>{hosts.map((host) => host.name).join(" · ") || "—"}</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd><a href={clip.sourceUrl} target="_blank" rel="noreferrer">Open attribution</a></dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </main>
  );
}

function ClipCard({ clip, active, onSelect }: { clip: GameplayClip; active: boolean; onSelect: () => void }) {
  return (
    <button type="button" className={`create-clip-card${active ? " active" : ""}`} onClick={onSelect} aria-pressed={active}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={clip.posterSrc} alt="" loading="lazy" />
      <div>
        <strong>{clip.name}</strong>
        <span>{clip.description}</span>
        <small>{Math.floor(clip.durationSeconds / 60)}:{(clip.durationSeconds % 60).toString().padStart(2, "0")} · {clip.license}</small>
      </div>
    </button>
  );
}