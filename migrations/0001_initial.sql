PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT,
  image TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'creator', 'pro')),
  credits INTEGER NOT NULL DEFAULT 10 CHECK (credits >= 0),
  subscription_status TEXT NOT NULL DEFAULT 'none',
  current_product_key TEXT,
  creem_customer_id TEXT UNIQUE,
  creem_subscription_id TEXT UNIQUE,
  billing_hold INTEGER NOT NULL DEFAULT 0 CHECK (billing_hold IN (0, 1)),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  last_login_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS users_email_index ON users(email);
CREATE INDEX IF NOT EXISTS users_creem_customer_index ON users(creem_customer_id);
CREATE INDEX IF NOT EXISTS users_creem_subscription_index ON users(creem_subscription_id);

CREATE TABLE IF NOT EXISTS credit_ledger (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  kind TEXT NOT NULL,
  description TEXT NOT NULL,
  source_event_id TEXT UNIQUE,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS credit_ledger_user_created_index
  ON credit_ledger(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS checkout_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_key TEXT NOT NULL,
  creem_checkout_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  return_to TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS checkout_requests_user_index
  ON checkout_requests(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_key TEXT NOT NULL,
  creem_order_id TEXT UNIQUE,
  creem_checkout_id TEXT,
  creem_customer_id TEXT,
  creem_subscription_id TEXT,
  amount INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL,
  credits_granted INTEGER NOT NULL DEFAULT 0,
  source_event_id TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS payments_user_created_index
  ON payments(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_key TEXT NOT NULL,
  creem_customer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS subscriptions_user_index
  ON subscriptions(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  error TEXT,
  received_at INTEGER NOT NULL,
  processed_at INTEGER
);

CREATE INDEX IF NOT EXISTS webhook_events_status_index
  ON webhook_events(status, received_at DESC);
