const baseUrl = process.env.AUDIT_BASE_URL ?? "http://localhost:3001";
const expectPublicIndexing = process.env.EXPECT_PUBLIC_INDEXING === "true";

const publicRoutes = [
  "/",
  "/italian-brainrot-generator",
  "/italian-brainrot-voice-generator",
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

const privateRoutes = [
  "/login",
  "/checkout?plan=creator&billing=monthly",
  "/checkout?status=processing",
  "/checkout?status=success",
  "/checkout?status=failed",
  "/checkout?status=canceled",
  "/app",
  "/app/account",
  "/app/billing",
  "/app/projects/gravity-glitch",
  "/app/projects/exam-rescue",
  "/app/projects/opera-mode",
  "/app/projects/pasta-pilot",
  "/app/projects/pasta-pilot?balance=4",
  "/admin",
];

const stateExpectations = new Map([
  ["/checkout?status=processing", "Keep this page open"],
  ["/checkout?status=success", "Your balance is ready"],
  ["/checkout?status=failed", "The charge did not complete"],
  ["/checkout?status=canceled", "No plan change was made"],
]);

const authProtectedRoutes = new Set(privateRoutes.filter((route) => route === "/admin" || route.startsWith("/app")));
const clientRenderedRoutes = new Set(privateRoutes.filter((route) => route.startsWith("/checkout")));
const clientAuthenticatedRoutes = new Set(privateRoutes.filter((route) => route.startsWith("/app")));

const faqRoutes = new Set([
  "/",
  "/italian-brainrot-generator",
  "/italian-brainrot-voice-generator",
  "/pdf-to-brainrot",
  "/text-to-brainrot",
  "/pricing",
]);

const publicBannedPhrases = [
  "frontend preview",
  "adapter integration",
  "api integration",
  "production environment",
  "legal review pending",
  "planned workflow",
  "final launch gallery",
  "representative media slot",
  "system job",
  "system error",
  "system failure",
];

function decodeHtml(value) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;|&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripTags(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function matchValue(html, pattern) {
  return decodeHtml(html.match(pattern)?.[1] ?? "");
}

function metaProperty(html, property) {
  return matchValue(html, new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"));
}

function metaName(html, name) {
  return matchValue(html, new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"));
}

function readPage(html) {
  const mainMatches = [...html.matchAll(/<main\b[^>]*>([\s\S]*?)<\/main>/gi)];
  const mainHtml = mainMatches.at(-1)?.[1] ?? "";
  const h1Matches = [...mainHtml.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  const jsonLdSources = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => decodeHtml(match[1]));
  const schemaTypes = [];
  const schemaErrors = [];

  for (const source of jsonLdSources) {
    try {
      const value = JSON.parse(source);
      const entries = Array.isArray(value) ? value : [value];
      for (const entry of entries) {
        if (typeof entry?.["@type"] === "string") schemaTypes.push(entry["@type"]);
      }
    } catch (error) {
      schemaErrors.push(error instanceof Error ? error.message : String(error));
    }
  }

  return {
    title: stripTags(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? ""),
    description: matchValue(html, /<meta[^>]+name="description"[^>]+content="([^"]+)"/i),
    canonical: matchValue(html, /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i),
    robots: matchValue(html, /<meta[^>]+name="robots"[^>]+content="([^"]+)"/i),
    openGraph: {
      title: metaProperty(html, "og:title"),
      description: metaProperty(html, "og:description"),
      url: metaProperty(html, "og:url"),
      image: metaProperty(html, "og:image"),
    },
    twitter: {
      card: metaName(html, "twitter:card"),
      title: metaName(html, "twitter:title"),
      description: metaName(html, "twitter:description"),
      image: metaName(html, "twitter:image"),
    },
    language: matchValue(html, /<html[^>]+lang="([^"]+)"/i),
    redirectUrl: matchValue(html, /<meta[^>]+id="__next-page-redirect"[^>]+content="\d+;url=([^"]+)"/i),
    mainCount: mainMatches.length,
    h1Count: h1Matches.length,
    h1: stripTags(h1Matches[0]?.[1] ?? ""),
    mainText: stripTags(mainHtml),
    faqItems: [...mainHtml.matchAll(/<details\b/gi)].length,
    schemaTypes,
    schemaErrors,
    internalLinks: [...html.matchAll(/<a\b[^>]+href="([^"]+)"/gi)]
      .map((match) => decodeHtml(match[1]))
      .filter((href) => href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/#")),
  };
}

const allRoutes = [...publicRoutes, ...privateRoutes];
const responses = await Promise.all(
  allRoutes.map(async (route) => {
    const response = await fetch(`${baseUrl}${route}`);
    return { route, status: response.status, html: await response.text() };
  }),
);

let failed = false;
const publicTitles = new Set();
const publicDescriptions = new Set();
const internalLinks = new Set();
const rows = [];

for (const result of responses) {
  const page = readPage(result.html);
  const isPublic = publicRoutes.includes(result.route);
  const isAuthProtected = authProtectedRoutes.has(result.route);
  const issues = [];

  if (result.status !== 200) issues.push(`HTTP ${result.status}`);
  if (page.language !== "en") issues.push(`lang=${page.language || "missing"}`);
  if (clientAuthenticatedRoutes.has(result.route)) {
    if (page.mainCount !== 1) issues.push(`client auth shell main=${page.mainCount}`);
    if (!page.mainText.includes("Loading your BrainrotKit workspace")) issues.push("missing client auth shell");
  } else if (isAuthProtected) {
    if (!page.redirectUrl.startsWith("/login?returnTo=")) issues.push(`missing auth redirect: ${page.redirectUrl || "none"}`);
  } else if (!clientRenderedRoutes.has(result.route)) {
    if (page.mainCount !== 1) issues.push(`main=${page.mainCount}`);
    if (page.h1Count !== 1) issues.push(`h1=${page.h1Count}`);
  }
  if (!page.title) issues.push("missing title");
  if (page.schemaErrors.length) issues.push("invalid JSON-LD");

  if (isPublic) {
    if (!page.description) issues.push("missing description");
    if (page.description.length < 70 || page.description.length > 165) issues.push(`description length=${page.description.length}`);
    if (!page.canonical) issues.push("missing canonical");
    if (publicTitles.has(page.title)) issues.push("duplicate title");
    if (publicDescriptions.has(page.description)) issues.push("duplicate description");
    publicTitles.add(page.title);
    publicDescriptions.add(page.description);

    const isNoIndex = page.robots.toLowerCase().includes("noindex");
    if (expectPublicIndexing && isNoIndex) issues.push("unexpected noindex");
    if (!expectPublicIndexing && !isNoIndex) issues.push("prelaunch page is indexable");
    if (page.schemaTypes.length === 0) issues.push("missing JSON-LD");
    if (!page.openGraph.title || !page.openGraph.description || !page.openGraph.url || !page.openGraph.image) issues.push("incomplete Open Graph metadata");
    if (page.openGraph.url !== page.canonical) issues.push("og:url does not match canonical");
    if (page.openGraph.image && !/^https?:\/\//i.test(page.openGraph.image)) issues.push("Open Graph image is not absolute");
    if (page.twitter.card !== "summary_large_image" || !page.twitter.title || !page.twitter.description || !page.twitter.image) issues.push("incomplete Twitter metadata");
    if (page.twitter.image && !/^https?:\/\//i.test(page.twitter.image)) issues.push("Twitter image is not absolute");
    if (faqRoutes.has(result.route)) {
      if (page.faqItems < 6) issues.push(`FAQ items=${page.faqItems}`);
      if (!page.schemaTypes.includes("FAQPage")) issues.push("missing FAQPage schema");
    }
    const internalPhrases = publicBannedPhrases.filter((phrase) => page.mainText.toLowerCase().includes(phrase));
    if (internalPhrases.length) issues.push(`internal copy=${internalPhrases.join(",")}`);
  } else if (!page.robots.toLowerCase().includes("noindex")) {
    issues.push("private route is indexable");
  }

  const expectedStateText = stateExpectations.get(result.route);
  if (expectedStateText && !clientRenderedRoutes.has(result.route) && !page.mainText.includes(expectedStateText)) {
    issues.push(`missing state: ${expectedStateText}`);
  }

  for (const href of page.internalLinks) internalLinks.add(href);
  if (issues.length) failed = true;
  rows.push({ route: result.route, status: result.status, title: page.title, mainH1: `${page.mainCount}/${page.h1Count}`, robots: page.robots || "missing", schemas: page.schemaTypes.join(",") || "none", issues: issues.join(" | ") || "none" });
}

const linkRows = [];
for (const href of internalLinks) {
  const url = new URL(href, baseUrl);
  const response = await fetch(url);
  const valid = response.status >= 200 && response.status < 400;
  if (!valid) failed = true;
  linkRows.push({ href, status: response.status, valid });
}

const robotsResponse = await fetch(`${baseUrl}/robots.txt`);
const robotsText = await robotsResponse.text();
const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`);
const sitemapText = await sitemapResponse.text();
const manifestResponse = await fetch(`${baseUrl}/manifest.webmanifest`);
const iconResponse = await fetch(`${baseUrl}/icon.svg`);

if (!manifestResponse.ok) {
  failed = true;
  console.error(`Manifest returned HTTP ${manifestResponse.status}.`);
} else {
  try {
    const manifest = await manifestResponse.json();
    if (!manifest.name || !manifest.short_name || !manifest.theme_color || !Array.isArray(manifest.icons) || manifest.icons.length === 0) {
      failed = true;
      console.error("Manifest is missing required app identity fields.");
    }
  } catch {
    failed = true;
    console.error("Manifest is not valid JSON.");
  }
}

if (!iconResponse.ok) {
  failed = true;
  console.error(`Site icon returned HTTP ${iconResponse.status}.`);
}

if (!expectPublicIndexing && !robotsText.includes("Disallow: /")) {
  failed = true;
  console.error("robots.txt does not block the prelaunch site.");
}

if (!expectPublicIndexing && /<url>/i.test(sitemapText)) {
  failed = true;
  console.error("Prelaunch sitemap unexpectedly contains indexable URLs.");
}

if (expectPublicIndexing && (!robotsText.includes("Allow: /") || !robotsText.includes(`${baseUrl}/sitemap.xml`))) {
  failed = true;
  console.error("robots.txt does not advertise the indexable public site and sitemap.");
}

if (expectPublicIndexing && !/<url>/i.test(sitemapText)) {
  failed = true;
  console.error("Public sitemap does not contain any URLs.");
}

console.table(rows);
console.table(linkRows.filter((row) => !row.valid));
console.log(`Validated ${rows.length} routes and ${linkRows.length} internal links.`);

if (failed) {
  console.error("Frontend audit failed.");
  process.exit(1);
}

console.log("Frontend audit passed.");
