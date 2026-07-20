import { findProductByCreemId, getBillingProducts, type BillingProduct } from "@/lib/billing-products";
import { getDatabase } from "@/lib/cloudflare";

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function objectId(value: unknown): string | null {
  return asString(value) ?? asString(asRecord(value)?.id);
}

function getMetadata(object: JsonRecord): JsonRecord {
  return asRecord(object.metadata) ?? {};
}

function getProduct(object: JsonRecord): { id: string | null; record: JsonRecord | null } {
  const record = asRecord(object.product);
  return { id: objectId(object.product), record };
}

function getCustomer(object: JsonRecord): { id: string | null; email: string | null } {
  const customer = asRecord(object.customer);
  return {
    id: objectId(object.customer),
    email: asString(customer?.email),
  };
}

function getSubscription(object: JsonRecord) {
  const subscription = asRecord(object.subscription);
  return {
    id: objectId(object.subscription),
    record: subscription,
  };
}

function hexToBytes(value: string) {
  if (!/^[a-f0-9]{64}$/i.test(value)) return null;
  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < value.length; index += 2) {
    bytes[index / 2] = Number.parseInt(value.slice(index, index + 2), 16);
  }
  return bytes;
}

async function verifySignature(rawBody: string, signature: string, secret: string) {
  const signatureBytes = hexToBytes(signature);
  if (!signatureBytes) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  return crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    new TextEncoder().encode(rawBody),
  );
}

async function resolveUserId(db: D1Database, object: JsonRecord) {
  const metadata = getMetadata(object);
  const metadataUserId = asString(metadata.user_id) ?? asString(metadata.userId) ?? asString(metadata.referenceId);
  if (metadataUserId) return metadataUserId;

  const requestId = asString(object.request_id);
  if (requestId) {
    const checkout = await db.prepare(
      "SELECT user_id FROM checkout_requests WHERE id = ?",
    ).bind(requestId).first<{ user_id: string }>();
    if (checkout?.user_id) return checkout.user_id;
  }

  const subscriptionId = objectId(object.subscription) ?? (object.object === "subscription" ? asString(object.id) : null);
  if (subscriptionId) {
    const subscription = await db.prepare(
      "SELECT user_id FROM subscriptions WHERE id = ?",
    ).bind(subscriptionId).first<{ user_id: string }>();
    if (subscription?.user_id) return subscription.user_id;
  }

  const customer = getCustomer(object);
  if (customer.id) {
    const account = await db.prepare(
      "SELECT id FROM users WHERE creem_customer_id = ?",
    ).bind(customer.id).first<{ id: string }>();
    if (account?.id) return account.id;
  }
  if (customer.email) {
    const account = await db.prepare(
      "SELECT id FROM users WHERE email = ? COLLATE NOCASE",
    ).bind(customer.email).first<{ id: string }>();
    if (account?.id) return account.id;
  }

  return null;
}

function resolveBillingProduct(object: JsonRecord): BillingProduct | null {
  const metadata = getMetadata(object);
  const productKey = asString(metadata.product_key) ?? asString(metadata.productKey);
  if (productKey && productKey in getBillingProducts()) {
    return getBillingProducts()[productKey as keyof ReturnType<typeof getBillingProducts>];
  }
  return findProductByCreemId(getProduct(object).id);
}

async function applyCreditChange(input: {
  db: D1Database;
  userId: string;
  amount: number;
  kind: string;
  description: string;
  sourceEventId: string;
}) {
  if (input.amount === 0) return;
  const now = Date.now();
  const [ledgerInsert] = await input.db.batch([
    input.db.prepare(
      `INSERT INTO credit_ledger (
        id, user_id, amount, balance_after, kind, description, source_event_id, created_at
      )
      SELECT ?, id,
        CASE WHEN ? < 0 THEN MAX(?, -credits) ELSE ? END,
        MAX(credits + ?, 0), ?, ?, ?, ?
      FROM users WHERE id = ?`,
    ).bind(
      crypto.randomUUID(),
      input.amount,
      input.amount,
      input.amount,
      input.amount,
      input.kind,
      input.description,
      input.sourceEventId,
      now,
      input.userId,
    ),
    input.db.prepare(
      `UPDATE users SET credits = MAX(credits + ?, 0), updated_at = ? WHERE id = ?`,
    ).bind(input.amount, now, input.userId),
  ]);
  if (ledgerInsert.meta.changes !== 1) {
    throw new Error(`User ${input.userId} was not found while updating credits.`);
  }
}

