import type { BriefItem, DailyBrief } from "@/types/brief";
import {
  buildDeck,
  buildDisplayTitle,
  formatPublishedAt,
  formatSourceLabel,
} from "@/lib/brief-format";

type PushPreviewEntry = {
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  note: string;
};

export type PushPreviewPayload = {
  title: string;
  summary: string;
  markdown: string;
  text: string;
  compactText: string;
  returnUrl: string;
  sections: Array<{
    title: string;
    items: PushPreviewEntry[];
  }>;
};

function resolveLink(item: BriefItem): string {
  return item.canonicalUrl ?? item.url;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function renderEntryMarkdown(item: BriefItem): string {
  const title = buildDisplayTitle(item);
  const source = formatSourceLabel(item.source);
  const publishedAt = formatPublishedAt(item.publishedAt);
  const link = resolveLink(item);
  const note = normalizeText(item.whyItMatters);

  return [
    `- ${title}`,
    `  - 来源：${source} · ${publishedAt}`,
    `  - 摘要：${normalizeText(buildDeck(item))}`,
    `  - 重点：${note}`,
    `  - 链接：${link}`,
  ].join("\n");
}

function renderEntryText(item: BriefItem): string {
  const title = buildDisplayTitle(item);
  const source = formatSourceLabel(item.source);
  const publishedAt = formatPublishedAt(item.publishedAt);
  const link = resolveLink(item);
  const note = normalizeText(item.whyItMatters);

  return [
    `- ${title}`,
    `  来源: ${source} · ${publishedAt}`,
    `  摘要: ${normalizeText(buildDeck(item))}`,
    `  重点: ${note}`,
    `  链接: ${link}`,
  ].join("\n");
}

function renderSectionMarkdown(title: string, items: BriefItem[]): string {
  const body = items.map((item) => renderEntryMarkdown(item)).join("\n");
  return `## ${title}\n${body}`;
}

function renderSectionText(title: string, items: BriefItem[]): string {
  const body = items.map((item) => renderEntryText(item)).join("\n");
  return `${title}\n${body}`;
}

export function buildPushPreviewPayload(brief: DailyBrief): PushPreviewPayload {
  const leadStory = brief.leadStory;
  const title = `今日简报 · ${brief.date}`;
  const summary = brief.trendLine;
  const returnUrl = `${process.env.APP_BASE_URL ?? "http://127.0.0.1:3002"}/issues/${brief.date}`;

  const sections = brief.sections.map((section) => ({
    title: section.title,
    items: section.items.slice(0, 3).map((item) => ({
      title: buildDisplayTitle(item),
      source: formatSourceLabel(item.source),
      publishedAt: formatPublishedAt(item.publishedAt),
      url: resolveLink(item),
      note: normalizeText(item.whyItMatters),
    })),
  }));

  const compactText = [
    title,
    normalizeText(summary),
    `回站阅读：${returnUrl}`,
    "",
    `头条：${buildDisplayTitle(leadStory)}`,
    `来源：${formatSourceLabel(leadStory.source)}`,
    `链接：${resolveLink(leadStory)}`,
    "",
    ...brief.sections.map((section) => {
      const leadItem = section.items[0];
      return leadItem
        ? `${section.title}：${buildDisplayTitle(leadItem)}\n${resolveLink(leadItem)}`
        : `${section.title}：今日待补强`;
    }),
  ].join("\n");

  const markdown = [
    `# ${title}`,
    ``,
    `> ${normalizeText(brief.trendLine)}`,
    ``,
    `## 头条`,
    renderEntryMarkdown(leadStory),
    ``,
    `## 今日重点`,
    ...brief.topHighlights.map((item) => `- ${buildDisplayTitle(item)}`),
    ``,
    ...brief.sections.map((section) => renderSectionMarkdown(section.title, section.items.slice(0, 3))),
  ].join("\n");

  const text = [
    `${title}`,
    `${normalizeText(brief.trendLine)}`,
    ``,
    `头条`,
    renderEntryText(leadStory),
    ``,
    `今日重点`,
    ...brief.topHighlights.map((item) => `- ${buildDisplayTitle(item)}`),
    ``,
    ...brief.sections.map((section) => renderSectionText(section.title, section.items.slice(0, 3))),
  ].join("\n");

  return {
    title,
    summary,
    markdown,
    text,
    compactText,
    returnUrl,
    sections,
  };
}
