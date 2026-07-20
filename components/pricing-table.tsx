"use client";

import { Check, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { requestAuthDialog } from "@/components/auth-dialog";
import { getSafeReturnPath } from "@/lib/adapters";
import { plans } from "@/lib/plans";

function usePricingReturnTo() {
  const [returnTo, setReturnTo] = useState("/app");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      setReturnTo(getSafeReturnPath(params.get("returnTo"), "/app"));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  return returnTo;
}

export function PricingTable() {
  const returnTo = usePricingReturnTo();
  const [annual, setAnnual] = useState(false);

  return (
    <>
      <div className="billing-toggle" aria-label="Billing interval">
        <button type="button" className={!annual ? "active" : undefined} aria-pressed={!annual} onClick={() => setAnnual(false)}>Monthly</button>
        <button type="button" className={annual ? "active" : undefined} aria-pressed={annual} onClick={() => setAnnual(true)}>Annual <span>Save 20%</span></button>
      </div>
      <div className="pricing-grid">
        {plans.map((plan) => {
          const price = annual ? plan.annualMonthlyPrice : plan.monthlyPrice;
          const checkoutReturnTo = plan.id === "free" ? returnTo : `/checkout?plan=${plan.id}&billing=${annual ? "annual" : "monthly"}&returnTo=${encodeURIComponent(returnTo)}`;
          return (
            <article className={plan.recommended ? "pricing-card recommended" : "pricing-card"} key={plan.id}>
              <div className="pricing-card-header">
                <div>
                  <h2>{plan.name}</h2>
                  {plan.recommended ? <span>Most popular</span> : null}
                </div>
                <p>{plan.description}</p>
                <strong>${price}<small>/month</small></strong>
                <p className="billing-note">{annual && price > 0 ? "Billed annually" : price > 0 ? "Billed monthly" : "No card required"}</p>
              </div>
              <div className="pricing-card-body">
                <p className="credits-line"><CreditCard aria-hidden="true" size={16} /> {plan.creditsLabel}</p>
                <ul>
                  {plan.features.map((feature) => <li key={feature}><Check aria-hidden="true" size={15} /> {feature}</li>)}
                </ul>
                <button className={plan.recommended ? "button-primary" : "button-secondary"} type="button" onClick={() => requestAuthDialog({ returnTo: checkoutReturnTo })}>
                  {plan.id === "free" ? "Start free" : `Choose ${plan.name}`}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

export function CreditPackLink() {
  const returnTo = usePricingReturnTo();
  const checkoutPath = `/checkout?product=credits&returnTo=${encodeURIComponent(returnTo)}`;
  return <button className="button-secondary" type="button" onClick={() => requestAuthDialog({ returnTo: checkoutPath })}>Buy credits</button>;
}
