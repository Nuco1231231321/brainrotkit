export type IntegrationState = "reserved" | "connected";

export const integrationStatus = {
  authentication: "connected" as IntegrationState,
  generation: "connected" as IntegrationState,
  billing: "connected" as IntegrationState,
  database: "connected" as IntegrationState,
};

export type SavedDraft = {
  sourcePath: string;
  projectType: string;
  fields: Record<string, string | boolean>;
  savedAt: string;
};

export const draftStorageKey = "brainrotkit:pending-draft";

export class IntegrationNotConfiguredError extends Error {
  constructor(integration: string) {
    super(`${integration} is not configured.`);
    this.name = "IntegrationNotConfiguredError";
  }
}

export type GoogleSignInRequest = {
  returnTo: string;
  draftStorageKey: string;
};

export interface AuthenticationAdapter {
  signInWithGoogle(request: GoogleSignInRequest): Promise<void>;
}

export interface GenerationAdapter {
  createProject(projectType: string, fields: Record<string, unknown>): Promise<{ projectId: string }>;
}

export interface BillingAdapter {
  createCheckout(productId: string, returnTo: string): Promise<{ checkoutUrl: string }>;
}

export interface ProjectRepository {
  listProjects(): Promise<Array<{ id: string; title: string; status: string }>>;
}

export function getSafeReturnPath(value: string | null | undefined, fallback = "/app") {
  if (!value?.startsWith("/") || value.startsWith("//")) return fallback;
  try {
    const parsed = new URL(value, "https://brainrotkit.local");
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export const billingAdapter: BillingAdapter = {
  async createCheckout(productId, returnTo) {
    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, returnTo }),
    });
    const payload = await response.json() as { checkoutUrl?: string; error?: string };
    if (!response.ok || !payload.checkoutUrl) {
      throw new Error(payload.error ?? "Creem checkout could not be created.");
    }
    return { checkoutUrl: payload.checkoutUrl };
  },
};
