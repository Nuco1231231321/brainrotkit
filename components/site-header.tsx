"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- account links intentionally load Cloudflare static documents. */

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { requestAuthDialog } from "@/components/auth-dialog";
import { Logo } from "@/components/logo";

const createLinks = [
  { href: "/create", label: "Create studio" },
  { href: "/", label: "AI Video" },
  { href: "/italian-brainrot-generator", label: "Italian Brainrot" },
  { href: "/pdf-to-brainrot", label: "PDF to Brainrot" },
  { href: "/text-to-brainrot", label: "Text to Brainrot" },
  { href: "/italian-brainrot-voice-generator", label: "Brainrot Voice" },
  { href: "/remove-bg", label: "Remove Background" },
];

export function SiteHeader() {
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function readAccount() {
      try {
        const response = await fetch("/api/account", { cache: "no-store", signal: controller.signal });
        if (!response.ok) return;
        const payload = await response.json() as { account?: { credits?: number } };
        if (typeof payload.account?.credits === "number") setCredits(payload.account.credits);
      } catch {
        // Public navigation remains fully usable when there is no active session.
      }
    }
    void readAccount();
    return () => controller.abort();
  }, []);

  return (
    <>
      <div className="promo-strip">
        <span>{credits === null ? "Starter credits with Google sign-in" : `${credits.toLocaleString()} credits available`}</span>
        <Link href="/pricing">See plans</Link>
      </div>
      <header className="site-header">
        <Logo />
        <nav className="desktop-nav" aria-label="Main navigation">
          <details className="create-menu">
            <summary>
              Create <ChevronDown aria-hidden="true" size={14} />
            </summary>
            <div className="create-menu-panel">
              {createLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </details>
          <Link href="/templates">Templates</Link>
          <Link href="/pricing">Pricing</Link>
          <a href="/app">My Projects</a>
        </nav>
        <div className="header-actions">
          <Link href="/pricing" className="button-secondary compact desktop-only">
            Pricing
          </Link>
          {credits === null ? (
            <button type="button" className="button-primary compact" onClick={() => requestAuthDialog({ returnTo: "/app" })}>Sign in</button>
          ) : (
            <a href="/app/account" className="button-primary compact">Account</a>
          )}
        </div>
      </header>
    </>
  );
}
