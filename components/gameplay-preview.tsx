"use client";

import { useEffect, useRef } from "react";
import { drawGameplayFrame } from "@/components/gameplay-renderer";
import { getGameplayBackground, type GameplayBackgroundId } from "@/lib/gameplay-backgrounds";

export function GameplayPreview({
  backgroundId,
  caption = "Your story starts here",
  compact = false,
  showCaption = true,
}: {
  backgroundId: GameplayBackgroundId | string;
  caption?: string;
  compact?: boolean;
  showCaption?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let frame = 0;
    let visible = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.05 });
    observer.observe(canvas);
    const startedAt = performance.now();
    const loopSrc = getGameplayBackground(backgroundId).videoSrc;
    let video = videoRef.current;
    if (loopSrc) {
      if (!video) {
        video = document.createElement("video");
        video.crossOrigin = "anonymous";
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = "auto";
        videoRef.current = video;
      }
      if (video.src !== new URL(loopSrc, window.location.origin).href) {
        video.src = loopSrc;
      }
      void video.play().catch(() => undefined);
    } else if (video) {
      video.pause();
    }

    const draw = (now: number) => {
      const elapsed = reducedMotion ? 1.6 : (now - startedAt) / 1_000;
      if (video && video.readyState >= 2) {
        const scale = Math.max(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
        const drawWidth = video.videoWidth * scale;
        const drawHeight = video.videoHeight * scale;
        context.drawImage(video, (canvas.width - drawWidth) / 2, (canvas.height - drawHeight) / 2, drawWidth, drawHeight);
      } else if (!loopSrc) {
        drawGameplayFrame(context, backgroundId, elapsed, canvas.width, canvas.height);
      } else {
        // Do not show the old procedural placeholder while real footage is loading.
        context.fillStyle = "#0b0e12";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "rgba(255,255,255,.72)";
        context.font = '600 13px Arial, sans-serif';
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText("Loading gameplay…", canvas.width / 2, canvas.height / 2);
      }
      const words = showCaption ? caption.trim().split(/\s+/).filter(Boolean).slice(0, 5) : [];
      if (words.length) {
        const activeWord = Math.floor(elapsed * 2.6) % words.length;
        const fontSize = compact ? 26 : 32;
        context.font = `800 ${fontSize}px "Arial Black", Impact, Arial, sans-serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        const joined = words.join(" ");
        const width = Math.min(canvas.width - 28, context.measureText(joined).width + 28);
        const y = canvas.height * 0.74;
        context.fillStyle = "rgba(0,0,0,.30)";
        context.fillRect((canvas.width - width) / 2, y - 30, width, 60);
        let cursor = canvas.width / 2 - context.measureText(joined).width / 2;
        context.textAlign = "left";
        for (let index = 0; index < words.length; index += 1) {
          const word = words[index];
          const label = word.length <= 3 ? word.toUpperCase() : word;
          context.lineWidth = Math.max(3, fontSize * 0.12);
          context.strokeStyle = "rgba(0,0,0,.9)";
          context.fillStyle = index === activeWord ? "#d1fe17" : "#ffffff";
          context.strokeText(label, cursor, y);
          context.fillText(label, cursor, y);
          cursor += context.measureText(`${label} `).width;
        }
      }
      if (!reducedMotion && visible) frame = window.requestAnimationFrame(draw);
    };
    draw(performance.now());
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      video?.pause();
    };
  }, [backgroundId, caption, compact, showCaption]);

  return <canvas ref={canvasRef} className={compact ? "gameplay-preview compact" : "gameplay-preview"} width={360} height={640} role="img" aria-label="Animated gameplay background preview" />;
}
