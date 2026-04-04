import path from "node:path";
import { promises as fs } from "node:fs";

import staticIssue20260402 from "@/data/intelly/issues/2026-04-02.json";
import staticIssue20260403 from "@/data/intelly/issues/2026-04-03.json";
import staticIssue20260404 from "@/data/intelly/issues/2026-04-04.json";
import { getIntellyCheckinStatus, readIntellyCheckinVersion } from "@/lib/intelly-checkins";
import { buildDeck, buildDisplayTitle, formatPublishedAt, formatSourceLabel } from "@/lib/brief-format";
import { readLatestBrief } from "@/lib/latest-brief";
import type { DailyBrief } from "@/types/brief";
import type { IntellyIssueArchiveEntry, IntellyIssueView, IntellySection } from "@/types/intelly";

const staticIssueMap: Record<string, IntellyIssueView> = {
  "2026-04-04": staticIssue20260404 as IntellyIssueView,
  "2026-04-03": staticIssue20260403 as IntellyIssueView,
  "2026-04-02": staticIssue20260402 as IntellyIssueView,
};

const orderedStaticIssueDates = Object.keys(staticIssueMap).sort((left, right) =>
  right.localeCompare(left),
);

const sectionPresets: Record<
  string,
  Pick<IntellySection, "title" | "strap" | "tone" | "visual">
> = {
  ai: {
    title: "AI",
    strap: "模型、平台、产品与公司动作",
    tone: "优先看真实产品动作、商业化信号和头部公司竞争节奏。",
    visual: {
      accent: "#2457d6",
      surface: "bg-[linear-gradient(180deg,#f4f8ff_0%,#fbfcfd_100%)]",
      ring: "ring-[#d6e3fb]",
    },
  },
  "autonomous-driving": {
    title: "智能驾驶",
    strap: "量产、运营、合规与安全",
    tone: "更值得比较真实运营进度、监管信号和高阶辅助驾驶能力。",
    visual: {
      accent: "#0f766e",
      surface: "bg-[linear-gradient(180deg,#f2fbf9_0%,#fbfcfd_100%)]",
      ring: "ring-[#d5ece8]",
    },
  },
  "embodied-intelligence": {
    title: "具身智能",
    strap: "机器人、场景验证与交付进度",
    tone: "重点看机器人产品化、场景密度和真实部署，而不是只看演示视频。",
    visual: {
      accent: "#b45309",
      surface: "bg-[linear-gradient(180deg,#fff8ef_0%,#fbfcfd_100%)]",
      ring: "ring-[#f1dcc2]",
    },
  },
  world: {
    title: "全球要闻",
    strap: "国际变量、政策与地缘环境",
    tone: "用来补足影响科技与商业判断的外部变量，而不是重复产业新闻。",
    visual: {
      accent: "#475569",
      surface: "bg-[linear-gradient(180deg,#f5f7fb_0%,#fbfcfd_100%)]",
      ring: "ring-[#dbe2ea]",
    },
  },
  business: {
    title: "商业趋势",
    strap: "公司财报、交易、资本与市场情绪",
    tone: "重点看公司动作、融资交易和市场风险偏好的结构性变化。",
    visual: {
      accent: "#7c3aed",
      surface: "bg-[linear-gradient(180deg,#f8f5ff_0%,#fbfcfd_100%)]",
      ring: "ring-[#e6dcfb]",
    },
  },
};

function isPlaceholderUrl(url: string): boolean {
  return /example\.com/i.test(url);
}

function isNonNullable<T>(value: T | null | undefined): value is T {
  return value != null;
}

function normalizeImageUrl(url?: string | null): string | undefined {
  if (!url || url.trim().length === 0 || isPlaceholderUrl(url)) {
    return undefined;
  }

  return url;
}

function isAggregatorUrl(url: string): boolean {
  return /news\.google\.com|duckduckgo\.com/i.test(url);
}

function buildStaticArchiveEntry(issue: IntellyIssueView): IntellyIssueArchiveEntry {
  return {
    issueDate: issue.issueDate,
    headline: issue.headline,
    leadTitle: issue.leadStory.title,
    leadSourceName: issue.leadStory.sourceName,
    sectionCount: issue.sections.length,
  };
}

async function listArtifactDates(): Promise<string[]> {
  const artifactsDir = path.join(process.cwd(), "artifacts");

  try {
    const files = await fs.readdir(artifactsDir);
    return files
      .filter((file) => /^daily-brief-\d{4}-\d{2}-\d{2}\.json$/.test(file))
      .map((file) => file.replace(/^daily-brief-/, "").replace(/\.json$/, ""))
      .sort((left, right) => right.localeCompare(left));
  } catch {
    return [];
  }
}

async function readBriefByDate(issueDate: string): Promise<DailyBrief | null> {
  const filePath = path.join(process.cwd(), "artifacts", `daily-brief-${issueDate}.json`);

  try {
    const payload = await fs.readFile(filePath, "utf8");
    return JSON.parse(payload) as DailyBrief;
  } catch {
    return null;
  }
}

async function readBriefVersion(issueDate: string): Promise<string> {
  const filePath = path.join(process.cwd(), "artifacts", `daily-brief-${issueDate}.json`);

  try {
    const stat = await fs.stat(filePath);
    return `${issueDate}:${stat.mtimeMs}`;
  } catch {
    return issueDate;
  }
}

function estimateReadTime(text: string): string {
  const normalizedLength = text.replace(/\s+/g, "").length;
  const minutes = Math.max(2, Math.min(8, Math.ceil(normalizedLength / 220)));
  return `预计 ${minutes} 分钟读完`;
}

