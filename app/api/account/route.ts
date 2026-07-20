import { getAccount } from "@/lib/accounts";
import { getSessionUserId } from "@/lib/session";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const account = await getAccount(userId);
  if (!account) return Response.json({ error: "Account not found." }, { status: 404 });

  return Response.json({
    account: {
      email: account.email,
      name: account.name,
      image: account.image,
      plan: account.plan,
      credits: account.credits,
      subscriptionStatus: account.subscriptionStatus,
      currentProductKey: account.currentProductKey,
      hasCreemCustomer: Boolean(account.creemCustomerId),
      billingHold: account.billingHold,
    },
  }, { headers: { "Cache-Control": "private, no-store" } });
}
