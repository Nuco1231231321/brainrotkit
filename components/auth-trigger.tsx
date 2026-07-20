"use client";

import type { ReactNode } from "react";
import { requestAuthDialog } from "@/components/auth-dialog";

export function AuthTrigger({
  children,
  className,
  returnTo = "/app",
}: {
  children: ReactNode;
  className?: string;
  returnTo?: string;
}) {
  return (
    <button className={className} type="button" onClick={() => requestAuthDialog({ returnTo })}>
      {children}
    </button>
  );
}