function buildHighlights(brief: DailyBrief): IntellyIssueView["highlights"] {
  return [
    {
      label: "今日判断",
      text: brief.trendLine,
    },
    ...brief.topHighlights.slice(0, 2).map((item, index) => ({
      label: index === 0 ? "重点追踪" : "继续阅读",
      text: buildDisplayTitle(item),
    })),
  ];
}

function buildIssueSection(section: DailyBrief["sections"][number]): IntellySection | null {
  const preset = sectionPresets[section.key];
  if (!preset) {
    return null;
  }

  const validItems = section.items.filter((item) => !isPlaceholderUrl(item.url));
  const stories = validItems.slice(0, 3).map((item) => ({
    title: buildDisplayTitle(item),
    sourceName: formatSourceLabel(item.source),
    url: item.canonicalUrl ?? item.url,
    isCanonicalLink: !isAggregatorUrl(item.canonicalUrl ?? item.url),
  }));

  if (stories.length === 0) {
    return {
      key: section.key,
      title: preset.title,
      strap: preset.strap,
      tone: "今天这一栏还没有筛出足够可靠、值得放上首页的内容，我们保留版位并继续补强信源。",
      visual: preset.visual,
      stories: [],
      status: "gap",
      note: "当前候选不足，暂不展示低质量或占位新闻。",
    };
  }

  const featuredItem = validItems[0] ?? section.items[0];
  const imageCandidate = section.items
    .map((item) => normalizeImageUrl(item.imageUrl))
    .find(isNonNullable);

  return {
    key: section.key,
    title: preset.title,
    strap: preset.strap,
    tone: featuredItem ? buildDeck(featuredItem) : preset.tone,
    image: imageCandidate,
    visual: preset.visual,
    stories,
    status: "ready",
  };
}

async function convertBriefToIssueView(
  brief: DailyBrief,
  userEmail?: string | null,
): Promise<IntellyIssueView> {
  const visibleSections = brief.sections.map(buildIssueSection).filter(isNonNullable);

  const lead = brief.leadStory;
  const fallbackLeadImage = visibleSections.find((section) => section.image)?.image;
  const leadUrl = lead.canonicalUrl ?? lead.url;
  const totalItems = visibleSections.reduce((total, section) => total + section.stories.length, 0);
  const checkinStatus = await getIntellyCheckinStatus(
    userEmail,
    brief.date,
    visibleSections.length,
    totalItems,
  );

  return {
    issueDate: brief.date,
    headline: buildDisplayTitle(lead),
    trendLine: brief.trendLine,
    leadStory: {
      title: buildDisplayTitle(lead),
      summary: buildDeck(lead),
      meta: `${formatSourceLabel(lead.source)} / ${formatPublishedAt(lead.publishedAt)}`,
      image: normalizeImageUrl(lead.imageUrl) ?? fallbackLeadImage,
      readTime: estimateReadTime(`${lead.title} ${lead.summary} ${lead.whyItMatters}`),
      sourceName: formatSourceLabel(lead.source),
      url: leadUrl,
      isCanonicalLink: !isAggregatorUrl(leadUrl),
    },
    highlights: buildHighlights(brief),
    sections: visibleSections,
    checkinStatus,
  };
}

const issueViewCache = new Map<string, Promise<IntellyIssueView>>();

function readCachedIssueView(cacheKey: string, loader: () => Promise<IntellyIssueView>) {
  const cached = issueViewCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const next = loader().catch((error) => {
    issueViewCache.delete(cacheKey);
    throw error;
  });
  issueViewCache.set(cacheKey, next);
  return next;
}

export async function listIntellyIssues(limit?: number): Promise<IntellyIssueArchiveEntry[]> {
  const artifactDates = await listArtifactDates();
  const archiveEntries = await Promise.all(
    artifactDates.slice(0, limit ?? artifactDates.length).map(async (issueDate) => {
      const brief = await readBriefByDate(issueDate);
      if (!brief) {
        return null;
      }

      return {
        issueDate: brief.date,
        headline: buildDisplayTitle(brief.leadStory),
        leadTitle: buildDisplayTitle(brief.leadStory),
        leadSourceName: formatSourceLabel(brief.leadStory.source),
        sectionCount: brief.sections.length,
      } satisfies IntellyIssueArchiveEntry;
    }),
  );

  const validEntries = archiveEntries.filter(
    (entry): entry is IntellyIssueArchiveEntry => Boolean(entry),
  );

  if (validEntries.length > 0) {
    return validEntries;
  }

  return orderedStaticIssueDates.map((issueDate) => buildStaticArchiveEntry(staticIssueMap[issueDate]));
}

export async function getIntellyTodayIssue(userEmail?: string | null): Promise<IntellyIssueView> {
  const latestBrief = await readLatestBrief();

  if (latestBrief) {
    const [briefVersion, checkinVersion] = await Promise.all([
      readBriefVersion(latestBrief.date),
      readIntellyCheckinVersion(),
    ]);
    const cacheKey = `${briefVersion}:${checkinVersion}:${userEmail ?? "guest"}`;
    return readCachedIssueView(cacheKey, async () => {
      return await convertBriefToIssueView(latestBrief, userEmail);
    });
  }

  return staticIssueMap[orderedStaticIssueDates[0]];
}

export async function getIntellyIssueByDate(
  issueDate: string,
  userEmail?: string | null,
): Promise<IntellyIssueView | null> {
  const brief = await readBriefByDate(issueDate);

  if (brief) {
    const [briefVersion, checkinVersion] = await Promise.all([
      readBriefVersion(issueDate),
      readIntellyCheckinVersion(),
    ]);
    const cacheKey = `${briefVersion}:${checkinVersion}:${userEmail ?? "guest"}`;
    return readCachedIssueView(cacheKey, async () => {
      return await convertBriefToIssueView(brief, userEmail);
    });
  }

  return staticIssueMap[issueDate] ?? null;
}
