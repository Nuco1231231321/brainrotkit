#!/usr/bin/env node
/**
 * Grant test credits on remote D1.
 * Requires: Node >= 22, wrangler logged in.
 *
 * Usage:
 *   node scripts/grant-credits.mjs you@email.com 200
 */
import { spawnSync } from "node:child_process";

const email = process.argv[2];
const amount = Number(process.argv[3] ?? "100");
if (!email || !Number.isFinite(amount) || amount <= 0) {
  console.error("Usage: node scripts/grant-credits.mjs <email> [amount]");
  process.exit(1);
}

const safeEmail = email.replace(/'/g, "''");
const sql = `
UPDATE users
  SET credits = credits + ${Math.floor(amount)},
      updated_at = ${Date.now()}
  WHERE email = '${safeEmail}' COLLATE NOCASE;
INSERT INTO credit_ledger (
  id, user_id, amount, balance_after, kind, description, source_event_id, created_at
)
SELECT
  lower(hex(randomblob(16))),
  id,
  ${Math.floor(amount)},
  credits,
  'admin_grant',
  'Manual test grant',
  'grant:' || id || ':' || ${Date.now()},
  ${Date.now()}
FROM users
WHERE email = '${safeEmail}' COLLATE NOCASE;
SELECT email, credits FROM users WHERE email = '${safeEmail}' COLLATE NOCASE;
`;

const result = spawnSync(
  "npx",
  ["wrangler", "d1", "execute", "DB", "--remote", "--command", sql],
  { stdio: "inherit", cwd: new URL("..", import.meta.url).pathname },
);
process.exit(result.status ?? 1);