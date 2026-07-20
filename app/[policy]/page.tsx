import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContactForm } from "@/components/contact-form";
import { JsonLd } from "@/components/json-ld";
import { contentPages } from "@/lib/content-pages";
import { pageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";

export function generateStaticParams() {
  return Object.keys(contentPages).map((policy) => ({ policy }));
}

export async function generateMetadata({ params }: { params: Promise<{ policy: string }> }) {
  const { policy } = await params;
  const page = contentPages[policy];
  if (!page) return {};
  return pageMetadata({ title: page.title, description: page.description, path: `/${page.slug}` });
}

export default async function ContentPage({ params }: { params: Promise<{ policy: string }> }) {
  const { policy } = await params;
  const page = contentPages[policy];
  if (!page) notFound();

  return (
    <main id="main-content" className="content-page narrow-shell">
      <Breadcrumbs label={page.title} path={`/${page.slug}`} />
      <header><p className="eyebrow">BrainrotKit</p><h1>{page.title}</h1><p>{page.intro}</p></header>
      <div className="content-layout">
        <article>
          {page.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
        </article>
        <aside><strong>Last updated</strong><span>{siteConfig.updatedAt}</span><strong>Questions?</strong><span>Contact BrainrotKit support for help with this page.</span><strong>Support</strong><a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a></aside>
      </div>
      {page.slug === "contact" ? <ContactForm /> : null}
      {page.slug === "about" ? <JsonLd value={{ "@context": "https://schema.org", "@type": "Organization", name: siteConfig.name, url: siteConfig.url, email: siteConfig.supportEmail, description: siteConfig.description }} /> : null}
    </main>
  );
}
