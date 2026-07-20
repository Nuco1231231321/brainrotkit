"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

export type AppAccount = {
  email: string;
  name: string | null;
  image: string | null;
  plan: "free" | "creator" | "pro";
  credits: number;
  subscriptionStatus: string;
  currentProductKey: string | null;
  hasCreemCustomer: boolean;
  billingHold: boolean;
};

const AppAccountContext = createContext<AppAccount | null>(null);

export function useAppAccount() {
  const account = useContext(AppAccountContext);
  if (!account) throw new Error("App account context is unavailable.");
  return account;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<AppAccount | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAccount() {
      try {
        const response = await fetch("/api/account", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (response.status === 401) {
          const returnTo = `${window.location.pathname}${window.location.search}`;
          window.location.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
          return;
        }
        const payload = await response.json() as { account?: AppAccount };
        if (!response.ok || !payload.account) throw new Error("Account could not be loaded.");
        setAccount(payload.account);
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") return;
        setError(true);
      }
    }

    void loadAccount();
    window.addEventListener("brainrotkit:account-refresh", loadAccount);
    return () => {
      window.removeEventListener("brainrotkit:account-refresh", loadAccount);
      controller.abort();
    };
  }, [attempt]);

  if (error) {
    return (
      <main id="main-content" className="route-error">
        <p className="eyebrow">Account connection</p>
        <h1>Your workspace could not load</h1>
        <p>Your drafts remain on this device. Retry the secure account request without re-entering anything.</p>
        <button className="button-primary" type="button" onClick={() => { setError(false); setAccount(null); setAttempt((value) => value + 1); }}>Retry workspace</button>
      </main>
    );
  }

  if (!account) {
    return (
      <main id="main-content" className="app-page" aria-busy="true" role="status">
        <div className="app-loading-heading" />
        <div className="app-loading-grid" aria-label="Loading your workspace"><span /><span /><span /><span /></div>
        <p className="sr-only">Loading your BrainrotKit workspace</p>
      </main>
    );
  }

  return (
    <AppAccountContext.Provider value={account}>
      <AppHeader credits={account.credits} accountLabel={account.name ?? account.email} />
      {children}
      <MobileBottomNav />
    </AppAccountContext.Provider>
  );
}
