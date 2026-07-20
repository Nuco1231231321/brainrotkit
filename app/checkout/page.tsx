import { Suspense } from "react";
import { CheckoutPanel } from "@/components/checkout-panel";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Checkout",
  description: "Review a BrainrotKit subscription or credit purchase before opening secure checkout.",
  path: "/checkout",
  noIndex: true,
});

export default function CheckoutPage() {
  return (
    <main id="main-content" className="checkout-page narrow-shell">
      <Suspense fallback={<div className="checkout-skeleton" aria-busy="true" aria-label="Loading checkout" />}>
        <CheckoutPanel />
      </Suspense>
    </main>
  );
}
