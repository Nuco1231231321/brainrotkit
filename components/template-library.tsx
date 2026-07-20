"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { mediaAssets } from "@/lib/media";

const categories = ["All", "Creator", "Study", "Italian", "Voice"];

export function TemplateLibrary() {
  const [category, setCategory] = useState("All");
  const visible = useMemo(() => {
    if (category === "All") return mediaAssets;
    return mediaAssets.filter((asset) => asset.type === category.toLowerCase());
  }, [category]);

  return (
    <>
      <div className="template-filters" role="group" aria-label="Template category">
        {categories.map((item) => (
          <button key={item} type="button" className={category === item ? "active" : undefined} onClick={() => setCategory(item)} aria-pressed={category === item}>
            {item}
          </button>
        ))}
      </div>
      <div className="template-grid" aria-live="polite">
        {visible.map((asset) => (
          <article key={asset.id} className="template-card">
            <div className="template-poster">
              {asset.videoSrc ? (
                <video controls playsInline preload="metadata" poster={asset.src} src={asset.videoSrc} aria-label={`${asset.title} real generated video`} />
              ) : (
                <>
                  <Image src={asset.src} alt={asset.alt} fill sizes="(max-width: 820px) 50vw, 25vw" unoptimized />
                  <audio className="showcase-audio" controls preload="metadata" src={asset.audioSrc} aria-label={`${asset.title} real generated audio`} />
                </>
              )}
            </div>
            <div>
              <span>{asset.sourceLabel}</span>
              <h2>{asset.title}</h2>
              <p>{asset.description}</p>
              <Link href={asset.href}>
                {asset.ctaLabel} <ArrowRight aria-hidden="true" size={14} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
