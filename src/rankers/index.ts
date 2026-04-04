import type { BriefSectionConfig, NewsItem } from "@/types/brief";

const preferredSourcePatterns: Record<BriefSectionConfig["key"], RegExp[]> = {
  ai: [
    /36kr/i,
    /雷峰网/i,
    /机器之心/i,
    /智东西/i,
    /极客公园/i,
    /axios/i,
    /business insider/i,
    /wsj/i,
    /techcrunch/i,
    /cnbc/i,
    /reuters/i,
    /financial times/i,
    /the information/i,
    /the verge/i,
    /openai/i,
    /anthropic/i,
    /google/i,
    /meta/i,
    /microsoft/i,
  ],
  "autonomous-driving": [
    /财联社/i,
    /36kr/i,
    /雷峰网/i,
    /盖世汽车/i,
    /亿欧汽车/i,
    /极客公园/i,
    /智东西/i,
    /华为/i,
    /小鹏/i,
    /理想/i,
    /百度/i,
    /文远/i,
    /小马智行/i,
    /momenta/i,
    /business insider/i,
    /reuters/i,
    /wsj/i,
    /financial times/i,
    /techcrunch/i,
    /the verge/i,
    /waymo/i,
    /uber/i,
    /tesla/i,
    /mobileye/i,
    /zoox/i,
    /aurora/i,
    /nuro/i,
  ],
  "embodied-intelligence": [
    /财联社/i,
    /36kr/i,
    /雷峰网/i,
    /机器之心/i,
    /智东西/i,
    /figure/i,
    /unitree/i,
    /ieee/i,
    /spectrum/i,
    /techcrunch/i,
    /the verge/i,
    /reuters/i,
    /business insider/i,
    /boston dynamics/i,
    /agility robotics/i,
    /apptronik/i,
  ],
  world: [
    /reuters/i,
    /associated press/i,
    /\bap\b/i,
    /financial times/i,
    /\bwsj\b/i,
    /bloomberg/i,
    /cnbc/i,
    /the economist/i,
  ],
  business: [
    /第一财经/i,
    /财联社/i,
    /界面/i,
    /36kr/i,
    /financial times/i,
    /\bwsj\b/i,
    /reuters/i,
    /cnbc/i,
    /bloomberg/i,
    /the information/i,
    /business insider/i,
    /第一财经/i,
    /财联社/i,
    /界面/i,
    /36kr/i,
  ],
};

function extractEntityKey(title: string): string | null {
  const patterns: Array<[RegExp, string]> = [
    [/openai/i, "openai"],
    [/anthropic/i, "anthropic"],
    [/meta/i, "meta"],
    [/microsoft/i, "microsoft"],
    [/nvidia/i, "nvidia"],
    [/google|deepmind|gemini/i, "google"],
    [/腾讯|tencent/i, "tencent"],
    [/阿里|alibaba/i, "alibaba"],
    [/百度|baidu|萝卜快跑/i, "baidu"],
    [/华为|huawei/i, "huawei"],
    [/月之暗面|kimi/i, "moonshot"],
    [/智谱/i, "zhipu"],
    [/特斯拉|tesla/i, "tesla"],
    [/waymo/i, "waymo"],
    [/uber/i, "uber"],
    [/福特|ford/i, "ford"],
    [/mobileye/i, "mobileye"],
    [/zoox/i, "zoox"],
    [/aurora/i, "aurora"],
    [/比亚迪|byd/i, "byd"],
    [/小鹏|xpeng/i, "xpeng"],
    [/理想|li auto/i, "li-auto"],
    [/文远|weride/i, "weride"],
    [/小马智行|pony\.?ai/i, "pony-ai"],
    [/momenta/i, "momenta"],
    [/figure/i, "figure"],
    [/unitree|宇树/i, "unitree"],
    [/boston dynamics/i, "boston-dynamics"],
    [/agility robotics/i, "agility-robotics"],
    [/apptronik/i, "apptronik"],
  ];

  for (const [pattern, key] of patterns) {
    if (pattern.test(title)) {
      return key;
    }
  }

  return null;
}

function isDirectSourceUrl(url: string): boolean {
  return !/news\.google\.com|duckduckgo\.com/i.test(url);
}

function editorialScore(item: NewsItem, sectionKey: BriefSectionConfig["key"]): number {
  const baseScore = item.score ?? 0;
  const preferredBoost = preferredSourcePatterns[sectionKey].some((pattern) => pattern.test(item.source))
    ? 12
    : 0;
  const registryBoost = item.sourceId ? 22 : 0;
  const directLinkBoost = isDirectSourceUrl(item.url) ? 18 : 0;
  const imageBoost = item.imageUrl ? 10 : 0;
  const chinaBoost =
    item.region === "china"
      ? sectionKey === "autonomous-driving"
        ? 24
        : sectionKey === "ai"
          ? 12
          : sectionKey === "embodied-intelligence" || sectionKey === "business"
            ? 10
            : 0
      : 0;

  return baseScore + preferredBoost + registryBoost + directLinkBoost + imageBoost + chinaBoost;
}

function pickChinaQuota(section: BriefSectionConfig): number {
  if (!section.regions?.includes("china")) {
    return 0;
  }

  if (section.key === "autonomous-driving") {
    return Math.min(2, section.targetItems - 1);
  }

  if (section.key === "ai" || section.key === "embodied-intelligence" || section.key === "business") {
    return 1;
  }

  return 0;
}

export function pickSectionCandidates(
  items: NewsItem[],
  section: BriefSectionConfig,
): NewsItem[] {
  const candidates = items
    .filter((item) => section.topics.includes(item.topic))
    .filter((item) => !section.regions || section.regions.includes(item.region))
    .sort((left, right) => editorialScore(right, section.key) - editorialScore(left, section.key));
  const preferredCandidates = candidates.filter(
    (item) =>
      item.sourceId ||
      preferredSourcePatterns[section.key].some((pattern) => pattern.test(item.source)) ||
      isDirectSourceUrl(item.url),
  );
  const editorialPool = preferredCandidates.length > 0 ? preferredCandidates : candidates;

  const picked: NewsItem[] = [];
  const perSourceCount = new Map<string, number>();
  const entityCounts = new Map<string, number>();
  const chinaQuota = pickChinaQuota(section);

  function canPick(item: NewsItem) {
    const count = perSourceCount.get(item.source) ?? 0;
    const maxPerSource = section.targetItems >= 3 ? 1 : 2;
    const entityKey = extractEntityKey(item.title);
    const entityCount = entityKey ? entityCounts.get(entityKey) ?? 0 : 0;

    return !(count >= maxPerSource || entityCount >= 1);
  }

  function commitPick(item: NewsItem) {
    const count = perSourceCount.get(item.source) ?? 0;
    const entityKey = extractEntityKey(item.title);
    const entityCount = entityKey ? entityCounts.get(entityKey) ?? 0 : 0;
    picked.push(item);
    perSourceCount.set(item.source, count + 1);
    if (entityKey) {
      entityCounts.set(entityKey, entityCount + 1);
    }
  }

  for (const item of editorialPool.filter((candidate) => candidate.region === "china")) {
    if (!canPick(item)) {
      continue;
    }

    commitPick(item);

    if (picked.length === chinaQuota) {
      break;
    }
  }

  for (const item of editorialPool) {
    if (!canPick(item)) {
      continue;
    }

    commitPick(item);

    if (picked.length === section.targetItems) {
      break;
    }
  }

  return picked;
}
