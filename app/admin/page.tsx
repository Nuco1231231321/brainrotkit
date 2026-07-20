import type { Metadata } from "next";
import { AdminConsole } from "@/components/admin-console";

export const metadata: Metadata = { title: "Admin Operations" };

export default function AdminPage() {
  return <AdminConsole />;
}
