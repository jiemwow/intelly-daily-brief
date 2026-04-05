import type { BriefItem, DailyBrief } from "@/types/brief";

export type StoryLocator =
  | { kind: "lead" }
  | { kind: "highlight"; index: number }
  | { kind: "section"; sectionKey: string; index: number };

export type StoryDetail = {
  issueDate: string;
  title: string;
  summary: string;
  whyItMatters: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  originalUrl: string;
  canonicalUrl?: string;
  sectionKey?: string;
  sectionTitle: string;
  storyId: string;
};

export function buildStoryId(locator: StoryLocator): string {
  if (locator.kind === "lead") {
    return "lead";
  }

  if (locator.kind === "highlight") {
    return `highlight-${locator.index + 1}`;
  }

  return `${locator.sectionKey}-${locator.index + 1}`;
}

export function buildStoryHref(issueDate: string, locator: StoryLocator): string {
  return `/issues/${issueDate}/story/${buildStoryId(locator)}`;
}

export function getStoryDetail(brief: DailyBrief, storyId: string): StoryDetail | null {
  if (storyId === "lead") {
    return mapStory(brief, brief.leadStory, "头条主稿", "lead");
  }

  const highlightMatch = /^highlight-(\d+)$/.exec(storyId);
  if (highlightMatch) {
    const index = Number(highlightMatch[1]) - 1;
    const item = brief.topHighlights[index];
    if (!item) {
      return null;
    }

    return mapStory(brief, item, "今日重点", storyId);
  }

  const sectionMatch = /^([a-z-]+)-(\d+)$/.exec(storyId);
  if (!sectionMatch) {
    return null;
  }

  const [, sectionKey, rawIndex] = sectionMatch;
  const index = Number(rawIndex) - 1;
  const section = brief.sections.find((item) => item.key === sectionKey);
  const item = section?.items[index];
  if (!section || !item) {
    return null;
  }

  return mapStory(brief, item, section.title, storyId, section.key);
}

function mapStory(
  brief: DailyBrief,
  item: BriefItem,
  sectionTitle: string,
  storyId: string,
  sectionKey?: string,
): StoryDetail {
  return {
    issueDate: brief.date,
    title: item.title,
    summary: item.summary,
    whyItMatters: item.whyItMatters,
    source: item.source,
    publishedAt: item.publishedAt,
    imageUrl: item.imageUrl,
    originalUrl: item.canonicalUrl ?? item.url,
    canonicalUrl: item.canonicalUrl,
    sectionKey,
    sectionTitle,
    storyId,
  };
}
