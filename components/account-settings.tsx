"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- app routes intentionally use full document navigation so Cloudflare serves static assets without invoking SSR. */

import Link from "next/link";
import Image from "next/image";
import { CreditCard, FileText, LoaderCircle, LogOut, ShieldCheck } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

export function AccountSettings({
  name,
  email,
  image,
  plan,
  credits,
  subscriptionStatus,
}: {
  name: string | null;
  email: string;
  image: string | null;
  plan: "free" | "creator" | "pro";
  credits: number;
  subscriptionStatus: string;
}) {
  const [signOutStatus, setSignOutStatus] = useState<"idle" | "pending" | "error">("idle");
  const displayName = name ?? email.split("@")[0];
  const initial = displayName.charAt(0).toUpperCase();

  async function handleSignOut() {
    setSignOutStatus("pending");
    try {
      const sessionResponse = await fetch("/api/session", { method: "DELETE" });
      if (!sessionResponse.ok) throw new Error("BrainrotKit session could not be cleared.");
      await signOut({ redirectTo: "/" });
    } catch {
      setSignOutStatus("error");
    }
  }

  return (
    <div className="settings-page-grid">
      <section className="settings-panel" aria-labelledby="profile-heading">
        <div className="settings-panel-heading"><div><h2 id="profile-heading">Profile</h2><p>Your Google account keeps your BrainrotKit access secure.</p></div></div>
        <div className="profile-row">
          {image ? <Image className="profile-avatar" src={image} alt="" width={46} height={46} unoptimized referrerPolicy="no-referrer" /> : <span className="profile-avatar" aria-hidden="true">{initial}</span>}
          <div><strong>{displayName}</strong><span>{email}</span><small>Verified with Google</small></div>
        </div>
        <button type="button" className="button-secondary" onClick={handleSignOut} disabled={signOutStatus === "pending"} aria-busy={signOutStatus === "pending"} aria-describedby="sign-out-status"><LogOut aria-hidden="true" size={15} /> {signOutStatus === "pending" ? "Signing out..." : "Sign out"}</button>
        <p id="sign-out-status" className={`checkout-status ${signOutStatus}`} aria-live="polite">{signOutStatus === "error" ? "Sign-out failed. Try again." : "Signing out only ends this browser session."}</p>
      </section>

      <section className="settings-panel" aria-labelledby="billing-account-heading">
        <div className="settings-panel-heading"><div><h2 id="billing-account-heading">Plan and credits</h2><p>Your current plan, balance and subscription status.</p></div><CreditCard aria-hidden="true" size={19} /></div>
        <div className="account-fact-row"><span>Plan</span><strong>{plan.charAt(0).toUpperCase() + plan.slice(1)}</strong></div>
        <div className="account-fact-row"><span>Credits</span><strong>{credits.toLocaleString()}</strong></div>
        <div className="account-fact-row"><span>Subscription</span><strong>{subscriptionStatus.replaceAll("_", " ")}</strong></div>
        <a className="button-secondary" href="/app/billing">Open billing</a>
      </section>

      <section className="settings-panel" aria-labelledby="data-heading">
        <div className="settings-panel-heading"><div><h2 id="data-heading">Data and privacy</h2><p>Understand how uploads and account records are handled.</p></div><FileText aria-hidden="true" size={19} /></div>
        <p>Google provides your name, email and profile image. Billing records are retained for payment reconciliation. Uploaded source files and generated results follow the retention rules in the Privacy Policy.</p>
        <div className="settings-link-row"><Link href="/privacy">Privacy policy</Link><Link href="/data-deletion">Data deletion policy</Link></div>
      </section>

      <section className="settings-panel" aria-labelledby="security-heading">
        <div className="settings-panel-heading"><div><h2 id="security-heading">Session security</h2><p>Authentication is limited to Google OAuth.</p></div><ShieldCheck aria-hidden="true" size={19} /></div>
        <p>BrainrotKit never receives your Google password. The browser session is stored in a signed, HTTP-only cookie and expires after 30 days.</p>
        {signOutStatus === "pending" ? <p className="settings-notice" role="status"><LoaderCircle className="spin" aria-hidden="true" size={14} /> Ending your session...</p> : null}
      </section>
    </div>
  );
}
