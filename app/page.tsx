import Link from "next/link";
import { ArrowRight, ShieldCheck, Volume2, WandSparkles, Layers3 } from "lucide-react";
import { CreateStudio } from "@/components/create-studio";
import { FAQSection } from "@/components/faq-section";
import { HomeSeoContent, homeFaqs } from "@/components/home-seo-content";
import { JsonLd } from "@/components/json-ld";
import { MediaGallery } from "@/components/media-gallery";
import { pageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "AI Brainrot Video Generator – Create Videos Online",
  description: "Use the AI Brainrot Video Generator to turn text, PDFs and ideas into editable vertical videos with scripts, generated voices and visual templates. Start free.",
  path: "/",
});

export default function HomePage() {
  return (
    <main id="main-content">
      <CreateStudio
        config={{
          kind: "video",
          title: "AI Brainrot Video Generator",
          summary: "Paste a script, pick a gameplay loop and original hosts, preview live, then export a vertical video. Sign in is required to generate.",
          path: "/",
          inputPlaceholder: "Explain your idea, paste a story, or write dialogue as Nova: / Riff: …",
        }}
      />

      <MediaGallery title="REAL OUTPUTS MADE WITH BRAINROTKIT" description="Play finished creator stories, PDF study explainers, original character videos and generated voice audio." />

      <HomeSeoContent />

      <section className="home-feature-band" aria-labelledby="editing-heading">
        <div className="page-shell home-feature-inner">
          <div>
            <p className="eyebrow">Edit before you export</p>
            <h2 id="editing-heading">Fix one scene without starting over</h2>
            <p>Rewrite the hook, reorder scenes, change the voice or replace one visual before you spend credits on the final video.</p>
            <Link href="/text-to-brainrot" className="button-primary">Create from text <ArrowRight aria-hidden="true" size={16} /></Link>
          </div>
          <ul className="editing-capabilities">
            <li><Layers3 aria-hidden="true" size={20} /><div><strong>Rewrite any scene</strong><span>Keep the scenes you like and replace only the weak one.</span></div></li>
            <li><Volume2 aria-hidden="true" size={20} /><div><strong>Choose the delivery</strong><span>Change the voice preset, speed and intensity.</span></div></li>
            <li><WandSparkles aria-hidden="true" size={20} /><div><strong>Control the visual style</strong><span>Choose the gameplay loop and aspect ratio before export.</span></div></li>
            <li><ShieldCheck aria-hidden="true" size={20} /><div><strong>Know the price first</strong><span>See the credit estimate before rendering begins.</span></div></li>
          </ul>
        </div>
      </section>

      <section className="pricing-preview section-block narrow-shell" aria-labelledby="pricing-preview-heading">
        <div className="section-heading">
          <h2 id="pricing-preview-heading">Make a free test video first</h2>
          <p>Starter credits cover one 15-second Gameplay video. Upgrade when you need more generation credits or AI Motion.</p>
        </div>
        <div className="pricing-preview-grid">
          <article><span>Free</span><strong>$0</strong><p>10 starter credits · one 15-second Gameplay video</p></article>
          <article className="recommended"><span>Creator</span><strong>$19<small>/month</small></strong><p>300 monthly credits · 15–60 sec Gameplay</p></article>
          <Link href="/pricing" className="button-secondary">Compare all plans <ArrowRight aria-hidden="true" size={16} /></Link>
        </div>
      </section>

      <FAQSection faqs={homeFaqs} />
      <p className="last-updated narrow-shell">Last updated: {siteConfig.updatedAt}</p>
      <JsonLd
        value={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "AI Brainrot Video Generator",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web",
          description: "Create Brainrot videos from text, PDFs and original ideas.",
          url: `${siteConfig.url}/`,
          offers: [
            { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
            { "@type": "Offer", name: "Creator", price: "19", priceCurrency: "USD" },
          ],
        }}
      />
    </main>
  );
}