async function handleCheckoutCompleted(db: D1Database, eventId: string, object: JsonRecord) {
  const product = resolveBillingProduct(object);
  if (!product) return;

  const userId = await resolveUserId(db, object);
  if (!userId) throw new Error("Checkout webhook could not be mapped to a user.");

  const order = asRecord(object.order) ?? {};
  const checkoutId = asString(object.id);
  const orderId = asString(order.id) ?? `checkout:${checkoutId ?? eventId}`;
  const requestId = asString(object.request_id);
  const customer = getCustomer(object);
  const subscription = getSubscription(object);
  const now = Date.now();

  if (requestId) {
    await db.prepare(
      `UPDATE checkout_requests
        SET status = 'paid', creem_checkout_id = COALESCE(creem_checkout_id, ?), updated_at = ?
        WHERE id = ? AND user_id = ?`,
    ).bind(checkoutId, now, requestId, userId).run();
  }

  await db.prepare(
    `UPDATE users SET
      creem_customer_id = COALESCE(?, creem_customer_id),
      creem_subscription_id = COALESCE(?, creem_subscription_id),
      current_product_key = CASE WHEN ? THEN ? ELSE current_product_key END,
      subscription_status = CASE WHEN ? THEN 'active' ELSE subscription_status END,
      updated_at = ?
      WHERE id = ?`,
  ).bind(
    customer.id,
    subscription.id,
    product.recurring ? 1 : 0,
    product.key,
    product.recurring ? 1 : 0,
    now,
    userId,
  ).run();

  if (subscription.id && customer.id) {
    await db.prepare(
      `INSERT INTO subscriptions (id, user_id, product_key, creem_customer_id, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'active', ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          product_key = excluded.product_key,
          creem_customer_id = excluded.creem_customer_id,
          status = excluded.status,
          updated_at = excluded.updated_at`,
    ).bind(subscription.id, userId, product.key, customer.id, now, now).run();
  }

  const paymentInsert = await db.prepare(
    `INSERT OR IGNORE INTO payments (
      id, user_id, product_key, creem_order_id, creem_checkout_id,
      creem_customer_id, creem_subscription_id, amount, currency, status,
      credits_granted, source_event_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?, ?, ?, ?)`,
  ).bind(
    orderId,
    userId,
    product.key,
    asString(order.id),
    checkoutId,
    customer.id,
    subscription.id,
    typeof order.amount === "number" ? order.amount : product.priceInCents,
    asString(order.currency) ?? "USD",
    product.recurring ? 0 : product.credits,
    eventId,
    now,
    now,
  ).run();

  if (paymentInsert.meta.changes === 1 && !product.recurring) {
    await applyCreditChange({
      db,
      userId,
      amount: product.credits,
      kind: "credit_purchase",
      description: product.name,
      sourceEventId: eventId,
    });
  }
}

async function handleSubscriptionEvent(db: D1Database, eventId: string, eventType: string, object: JsonRecord) {
  const userId = await resolveUserId(db, object);
  const product = resolveBillingProduct(object);
  const subscriptionId = asString(object.id) ?? objectId(object.subscription);
  const customer = getCustomer(object);
  if (!userId || !product || !subscriptionId || !customer.id) {
    throw new Error(`${eventType} could not be mapped to a user, product, subscription and customer.`);
  }

  const status = eventType.replace("subscription.", "");
  const now = Date.now();
  await db.prepare(
    `INSERT INTO subscriptions (id, user_id, product_key, creem_customer_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        product_key = excluded.product_key,
        creem_customer_id = excluded.creem_customer_id,
        status = excluded.status,
        updated_at = excluded.updated_at`,
  ).bind(subscriptionId, userId, product.key, customer.id, status, now, now).run();

  if (eventType === "subscription.paid") {
    const transaction = asRecord(object.last_transaction) ?? {};
    const orderId = objectId(transaction.order) ?? asString(object.order_id);
    const transactionId = asString(transaction.id);
    const amount = typeof transaction.amount_paid === "number"
      ? transaction.amount_paid
      : typeof transaction.amount === "number"
        ? transaction.amount
        : typeof object.amount === "number"
          ? object.amount
          : product.priceInCents;
    const currency = asString(transaction.currency) ?? asString(object.currency) ?? "USD";
    let shouldGrantCredits = false;

    if (orderId) {
      const paymentUpdate = await db.prepare(
        `UPDATE payments SET
          creem_customer_id = ?, creem_subscription_id = ?, amount = ?, currency = ?,
          status = 'paid', credits_granted = ?, updated_at = ?
          WHERE creem_order_id = ? AND credits_granted = 0`,
      ).bind(
        customer.id,
        subscriptionId,
        amount,
        currency,
        product.credits,
        now,
        orderId,
      ).run();
      shouldGrantCredits = paymentUpdate.meta.changes === 1;
    }

    const paymentInsert = await db.prepare(
      `INSERT OR IGNORE INTO payments (
        id, user_id, product_key, creem_order_id, creem_customer_id, creem_subscription_id,
        amount, currency, status, credits_granted, source_event_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?, ?, ?, ?)`,
    ).bind(
      transactionId ?? `subscription-payment:${eventId}`,
      userId,
      product.key,
      orderId,
      customer.id,
      subscriptionId,
      amount,
      currency,
      product.credits,
      eventId,
      now,
      now,
    ).run();

    shouldGrantCredits ||= paymentInsert.meta.changes === 1;
    if (shouldGrantCredits) {
      await applyCreditChange({
        db,
        userId,
        amount: product.credits,
        kind: "subscription_credit",
        description: `${product.name} credits`,
        sourceEventId: eventId,
      });
    }

    await db.prepare(
      `UPDATE users SET
        plan = ?, subscription_status = 'active', current_product_key = ?,
        creem_customer_id = ?, creem_subscription_id = ?, billing_hold = 0, updated_at = ?
        WHERE id = ?`,
    ).bind(product.plan, product.key, customer.id, subscriptionId, now, userId).run();
    return;
  }

  const periodEnd = Date.parse(asString(object.current_period_end_date) ?? "");
  const canceledWithRemainingAccess = eventType === "subscription.canceled"
    && Number.isFinite(periodEnd)
    && periodEnd > now;
  const revokeAccess = eventType === "subscription.expired"
    || eventType === "subscription.paused"
    || (eventType === "subscription.canceled" && !canceledWithRemainingAccess);
  await db.prepare(
    `UPDATE users SET
      subscription_status = ?,
      plan = CASE WHEN ? THEN 'free' ELSE plan END,
      current_product_key = CASE WHEN ? THEN NULL ELSE current_product_key END,
      creem_customer_id = ?, creem_subscription_id = ?, updated_at = ?
      WHERE id = ?`,
  ).bind(status, revokeAccess ? 1 : 0, revokeAccess ? 1 : 0, customer.id, subscriptionId, now, userId).run();
}

