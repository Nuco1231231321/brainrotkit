import { getDatabase } from "@/lib/cloudflare";

export type Account = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  plan: "free" | "creator" | "pro";
  credits: number;
  subscriptionStatus: string;
  currentProductKey: string | null;
  creemCustomerId: string | null;
  creemSubscriptionId: string | null;
  billingHold: boolean;
};

type AccountRow = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  plan: Account["plan"];
  credits: number;
  subscription_status: string;
  current_product_key: string | null;
  creem_customer_id: string | null;
  creem_subscription_id: string | null;
  billing_hold: number;
};

function mapAccount(row: AccountRow): Account {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    image: row.image,
    plan: row.plan,
    credits: row.credits,
    subscriptionStatus: row.subscription_status,
    currentProductKey: row.current_product_key,
    creemCustomerId: row.creem_customer_id,
    creemSubscriptionId: row.creem_subscription_id,
    billingHold: row.billing_hold === 1,
  };
}

export async function upsertGoogleUser(input: {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}) {
  const db = await getDatabase();
  const now = Date.now();
  const insert = await db.prepare(
    `INSERT OR IGNORE INTO users (
      id, email, name, image, plan, credits, subscription_status,
      billing_hold, created_at, updated_at, last_login_at
    ) VALUES (?, ?, ?, ?, 'free', 10, 'none', 0, ?, ?, ?)`,
  ).bind(input.id, input.email, input.name ?? null, input.image ?? null, now, now, now).run();

  if (insert.meta.changes === 1) {
    await db.prepare(
      `INSERT INTO credit_ledger (
        id, user_id, amount, balance_after, kind, description, source_event_id, created_at
      ) VALUES (?, ?, 10, 10, 'starter_grant', 'Starter credits', ?, ?)`,
    ).bind(crypto.randomUUID(), input.id, `starter:${input.id}`, now).run();
    return;
  }

  await db.prepare(
    `UPDATE users
      SET email = ?, name = ?, image = ?, updated_at = ?, last_login_at = ?
      WHERE id = ?`,
  ).bind(input.email, input.name ?? null, input.image ?? null, now, now, input.id).run();
}

export async function getAccount(userId: string): Promise<Account | null> {
  const db = await getDatabase();
  const row = await db.prepare(
    `SELECT id, email, name, image, plan, credits, subscription_status,
      current_product_key, creem_customer_id, creem_subscription_id, billing_hold
      FROM users WHERE id = ?`,
  ).bind(userId).first<AccountRow>();
  return row ? mapAccount(row) : null;
}

export type CreditActivity = {
  id: string;
  amount: number;
  balanceAfter: number;
  kind: string;
  description: string;
  createdAt: number;
};

type CreditActivityRow = {
  id: string;
  amount: number;
  balance_after: number;
  kind: string;
  description: string;
  created_at: number;
};

function mapCreditActivity(row: CreditActivityRow): CreditActivity {
  return {
    id: row.id,
    amount: row.amount,
    balanceAfter: row.balance_after,
    kind: row.kind,
    description: row.description,
    createdAt: row.created_at,
  };
}

export async function listCreditActivity(userId: string, limit = 20): Promise<CreditActivity[]> {
  const db = await getDatabase();
  const result = await db.prepare(
    `SELECT id, amount, balance_after, kind, description, created_at
      FROM credit_ledger
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?`,
  ).bind(userId, limit).all<CreditActivityRow>();

  return result.results.map(mapCreditActivity);
}

export type PaymentRecord = {
  id: string;
  productKey: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: number;
};

type PaymentRow = {
  id: string;
  product_key: string;
  amount: number;
  currency: string;
  status: string;
  created_at: number;
};

function mapPayment(row: PaymentRow): PaymentRecord {
  return {
    id: row.id,
    productKey: row.product_key,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function listPayments(userId: string, limit = 20): Promise<PaymentRecord[]> {
  const db = await getDatabase();
  const result = await db.prepare(
    `SELECT id, product_key, amount, currency, status, created_at
      FROM payments
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?`,
  ).bind(userId, limit).all<PaymentRow>();

  return result.results.map(mapPayment);
}

export async function getBillingHistory(userId: string, limit = 20) {
  const db = await getDatabase();
  const [activityResult, paymentResult] = await db.batch([
    db.prepare(
      `SELECT id, amount, balance_after, kind, description, created_at
        FROM credit_ledger
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?`,
    ).bind(userId, limit),
    db.prepare(
      `SELECT id, product_key, amount, currency, status, created_at
        FROM payments
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?`,
    ).bind(userId, limit),
  ]) as [D1Result<CreditActivityRow>, D1Result<PaymentRow>];

  return {
    activities: activityResult.results.map(mapCreditActivity),
    payments: paymentResult.results.map(mapPayment),
  };
}
