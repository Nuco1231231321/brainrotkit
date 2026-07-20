import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { mediaAssets } from "@/lib/media";

type MediaGalleryProps = { title?: string; description?: string };

export function MediaGallery({
  title = "REAL OUTPUTS FROM BRAINROTKIT",
  description = "Play finished results created through the live image, voice and video pipeline.",
}: MediaGalleryProps) {
  return (
    <section className="section-block page-shell" aria-labelledby="output-gallery-title">
      <div className="section-heading lime">
        <h2 id="output-gallery-title">{title}</h2>
        <p>{description}</p>
      </div>
      <div className="media-grid">
        {mediaAssets.map((asset) => (
          <article className="media-card" key={asset.id}>
            <div className="media-card-poster">
              {asset.videoSrc ? (
                <video controls playsInline preload="metadata" poster={asset.src} src={asset.videoSrc} aria-label={`${asset.title} real generated video`} />
              ) : (
                <>
                  <Image src={asset.src} alt={asset.alt} fill sizes="(max-width: 820px) 50vw, 25vw" unoptimized />
                  <audio className="showcase-audio" controls preload="metadata" src={asset.audioSrc} aria-label={`${asset.title} real generated audio`} />
                </>
              )}
            </div>
            <div className="media-card-copy">
              <div className="media-card-meta"><span>{asset.sourceLabel}</span><span>{asset.duration}</span></div>
              <h3>{asset.title}</h3>
              <p>{asset.description}</p>
              <Link href={asset.href}>{asset.ctaLabel} <ArrowRight aria-hidden="true" size={14} /></Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}