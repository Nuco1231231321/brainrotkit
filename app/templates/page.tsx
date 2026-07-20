import { Breadcrumbs } from "@/components/breadcrumbs";
import { TemplateLibrary } from "@/components/template-library";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Brainrot Video Templates – Pick Your Style",
  description: "Browse Brainrot templates demonstrated with real creator stories, PDF study explainers, original character videos and generated voice audio.",
  path: "/templates",
});

export default function TemplatesPage() {
  return (
    <main id="main-content" className="page-shell templates-page">
      <Breadcrumbs label="Templates" path="/templates" />
      <header>
        <p className="eyebrow">Real generated outputs</p>
        <h1>Brainrot Video Templates Shown with Real Results</h1>
        <p>Play each finished video or voice result, then open the matching generator with your own text, PDF or original character.</p>
      </header>
      <TemplateLibrary />
    </main>
  );
}
