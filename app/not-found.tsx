import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main id="main-content" className="route-error">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>The link may be outdated. Start a new project or return to the homepage.</p>
      <Link href="/" className="button-primary"><ArrowLeft aria-hidden="true" size={16} /> Return home</Link>
    </main>
  );
}
