"use client";

import { Check, CloudUpload, Download, FileDown, Film, LoaderCircle, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BufferTarget, CanvasSource, AudioBufferSource, Mp4OutputFormat, Output } from "mediabunny";
import { drawGameplayFrame } from "@/components/gameplay-renderer";
import { getGameplayBackground } from "@/lib/gameplay-backgrounds";
import { buildFallbackTimeline, normalizeAudioTimeline } from "@/lib/audio-timeline";
import type { BrainrotScript } from "@/lib/kie";
import type { ProjectDetail } from "@/lib/projects";

type CaptionWord = { start: number; end: number; text: string; speakerId: string | null; speakerName: string; speakerColor: string };
type CaptionFrame = { start: number; end: number; words: CaptionWord[]; activeIndex: number; speakerName: string; speakerColor: string };
type SubtitleCue = { start: number; end: number; text: string };
type ExportState = "idle" | "loading" | "recording" | "ready" | "error";
type SaveState = "idle" | "saving" | "saved" | "failed";

function outputDimensions(aspectRatio: string) {
  if (aspectRatio === "1:1") return { width: 720, height: 720 };
  if (aspectRatio === "16:9") return { width: 1_280, height: 720 };
  return { width: 720, height: 1_280 };
}

function mediaStreamUrl(url: string) {
  return `${url}${url.includes("?") ? "&" : "?"}stream=1`;
}

