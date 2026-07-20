"use client";

import { RotateCcw } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main-content" className="route-error">
      <p className="eyebrow">Page error</p>
      <h1>This view could not load</h1>
      <p>Your draft remains on this device. Retry the page without re-entering the source.</p>
      <button type="button" className="button-primary" onClick={reset}><RotateCcw aria-hidden="true" size={16} /> Retry</button>
    </main>
  );
}
