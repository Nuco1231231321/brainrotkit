import { getAccount } from "@/lib/accounts";
import { getCreemApiBase } from "@/lib/billing-products";
import { getSessionUserId } from "@/lib/session";

type CreemPortalResponse = {
  customer_portal_link?: string;
};

function isCreemPortalUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "creem.io" || url.hostname.endsWith(".creem.io"));
  } catch {
    return false;
  }
}

export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) {
    return Response.json({ error: "Sign in to manage billing." }, { status: 401 });
  }

  const account = await getAccount(userId);
  if (!account?.creemCustomerId) {
    return Response.json({ error: "No Creem customer is connected to this account yet." }, { status: 404 });
  }
  if (!process.env.CREEM_API_KEY) {
    return Response.json({ error: "Creem billing is not configured yet." }, { status: 503 });
  }

  try {
    const response = await fetch(`${getCreemApiBase()}/v1/customers/billing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.CREEM_API_KEY,
      },
      body: JSON.stringify({ customer_id: account.creemCustomerId }),
    });

    if (!response.ok) {
      const details = (await response.text()).slice(0, 500);
      throw new Error(`Creem returned ${response.status}: ${details}`);
    }

    const portal = await response.json() as CreemPortalResponse;
    if (!portal.customer_portal_link || !isCreemPortalUrl(portal.customer_portal_link)) {
      throw new Error("Creem returned an invalid customer portal URL.");
    }

    return Response.json({ portalUrl: portal.customer_portal_link });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Customer portal creation failed.";
    console.error("Creem customer portal creation failed", { userId, message });
    return Response.json({ error: "The billing portal could not be opened. Try again shortly." }, { status: 502 });
  }
}
