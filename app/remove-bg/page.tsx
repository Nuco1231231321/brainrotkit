import { Download, LockKeyhole, Zap } from "lucide-react";
import Image from "next/image";
import { BackgroundRemover } from "@/components/background-remover";
import { FAQSection } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Remove Background Free – AI Background Remover",
  description:
    "Remove image backgrounds online in seconds with a free AI background remover for PNG, JPG and WebP. Process locally and download a transparent PNG.",
  path: "/remove-bg",
});

const faqs = [
  {
    question: "Is this a free background remover online?",
    answer:
      "Yes. This AI background remover runs in your browser, so there is no per-image API charge and no credit is deducted. The first visit downloads the AI model; later images usually start faster on the same device.",
  },
  {
    question: "Does my image leave my device?",
    answer:
      "No. The image is processed locally with the browser background remover. BrainrotKit does not upload the original image to create the transparent result. You can clear the preview at any time.",
  },
  {
    question: "Which image formats are supported?",
    answer:
      "Upload a PNG, JPG or WebP image up to 20 MB. The result is exported as a transparent PNG so you can place a character, sticker or product cutout over a new background.",
  },
  {
    question: "Why is the first result slower?",
    answer:
      "The browser downloads the segmentation model once before removing the background. A visible progress state tells you whether the model is loading or the image is being processed. Keep this tab open until the transparent preview appears.",
  },
  {
    question: "Can I use the transparent image in a brainrot video?",
    answer:
      "Yes. Transparent PNGs work well for original characters, stickers, thumbnails and overlays. Download the cutout, then use it as a visual layer in your BrainrotKit project or another editor.",
  },
  {
    question: "Does the background remover work on mobile?",
    answer:
      "It works in modern mobile browsers, but local AI processing needs memory. A recent desktop browser is usually faster for large images, detailed hair or complex character edges.",
  },
];

export default function RemoveBackgroundPage() {
  return (
    <main id="main-content" className="remove-bg-page">
      <section className="remove-bg-hero page-shell">
        <div className="remove-bg-hero-copy">
          <p className="remove-bg-kicker">Free · private · no sign-in</p>
          <h1>AI background remover in seconds</h1>
          <p className="remove-bg-lede">
            Upload a PNG, JPG or WebP. Our free AI background remover runs in your browser and gives you a clean transparent PNG without using credits.
          </p>
          <div className="remove-bg-proof-row" aria-label="Background remover benefits">
            <span><LockKeyhole aria-hidden="true" size={16} /> Local processing</span>
            <span><Zap aria-hidden="true" size={16} /> One-click cutout</span>
            <span><Download aria-hidden="true" size={16} /> Transparent PNG</span>
          </div>
        </div>
        <BackgroundRemover />
      </section>

      <section className="remove-bg-feature page-shell" aria-labelledby="character-cutout-title">
        <div className="remove-bg-feature-copy">
          <p className="remove-bg-kicker">Clean character cutouts</p>
          <h2 id="character-cutout-title">Keep the character. Lose the studio background.</h2>
          <p>Turn an original character image into a transparent asset for thumbnails, stickers and video overlays. The before and after stay side by side, so you can inspect the outline before downloading.</p>
          <a className="remove-bg-text-link" href="#remove-bg-tool-title">Remove a background</a>
        </div>
        <figure className="remove-bg-feature-visual">
          <div className="remove-bg-pair-images">
            <div><span>Before</span><Image src="/remove-bg/sneaker-robot-original.webp" alt="Original red sneaker robot on a light gray studio background" width={900} height={900} unoptimized /></div>
            <div className="checker"><span>After</span><Image src="/remove-bg/sneaker-robot-transparent.webp" alt="Red sneaker robot after its background was removed" width={900} height={900} unoptimized /></div>
          </div>
          <figcaption>Actual original character and transparent cutout used on this page.</figcaption>
        </figure>
      </section>

      <section className="remove-bg-feature reverse page-shell" aria-labelledby="edge-detail-title">
        <figure className="remove-bg-feature-visual">
          <div className="remove-bg-pair-images">
            <div><span>Before</span><Image src="/remove-bg/cloud-creature-original.webp" alt="Original purple cloud creature on a light gray studio background" width={900} height={900} unoptimized /></div>
            <div className="checker"><span>After</span><Image src="/remove-bg/cloud-creature-transparent.webp" alt="Purple cloud creature after its background was removed" width={900} height={900} unoptimized /></div>
          </div>
          <figcaption>Soft edges remain visible while the flat background is removed.</figcaption>
        </figure>
        <div className="remove-bg-feature-copy">
          <p className="remove-bg-kicker">See the edge before export</p>
          <h2 id="edge-detail-title">Check fur, hair and soft outlines before you download.</h2>
          <p>The transparent preview uses a checkerboard so weak edges are easy to spot. If the source is too large or the subject is unclear, the page explains what happened and lets you choose another image.</p>
          <a className="remove-bg-text-link" href="#remove-bg-tool-title">Try your image</a>
        </div>
      </section>

      <section className="remove-bg-privacy page-shell" aria-labelledby="private-processing-title">
        <div className="remove-bg-privacy-visual">
          <Image src="/remove-bg/frog-astronaut-original.webp" alt="Original frog astronaut image ready for local background removal" width={900} height={900} loading="eager" unoptimized />
          <div><LockKeyhole aria-hidden="true" size={21} /><strong>Processed in this browser</strong><span>Your source image is not sent to our server.</span></div>
        </div>
        <div className="remove-bg-feature-copy">
          <p className="remove-bg-kicker">Private by design</p>
          <h2 id="private-processing-title">Your image stays on your device.</h2>
          <p>The AI background remover loads its model in the browser and processes PNG, JPG and WebP files locally. The first run downloads model data, then it can start faster on the same device.</p>
          <p>Use images up to 20 MB that you own or have permission to edit. No BrainrotKit credits are charged for background removal.</p>
        </div>
      </section>

      <FAQSection faqs={faqs} />
      <p className="last-updated narrow-shell">Last updated: {siteConfig.updatedAt}</p>
      <JsonLd
        value={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "BrainrotKit Background Remover",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web",
          description: "A browser-based AI background remover for transparent PNG creator assets.",
          url: `${siteConfig.url}/remove-bg`,
          featureList: ["Local browser processing", "PNG, JPG and WebP input", "Transparent PNG download"],
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }}
      />
    </main>
  );
}
