import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { getCurrentAccount } from "@/lib/current-account";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const currentAccount = await getCurrentAccount();
  if (!currentAccount) redirect("/login?returnTo=/admin");

  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (!admins.includes(currentAccount.account.email.toLowerCase())) notFound();

  return (
    <>
      <AppHeader admin />
      {children}
    </>
  );
}
