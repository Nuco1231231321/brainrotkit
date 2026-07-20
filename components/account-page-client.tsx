"use client";

import { AccountSettings } from "@/components/account-settings";
import { useAppAccount } from "@/components/app-shell";

export function AccountPageClient() {
  const account = useAppAccount();
  return (
    <main id="main-content" className="app-page settings-page">
      <header className="app-page-heading"><div><p>Google identity · {account.plan.charAt(0).toUpperCase() + account.plan.slice(1)} plan</p><h1>Account</h1></div></header>
      <AccountSettings
        name={account.name}
        email={account.email}
        image={account.image}
        plan={account.plan}
        credits={account.credits}
        subscriptionStatus={account.subscriptionStatus}
      />
    </main>
  );
}
