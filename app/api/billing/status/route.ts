import { getDatabase } from "@/lib/cloudflare";
import { getSessionUserId } from "@/lib/session";

type CheckoutStatusRow = {
  status: string;
};

export async function GET(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const requestId = url.searchParams.get("request_id");
  const checkoutId = url.searchParams.get("checkout_id");
  if (!requestId && !checkoutId) {
    return Response.json({ error: "Missing checkout identifier." }, { status: 400 });
  }

  const db = await getDatabase();
  const row = requestId
    ? await db.prepare(
        `SELECT status FROM checkout_requests WHERE id = ? AND user_id = ?`,
      ).bind(requestId, userId).first<CheckoutStatusRow>()
    : await db.prepare(
        `SELECT status FROM checkout_requests WHERE creem_checkout_id = ? AND user_id = ?`,
      ).bind(checkoutId, userId).first<CheckoutStatusRow>();

  if (!row) return Response.json({ error: "Checkout not found." }, { status: 404 });
  return Response.json({ status: row.status });
}
