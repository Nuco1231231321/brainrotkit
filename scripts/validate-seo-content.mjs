const baseUrl = process.env.SEO_BASE_URL ?? "http://localhost:3001";

const pages = [
  {
    path: "/",
    minWords: 1200,
    maxWords: 1500,
    minFaqWords: 300,
    maxFaqWords: 450,
    minUserReferences: 20,
    keywords: [
      "ai brainrot video generator",
      "brainrot video generator",
      "ai brainrot generator",
      "ai brainrot",
    ],
  },
  {
    path: "/italian-brainrot-generator",
    minWords: 850,
    maxWords: 1400,
    minFaqWords: 220,
    maxFaqWords: 400,
    minUserReferences: 10,
    keywords: ["italian brainrot generator", "italian brainrot maker"],
  },
  {
    path: "/italian-brainrot-voice-generator",
    minWords: 850,
    maxWords: 1400,
    minFaqWords: 220,
    maxFaqWords: 400,
    minUserReferences: 10,
    keywords: ["italian brainrot voice generator", "italian brainrot voice", "brainrot text to speech"],
  },
  {
    path: "/pdf-to-brainrot",
    minWords: 850,
    maxWords: 1400,
    minFaqWords: 220,
    maxFaqWords: 400,
    minUserReferences: 10,
    keywords: ["pdf to brainrot", "brainrot pdf"],
  },
  {
    path: "/text-to-brainrot",
    minWords: 850,
    maxWords: 1400,
    minFaqWords: 220,
    maxFaqWords: 400,
    minUserReferences: 10,
    keywords: ["text to brainrot", "text to ai brainrot video"],
  },
  {
    path: "/remove-bg",
    minWords: 500,
    maxWords: 800,
    minFaqWords: 220,
    maxFaqWords: 420,
    minUserReferences: 10,
    keywords: ["ai background remover", "background remover online", "transparent png"],
  },
];

const bannedPublicPhrases = [
  "frontend preview",
  "adapter will be connected",
  "planned workflow",
  "planned product",
  "final launch gallery",
  "representative media slots",
  "the pipeline",
  "project workflow",
  "target upload limit",
  "system stage",
];

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;|&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function visibleText(html) {
  return decodeHtml(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<svg\b[\s\S]*?<\/svg>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function wordCount(text) {
  return text.match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g)?.length ?? 0;
}

function phraseCount(text, phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.match(new RegExp(`\\b${escaped}\\b`, "gi"))?.length ?? 0;
}

let failed = false;
const rows = [];

for (const page of pages) {
  const response = await fetch(`${baseUrl}${page.path}`);
  if (!response.ok) {
    console.error(`${page.path}: HTTP ${response.status}`);
    failed = true;
    continue;
  }

  const html = await response.text();
  const mainMatches = [...html.matchAll(/<main\b[^>]*>([\s\S]*?)<\/main>/gi)];
  const mainHtml = mainMatches.at(-1)?.[1] ?? "";
  const faqHtml = mainHtml.match(/<div class="faq-list">([\s\S]*?)<\/div>/i)?.[1] ?? "";
  const title = visibleText(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const description = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i)?.[1] ?? "";
  const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1] ?? "";
  const h1Matches = [...mainHtml.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h1 = visibleText(h1Matches[0]?.[1] ?? "");
  const faqItems = [...faqHtml.matchAll(/<details\b/gi)].length;
  const text = visibleText(mainHtml);
  const faqText = visibleText(faqHtml);
  const words = wordCount(text);
  const faqWords = wordCount(faqText);
  const userReferences = phraseCount(text, "you") + phraseCount(text, "your");
  const lowerText = text.toLowerCase();
  const banned = bannedPublicPhrases.filter((phrase) => lowerText.includes(phrase));
  const keywordResults = page.keywords.map((keyword) => {
    const count = phraseCount(text, keyword);
    return { keyword, count, density: Number(((count / Math.max(words, 1)) * 100).toFixed(2)) };
  });

  const primaryKeywordMissing = keywordResults[0].count < 3;
  const requiredKeywordMissing = keywordResults.some((keyword) => keyword.count < 1);
  const faqPrimaryKeywordMissing = phraseCount(faqText, page.keywords[0]) < 1;
  const primaryDensityInvalid = keywordResults[0].density < 0.15 || keywordResults[0].density > 1;
  const wordCountInvalid = words < page.minWords || words > page.maxWords;
  const faqLengthInvalid = faqWords < page.minFaqWords || faqWords > page.maxFaqWords;
  const userFocusInvalid = userReferences < page.minUserReferences;
  const structureInvalid =
    mainMatches.length !== 1 ||
    h1Matches.length !== 1 ||
    !h1.toLowerCase().includes(page.keywords[0]) ||
    faqItems < 6;
  const metadataInvalid =
    !title.toLowerCase().includes(page.keywords[0]) ||
    title.length < 50 ||
    title.length > 60 ||
    !description.toLowerCase().includes(page.keywords[0]) ||
    description.length < 100 ||
    description.length > 165 ||
    !canonical;
  if (
    wordCountInvalid ||
    faqLengthInvalid ||
    primaryKeywordMissing ||
    requiredKeywordMissing ||
    faqPrimaryKeywordMissing ||
    primaryDensityInvalid ||
    userFocusInvalid ||
    structureInvalid ||
    metadataInvalid ||
    banned.length > 0
  ) failed = true;

  rows.push({
    path: page.path,
    words,
    target: `${page.minWords}-${page.maxWords}`,
    faqWords,
    faqTarget: `${page.minFaqWords}-${page.maxFaqWords}`,
    faqItems,
    mainH1: `${mainMatches.length}/${h1Matches.length}`,
    titleLength: title.length,
    metaDescription: description.length,
    primaryCount: keywordResults[0].count,
    primaryDensity: `${keywordResults[0].density}%`,
    userReferences,
    secondaryCounts: keywordResults.slice(1).map((item) => `${item.keyword}:${item.count}`).join(" | "),
    banned: banned.join(", ") || "none",
  });
}

console.table(rows);

if (failed) {
  console.error("SEO content validation failed.");
  process.exit(1);
}

console.log("SEO content validation passed.");
