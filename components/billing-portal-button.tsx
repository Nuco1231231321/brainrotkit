"use client";

import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { useState } from "react";

export function BillingPortalButton() {
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");

  async function openPortal() {
    setStatus("pending");
    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const payload = await response.json() as { portalUrl?: string; error?: string };
      if (!response.ok || !payload.portalUrl) throw new Error(payload.error ?? "Billing portal unavailable.");
      window.location.assign(payload.portalUrl);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="billing-portal-action">
      <button
        type="button"
        className="button-secondary"
        onClick={openPortal}
        disabled={status === "pending"}
        aria-busy={status === "pending"}
        aria-describedby="billing-portal-status"
      >
        {status === "pending" ? <LoaderCircle className="spin" aria-hidden="true" size={15} /> : <ArrowUpRight aria-hidden="true" size={15} />}
        Manage subscription
      </button>
      <p id="billing-portal-status" className={`checkout-status ${status}`} aria-live="polite">
        {status === "pending" ? "Opening your secure Creem portal..." : status === "error" ? "The billing portal could not open. Try again." : "Cancel, update payment details or download invoices in Creem."}
      </p>
    </div>
  );
}
