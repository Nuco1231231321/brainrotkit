import Link from "next/link";
import { ArrowRight, Check, ShieldCheck, TimerReset } from "lucide-react";
import { AuthTrigger } from "@/components/auth-trigger";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FAQSection } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import { MediaGallery } from "@/components/media-gallery";
import { ToolSeoContent } from "@/components/tool-seo-content";
import { ToolWorkspace } from "@/components/tool-workspace";
import { siteConfig } from "@/lib/site";
import type { ToolPageConfig } from "@/lib/tool-pages";

export function ToolMarketingPage({ config }: { config: ToolPageConfig }) {
  const path = `/${config.slug}`;

  return (
    <main id="main-content">
      <div className="page-shell">
        <Breadcrumbs label={config.title} path={path} />
        <header className="tool-page-header">
          <div>
            <p className="eyebrow">{config.eyebrow}</p>
            <h1>{config.title}</h1>
            <p>{config.summary}</p>
          </div>
          <dl className="tool-facts">
            <div><dt>Output</dt><dd>{config.outputLabel}</dd></div>
            <div><dt>Default</dt><dd>9:16 · 15 seconds</dd></div>
            <div><dt>Estimate</dt><dd>From {config.estimatedCredits} credits</dd></div>
          </dl>
        </header>
      </div>

      <ToolWorkspace config={config} />

      <div className="trust-strip page-shell" aria-label="Product rules">
        <span><Check aria-hidden="true" size={15} /> Review and edit before rendering</span>
        <span><TimerReset aria-hidden="true" size={15} /> Get credits back when generation fails</span>
        <span><ShieldCheck aria-hidden="true" size={15} /> Keep private inputs out of model training</span>
      </div>

      <MediaGallery
        title="CHOOSE AN OUTPUT STYLE"
        description="Compare character, study, voice and creator examples before you choose a template."
      />

      <ToolSeoContent slug={config.slug} />

      <section className="section-block page-shell" aria-labelledby="use-case-heading">
        <div className="section-heading">
          <h2 id="use-case-heading">What you can create</h2>
          <p>Choose the result that matches what you want to publish or study.</p>
        </div>
        <ul className="use-case-grid">
          {config.useCases.map((useCase) => (
            <li key={useCase.title}>
              <span aria-hidden="true">{String(config.useCases.indexOf(useCase) + 1).padStart(2, "0")}</span>
              <h3>{useCase.title}</h3>
              <p>{useCase.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="feature-stage page-shell" aria-labelledby="workflow-heading">
        <div className="feature-stage-copy">
          <p className="eyebrow">Three clear steps</p>
          <h2 id="workflow-heading">Create your first result</h2>
          <p>Add the source, review what was generated and confirm the final file only when it looks right.</p>
          <AuthTrigger returnTo={path} className="button-primary">
            Start with Google <ArrowRight aria-hidden="true" size={16} />
          </AuthTrigger>
        </div>
        <ol className="workflow-list">
          {config.steps.map((step, index) => (
            <li key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="section-block page-shell" aria-labelledby="related-heading">
        <div className="section-heading lime">
          <h2 id="related-heading">Try another way to create</h2>
          <p>Start with a different source without learning a different editor.</p>
        </div>
        <div className="related-tools">
          {config.related.map((item) => (
            <Link href={item.href} key={item.href}>
              <span>{item.label}</span>
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          ))}
        </div>
      </section>

      <FAQSection faqs={config.faqs} />
      <p className="last-updated narrow-shell">Last updated: {siteConfig.updatedAt}</p>
      <JsonLd
        value={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: config.title,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web",
          description: config.description,
          url: `${siteConfig.url}${path}`,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          featureList: config.useCases.map((item) => item.title),
        }}
      />
    </main>
  );
}
