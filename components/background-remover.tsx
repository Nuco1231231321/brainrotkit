"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, ClipboardPaste, Download, ImagePlus, LoaderCircle, RotateCcw, Upload } from "lucide-react";
import { preload, removeBackground } from "@imgly/background-removal";

type Stage = "idle" | "loading-model" | "processing" | "complete" | "error";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MODEL_PATH = "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/";

function getDevice(): "cpu" | "gpu" {
  return typeof navigator !== "undefined" && "gpu" in navigator ? "gpu" : "cpu";
}

function createRemovalConfig(progress: (key: string, current: number, total: number) => void) {
  return {
    model: "isnet_quint8" as const,
    device: getDevice(),
    output: { format: "image/png" as const },
    publicPath: MODEL_PATH,
    progress,
  };
}

export function BackgroundRemover() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [modelStatus, setModelStatus] = useState<"idle" | "loading" | "ready">("idle");

  useEffect(() => {
    let disposed = false;
    const warmModel = async () => {
      setModelStatus("loading");
      try {
        await preload(createRemovalConfig(() => undefined));
        if (!disposed) setModelStatus("ready");
      } catch {
        if (!disposed) setModelStatus("idle");
      }
    };
    const timer = window.setTimeout(() => void warmModel(), 700);
    return () => {
      disposed = true;
      window.clearTimeout(timer);
    };
  }, []);

  const reset = useCallback(() => {
    setFile(null);
    setStage("idle");
    setProgress(0);
    setMessage("");
    setError("");
    setSourceUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setResultUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  useEffect(() => () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [resultUrl, sourceUrl]);

  const validateFile = (candidate: File) => {
    if (!ACCEPTED_TYPES.has(candidate.type)) throw new Error("Choose a PNG, JPG or WebP image.");
    if (candidate.size > MAX_FILE_SIZE) throw new Error("That image is larger than 20 MB. Choose a smaller file.");
  };

  const processFile = useCallback(async (candidate: File) => {
    try {
      validateFile(candidate);
      setFile(candidate);
      setError("");
      setProgress(0);
      setMessage("Preparing the local model...");
      setStage("loading-model");
      setSourceUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return URL.createObjectURL(candidate);
      });
      setResultUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });

      const output = await removeBackground(candidate, createRemovalConfig((key, current, total) => {
          const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
          setProgress(percent);
          if (key.startsWith("fetch:")) {
            setStage("loading-model");
            setMessage("Downloading the local model data...");
          } else {
            setStage("processing");
            if (key === "compute:decode") setMessage("Reading your image...");
            else if (key === "compute:inference") setMessage("Removing the background...");
            else setMessage("Refining edges and exporting PNG...");
          }
        }));

      setResultUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return URL.createObjectURL(output);
      });
      setProgress(100);
      setMessage("Transparent PNG ready to download.");
      setStage("complete");
    } catch (caught) {
      setStage("error");
      setError(caught instanceof Error ? caught.message : "We could not process that image. Try another file.");
      setMessage("");
    }
  }, []);

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const pasted = Array.from(event.clipboardData?.files ?? []).find((item) => item.type.startsWith("image/"));
      if (!pasted) return;
      event.preventDefault();
      void processFile(pasted);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [processFile]);

  const chooseFile = (candidate: File | undefined) => {
    if (candidate) void processFile(candidate);
  };

  const isBusy = stage === "loading-model" || stage === "processing";
  const visibleProgress = stage === "loading-model"
    ? Math.max(4, Math.round(progress * 0.7))
    : stage === "processing"
      ? Math.min(99, 70 + Math.round(progress * 0.3))
      : progress;

  return (
    <section className="remove-bg-workbench" aria-labelledby="remove-bg-tool-title">
      <div className="remove-bg-workbench-topline">
        <div><span className="remove-bg-tool-kicker">Start here</span><h2 id="remove-bg-tool-title">Upload your image</h2></div>
        <span className="remove-bg-limit">PNG · JPG · WebP · 20 MB</span>
      </div>
      <div className="remove-bg-workbench-grid">
        <div
          className={`remove-bg-dropzone${isDragging ? " is-dragging" : ""}${file ? " has-file" : ""}`}
          onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => { event.preventDefault(); setIsDragging(false); chooseFile(event.dataTransfer.files[0]); }}
        >
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => chooseFile(event.target.files?.[0])} />
          {!file ? (
            <>
              <div className="remove-bg-upload-icon"><Upload aria-hidden="true" size={24} /></div>
              <h3>Drop an image here</h3>
              <p>or choose a file, then let the browser make the cutout</p>
              <div className="remove-bg-upload-actions">
                <button type="button" className="button-primary" onClick={() => inputRef.current?.click()}><ImagePlus aria-hidden="true" size={17} /> Choose image</button>
                <span><ClipboardPaste aria-hidden="true" size={15} /> Paste from clipboard</span>
              </div>
              <span className={`remove-bg-model-status ${modelStatus}`} role="status">
                {modelStatus === "ready" ? "Local model ready" : modelStatus === "loading" ? "Preparing the local model in the background..." : "The model starts when you choose an image"}
              </span>
            </>
          ) : (
            <div className="remove-bg-source-preview">
              {sourceUrl ? <img src={sourceUrl} alt="Original image selected for background removal" /> : null}
              <div><strong>{file.name}</strong><span>{(file.size / 1024 / 1024).toFixed(1)} MB · original</span></div>
              {!isBusy ? <button type="button" className="button-secondary compact" onClick={() => inputRef.current?.click()}><RotateCcw aria-hidden="true" size={15} /> Choose another</button> : null}
            </div>
          )}
        </div>

        <div className={`remove-bg-result${resultUrl ? " has-result" : ""}`} aria-live="polite">
          {resultUrl ? <img src={resultUrl} alt="Background removed transparent PNG preview" /> : <div className="remove-bg-empty-result"><span>Transparent preview</span><small>Your cutout will appear here</small></div>}
          {isBusy ? (
            <div className="remove-bg-progress-panel">
              <LoaderCircle className="remove-bg-spinner" aria-hidden="true" size={22} />
              <strong>{message}</strong>
              <div className="remove-bg-progress-track"><span style={{ width: `${visibleProgress}%` }} /></div>
              <small>{visibleProgress > 4 ? `${visibleProgress}% complete` : "Preparing local processing"}</small>
            </div>
          ) : null}
          {stage === "error" ? <div className="remove-bg-error"><AlertCircle aria-hidden="true" size={20} /><div><strong>We could not finish that image.</strong><span>{error}</span><button type="button" onClick={reset}>Try another image</button></div></div> : null}
          {stage === "complete" && resultUrl ? <div className="remove-bg-result-actions"><a className="button-primary" href={resultUrl} download={`${file?.name.replace(/\.[^.]+$/, "") ?? "brainrot-cutout"}-transparent.png`}><Download aria-hidden="true" size={17} /> Download PNG</a><button type="button" className="button-secondary" onClick={reset}><RotateCcw aria-hidden="true" size={16} /> Start over</button></div> : null}
        </div>
      </div>
      <p className="remove-bg-workbench-note">Your image stays in this browser during processing. The first run may download about 40 MB of model data; that download is separate from your image.</p>
    </section>
  );
}
