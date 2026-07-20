"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- workspace exits use static document navigation on Cloudflare Free. */

import { ArrowRight, FileText, Plus, Sparkles, Type, Volume2 } from "lucide-react";
import { useAppAccount } from "@/components/app-shell";
import { ProjectDashboard } from "@/components/project-dashboard";

const createOptions = [
  { href: "/text-to-brainrot", label: "Text video", icon: Type },
  { href: "/pdf-to-brainrot", label: "PDF video", icon: FileText },
  { href: "/italian-brainrot-generator", label: "Italian character", icon: Sparkles },
  { href: "/italian-brainrot-voice-generator", label: "Voice", icon: Volume2 },
];

export function DashboardHome() {
  const account = useAppAccount();

  return (
    <main id="main-content" className="app-page">
      <header className="app-page-heading">
        <div><p>{account.credits.toLocaleString()} credits · {account.plan.charAt(0).toUpperCase() + account.plan.slice(1)} plan</p><h1>Your projects</h1></div>
        <a href="/text-to-brainrot" className="button-primary"><Plus aria-hidden="true" size={17} /> Create new</a>
      </header>
      <section className="quick-create" aria-labelledby="quick-create-title">
        <div className="app-section-title"><h2 id="quick-create-title">Create from</h2><a href="/templates">Browse templates <ArrowRight aria-hidden="true" size={14} /></a></div>
        <div>
          {createOptions.map(({ href, label, icon: Icon }) => <a key={href} href={href}><Icon aria-hidden="true" size={18} /><span>{label}</span><ArrowRight aria-hidden="true" size={14} /></a>)}
        </div>
      </section>
      <section className="recent-projects" aria-labelledby="recent-title">
        <div className="app-section-title"><h2 id="recent-title">Recent projects</h2><span>Private to your account</span></div>
        <ProjectDashboard />
      </section>
    </main>
  );
}