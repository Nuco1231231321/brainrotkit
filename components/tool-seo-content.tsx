import { CheckCircle2 } from "lucide-react";
import { toolSeoContent } from "@/lib/tool-seo-content";

export function ToolSeoContent({ slug }: { slug: string }) {
  const sections = toolSeoContent[slug] ?? [];

  return (
    <div className="tool-seo-content narrow-shell">
      {sections.map((section, index) => (
        <section key={section.title} className="tool-seo-section" aria-labelledby={`seo-section-${index}`}>
          <h2 id={`seo-section-${index}`}>{section.title}</h2>
          <div className="seo-prose">
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.bullets ? (
              <ul>
                {section.bullets.map((bullet) => <li key={bullet}><CheckCircle2 aria-hidden="true" size={16} /><span>{bullet}</span></li>)}
              </ul>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  );
}