async function handleRefund(db: D1Database, eventId: string, object: JsonRecord) {
  const orderId = objectId(object.order) ?? asString(object.order_id);
  if (!orderId) return;
  const payment = await db.prepare(
    `SELECT id, user_id, credits_granted FROM payments WHERE creem_order_id = ? OR id = ?`,
  ).bind(orderId, orderId).first<{ id: string; user_id: string; credits_granted: number }>();
  if (!payment) return;

  const changed = await db.prepare(
    `UPDATE payments SET status = 'refunded', updated_at = ?
      WHERE id = ? AND status != 'refunded'`,
  ).bind(Date.now(), payment.id).run();
  if (changed.meta.changes === 1 && payment.credits_granted > 0) {
    await applyCreditChange({
      db,
      userId: payment.user_id,
      amount: -payment.credits_granted,
      kind: "payment_refund",
      description: "Credits removed after refund",
      sourceEventId: eventId,
    });
  }
}

async function handleDispute(db: D1Database, object: JsonRecord) {
  const userId = await resolveUserId(db, object);
  if (!userId) return;
  await db.prepare(
    `UPDATE users SET billing_hold = 1, plan = 'free', subscription_status = 'disputed', updated_at = ?
      WHERE id = ?`,
  ).bind(Date.now(), userId).run();
}

async function processWebhook(db: D1Database, eventId: string, eventType: string, object: JsonRecord) {
  if (eventType === "checkout.completed") {
    await handleCheckoutCompleted(db, eventId, object);
    return;
  }
  if (eventType.startsWith("subscription.")) {
    await handleSubscriptionEvent(db, eventId, eventType, object);
    return;
  }
  if (eventType === "refund.created") {
    await handleRefund(db, eventId, object);
    return;
  }
  if (eventType === "dispute.created") {
    await handleDispute(db, object);
  }
}

export async function POST(request: Request) {
  const secret = process.env.CREEM_WEBHOOK_SECRET;
  const signature = request.headers.get("creem-signature");
  if (!secret) return Response.json({ error: "Webhook secret is not configured." }, { status: 503 });
  if (!signature) return Response.json({ error: "Missing Creem signature." }, { status: 401 });

  const rawBody = await request.text();
  if (!(await verifySignature(rawBody, signature, secret))) {
    return Response.json({ error: "Invalid Creem signature." }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as unknown;
  const event = asRecord(payload);
  const eventId = asString(event?.id);
  const eventType = asString(event?.eventType);
  const object = asRecord(event?.object);
  if (!eventId || !eventType || !object) {
    return Response.json({ error: "Invalid Creem webhook payload." }, { status: 400 });
  }

  const db = await getDatabase();
  const receivedAt = Date.now();
  const inserted = await db.prepare(
    `INSERT OR IGNORE INTO webhook_events (id, event_type, payload, status, received_at)
      VALUES (?, ?, ?, 'processing', ?)`,
  ).bind(eventId, eventType, rawBody, receivedAt).run();

  if (inserted.meta.changes === 0) {
    const existing = await db.prepare(
      "SELECT status FROM webhook_events WHERE id = ?",
    ).bind(eventId).first<{ status: string }>();
    if (existing?.status !== "failed") return Response.json({ received: true, duplicate: true });
    await db.prepare(
      "UPDATE webhook_events SET status = 'processing', error = NULL WHERE id = ?",
    ).bind(eventId).run();
  }

  try {
    await processWebhook(db, eventId, eventType, object);
    await db.prepare(
      `UPDATE webhook_events SET status = 'processed', processed_at = ? WHERE id = ?`,
    ).bind(Date.now(), eventId).run();
    return Response.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown webhook processing error.";
    await db.prepare(
      `UPDATE webhook_events SET status = 'failed', error = ?, processed_at = ? WHERE id = ?`,
    ).bind(message.slice(0, 1000), Date.now(), eventId).run();
    console.error("Creem webhook processing failed", { eventId, eventType, message });
    return Response.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
