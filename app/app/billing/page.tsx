import type { Metadata } from "next";
import { BillingDashboard } from "@/components/billing-dashboard";

export const metadata: Metadata = { title: "Billing and Credits" };

export default function BillingPage() {
  return <BillingDashboard />;
}
