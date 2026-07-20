import Link from "next/link";
import { FooterBadgeCarousel } from "@/components/footer-badge-carousel";
import { Logo } from "@/components/logo";

const groups = [
  {
    label: "Create",
    links: [
      ["AI Brainrot Video", "/"],
      ["Italian Brainrot", "/italian-brainrot-generator"],
      ["PDF to Brainrot", "/pdf-to-brainrot"],
      ["Text to Brainrot", "/text-to-brainrot"],
      ["Brainrot Voice", "/italian-brainrot-voice-generator"],
      ["Remove Background", "/remove-bg"],
    ],
  },
  {
    label: "Product",
    links: [
      ["Templates", "/templates"],
      ["Pricing", "/pricing"],
      ["Projects", "/app"],
      ["Status", "/status"],
      ["Contact", "/contact"],
    ],
  },
  {
    label: "Legal",
    links: [
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
      ["Refunds", "/refund-policy"],
      ["Copyright", "/copyright"],
      ["Data deletion", "/data-deletion"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <Logo />
        <p>Turn text, PDFs and ideas into watchable short-form videos.</p>
        <FooterBadgeCarousel />
      </div>
      <div className="footer-links">
        {groups.map((group) => (
          <div key={group.label}>
            <p>{group.label}</p>
            {group.links.map(([label, href]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <span>© 2026 BrainrotKit</span>
        <div className="footer-credits">
          <span>Built for short-form creators</span>
          <a href="https://mossai.org" title="MossAI Tools">MossAI Tools</a>
        </div>
      </div>
    </footer>
  );
}
