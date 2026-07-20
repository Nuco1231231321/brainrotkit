import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <main id="main-content" className="app-page"><div className="empty-state"><h1>Project not found</h1><p>The project may have been deleted or the file has expired.</p><Link className="button-primary" href="/app">Return to projects</Link></div></main>
  );
}
