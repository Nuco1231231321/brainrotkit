import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpenText, FileText, Layers3, ShieldCheck, Sparkles, Volume2, WandSparkles } from "lucide-react";
import { FAQSection } from "@/components/faq-section";
import { HomeSeoContent, homeFaqs } from "@/components/home-seo-content";
import { JsonLd } from "@/components/json-ld";
import { MediaGallery } from "@/components/media-gallery";
import { pageMetadata } from "@/lib/metadata";
import { mediaAssets } from "@/lib/media";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "AI Brainrot Video Generator – Create Videos Online",
  description: "Use the AI Brainrot Video Generator to turn text, PDFs and ideas into editable vertical videos with scripts, generated voices and visual templates. Start free.",
  path: "/",
});

const shortcuts = [
  { href: "/italian-brainrot-generator", icon: Sparkles, title: "Create a Character", copy: "Turn an animal-and-object idea into a character, catchphrase, voice and video." },
  { href: "/pdf-to-brainrot", icon: FileText, title: "Upload a PDF", copy: "Turn notes or study material into a short explainer, summary or quiz." },
  { href: "/text-to-brainrot", icon: BookOpenText, title: "Paste Your Text", copy: "Convert a story, article or comment thread into a hook and paced scenes." },
  { href: "/italian-brainrot-voice-generator", icon: Volume2, title: "Generate a Voice", copy: "Paste a line, choose a voice preset and download the generated narration." },
];

export default function HomePage() {
  return (
    <main id="main-content">
      <section className="home-hero page-shell">
        <div className="home-hero-copy">
          <p className="eyebrow">Create · remix · publish</p>
          <h1>AI Brainrot Video Generator</h1>
          <p className="home-hero-description">Paste a script, upload a PDF or describe an idea. Get a vertical video with an editable hook, scenes and generated voice.</p>
          <div className="home-hero-actions">
            <Link href="/create" className="button-primary home-create-cta">Create a video <ArrowRight aria-hidden="true" size={18} /></Link>
          </div>
        </div>
        <div className="home-media-rail" aria-label="Example output directions">
          {mediaAssets.filter((asset) => asset.src.startsWith("/showcase/")).map((asset, index) => (
            <div className={index === 0 ? "featured" : undefined} key={asset.id}>
              <Image src={asset.src} alt={asset.alt} fill sizes="(max-width: 520px) 50vw, 24vw" unoptimized />
              <span>{asset.title}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="shortcut-section page-shell" aria-labelledby="create-mode-heading">
        <div className="section-heading lime">
          <h2 id="create-mode-heading">Choose what you want to make</h2>
          <p>Start with text, a PDF, an original character idea or a line of dialogue.</p>
        </div>
        <div className="shortcut-grid">
          {shortcuts.map(({ href, icon: Icon, title, copy }) => (
            <Link key={href} href={href}>
              <Icon aria-hidden="true" size={22} />
              <h3>{title}</h3>
              <p>{copy}</p>
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          ))}
        </div>
      </section>

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
            <li><WandSparkles aria-hidden="true" size={20} /><div><strong>Control the visual style</strong><span>Choose the template and aspect ratio before export.</span></div></li>
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
