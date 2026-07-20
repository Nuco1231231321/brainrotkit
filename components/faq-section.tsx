import { JsonLd } from "@/components/json-ld";

type FAQ = { question: string; answer: string };

export function FAQSection({ faqs }: { faqs: FAQ[] }) {
  return (
    <section className="section-block narrow-shell" aria-labelledby="faq-heading">
      <div className="section-heading">
        <h2 id="faq-heading">Frequently asked questions</h2>
        <p>What you need to know before you generate, edit or export.</p>
      </div>
      <div className="faq-list">
        {faqs.map((faq) => (
          <details key={faq.question}>
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
      <JsonLd
        value={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }}
      />
    </section>
  );
}
