import { resolveBriefRecipient, sectionConfigs } from "@/config/brief";
import { collectNews } from "@/collectors";
import { formatIsoDate } from "@/lib/date";
import { pickSectionCandidates } from "@/rankers";
import { summarizeEditorialPackage } from "@/summarizers";
import type { BriefItem, DailyBrief, NewsItem } from "@/types/brief";

const leadPreferredSourcePatterns = [
  /reuters/i,
  /financial times/i,
  /\bwsj\b/i,
  /techcrunch/i,
  /the verge/i,
  /business insider/i,
  /36kr/i,
  /财联社/i,
  /第一财经/i,
  /界面/i,
  /澎湃/i,
  /新浪/i,
];

function isDirectSourceUrl(url: string): boolean {
  return !/news\.google\.com|duckduckgo\.com/i.test(url);
}

function leadEditorialScore(item: NewsItem): number {
  const sourceBoost = leadPreferredSourcePatterns.some((pattern) => pattern.test(item.source)) ? 18 : 0;
  const chinaBoost = /[\u4e00-\u9fff]/.test(item.title) ? 4 : 0;
  const registryBoost = item.sourceId ? 24 : 0;
  const directLinkBoost = isDirectSourceUrl(item.url) ? 18 : 0;
  const imageBoost = item.imageUrl ? 12 : 0;

  return (item.score ?? 0) + sourceBoost + chinaBoost + registryBoost + directLinkBoost + imageBoost;
}

function buildPlaceholderItem(sectionTitle: string): BriefItem {
  return {
    title: `${sectionTitle}板块已完成基础搭建`,
    summary:
      "当前结果暂时没有抓到足够的高质量候选新闻，后续会继续扩展信源与排序规则。",
    whyItMatters:
      "占位内容用于保证简报结构完整，也提醒我们当前版块还需要继续补强采集覆盖和热点判断。",
    source: "系统占位",
    publishedAt: new Date().toISOString(),
    url: "https://example.com",
  };
}

function pickLeadCandidate(items: NewsItem[]): NewsItem | null {
  if (items.length === 0) {
    return null;
  }

  return [...items].sort((left, right) => {
    return leadEditorialScore(right) - leadEditorialScore(left);
  })[0];
}

function chooseLeadCandidate(
  editorialLeadCandidate: NewsItem | null,
  rankedLeadCandidate: NewsItem | null,
): NewsItem | null {
  if (!editorialLeadCandidate) {
    return rankedLeadCandidate;
  }

  if (!rankedLeadCandidate) {
    return editorialLeadCandidate;
  }

  return leadEditorialScore(rankedLeadCandidate) > leadEditorialScore(editorialLeadCandidate)
    ? rankedLeadCandidate
    : editorialLeadCandidate;
}

export async function collectCandidateNews(): Promise<NewsItem[]> {
  return collectNews();
}

export async function generateDailyBrief(now = new Date()): Promise<DailyBrief> {
  const items = await collectCandidateNews();
  const sectionEntries = sectionConfigs.map((section) => {
    const candidates = pickSectionCandidates(items, section);
    const selectedCandidates =
      candidates.length > 0
        ? candidates.slice(0, section.targetItems)
        : [
            {
              id: `placeholder-${section.key}`,
              title: `${section.title}暂未检出足够可靠的头条`,
              summary: "当前这一栏尚未抓到足够可靠的一手候选，系统已保留版位并等待下一轮补强。",
              whyItMatters:
                "对高质量晨报来说，宁可少发，也不应该用低质量或不相关的新闻填满版面。",
              source: "系统提示",
              publishedAt: new Date().toISOString(),
              url: "https://example.com",
              region: section.regions?.[0] ?? "global",
              topic: section.topics[0],
              score: 0,
            },
          ];

    return {
      section,
      items: selectedCandidates,
    };
  });

  const selectedItems = sectionEntries.flatMap((entry) => entry.items);
  const editorialPackage = await summarizeEditorialPackage(selectedItems);

  const leadCandidate = chooseLeadCandidate(
    selectedItems.find((item) => item.id === editorialPackage.leadId) ?? null,
    pickLeadCandidate(selectedItems),
  );
  const leadStory = leadCandidate
    ? editorialPackage.items.get(leadCandidate.id) ?? buildPlaceholderItem("头版主稿")
    : buildPlaceholderItem("头版主稿");

  const topHighlights = selectedItems
    .filter((item) => item.id !== leadCandidate?.id)
    .filter(
      (item, index, list) =>
        list.findIndex(
          (candidate) =>
            candidate.region === item.region &&
            candidate.topic === item.topic &&
            candidate.source === item.source,
        ) === index,
    )
    .slice(0, 3)
    .map((item) => editorialPackage.items.get(item.id) ?? buildPlaceholderItem("今日重点"));

  return {
    date: formatIsoDate(now),
    recipient: resolveBriefRecipient(),
    headline: "每日简报 | AI、智能驾驶、具身智能与商业要闻",
    trendLine:
      editorialPackage.trendLine ??
      "过去二十四小时，AI、智能驾驶、具身智能与全球商业环境同时出现新信号，值得按板块快速扫读。",
    leadStory,
    topHighlights,
    sections: sectionEntries.map(({ section, items: sectionItems }) => {
      const summarized = sectionItems.map(
        (item) => editorialPackage.items.get(item.id) ?? buildPlaceholderItem(section.title),
      );
      return {
        key: section.key,
        title: section.title,
        items: summarized,
      };
    }),
  };
}
