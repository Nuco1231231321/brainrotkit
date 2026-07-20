import Image from "next/image";
import { CheckCircle2, Clock3, Download, RotateCcw } from "lucide-react";
import { ToolForm } from "@/components/tool-form";
import { mediaAssets } from "@/lib/media";
import type { ToolPageConfig } from "@/lib/tool-pages";

type ToolWorkspaceProps = { config: Pick<ToolPageConfig, "kind" | "slug" | "inputLabel" | "inputPlaceholder" | "estimatedCredits" | "outputLabel"> };

export function ToolWorkspace({ config }: ToolWorkspaceProps) {
  const poster = mediaAssets.find((asset) => asset.type === config.kind) ?? mediaAssets[0];
  const sourcePath = config.slug === "home" ? "/" : `/${config.slug}`;

  return (
    <section className="generator-shell" aria-label={`${config.outputLabel} generator`}>
      <div className="generator-sidebar">
        <div className="workspace-panel-heading">
          <div>
            <p>Start creating</p>
            <h2>Add your source</h2>
          </div>
          <span className="status-badge">Draft</span>
        </div>
        <ToolForm
          kind={config.kind}
          sourcePath={sourcePath}
          inputLabel={config.inputLabel}
          inputPlaceholder={config.inputPlaceholder}
          estimatedCredits={config.estimatedCredits}
        />
      </div>
      <div className="preview-stage">
        <div className="preview-toolbar">
          <div>
            <span className="status-dot" aria-hidden="true" />
            Preview
          </div>
          <span>9:16 · 480p</span>
        </div>
        <div className="preview-content">
          <div className={`preview-poster${poster.audioSrc ? " has-audio" : ""}`}>
            {poster.videoSrc ? (
              <video
                controls
                playsInline
                preload="metadata"
                poster={poster.src}
                src={poster.videoSrc}
                aria-label={`${poster.title} real generated video preview`}
              />
            ) : (
              <>
                <Image src={poster.src} alt={poster.alt} fill sizes="(max-width: 520px) 78vw, 330px" unoptimized />
                <audio className="showcase-audio" controls preload="metadata" src={poster.audioSrc} aria-label={`${poster.title} real generated audio preview`} />
              </>
            )}
            <div className="preview-caption">REAL OUTPUT CREATED WITH BRAINROTKIT</div>
          </div>
          <div className="preview-empty-copy">
            <p className="eyebrow">What you will get</p>
            <h2>{config.outputLabel}</h2>
            <p>Add your source and choose the settings. You can review the script, scenes, voice and credit cost before rendering the final output.</p>
            <ol className="mini-steps">
              <li><CheckCircle2 aria-hidden="true" size={17} /> Create a project to get an editable script</li>
              <li><Clock3 aria-hidden="true" size={17} /> Confirm once to generate narration (and images if needed)</li>
              <li><RotateCcw aria-hidden="true" size={17} /> Fix weak lines, then retry only if something fails</li>
              <li><Download aria-hidden="true" size={17} /> Export the final MP4 with captions in your browser</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}