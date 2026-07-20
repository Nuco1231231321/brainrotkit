import { Suspense } from "react";
import { LoginPanel } from "@/components/login-panel";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Sign in",
  description: "Sign in to BrainrotKit with Google.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <main id="main-content" className="login-page">
      <div className="login-visual" aria-hidden="true">
        <div><span>01</span><strong>Keep the draft</strong></div>
        <div><span>02</span><strong>Review the cost</strong></div>
        <div><span>03</span><strong>Return to the result</strong></div>
      </div>
      <Suspense fallback={<div className="login-card login-skeleton" aria-label="Loading sign in" />}>
        <LoginPanel />
      </Suspense>
    </main>
  );
}
