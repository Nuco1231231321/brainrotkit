import { creditPack, plans } from "@/lib/plans";

export type BillingProductKey =
  | "creator-monthly"
  | "creator-annual"
  | "pro-monthly"
  | "pro-annual"
  | "credits";

export type BillingProduct = {
  key: BillingProductKey;
  name: string;
  plan: "free" | "creator" | "pro";
  credits: number;
  recurring: boolean;
  priceInCents: number;
  creemProductId: string | undefined;
};

const creator = plans.find((plan) => plan.id === "creator")!;
const pro = plans.find((plan) => plan.id === "pro")!;

export function getBillingProducts(): Record<BillingProductKey, BillingProduct> {
  return {
    "creator-monthly": {
      key: "creator-monthly",
      name: "Creator Monthly",
      plan: "creator",
      credits: creator.monthlyCredits,
      recurring: true,
      priceInCents: creator.monthlyPrice * 100,
      creemProductId: process.env.CREEM_PRODUCT_CREATOR_MONTHLY,
    },
    "creator-annual": {
      key: "creator-annual",
      name: "Creator Annual",
      plan: "creator",
      credits: creator.monthlyCredits * 12,
      recurring: true,
      priceInCents: creator.annualMonthlyPrice * 12 * 100,
      creemProductId: process.env.CREEM_PRODUCT_CREATOR_ANNUAL,
    },
    "pro-monthly": {
      key: "pro-monthly",
      name: "Pro Monthly",
      plan: "pro",
      credits: pro.monthlyCredits,
      recurring: true,
      priceInCents: pro.monthlyPrice * 100,
      creemProductId: process.env.CREEM_PRODUCT_PRO_MONTHLY,
    },
    "pro-annual": {
      key: "pro-annual",
      name: "Pro Annual",
      plan: "pro",
      credits: pro.monthlyCredits * 12,
      recurring: true,
      priceInCents: pro.annualMonthlyPrice * 12 * 100,
      creemProductId: process.env.CREEM_PRODUCT_PRO_ANNUAL,
    },
    credits: {
      key: "credits",
      name: "175 Credit Pack",
      plan: "free",
      credits: creditPack.credits,
      recurring: false,
      priceInCents: Math.round(creditPack.price * 100),
      creemProductId: process.env.CREEM_PRODUCT_CREDITS,
    },
  };
}

export function isBillingProductKey(value: unknown): value is BillingProductKey {
  return typeof value === "string" && value in getBillingProducts();
}

export function findProductByCreemId(productId: string | null | undefined) {
  if (!productId) return null;
  return Object.values(getBillingProducts()).find((product) => product.creemProductId === productId) ?? null;
}

export function getCreemApiBase() {
  return (process.env.CREEM_TEST_MODE as string | undefined) === "false"
    ? "https://api.creem.io"
    : "https://test-api.creem.io";
}
