import { getAccount } from "@/lib/accounts";
import { getBillingProducts, getCreemApiBase, isBillingProductKey } from "@/lib/billing-products";
import { getDatabase } from "@/lib/cloudflare";
import { getSafeReturnPath } from "@/lib/adapters";
import { getSessionUserId } from "@/lib/session";

type CreemCheckoutResponse = {
  id?: string;
  checkout_url?: string;
};

function isCreemCheckoutUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "creem.io" || url.hostname.endsWith(".creem.io"));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return Response.json({ error: "Sign in before starting checkout." }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as { productId?: unknown; returnTo?: unknown } | null;
  if (!body || !isBillingProductKey(body.productId)) {
    return Response.json({ error: "Unknown billing product." }, { status: 400 });
  }

  const account = await getAccount(userId);
  if (!account) return Response.json({ error: "Account not found." }, { status: 404 });
  if (account.billingHold) {
    return Response.json({ error: "Billing is temporarily unavailable for this account." }, { status: 403 });
  }

  const product = getBillingProducts()[body.productId];
  if (!product.creemProductId || !process.env.CREEM_API_KEY) {
    return Response.json({ error: "Creem billing is not configured yet." }, { status: 503 });
  }

  const returnTo = getSafeReturnPath(typeof body.returnTo === "string" ? body.returnTo : null);
  const checkoutRequestId = crypto.randomUUID();
  const now = Date.now();
  const db = await getDatabase();
  await db.prepare(
    `INSERT INTO checkout_requests (
      id, user_id, product_key, status, return_to, created_at, updated_at
    ) VALUES (?, ?, ?, 'pending', ?, ?, ?)`,
  ).bind(checkoutRequestId, userId, product.key, returnTo, now, now).run();

  const successUrl = new URL("/checkout", request.url);
  successUrl.searchParams.set("status", "processing");
  successUrl.searchParams.set("returnTo", returnTo);
  successUrl.searchParams.set("request_id", checkoutRequestId);

  try {
    const response = await fetch(`${getCreemApiBase()}/v1/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.CREEM_API_KEY,
      },
      body: JSON.stringify({
        product_id: product.creemProductId,
        request_id: checkoutRequestId,
        success_url: successUrl.toString(),
        customer: { email: account.email },
        metadata: {
          user_id: userId,
          product_key: product.key,
          return_to: returnTo,
        },
      }),
    });

    if (!response.ok) {
      const details = (await response.text()).slice(0, 500);
      throw new Error(`Creem returned ${response.status}: ${details}`);
    }

    const checkout = await response.json() as CreemCheckoutResponse;
    if (!checkout.id || !checkout.checkout_url || !isCreemCheckoutUrl(checkout.checkout_url)) {
      throw new Error("Creem returned an invalid checkout response.");
    }

    await db.prepare(
      `UPDATE checkout_requests
        SET creem_checkout_id = ?, status = 'created', updated_at = ?
        WHERE id = ?`,
    ).bind(checkout.id, Date.now(), checkoutRequestId).run();

    return Response.json({ checkoutUrl: checkout.checkout_url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout creation failed.";
    await db.prepare(
      `UPDATE checkout_requests SET status = 'failed', updated_at = ? WHERE id = ?`,
    ).bind(Date.now(), checkoutRequestId).run();
    console.error("Creem checkout creation failed", { checkoutRequestId, message });
    return Response.json({ error: "Secure checkout could not be opened. Try again shortly." }, { status: 502 });
  }
}
