"use client";

import { CircleUserRound, FolderOpen, Home, LayoutGrid, Plus } from "lucide-react";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/templates", label: "Templates", icon: LayoutGrid },
  { href: "/create", label: "Create", icon: Plus, primary: true },
  { href: "/app", label: "Projects", icon: FolderOpen },
  { href: "/app/account", label: "Account", icon: CircleUserRound },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {items.map(({ href, label, icon: Icon, primary }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <a
            key={href}
            href={href}
            className={primary ? "mobile-nav-primary" : active ? "active" : undefined}
            aria-current={active ? "page" : undefined}
          >
            <Icon aria-hidden="true" size={19} />
            <span>{label}</span>
          </a>
        );
      })}
    </nav>
  );
}
