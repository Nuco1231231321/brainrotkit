"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- workspace navigation intentionally requests static HTML directly on Cloudflare Free. */

import { CircleHelp, CircleUserRound, CreditCard, FolderOpen, LayoutTemplate, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";

const appLinks = [
  { href: "/app", label: "Projects", icon: FolderOpen },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/app/billing", label: "Billing", icon: CreditCard },
  { href: "/contact", label: "Help", icon: CircleHelp },
];

export function AppHeader({
  admin = false,
  credits = 0,
  accountLabel = "Account",
}: {
  admin?: boolean;
  credits?: number;
  accountLabel?: string;
}) {
  const pathname = usePathname();
  return (
    <header className="app-header">
      <Logo />
      <nav aria-label={admin ? "Admin navigation" : "Workspace navigation"}>
        {(admin ? [{ href: "/admin", label: "Operations", icon: FolderOpen }] : appLinks).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/app" && pathname.startsWith(href));
          return <a key={href} href={href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined}><Icon aria-hidden="true" size={15} />{label}</a>;
        })}
      </nav>
      <div className="app-header-actions">
        {!admin ? <a href="/app/billing" className="credit-chip">{credits.toLocaleString()} credits</a> : <span className="credit-chip">Admin</span>}
        {!admin ? <a href="/text-to-brainrot" className="button-primary compact"><Plus aria-hidden="true" size={16} /> New</a> : null}
        <a href={admin ? "/app" : "/app/account"} className="icon-link" aria-label={admin ? "Exit admin" : `Open ${accountLabel}`}><CircleUserRound aria-hidden="true" size={20} /></a>
      </div>
    </header>
  );
}
