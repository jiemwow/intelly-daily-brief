import { execFile } from "node:child_process";
import { promisify } from "node:util";

import type { BriefItem, DailyBrief } from "@/types/brief";

const execFileAsync = promisify(execFile);

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const sourceDomainHints: Array<{ pattern: RegExp; domains: string[] }> = [
  { pattern: /^WSJ$/i, domains: ["wsj.com", "cn.wsj.com"] },
  { pattern: /^Reuters$/i, domains: ["reuters.com"] },
  { pattern: /^Financial Times$/i, domains: ["ft.com"] },
  { pattern: /^TechCrunch$/i, domains: ["techcrunch.com"] },
  { pattern: /^Business Insider$/i, domains: ["businessinsider.com"] },
  { pattern: /^The Verge$/i, domains: ["theverge.com"] },
  { pattern: /^VentureBeat$/i, domains: ["venturebeat.com"] },
  { pattern: /^NVIDIA/i, domains: ["blogs.nvidia.com", "nvidia.com"] },
  { pattern: /^Hugging Face$/i, domains: ["huggingface.co"] },
  { pattern: /^Waymo$/i, domains: ["waymo.com"] },
  { pattern: /^Google/i, domains: ["blog.google", "googleblog.com"] },
  { pattern: /^OpenAI$/i, domains: ["openai.com"] },
  { pattern: /^Anthropic$/i, domains: ["anthropic.com"] },
  { pattern: /^WardsAuto$/i, domains: ["wardsauto.com"] },
  { pattern: /^36Kr$/i, domains: ["36kr.com"] },
  { pattern: /新浪/i, domains: ["sina.com.cn", "finance.sina.com.cn", "news.sina.com.cn"] },
  { pattern: /腾讯|QQ/i, domains: ["qq.com", "news.qq.com"] },
  { pattern: /澎湃/i, domains: ["thepaper.cn"] },
  { pattern: /界面/i, domains: ["jiemian.com"] },
  { pattern: /第一财经/i, domains: ["yicai.com"] },
  { pattern: /财联社/i, domains: ["cls.cn"] },
];

function decodeHtml(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync("curl", [
      "--silent",
      "--show-error",
      "--location",
      "--max-time",
      "20",
      "--retry",
      "1",
      "--retry-delay",
      "1",
      "--user-agent",
      userAgent,
      url,
    ]);

    return stdout || null;
  } catch {
    return null;
  }
}

function parseMetaContent(html: string, key: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${key}["']`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return decodeHtml(match[1].trim());
    }
  }

  return null;
}

function decodeDuckDuckGoRedirect(url: string): string | null {
  const normalized = url.startsWith("//") ? `https:${url}` : url;

  try {
    const parsed = new URL(normalized);
    const candidate = parsed.searchParams.get("uddg");
    return candidate ? decodeURIComponent(candidate) : null;
  } catch {
    return null;
  }
}

function pickMatchingSourceUrl(urls: string[], source: string): string | null {
  const normalizedSource = source.trim();
  const hints = sourceDomainHints.find(({ pattern }) => pattern.test(normalizedSource))?.domains ?? [];

  if (hints.length > 0) {
    const matched = urls.find((candidate) => hints.some((domain) => candidate.includes(domain)));
    if (matched) {
      return matched;
    }
  }

  return urls.find(
    (candidate) =>
      !/news\.google\.com|duckduckgo\.com|linkedin\.com|youtube\.com|x\.com|twitter\.com/i.test(
        candidate,
      ),
  ) ?? null;
}

function normalizeForCompare(value: string): string {
  return value
    .toLowerCase()
    .replace(/[“”"'`’‘]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

async function resolveCanonicalUrl(item: BriefItem): Promise<string | null> {
  const query = `${item.title} ${item.source}`;
  const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const html = await fetchHtml(searchUrl);

  if (!html) {
    return null;
  }

  const matches = [...html.matchAll(/href="([^"]*duckduckgo\.com\/l\/\?uddg=[^"]+)"/gi)]
    .map((match) => decodeDuckDuckGoRedirect(match[1]))
    .filter((candidate): candidate is string => Boolean(candidate));

  return pickMatchingSourceUrl(matches, item.source);
}

function isUsableImageUrl(url: string): boolean {
  if (
    /google_news_\d+\.png|gnews\/logo|logo|avatar|favicon|icon/i.test(url)
  ) {
    return false;
  }

  return /^https?:\/\//i.test(url);
}

function isDirectArticleUrl(url: string): boolean {
  return /^https?:\/\//i.test(url) && !/news\.google\.com|duckduckgo\.com/i.test(url);
}

async function resolveArticleImage(url: string): Promise<string | null> {
  const html = await fetchHtml(url);

  if (!html) {
    return null;
  }

  const imageUrl =
    parseMetaContent(html, "og:image") ??
    parseMetaContent(html, "og:image:secure_url") ??
    parseMetaContent(html, "twitter:image") ??
    parseMetaContent(html, "twitter:image:src");

  if (!imageUrl) {
    return null;
  }

  if (!isUsableImageUrl(imageUrl)) {
    return null;
  }

  return imageUrl;
}

async function enrichItem(item: BriefItem): Promise<BriefItem> {
  if (item.imageUrl && isUsableImageUrl(item.imageUrl) && item.canonicalUrl) {
    return item;
  }

  const canonicalUrl = item.canonicalUrl ?? (await resolveCanonicalUrl(item));
  const imageTargetUrl = canonicalUrl ?? (isDirectArticleUrl(item.url) ? item.url : null);
  const imageUrl =
    item.imageUrl && isUsableImageUrl(item.imageUrl)
      ? item.imageUrl
      : imageTargetUrl
        ? await resolveArticleImage(imageTargetUrl)
        : null;

  return {
    ...item,
    canonicalUrl: canonicalUrl ?? item.canonicalUrl,
    imageUrl: imageUrl ?? item.imageUrl,
  };
}

function collectUniqueItems(brief: DailyBrief): BriefItem[] {
  const allItems = [
    brief.leadStory,
    ...brief.topHighlights,
    ...brief.sections.flatMap((section) => section.items),
  ];

  const unique = new Map<string, BriefItem>();

  for (const item of allItems) {
    const key = normalizeForCompare(`${item.source}:${item.title}:${item.publishedAt}`);
    if (!unique.has(key)) {
      unique.set(key, item);
    }
  }

  return [...unique.values()];
}

export async function enrichBrief(brief: DailyBrief): Promise<DailyBrief> {
  const uniqueItems = collectUniqueItems(brief);
  const enrichedPairs = await Promise.all(
    uniqueItems.map(async (item) => [
      normalizeForCompare(`${item.source}:${item.title}:${item.publishedAt}`),
      await enrichItem(item),
    ] as const),
  );
  const enrichedMap = new Map(enrichedPairs);
  const readEnriched = (item: BriefItem): BriefItem =>
    enrichedMap.get(normalizeForCompare(`${item.source}:${item.title}:${item.publishedAt}`)) ?? item;

  return {
    ...brief,
    leadStory: readEnriched(brief.leadStory),
    topHighlights: brief.topHighlights.map(readEnriched),
    sections: brief.sections.map((section) => ({
      ...section,
      items: section.items.map(readEnriched),
    })),
  };
}
