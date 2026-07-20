"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CheckCircle2, LoaderCircle, ShieldCheck, X } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSafeReturnPath } from "@/lib/adapters";

type AuthDialogDetail = {
  returnTo?: string;
  hasDraft?: boolean;
  needsFileReselection?: boolean;
};

const authDialogEvent = "brainrotkit:open-auth";

export function requestAuthDialog(detail: AuthDialogDetail = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AuthDialogDetail>(authDialogEvent, { detail }));
}

export function AuthDialog() {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState({ returnTo: "/app", hasDraft: false, needsFileReselection: false });
  const [status, setStatus] = useState<"idle" | "checking" | "pending" | "error">("idle");

  useEffect(() => {
    function handleOpen(event: Event) {
      const detail = (event as CustomEvent<AuthDialogDetail>).detail ?? {};
      const nextContext = {
        returnTo: getSafeReturnPath(detail.returnTo),
        hasDraft: detail.hasDraft === true,
        needsFileReselection: detail.needsFileReselection === true,
      };
      setContext(nextContext);
      setStatus("checking");
      setOpen(true);

      fetch("/api/account", { cache: "no-store" })
        .then((response) => {
          if (response.ok) {
            window.location.assign(nextContext.returnTo);
            return;
          }
          setStatus("idle");
        })
        .catch(() => setStatus("idle"));
    }

    window.addEventListener(authDialogEvent, handleOpen);
    return () => window.removeEventListener(authDialogEvent, handleOpen);
  }, []);

  async function handleGoogleLogin() {
    setStatus("pending");
    try {
      const completionUrl = `/auth/complete?returnTo=${encodeURIComponent(context.returnTo)}`;
      await signIn("google", { redirectTo: completionUrl });
    } catch {
      setStatus("error");
    }
  }

  const isBusy = status === "checking" || status === "pending";

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => {
      setOpen(nextOpen);
      if (!nextOpen) setStatus("idle");
    }}>
      <Dialog.Portal>
        <Dialog.Overlay className="auth-dialog-overlay" />
        <Dialog.Content className="auth-dialog-content" aria-busy={isBusy}>
          <Dialog.Close className="auth-dialog-close" aria-label="Close sign in">
            <X aria-hidden="true" size={18} />
          </Dialog.Close>

          <div className="auth-dialog-visual">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster="/showcase/moonbound-cart-dash-poster.png"
              src="/showcase/moonbound-cart-dash.mp4"
            />
            <div>
              <span>Real BrainrotKit output</span>
              <strong>Moonbound Cart Dash</strong>
              <p>Text, image, voice and video completed in one saved project.</p>
            </div>
          </div>

          <div className="auth-dialog-panel">
            <div className="auth-dialog-mark" aria-hidden="true">BR</div>
            <Dialog.Title>Create with BrainrotKit</Dialog.Title>
            <Dialog.Description>
              Sign in with Google to save your draft, credits and finished videos.
            </Dialog.Description>

            {context.hasDraft ? (
              <div className="auth-draft-notice" role="status">
                <CheckCircle2 aria-hidden="true" size={18} />
                <div>
                  <strong>Your draft is safe</strong>
                  <span>{context.needsFileReselection
                    ? "Your settings are saved. Select the PDF again after sign-in."
                    : "Your source and settings will return after sign-in."}</span>
                </div>
              </div>
            ) : null}

            <button
              className="auth-google-button"
              type="button"
              onClick={handleGoogleLogin}
              disabled={isBusy}
              aria-busy={isBusy}
              aria-describedby="auth-dialog-status"
            >
              {isBusy ? <LoaderCircle aria-hidden="true" className="spin" size={19} /> : <span aria-hidden="true">G</span>}
              {status === "checking" ? "Checking your account" : status === "pending" ? "Opening Google" : status === "error" ? "Retry with Google" : "Continue with Google"}
            </button>

            <div id="auth-dialog-status" className={`auth-dialog-status ${status}`} aria-live="polite">
              <ShieldCheck aria-hidden="true" size={15} />
              <span>{status === "error"
                ? "Google sign-in did not finish. Your draft is still saved on this device."
                : status === "pending"
                  ? "Waiting for Google. Keep this window open."
                  : status === "checking"
                    ? "Checking whether you are already signed in."
                    : "One Google account keeps projects, billing and downloads together."}</span>
            </div>

            <p className="auth-dialog-terms">
              By continuing, you agree to the <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
