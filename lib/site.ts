export const siteConfig = {
  name: "BrainrotKit",
  shortName: "BR.KIT",
  description:
    "Create Brainrot videos, Italian characters, voices and study clips from text or PDFs.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://brainrotkit.com",
  supportEmail: "support@brainrotkit.com",
  updatedAt: "July 17, 2026",
};

export const publicRoutes = [
  "/",
  "/italian-brainrot-generator",
  "/italian-brainrot-voice-generator",
  "/remove-bg",
  "/pdf-to-brainrot",
  "/text-to-brainrot",
  "/templates",
  "/pricing",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/refund-policy",
  "/copyright",
  "/data-deletion",
  "/status",
];

const indexingPreference = (process.env.NEXT_PUBLIC_ALLOW_INDEXING as string | undefined)?.trim().toLowerCase();

export const allowIndexing = indexingPreference === undefined
  ? process.env.NODE_ENV === "production"
  : indexingPreference === "true";
