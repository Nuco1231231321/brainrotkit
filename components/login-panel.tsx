"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, LoaderCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { getSafeReturnPath } from "@/lib/adapters";

export function LoginPanel() {
  const [loginContext, setLoginContext] = useState({ returnTo: "/app", hasDraft: false, needsFileReselection: false });
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");
  const { returnTo, hasDraft, needsFileReselection } = loginContext;

  useEffect(() => {
    const controller = new AbortController();
    const contextTimer = window.setTimeout(async () => {
      const params = new URLSearchParams(window.location.search);
      const nextContext = {
        returnTo: getSafeReturnPath(params.get("returnTo")),
        hasDraft: params.get("draft") === "1",
        needsFileReselection: params.get("file") === "1",
      };
      setLoginContext(nextContext);
      if (params.get("error")) setStatus("error");
      try {
        const response = await fetch("/api/account", { cache: "no-store", signal: controller.signal });
        if (response.ok) window.location.replace(nextContext.returnTo);
      } catch {
        // A missing or expired session simply leaves the Google login option available.
      }
    }, 0);
    return () => {
      window.clearTimeout(contextTimer);
      controller.abort();
    };
  }, []);

  async function handleGoogleLogin() {
    setStatus("pending");
    try {
      const completionUrl = `/auth/complete?returnTo=${encodeURIComponent(returnTo)}`;
      await signIn("google", { redirectTo: completionUrl });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="login-card">
      <div className="login-card-copy">
        <p className="eyebrow">Continue your project</p>
        <h1>Sign in with Google</h1>
        <p>Save projects, keep generation history and return to the exact step where you started.</p>
      </div>
      {hasDraft ? (
        <div className="saved-draft-notice" role="status">
          <CheckCircle2 aria-hidden="true" size={17} />
          <div>
            <strong>Your draft is saved</strong>
            <span>{needsFileReselection ? "Your settings are saved. For privacy, your browser will ask you to select the PDF again after sign-in." : "Your text and selected settings will be restored after sign-in."}</span>
          </div>
        </div>
      ) : null}
      <button className="google-button" type="button" onClick={handleGoogleLogin} aria-describedby="oauth-status" aria-busy={status === "pending"} disabled={status === "pending"}>
        {status === "pending" ? <LoaderCircle aria-hidden="true" className="spin" size={19} /> : <span aria-hidden="true">G</span>}
        {status === "error" ? "Retry with Google" : "Continue with Google"}
      </button>
      <p id="oauth-status" className="oauth-status" aria-live="polite">
        {status === "pending"
          ? "Checking your Google sign-in..."
          : status === "error"
            ? "Google sign-in did not complete. Try again; your draft is still safe on this device."
            : "Use Google to save projects, credits and generation history."}
      </p>
      <div className="login-divider"><span>Not ready to sign in?</span></div>
      <Link className="button-secondary" href="/templates">Browse templates</Link>
      <p className="login-terms">By continuing, you agree to the <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.</p>
      <Link href={returnTo} className="back-link"><ArrowLeft aria-hidden="true" size={14} /> Return to your draft</Link>
    </div>
  );
}
