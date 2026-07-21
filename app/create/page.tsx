import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Create a Brainrot video",
  description: "Pick a gameplay loop, original hosts, write or AI-generate a script, preview live, then export a vertical video.",
  robots: { index: false, follow: false },
};

export default function CreateRedirectPage() {
  redirect("/");
}
