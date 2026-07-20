"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2, CreditCard, LoaderCircle, RotateCcw, ShieldCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { billingAdapter, getSafeReturnPath } from "@/lib/adapters";
import { plans } from "@/lib/plans";

type CheckoutStatus = "idle" | "pending" | "error";
type ReturnStatus = "processing" | "success" | "failed" | "canceled";

export function CheckoutPanel() {
  const params = useSearchParams();
  const product = params.get("product");
  const planId = params.get("plan") === "pro" ? "pro" : "creator";
  const billing = params.get("billing") === "annual" ? "annual" : "monthly";
  const returnTo = getSafeReturnPath(params.get("returnTo"), "/app");
  const returnStatus = params.get("status") as ReturnStatus | null;
  const requestId = params.get("request_id");
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const plan = plans.find((item) => item.id === planId) ?? plans[1];
  const isCreditPack = product === "credits";
  const price = isCreditPack ? 9.99 : billing === "annual" ? plan.annualMonthlyPrice * 12 : plan.monthlyPrice;
  const productName = isCreditPack ? "Credit Pack" : `${plan.name} · ${billing === "annual" ? "Annual" : "Monthly"}`;

  async function startCheckout() {
    setStatus("pending");
    try {
      const result = await billingAdapter.createCheckout(isCreditPack ? "credits" : `${plan.id}-${billing}`, returnTo);
      window.location.assign(result.checkoutUrl);
    } catch {
      setStatus("error");
    }
  }

  if (returnStatus) {
    return <CheckoutReturnState initialStatus={returnStatus} requestId={requestId} returnTo={returnTo} />;
  }

  return (
    <div className="checkout-grid">
      <section className="checkout-summary" aria-labelledby="checkout-title">
        <p className="eyebrow">Order summary</p>
        <h1 id="checkout-title">Review before checkout</h1>
        <p>No card details are collected on this page. Creem handles the secure payment form and global tax calculation.</p>
        <dl>
          <div><dt>Product</dt><dd>{productName}</dd></div>
          <div><dt>Charge</dt><dd>${price.toFixed(2)}{!isCreditPack && billing === "annual" ? "/year" : !isCreditPack ? "/month" : " once"}</dd></div>
          <div><dt>Output</dt><dd>{isCreditPack ? "One-time credit top-up" : "Credits for 480p video and generated audio"}</dd></div>
          <div><dt>Renewal</dt><dd>{isCreditPack ? "No renewal" : billing === "annual" ? "Annual until canceled" : "Monthly until canceled"}</dd></div>
        </dl>
        <ul>
          <li><ShieldCheck aria-hidden="true" size={16} /> The final amount is shown before payment.</li>
          <li><CreditCard aria-hidden="true" size={16} /> Credits activate only after a verified server webhook.</li>
          <li><RotateCcw aria-hidden="true" size={16} /> Canceling checkout returns you without changing your plan.</li>
        </ul>
      </section>

      <aside className="checkout-action" aria-label="Checkout action">
        <span>Due at checkout</span>
        <strong>${price.toFixed(2)}</strong>
        <p>{isCreditPack ? "One-time purchase" : billing === "annual" ? "Billed once per year" : "Billed once per month"}</p>
        <button className="button-primary" type="button" onClick={startCheckout} disabled={status === "pending"} aria-busy={status === "pending"} aria-describedby="checkout-status">
          {status === "pending" ? <LoaderCircle className="spin" aria-hidden="true" size={17} /> : <CreditCard aria-hidden="true" size={17} />}
          {status === "error" ? "Retry secure checkout" : "Continue to secure checkout"}
        </button>
        <p id="checkout-status" className={`checkout-status ${status}`} aria-live="polite">
          {status === "pending" ? "Opening Creem secure checkout..." : status === "error" ? "Checkout could not start. Check your connection and try again." : "You will return to your original task after payment verification."}
        </p>
        <Link href="/pricing" className="back-link"><ArrowLeft aria-hidden="true" size={14} /> Back to pricing</Link>
      </aside>
    </div>
  );
}

function CheckoutReturnState({
  initialStatus,
  requestId,
  returnTo,
}: {
  initialStatus: ReturnStatus;
  requestId: string | null;
  returnTo: string;
}) {
  const [status, setStatus] = useState<ReturnStatus>(initialStatus);

  useEffect(() => {
    if (initialStatus !== "processing" || !requestId) return;

    let canceled = false;
    let attempts = 0;
    let timer: number | undefined;

    async function checkStatus() {
      try {
        const response = await fetch(`/api/billing/status?request_id=${encodeURIComponent(requestId!)}`, {
          cache: "no-store",
        });
        const payload = await response.json() as { status?: string };
        if (canceled) return;
        if (response.ok && payload.status === "paid") {
          setStatus("success");
          return;
        }
        if (response.ok && payload.status === "failed") {
          setStatus("failed");
          return;
        }
      } catch {
        // The webhook may still be in flight; retry within the bounded window.
      }

      attempts += 1;
      if (!canceled && attempts < 20) {
        timer = window.setTimeout(checkStatus, 1500);
      }
    }

    void checkStatus();
    return () => {
      canceled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [initialStatus, requestId]);

  const state = status === "success"
    ? { icon: CheckCircle2, eyebrow: "Payment verified", title: "Your balance is ready", copy: "Creem confirmed the payment and BrainrotKit updated your plan or credit balance.", action: "Return to your task" }
    : status === "processing"
      ? { icon: LoaderCircle, eyebrow: "Verifying payment", title: "Keep this page open", copy: "The payment is being verified. Your balance should not change until the server confirms the transaction.", action: "Check billing" }
      : status === "canceled"
        ? { icon: RotateCcw, eyebrow: "Checkout canceled", title: "No plan change was made", copy: "You left the payment page before completion. Return to pricing or continue your original task without a charge.", action: "Return to your task" }
        : { icon: AlertCircle, eyebrow: "Payment failed", title: "The charge did not complete", copy: "No credits were added. Review the payment details with the provider or choose another plan before trying again.", action: "Try another plan" };
  const Icon = state.icon;
  const href = status === "failed" ? "/pricing" : status === "processing" ? "/app/billing" : returnTo;

  return (
    <section className={`checkout-return ${status}`}>
      <Icon aria-hidden="true" size={28} />
      <p className="eyebrow">{state.eyebrow}</p>
      <h1>{state.title}</h1>
      <p>{state.copy}</p>
      <Link className="button-primary" href={href}>{state.action}</Link>
      <Link className="button-secondary" href="/app/billing">View billing and credits</Link>
    </section>
  );
}
