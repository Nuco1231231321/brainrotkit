"use client";

import { GameplayPreview } from "@/components/gameplay-preview";
import { gameplayBackgrounds, normalizeGameplayBackgroundId, type GameplayBackgroundId } from "@/lib/gameplay-backgrounds";

export function GameplayPicker({
  value,
  onChange,
  disabled = false,
  caption,
}: {
  value: string;
  onChange: (value: GameplayBackgroundId) => void;
  disabled?: boolean;
  caption?: string;
}) {
  const selected = normalizeGameplayBackgroundId(value);
  return (
    <section className="gameplay-picker" aria-labelledby="gameplay-picker-title">
      <div className="gameplay-picker-heading">
        <div><strong id="gameplay-picker-title">Real gameplay background</strong><span>10 open/licensed recordings with at least one minute of source footage. The editor loops and crops them for vertical video.</span></div>
        <small>No AI charge</small>
      </div>
      <div className="gameplay-picker-layout">
        <GameplayPreview backgroundId={selected} caption={caption} compact />
        <div className="gameplay-background-options" role="group" aria-label="Gameplay background">
          {gameplayBackgrounds.map((background) => (
            <button
              type="button"
              key={background.id}
              disabled={disabled}
              aria-pressed={selected === background.id}
              className={selected === background.id ? "active" : undefined}
              onClick={() => onChange(background.id)}
            >
              <strong>{background.name}</strong>
              <span>{background.description}</span>
              <small>{Math.floor(background.durationSeconds / 60)}:{String(background.durationSeconds % 60).padStart(2, "0")} · {background.license}</small>
            </button>
          ))}
        </div>
      </div>
      <a className="gameplay-picker-source" href={gameplayBackgrounds.find((background) => background.id === selected)?.sourceUrl} target="_blank" rel="noreferrer">
        View source and licence for the selected recording
      </a>
    </section>
  );
}
