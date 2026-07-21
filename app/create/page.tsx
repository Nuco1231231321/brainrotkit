import type { Metadata } from "next";
import { CreateStudio } from "@/components/create-studio";

export const metadata: Metadata = {
  title: "Create a Brainrot video",
  description: "Pick a gameplay loop, original hosts, write or AI-generate a script, preview live, then export a vertical video.",
  robots: { index: false, follow: false },
};

export default function CreatePage() {
  return <CreateStudio />;
}