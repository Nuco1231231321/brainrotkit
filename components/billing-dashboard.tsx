"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- billing exits use full navigation to avoid an RSC Worker invocation. */

import { ArrowUpRight, CheckCircle2, CreditCard, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppAccount } from "@/components/app-shell";
import { BillingPortalButton } from "@/components/billing-portal-button";
import type { CreditActivity, PaymentRecord } from "@/lib/accounts";

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const planNames = { free: "Free", creator: "Creator", pro: "Pro" } as const;

function activityKind(kind: string) {
  const labels: Record<string, string> = {
    starter_grant: "Starter grant",
    credit_purchase: "Credit purchase",
    subscription_credit: "Subscription credit",
    payment_refund: "Payment refund",
    generation_charge: "Generation",
    system_refund: "System refund",
  };
  return labels[kind] ?? kind.replaceAll("_", " ");
}

function productName(productKey: string) {
  const labels: Record<string, string> = {
    "creator-monthly": "Creator Monthly",
    "creator-annual": "Creator Annual",
    "pro-monthly": "Pro Monthly",
    "pro-annual": "Pro Annual",
    credits: "175 Credit Pack",
  };
  return labels[productKey] ?? productKey;
}

export function BillingDashboard() {
  const account = useAppAccount();
  const [activities, setActivities] = useState<CreditActivity[] | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[] | null>(null);
  const [historyError, setHistoryError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadHistory() {
      try {
        const response = await fetch("/api/billing/history", { cache: "no-store", signal: controller.signal });
        const payload = await response.json() as { activities?: CreditActivity[]; payments?: PaymentRecord[] };
        if (!response.ok || !payload.activities || !payload.payments) throw new Error("Billing history could not be loaded.");
        setActivities(payload.activities);
        setPayments(payload.payments);
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") return;
        setHistoryError(true);
      }
    }
    void loadHistory();
    return () => controller.abort();
  }, []);

  const planName = planNames[account.plan];
  const hasSubscription = account.hasCreemCustomer && Boolean(account.currentProductKey);
  const hasAccessThroughPeriod = account.plan !== "free" && ["canceled", "scheduled_cancel"].includes(account.subscriptionStatus);
  const subscriptionCopy = account.subscriptionStatus === "active"
    ? "Renews in Creem until canceled"
    : hasAccessThroughPeriod
      ? "Canceled · access continues until period end"
      : account.subscriptionStatus === "none"
        ? "No active subscription"
        : account.subscriptionStatus.replaceAll("_", " ");
  const subscriptionLabel = account.subscriptionStatus === "active" ? "Active" : hasAccessThroughPeriod ? "Ending" : account.subscriptionStatus === "none" ? "None" : "Updated";
  const accountBillingState = account.subscriptionStatus === "active" ? "Active subscription" : hasAccessThroughPeriod ? "Access until period end" : "Pay as you go";

  return (
    <main id="main-content" className="app-page billing-page">
      <header className="app-page-heading"><div><p>{planName} plan · {accountBillingState}</p><h1>Billing and credits</h1></div><a href="/pricing?returnTo=/app/billing" className="button-primary">{account.plan === "free" ? "Upgrade plan" : "Compare plans"} <ArrowUpRight aria-hidden="true" size={16} /></a></header>
      <section className="billing-summary" aria-label="Billing summary">
        <article><span>Available balance</span><strong>{account.credits.toLocaleString()}</strong><p>credits</p><a href="/checkout?product=credits&returnTo=/app/billing"><Plus aria-hidden="true" size={14} /> Add credits</a></article>
        <article><span>Current plan</span><strong>{planName}</strong><p>15–60 sec Gameplay · 5–15 sec AI Motion</p><a href="/pricing?returnTo=/app/billing">Compare plans</a></article>
        <article><span>Subscription</span><strong>{subscriptionLabel}</strong><p>{subscriptionCopy}</p><span className="billing-status"><CheckCircle2 aria-hidden="true" size={14} /> Webhook verified</span></article>
      </section>
      {hasSubscription ? <BillingPortalButton /> : null}
      <section className="billing-panel" aria-labelledby="usage-heading">
        <div className="billing-panel-heading"><div><h2 id="usage-heading">Credit activity</h2><p>Every balance change will be traceable to a task, grant or purchase.</p></div><CreditCard aria-hidden="true" size={19} /></div>
        {historyError ? <div className="empty-billing"><CreditCard aria-hidden="true" size={22} /><h3>History is temporarily unavailable</h3><p>Your current plan and balance above remain verified.</p></div> : activities === null ? <div className="empty-billing" role="status"><CreditCard aria-hidden="true" size={22} /><h3>Loading credit activity</h3><p>Checking your latest balance changes.</p></div> : activities.length ? (
          <div className="table-scroll"><table><thead><tr><th scope="col">Activity</th><th scope="col">Type</th><th scope="col">Date</th><th scope="col">Credits</th></tr></thead><tbody>{activities.map((item) => <tr key={item.id}><th scope="row">{item.description}</th><td>{activityKind(item.kind)}</td><td>{dateFormatter.format(item.createdAt)}</td><td className={item.amount > 0 ? "positive" : undefined}>{item.amount > 0 ? "+" : ""}{item.amount}</td></tr>)}</tbody></table></div>
        ) : <div className="empty-billing"><CreditCard aria-hidden="true" size={22} /><h3>No credit activity yet</h3><p>Your starter grant and future usage will appear here.</p></div>}
      </section>
      <section className="billing-panel" aria-labelledby="payment-heading">
        <div className="billing-panel-heading"><div><h2 id="payment-heading">Payment history</h2><p>Receipts and invoices appear here after a verified checkout.</p></div></div>
        {payments === null && !historyError ? <div className="empty-billing" role="status"><CreditCard aria-hidden="true" size={22} /><h3>Loading payment history</h3><p>Checking verified Creem events.</p></div> : payments?.length ? (
          <div className="table-scroll"><table><thead><tr><th scope="col">Product</th><th scope="col">Status</th><th scope="col">Date</th><th scope="col">Amount</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id}><th scope="row">{productName(payment.productKey)}</th><td>{payment.status}</td><td>{dateFormatter.format(payment.createdAt)}</td><td>{new Intl.NumberFormat("en-US", { style: "currency", currency: payment.currency }).format(payment.amount / 100)}</td></tr>)}</tbody></table></div>
        ) : <div className="empty-billing"><CreditCard aria-hidden="true" size={22} /><h3>No payments yet</h3><p>Choose a subscription or credit pack when you are ready.</p><a href="/pricing?returnTo=/app/billing" className="button-secondary">View pricing</a></div>}
      </section>
    </main>
  );
}
