"use client";

import { usePathname } from "next/navigation";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function RouteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isApp = pathname.startsWith("/app");

  if (isAdmin || isApp) {
    return children;
  }

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
      <MobileBottomNav />
    </>
  );
}
