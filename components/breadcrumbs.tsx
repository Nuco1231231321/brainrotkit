import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { siteConfig } from "@/lib/site";

type BreadcrumbsProps = { label: string; path: string };

export function Breadcrumbs({ label, path }: BreadcrumbsProps) {
  const items = [
    { name: "Home", item: siteConfig.url },
    { name: label, item: `${siteConfig.url}${path}` },
  ];

  return (
    <>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><Link href="/">Home</Link></li>
          <li aria-hidden="true"><ChevronRight size={13} /></li>
          <li aria-current="page">{label}</li>
        </ol>
      </nav>
      <JsonLd
        value={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            ...item,
          })),
        }}
      />
    </>
  );
}
