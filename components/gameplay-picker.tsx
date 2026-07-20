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
        <div><strong id="gameplay-picker-title">Gameplay background</strong><span>Original motion, commercial-safe — pick Cinematic Dash for denser real-loop footage</span></div>
        <small>No extra AI charge</small>
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
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