function formatSrtTime(seconds: number) {
  const safe = Math.max(0, seconds);
  const hours = Math.floor(safe / 3_600);
  const minutes = Math.floor((safe % 3_600) / 60);
  const whole = Math.floor(safe % 60);
  const millis = Math.floor((safe - Math.floor(safe)) * 1_000);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(whole).padStart(2, "0")},${String(millis).padStart(3, "0")}`;
}

function buildCaptionWords(
  script: BrainrotScript,
  audioSegments: ProjectDetail["audioSegments"],
  segmentDurations: number[],
  durationSeconds: number,
): CaptionWord[] {
  if (!audioSegments.length) {
    const timeline = buildFallbackTimeline(script.narration, durationSeconds);
    const speaker = script.speakers[0];
    return timeline.words.map((word) => ({
      text: word.word,
      start: word.start,
      end: word.end,
      speakerId: speaker?.id ?? null,
      speakerName: speaker?.name ?? "Narrator",
      speakerColor: speaker?.captionColor ?? "#d1fe17",
    }));
  }

  const words: CaptionWord[] = [];
  let cursor = 0;
  audioSegments.forEach((segment, index) => {
    const duration = segmentDurations[index] ?? 0;
    const dialogue = script.dialogue[index];
    const providerTimeline = normalizeAudioTimeline(segment.timeline);
    const timeline = providerTimeline?.words.length
      ? providerTimeline
      : buildFallbackTimeline(dialogue?.text ?? script.narration, duration || durationSeconds);
    const speaker = script.speakers.find((candidate) => candidate.id === segment.speakerId)
      ?? script.speakers.find((candidate) => candidate.id === dialogue?.speakerId)
      ?? script.speakers[0];
    const timelineScale = providerTimeline && duration > 0 && providerTimeline.durationSeconds > 0
      ? duration / providerTimeline.durationSeconds
      : 1;
    timeline.words.forEach((word) => {
      const start = cursor + word.start * timelineScale;
      const end = cursor + Math.min(duration || word.end, word.end * timelineScale);
      if (end <= start) return;
      words.push({
        text: word.word,
        start,
        end,
        speakerId: speaker?.id ?? null,
        speakerName: speaker?.name ?? "Narrator",
        speakerColor: speaker?.captionColor ?? "#d1fe17",
      });
    });
    cursor += duration;
  });
  return words;
}

function captionFrameAt(words: CaptionWord[], elapsed: number): CaptionFrame | null {
  const activeWordIndex = words.findIndex((word) => elapsed >= word.start && elapsed < word.end);
  if (activeWordIndex < 0) return null;
  let speakerStart = activeWordIndex;
  while (speakerStart > 0 && words[speakerStart - 1].speakerId === words[activeWordIndex].speakerId) speakerStart -= 1;
  // Short-form style: 2–3 words per beat, not a heavy 4-word board.
  const chunk = 3;
  const groupStart = speakerStart + Math.floor((activeWordIndex - speakerStart) / chunk) * chunk;
  const group = words.slice(groupStart, groupStart + chunk);
  return {
    start: group[0].start,
    end: group.at(-1)?.end ?? group[0].end,
    words: group,
    activeIndex: activeWordIndex - groupStart,
    speakerName: words[activeWordIndex].speakerName,
    speakerColor: words[activeWordIndex].speakerColor,
  };
}

function makeSubtitleCues(words: CaptionWord[]): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  for (let index = 0; index < words.length; index += 3) {
    const group = words.slice(index, index + 3);
    if (!group.length) continue;
    cues.push({ start: group[0].start, end: group.at(-1)?.end ?? group[0].end, text: group.map((word) => word.text).join(" ") });
  }
  return cues;
}

function drawCover(context: CanvasRenderingContext2D, source: CanvasImageSource, x: number, y: number, width: number, height: number) {
  const sourceWidth = source instanceof HTMLVideoElement ? source.videoWidth : source instanceof HTMLImageElement ? source.naturalWidth : 1;
  const sourceHeight = source instanceof HTMLVideoElement ? source.videoHeight : source instanceof HTMLImageElement ? source.naturalHeight : 1;
  if (!sourceWidth || !sourceHeight) return;
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  context.drawImage(source, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}

function displayWord(text: string, style: string) {
  // TikTok-style emphasis without shouting every letter.
  if (style === "Study Clean") return text;
  if (text.length <= 3) return text.toUpperCase();
  return text;
}

function captionLines(context: CanvasRenderingContext2D, words: CaptionWord[], maxWidth: number, gap: number, style: string) {
  const lines: Array<Array<{ word: CaptionWord; originalIndex: number; width: number; label: string }>> = [[]];
  words.forEach((word, originalIndex) => {
    const label = displayWord(word.text, style);
    const width = context.measureText(label).width;
    const current = lines[lines.length - 1];
    const currentWidth = current.reduce((sum, item) => sum + item.width, 0) + gap * Math.max(0, current.length - 1);
    if (current.length && currentWidth + gap + width > maxWidth) lines.push([]);
    lines[lines.length - 1].push({ word, originalIndex, width, label });
  });
  return lines;
}

function strokeFillText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fill: string,
  stroke: string,
  lineWidth: number,
) {
  context.lineJoin = "round";
  context.miterLimit = 2;
  context.lineWidth = lineWidth;
  context.strokeStyle = stroke;
  context.fillStyle = fill;
  context.strokeText(text, x, y);
  context.fillText(text, x, y);
}

function drawKaraokeCaption(
  context: CanvasRenderingContext2D,
  frame: CaptionFrame,
  style: string,
  outputWidth: number,
  outputHeight: number,
) {
  const maxTextWidth = Math.max(260, outputWidth - 72);
  const gap = Math.max(8, Math.round(outputWidth * 0.012));
  const boxed = style === "Bold Box" || style === "Study Clean";
  let fontSize = style === "Study Clean" ? 42 : 54;
  let lines: ReturnType<typeof captionLines> = [];
  while (fontSize >= 30) {
    context.font = `800 ${fontSize}px "Arial Black", Impact, Arial, sans-serif`;
    lines = captionLines(context, frame.words, maxTextWidth, gap, style);
    const longestWord = Math.max(...lines.flat().map((item) => item.width), 0);
    if (lines.length <= 2 && longestWord <= maxTextWidth) break;
    fontSize -= 2;
  }
  context.textBaseline = "middle";
  const lineHeight = Math.round(fontSize * 1.18);
  const contentWidth = Math.max(...lines.map((line) => line.reduce((sum, item) => sum + item.width, 0) + gap * Math.max(0, line.length - 1)), 0);
  const showSpeaker = Boolean(frame.speakerName) && frame.speakerName !== "Narrator" && frame.speakerName !== "Study Guide";
  const labelHeight = showSpeaker ? Math.round(fontSize * 0.42) + 10 : 0;
  const boxPadX = boxed ? 28 : 0;
  const boxPadY = boxed ? 18 : 0;
  const boxWidth = boxed ? Math.min(outputWidth - 40, Math.max(240, contentWidth + boxPadX * 2)) : contentWidth;
  const boxHeight = lineHeight * lines.length + boxPadY * 2 + labelHeight;
  const boxX = (outputWidth - boxWidth) / 2;
  // Lower-third placement like short-form apps, not a center billboard.
  const boxY = Math.round(outputHeight * 0.72 - boxHeight / 2);

  if (boxed) {
    roundedRect(context, boxX, boxY, boxWidth, boxHeight, 14);
    context.fillStyle = style === "Bold Box" ? "rgba(209, 254, 23, 0.94)" : "rgba(246, 247, 242, 0.94)";
    context.fill();
  } else {
    // Soft shadow plate so stroke text stays readable on bright gameplay.
    const platePad = 18;
    roundedRect(context, boxX - platePad, boxY - 8, boxWidth + platePad * 2, boxHeight + 16, 16);
    context.fillStyle = "rgba(0, 0, 0, 0.28)";
    context.fill();
  }

  if (showSpeaker) {
    context.font = `700 ${Math.max(16, Math.round(fontSize * 0.34))}px Arial, sans-serif`;
    context.textAlign = "center";
    if (boxed) {
      context.fillStyle = frame.speakerColor;
      context.fillText(frame.speakerName, outputWidth / 2, boxY + labelHeight * 0.55);
    } else {
      strokeFillText(context, frame.speakerName, outputWidth / 2, boxY + labelHeight * 0.45, frame.speakerColor, "rgba(0,0,0,0.85)", Math.max(3, Math.round(fontSize * 0.08)));
    }
  }

  context.font = `800 ${fontSize}px "Arial Black", Impact, Arial, sans-serif`;
  const strokeWidth = Math.max(4, Math.round(fontSize * 0.12));
  lines.forEach((line, lineIndex) => {
    const lineWidth = line.reduce((sum, item) => sum + item.width, 0) + gap * Math.max(0, line.length - 1);
    let cursor = outputWidth / 2 - lineWidth / 2;
    line.forEach((item) => {
      const active = item.originalIndex === frame.activeIndex;
      const y = boxY + labelHeight + boxPadY + lineHeight * (lineIndex + 0.5);
      context.textAlign = "left";
      if (boxed) {
        context.fillStyle = active
          ? (style === "Bold Box" ? "#0b0b0b" : frame.speakerColor)
          : (style === "Bold Box" || style === "Study Clean" ? "#111417" : "#ffffff");
        context.fillText(item.label, cursor, y);
      } else {
        const fill = active ? (frame.speakerColor || "#d1fe17") : "#ffffff";
        strokeFillText(context, item.label, cursor, y, fill, "rgba(0,0,0,0.92)", strokeWidth);
      }
      cursor += item.width + gap;
    });
  });
}

function makeSrt(cues: SubtitleCue[]) {
  return cues.map((cue, index) => `${index + 1}\n${formatSrtTime(cue.start)} --> ${formatSrtTime(cue.end)}\n${cue.text}\n`).join("\n");
}

async function mixAudioBuffers(buffers: AudioBuffer[]) {
  if (!buffers.length) throw new Error("No narration buffers to mix.");
  const sampleRate = buffers[0].sampleRate;
  const channels = Math.max(...buffers.map((buffer) => buffer.numberOfChannels), 1);
  const totalLength = buffers.reduce((sum, buffer) => sum + buffer.length, 0);
  const offline = new OfflineAudioContext(channels, Math.max(1, totalLength), sampleRate);
  let offset = 0;
  for (const buffer of buffers) {
    const source = offline.createBufferSource();
    source.buffer = buffer;
    source.connect(offline.destination);
    source.start(offset / sampleRate);
    offset += buffer.length;
  }
  return offline.startRendering();
}

function drawComposedFrame(
  context: CanvasRenderingContext2D,
  options: {
    elapsed: number;
    width: number;
    height: number;
    backgroundId: string;
    captionStyle: string;
    captionWords: CaptionWord[];
    motionVideo: HTMLVideoElement | null;
    loopVideo: HTMLVideoElement | null;
    poster: HTMLImageElement | null;
  },
) {
  const { elapsed, width, height, backgroundId, captionStyle, captionWords, motionVideo, loopVideo, poster } = options;
  if (motionVideo && motionVideo.readyState >= 2) {
    drawCover(context, motionVideo, 0, 0, width, height);
  } else if (loopVideo && loopVideo.readyState >= 2) {
    if (loopVideo.duration && Number.isFinite(loopVideo.duration) && loopVideo.duration > 0) {
      const t = elapsed % loopVideo.duration;
      if (Math.abs(loopVideo.currentTime - t) > 0.08) {
        try { loopVideo.currentTime = t; } catch { /* seek may fail mid-decode */ }
      }
    }
    drawCover(context, loopVideo, 0, 0, width, height);
  } else if (poster) {
    drawCover(context, poster, 0, 0, width, height);
  } else {
    drawGameplayFrame(context, backgroundId, elapsed, width, height);
  }

  const readabilityGradient = context.createLinearGradient(0, height * 0.58, 0, height);
  readabilityGradient.addColorStop(0, "rgba(4, 6, 8, 0)");
  readabilityGradient.addColorStop(1, "rgba(4, 6, 8, .42)");
  context.fillStyle = readabilityGradient;
  context.fillRect(0, height * 0.58, width, height * 0.42);
  const captionFrame = captionFrameAt(captionWords, elapsed);
  if (captionFrame && captionStyle !== "No captions") {
    drawKaraokeCaption(context, captionFrame, captionStyle, width, height);
  }
}

export function VideoComposer({
  projectId,
  title,
  script,
  posterUrl,
  audioUrl,
  audioSegments,
  motionVideoUrl,
  durationSeconds,
  captionStyle,
  backgroundId,
  aspectRatio,
  onProjectSaved,
  autoStart = false,
}: {
  projectId: string;
  title: string;
  script: BrainrotScript;
  posterUrl: string | null;
  audioUrl: string | null;
  audioSegments: ProjectDetail["audioSegments"];
  motionVideoUrl: string | null;
  durationSeconds: number;
  captionStyle: string;
  backgroundId: string;
  aspectRatio: string;
  onProjectSaved: (project: ProjectDetail) => void;
  autoStart?: boolean;
}) {
  const [state, setState] = useState<ExportState>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [srtUrl, setSrtUrl] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [canRetrySave, setCanRetrySave] = useState(false);
  const activeObjectUrls = useRef<string[]>([]);
  const finalBlob = useRef<Blob | null>(null);
  const autoStarted = useRef(false);
  const previewRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => () => {
    activeObjectUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    if (!autoStart || autoStarted.current || state !== "idle") return;
    autoStarted.current = true;
    void exportVideo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  async function saveFinalExport(blob: Blob) {
    setSaveState("saving");
    setSaveMessage("Saving a copy to this project…");
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/export`, {
        method: "POST",
        headers: { "Content-Type": "video/mp4" },
        body: blob,
      });
      const payload = await response.json() as { project?: ProjectDetail; error?: string };
      if (!response.ok || !payload.project) throw new Error(payload.error ?? "The final MP4 could not be saved to the project.");
      setSaveState("saved");
      setSaveMessage("Saved to this project. You can return later and download the same MP4 without exporting again.");
      onProjectSaved(payload.project);
    } catch (error) {
      setSaveState("failed");
      setSaveMessage(error instanceof Error ? error.message : "The MP4 is ready locally, but the project copy could not be saved.");
    }
  }

  async function exportVideo() {
    if (state === "loading" || state === "recording") return;
    const segments = audioSegments.length
      ? audioSegments.filter((segment) => segment.url)
      : audioUrl ? [{ url: audioUrl, sequence: 0, speakerId: script.speakers[0]?.id ?? null, timeline: null }] : [];
    if (!segments.length) {
      setState("error");
      setMessage("The narration must finish before the final export can start.");
      return;
    }
    if (typeof VideoEncoder === "undefined" || typeof AudioEncoder === "undefined") {
      setState("error");
      setMessage("This browser does not expose the local MP4 encoder. Use the latest Chrome or Edge.");
      return;
    }
    activeObjectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    activeObjectUrls.current = [];
    setVideoUrl(null);
    setSrtUrl(null);
    setSaveState("idle");
    setSaveMessage("");
    setCanRetrySave(false);
    finalBlob.current = null;
    setProgress(0);
    setState("loading");
    setMessage("Loading narration and visuals…");

    const image = posterUrl ? new Image() : null;
    if (image && posterUrl) {
      image.crossOrigin = "anonymous";
      image.src = mediaStreamUrl(posterUrl);
      image.decoding = "async";
    }
    const motionSource = motionVideoUrl;
    const motionVideo = motionSource ? document.createElement("video") : null;
    if (motionVideo && motionSource) {
      motionVideo.src = mediaStreamUrl(motionSource);
      motionVideo.muted = true;
      motionVideo.loop = true;
      motionVideo.playsInline = true;
      motionVideo.crossOrigin = "anonymous";
      motionVideo.preload = "auto";
    }
    const loopSource = getGameplayBackground(backgroundId).videoSrc;
    const loopVideo = !motionSource && loopSource ? document.createElement("video") : null;
    if (loopVideo && loopSource) {
      loopVideo.src = loopSource;
      loopVideo.muted = true;
      loopVideo.loop = true;
      loopVideo.playsInline = true;
      loopVideo.preload = "auto";
    }

    try {
      await Promise.all([
        image ? new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("The generated visual could not be loaded.")); }) : Promise.resolve(),
        motionVideo ? new Promise<void>((resolve, reject) => { motionVideo.onloadeddata = () => resolve(); motionVideo.onerror = () => reject(new Error("The motion clip could not be loaded.")); }) : Promise.resolve(),
        loopVideo ? new Promise<void>((resolve, reject) => { loopVideo.onloadeddata = () => resolve(); loopVideo.onerror = () => reject(new Error("The gameplay loop could not be loaded.")); }) : Promise.resolve(),
      ]);

      const dimensions = outputDimensions(aspectRatio);
      const canvas = document.createElement("canvas");
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("The browser compositor could not create a canvas.");

      setMessage("Decoding narration and building word timing…");
      const decodeContext = new AudioContext();
      const audioBuffers = await Promise.all(segments.map(async (segment) => {
        const response = await fetch(mediaStreamUrl(segment.url));
        if (!response.ok) throw new Error("The generated narration could not be loaded.");
        return decodeContext.decodeAudioData(await response.arrayBuffer());
      }));
      await decodeContext.close();

      const segmentDurations = audioBuffers.map((buffer) => buffer.duration);
      const totalAudioDuration = segmentDurations.reduce((sum, duration) => sum + duration, 0);
      const renderDuration = Math.max(durationSeconds, Math.ceil(totalAudioDuration * 10) / 10);
      const captionWords = buildCaptionWords(script, segments, segmentDurations, renderDuration);
      const subtitleCues = makeSubtitleCues(captionWords);
      const mixedAudio = await mixAudioBuffers(audioBuffers);

      const output = new Output({ format: new Mp4OutputFormat(), target: new BufferTarget() });
      const videoSource = new CanvasSource(canvas, {
        codec: "avc",
        bitrate: aspectRatio === "16:9" ? 6_500_000 : 5_500_000,
      });
      const audioSource = new AudioBufferSource({ codec: "aac", bitrate: 192_000 });
      output.addVideoTrack(videoSource, { frameRate: 30 });
      output.addAudioTrack(audioSource);
      setState("recording");
      setMessage(`Composing ${renderDuration.toFixed(1)}s offline at ${dimensions.width}×${dimensions.height}…`);
      await output.start();
      await audioSource.add(mixedAudio);

      if (motionVideo) {
        try { motionVideo.currentTime = 0; await motionVideo.play(); } catch { /* optional */ }
      }
      if (loopVideo) {
        try { loopVideo.currentTime = 0; await loopVideo.play(); } catch { /* optional */ }
      }

      const frameRate = 30;
      const totalFrames = Math.ceil(renderDuration * frameRate);
      for (let frameIndex = 0; frameIndex < totalFrames; frameIndex += 1) {
        const elapsed = frameIndex / frameRate;
        drawComposedFrame(context, {
          elapsed,
          width: dimensions.width,
          height: dimensions.height,
          backgroundId,
          captionStyle,
          captionWords,
          motionVideo,
          loopVideo,
          poster: image,
        });
        const preview = previewRef.current?.getContext("2d");
        if (preview && previewRef.current) {
          preview.drawImage(canvas, 0, 0, previewRef.current.width, previewRef.current.height);
        }
        setProgress(Math.min(100, ((frameIndex + 1) / totalFrames) * 100));
        if (frameIndex % 8 === 0) await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
        await videoSource.add(elapsed, 1 / frameRate);
      }

      await output.finalize();
      motionVideo?.pause();
      loopVideo?.pause();
      const buffer = output.target.buffer;
      if (!buffer) throw new Error("The local MP4 encoder did not produce a file.");
      const blob = new Blob([buffer], { type: "video/mp4" });
      finalBlob.current = blob;
      setCanRetrySave(true);
      const objectUrl = URL.createObjectURL(blob);
      const subtitleUrl = URL.createObjectURL(new Blob([makeSrt(subtitleCues)], { type: "text/plain;charset=utf-8" }));
      activeObjectUrls.current.push(objectUrl, subtitleUrl);
      setVideoUrl(objectUrl);
      setSrtUrl(subtitleUrl);
      setProgress(100);
      setState("ready");
      setMessage("Publish-ready MP4 is ready. Karaoke captions are burned in; SRT is included separately.");
      void saveFinalExport(blob);
    } catch (error) {
      motionVideo?.pause();
      loopVideo?.pause();
      setState("error");
      setMessage(error instanceof Error ? error.message : "The final export failed. Try again after the generated assets are ready.");
    }
  }

  const dims = outputDimensions(aspectRatio);

  return (
    <section className="video-composer" aria-labelledby="video-composer-title">
      <div className="video-composer-heading">
        <div>
          <p>Final browser export</p>
          <h2 id="video-composer-title">Compose the publish-ready video</h2>
        </div>
        <Film aria-hidden="true" size={18} />
      </div>
      <p className="video-composer-copy">
        Offline compositor (faster than real-time): mixes every voice segment, draws {motionVideoUrl ? "AI motion" : getGameplayBackground(backgroundId).videoSrc ? "loop footage" : "gameplay motion"}, and burns stroke karaoke captions at {dims.width}×{dims.height}. No extra AI credits.
      </p>
      <canvas
        ref={previewRef}
        className="video-composer-preview"
        width={Math.round(dims.width / 2)}
        height={Math.round(dims.height / 2)}
        aria-label="Export preview"
      />
      {state === "recording" ? (
        <div className="video-composer-progress" role="status" aria-live="polite">
          <div>
            <LoaderCircle aria-hidden="true" size={16} />
            <strong>{Math.round(progress)}% · Offline export</strong>
            <span>{message}</span>
          </div>
          <progress max="100" value={progress} aria-label="Export progress" />
        </div>
      ) : null}
      {state === "loading" ? (
        <div className="video-composer-progress" role="status" aria-live="polite">
          <div>
            <LoaderCircle aria-hidden="true" size={16} />
            <strong>Preparing export</strong>
            <span>{message}</span>
          </div>
        </div>
      ) : null}
      {state === "error" ? <p className="video-composer-error" role="alert"><TriangleAlert aria-hidden="true" size={16} /> {message}</p> : null}
      {state === "ready" && videoUrl ? (
        <div className="video-composer-ready" role="status">
          <Check aria-hidden="true" size={16} />
          <span>{message}</span>
          {saveState === "saving" ? <span className="video-composer-save-status"><CloudUpload aria-hidden="true" size={14} /> {saveMessage}</span> : null}
          {saveState === "saved" ? <span className="video-composer-save-status saved"><Check aria-hidden="true" size={14} /> {saveMessage}</span> : null}
          {saveState === "failed" ? <span className="video-composer-save-status failed" role="alert"><TriangleAlert aria-hidden="true" size={14} /> {saveMessage}</span> : null}
          <video className="video-composer-result" src={videoUrl} controls playsInline preload="metadata" />
          <div>
            <a className="button-primary" href={videoUrl} download={`${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "brainrot-video"}.mp4`}>
              <Download aria-hidden="true" size={15} /> Download MP4
            </a>
            {srtUrl ? (
              <a className="button-secondary" href={srtUrl} download={`${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "brainrot-video"}.srt`}>
                <FileDown aria-hidden="true" size={15} /> Download SRT
              </a>
            ) : null}
          </div>
          {saveState === "failed" && canRetrySave ? (
            <button type="button" className="button-secondary video-composer-save-button" onClick={() => { if (finalBlob.current) void saveFinalExport(finalBlob.current); }}>
              <CloudUpload aria-hidden="true" size={15} /> Retry project save
            </button>
          ) : null}
        </div>
      ) : null}
      {state !== "ready" ? (
        <button type="button" className="button-primary video-composer-button" onClick={() => void exportVideo()} disabled={state === "loading" || state === "recording"}>
          <Film aria-hidden="true" size={16} /> {state === "error" ? "Retry final export" : autoStart ? "Exporting automatically…" : "Export final video"}
          <span>{durationSeconds}s</span>
        </button>
      ) : (
        <button type="button" className="button-secondary video-composer-button" onClick={() => void exportVideo()}>
          <Film aria-hidden="true" size={16} /> Export another copy
        </button>
      )}
      <small className="video-composer-note">Offline encode is typically much faster than watching the clip. Keep this tab open until the MP4 finishes.</small>
    </section>
  );
}
