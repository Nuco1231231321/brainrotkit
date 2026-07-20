import { FAQSection } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import { CreditPackLink, PricingTable } from "@/components/pricing-table";
import { pageMetadata } from "@/lib/metadata";
import { plans } from "@/lib/plans";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Brainrot Generator Pricing – Plans and Credits",
  description: "Compare Brainrot generator pricing, credits and Free, Creator or Pro plan limits for video, voice, PDF and image generation before you pay online securely.",
  path: "/pricing",
});

const pricingFaqs = [
  { question: "What can I make on the Free plan?", answer: "Free includes 10 starter credits, enough for one 15-second Gameplay video or several short voice generations. Gameplay Mode combines generated assets with local MP4 export, so it costs less than AI Motion." },
  { question: "When are credits charged?", answer: "The estimate is shown before submission. Credits are reserved during processing and charged only when the output completes successfully." },
  { question: "What happens if generation fails?", answer: "You get the credits reserved for the failed step or render back, and the project keeps completed work so you can retry only the part that failed." },
  { question: "Can I buy credits without a subscription?", answer: "Yes. A $9.99 credit pack is available as a one-time top-up for occasional usage." },
  { question: "Can I cancel a subscription?", answer: "Yes. Cancellation stops future renewals while access continues through the paid billing period." },
  { question: "Is annual billing cheaper?", answer: "Yes. Annual billing applies a 20% discount to Creator and Pro, with the exact charge shown before checkout." },
];

export default function PricingPage() {
  return (
    <main id="main-content" className="pricing-page narrow-shell">
      <header className="pricing-header">
        <p className="eyebrow">Simple credit-based plans</p>
        <h1>Brainrot Generator Pricing</h1>
        <p>Start with a complete 15-second Gameplay video. Use AI Motion only when a short generated motion clip adds value.</p>
      </header>
      <PricingTable />
      <section className="credit-pack" aria-labelledby="credit-pack-title">
        <div>
          <span>One-time purchase</span>
          <h2 id="credit-pack-title">Credit Pack</h2>
          <p>Top up without changing your subscription.</p>
        </div>
        <strong>$9.99</strong>
        <CreditPackLink />
      </section>
      <section className="comparison-section" aria-labelledby="comparison-title">
        <div className="section-heading"><h2 id="comparison-title">Plan comparison</h2><p>The differences that affect the finished file and repeat usage.</p></div>
        <div className="table-scroll">
          <table>
            <thead><tr><th scope="col">Feature</th><th scope="col">Free</th><th scope="col">Creator</th><th scope="col">Pro</th></tr></thead>
            <tbody>
              <tr><th scope="row">Video quality</th><td>720 × 1280 Gameplay</td><td>720 × 1280 Gameplay / 480p AI Motion source</td><td>720 × 1280 Gameplay / 480p AI Motion source</td></tr>
              <tr><th scope="row">Available duration</th><td>15–60 sec Gameplay</td><td>15–60 sec Gameplay / 5–15 sec AI Motion</td><td>15–60 sec Gameplay / 5–15 sec AI Motion</td></tr>
              <tr><th scope="row">Voice presets</th><td>Included</td><td>Included</td><td>Included</td></tr>
              <tr><th scope="row">Monthly credits</th><td>10 once</td><td>300</td><td>800</td></tr>
              <tr><th scope="row">Saved projects</th><td>Included</td><td>Included</td><td>Included</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <FAQSection faqs={pricingFaqs} />
      <JsonLd value={{ "@context": "https://schema.org", "@type": "Product", name: "BrainrotKit", description: siteConfig.description, offers: plans.map((plan) => ({ "@type": "Offer", name: plan.name, price: String(plan.monthlyPrice), priceCurrency: "USD", url: `${siteConfig.url}/pricing` })) }} />
    </main>
  );
}
