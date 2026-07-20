import { getBillingHistory } from "@/lib/accounts";
import { getSessionUserId } from "@/lib/session";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  return Response.json(await getBillingHistory(userId), {
    headers: { "Cache-Control": "private, no-store" },
  });
}
