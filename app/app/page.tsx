import type { Metadata } from "next";
import { DashboardHome } from "@/components/dashboard-home";

export const metadata: Metadata = { title: "Projects" };

export default function DashboardPage() {
  return <DashboardHome />;
}
