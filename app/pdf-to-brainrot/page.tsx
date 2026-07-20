import { ToolMarketingPage } from "@/components/tool-marketing-page";
import { pageMetadata } from "@/lib/metadata";
import { toolPages } from "@/lib/tool-pages";

const config = toolPages["pdf-to-brainrot"];

export const metadata = pageMetadata({ title: config.metaTitle, description: config.description, path: `/${config.slug}` });

export default function PdfToBrainrotPage() {
  return <ToolMarketingPage config={config} />;
}
