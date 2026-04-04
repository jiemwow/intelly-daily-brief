import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";

import { CheckinPanel } from "@/components/checkin-panel";
import { sectionConfigs } from "@/config/brief";
import { siteConfig } from "@/config/site";
import {
  buildDeck,
  buildDisplayTitle,
  formatPublishedAt,
  formatSourceLabel,
} from "@/lib/brief-format";
import { getIntellyTodayIssue } from "@/lib/intelly-issues";
import { readLatestBrief } from "@/lib/latest-brief";
import { INTELLY_SESSION_COOKIE } from "@/lib/intelly-user";
import type { BriefItem, BriefSection } from "@/types/brief";

export const dynamic = "force-dynamic";

function fallbackItem(title: string): BriefItem {
  return {
    title,
    summary: "今日简报尚未生成，请稍后刷新查看最新内容。",
    whyItMatters: "系统正在等待最新一期日报生成完成。",
    source: "系统",
    publishedAt: new Date().toISOString(),
    url: "https://example.com",
  };
}

function resolveItemLink(item: BriefItem): string {
  return item.canonicalUrl ?? item.url;
}

function renderItemCtaLabel(item: BriefItem): string {
  return item.canonicalUrl ? "查看原文" : "查看聚合页";
}

function imageVariant(url: string | undefined, width: number): string | undefined {
  if (!url) {
    return undefined;
  }

  return url.replace(/=s0-w\d+(-rw)?$/i, `=s0-w${width}-rw`);
}

function visibleSections(sections: BriefSection[]): Array<BriefSection & { visibleItems: BriefItem[] }> {
  return sections
    .map((section) => ({
      ...section,
      visibleItems: section.items.slice(0, 3),
    }))
    .filter((section) => section.visibleItems.length > 0);
}

function collectUniqueSources(items: BriefItem[]): number {
  return new Set(items.map((item) => formatSourceLabel(item.source))).size;
}

function pickHeroVisual(
  lead: BriefItem,
): { item: BriefItem | null; isLeadImage: boolean } {
  if (lead.imageUrl) {
    return { item: lead, isLeadImage: true };
  }

  return {
    item: null,
    isLeadImage: false,
  };
}

function formatIssueLabel(date: string | undefined): string {
  if (!date) {
    return "今日刊";
  }

  return date.replaceAll("-", ".");
}

function summaryText(item: BriefItem): string {
  return buildDeck(item)
    .replace(/\s+(Jiemian\.com|jiemian\.com|MarkTechPost|AP News|Reuters|NYT World|NYT Business)$/i, "")
    .trim();
}

function SectionStory({
  item,
}: {
  item: BriefItem;
}) {
  const imageUrl = imageVariant(item.imageUrl, 720);

  return (
    <article className="grid gap-4 border-t border-slate-900/10 pt-4 first:border-t-0 first:pt-0">
      {imageUrl ? (
        <div className="relative aspect-[16/9] overflow-hidden rounded-[20px] border border-slate-900/10 bg-slate-100">
          <Image
            src={imageUrl}
            alt={buildDisplayTitle(item)}
            fill
            unoptimized
            sizes="(min-width: 1024px) 28vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(15,23,42,0.1)_100%)]" />
        </div>
      ) : null}
      <div>
        <div className="text-[0.72rem] tracking-[0.14em] text-slate-500">
          {formatSourceLabel(item.source)} / {formatPublishedAt(item.publishedAt)}
        </div>
        <h3 className="mt-2 text-[1.08rem] font-semibold leading-7 tracking-[-0.025em] text-slate-950">
          <a
            href={resolveItemLink(item)}
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-[#2457d6]"
          >
            {buildDisplayTitle(item)}
          </a>
        </h3>
        <p className="mt-2 text-[0.93rem] leading-7 text-slate-700">{buildDeck(item)}</p>
        <a
          href={resolveItemLink(item)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex text-[0.8rem] font-medium text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-[#2457d6] hover:decoration-[#2457d6]"
        >
          {renderItemCtaLabel(item)}
        </a>
      </div>
    </article>
  );
}

export default async function Home() {
  const sessionEmail = (await cookies()).get(INTELLY_SESSION_COOKIE)?.value;
  const [brief, issue] = await Promise.all([readLatestBrief(), getIntellyTodayIssue(sessionEmail)]);
  const lead = brief?.leadStory ?? fallbackItem("头版主稿");
  const topHighlights = brief?.topHighlights ?? [
    fallbackItem("重点 01"),
    fallbackItem("重点 02"),
    fallbackItem("重点 03"),
  ];
  const sections =
    brief?.sections ??
    sectionConfigs.map((section) => ({
      key: section.key,
      title: section.title,
      items: Array.from({ length: section.targetItems }, (_, index) =>
        fallbackItem(`${section.title} 稿件 ${index + 1}`),
      ),
    }));

  const sectionViews = visibleSections(sections);
  const allCuratedItems = [lead, ...topHighlights, ...sections.flatMap((section) => section.items)];
  const totalEntries = allCuratedItems.length;
  const sourceCount = collectUniqueSources(allCuratedItems);
  const imageCount = allCuratedItems.filter((item) => item.imageUrl).length;
  const heroVisual = pickHeroVisual(lead);
  const heroImageUrl = imageVariant(heroVisual.item?.imageUrl, 1600);

  return (
    <main className="min-h-screen bg-[#edf2f7] px-4 py-5 text-slate-950 md:px-6 md:py-7">
      <div className="mx-auto max-w-[1460px] rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,#fbfdff_0%,#f5f8fc_100%)] px-5 py-5 shadow-[0_28px_90px_rgba(15,23,42,0.08)] md:px-8 md:py-8">
        <header className="flex flex-col gap-4 border-b border-slate-900/12 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[0.74rem] tracking-[0.22em] text-slate-500">DAILY BRIEF</div>
            <div className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-slate-950 md:text-[2.4rem]">
              每日简报
            </div>
            <p className="mt-2 max-w-[44rem] text-[0.96rem] leading-7 text-slate-600">
              {siteConfig.description}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[0.78rem] tracking-[0.16em] text-slate-500">
            <Link
              href="/issues"
              className="rounded-full border border-slate-900/10 bg-white px-3 py-1.5 text-slate-600 transition hover:border-[#2457d6] hover:text-[#2457d6]"
            >
              历史简报
            </Link>
            <Link
              href="/me"
              className="rounded-full border border-slate-900/10 bg-white px-3 py-1.5 text-slate-600 transition hover:border-[#2457d6] hover:text-[#2457d6]"
            >
              {sessionEmail ? `我的 · ${sessionEmail}` : "我的"}
            </Link>
            <Link
              href="/admin"
              className="rounded-full border border-slate-900/10 bg-white px-3 py-1.5 text-slate-600 transition hover:border-[#2457d6] hover:text-[#2457d6]"
            >
              管理台
            </Link>
            <Link
              href="/push/preview"
              className="rounded-full border border-slate-900/10 bg-white px-3 py-1.5 text-slate-600 transition hover:border-[#2457d6] hover:text-[#2457d6]"
            >
              推送概览
            </Link>
            <span className="rounded-full border border-slate-900/10 bg-white px-3 py-1.5">
              Tech Edition
            </span>
            <span>{brief?.date ?? "今日刊"}</span>
            <span>{sessionEmail ? "已登录" : "访客"}</span>
          </div>
        </header>

        <section className="mt-7 grid gap-7 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside className="space-y-5">
            <div className="overflow-hidden rounded-[26px] border border-slate-900/10 bg-[linear-gradient(180deg,#ffffff_0%,#f2f7ff_100%)]">
              <div className="border-b border-slate-900/8 px-5 py-4">
                <div className="text-[0.72rem] tracking-[0.18em] text-slate-500">本期概览</div>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[2.9rem] font-semibold leading-none tracking-[-0.08em] text-slate-950">
                      {totalEntries}
                    </div>
                    <div className="mt-2 text-[0.82rem] tracking-[0.18em] text-slate-500">入选稿件</div>
                  </div>
                  <div className="rounded-full border border-slate-900/10 bg-white px-3 py-1.5 text-[0.78rem] tracking-[0.16em] text-slate-600">
                    {formatIssueLabel(brief?.date)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-px bg-slate-900/8">
                <div className="bg-white px-5 py-4">
                  <div className="text-[1.15rem] font-semibold tracking-[-0.03em] text-slate-950">
                    {sourceCount}
                  </div>
                  <div className="mt-1 text-[0.78rem] text-slate-500">覆盖来源</div>
                </div>
                <div className="bg-white px-5 py-4">
                  <div className="text-[1.15rem] font-semibold tracking-[-0.03em] text-slate-950">
                    {imageCount}
                  </div>
                  <div className="mt-1 text-[0.78rem] text-slate-500">配图稿件</div>
                </div>
              </div>
              <div className="px-5 py-4">
                <div className="text-[0.72rem] tracking-[0.18em] text-slate-500">今日判断</div>
                <p className="mt-2 text-[0.92rem] leading-7 text-slate-700">{brief?.trendLine}</p>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-900/10 bg-white px-5 py-5">
              <div className="text-[0.72rem] tracking-[0.18em] text-slate-500">板块索引</div>
              <div className="mt-4 space-y-3">
                {sections.map((section, index) => (
                  <Link
                    key={section.key}
                    href={`/sections/${section.key}?date=${issue.issueDate}`}
                    className="flex items-start justify-between gap-4 border-t border-slate-900/8 pt-3 first:border-t-0 first:pt-0"
                  >
                    <div>
                      <div className="text-[0.72rem] tracking-[0.18em] text-[#2457d6]">
                        {(index + 1).toString().padStart(2, "0")}
                      </div>
                      <div className="mt-1 text-[0.96rem] font-medium leading-6 text-slate-900">
                        {section.title}
                      </div>
                    </div>
                    <div className="text-[0.74rem] tracking-[0.12em] text-slate-500">
                      {section.items.length} 条
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[26px] border border-[#d9e6ff] bg-[linear-gradient(180deg,#f7fbff_0%,#eef5ff_100%)] p-1 shadow-[0_16px_40px_rgba(36,87,214,0.08)]">
              <CheckinPanel issueDate={issue.issueDate} initialStatus={issue.checkinStatus} />
            </div>
          </aside>

          <div className="min-w-0">
            <section className="overflow-hidden rounded-[28px] border border-slate-900/10 bg-white px-5 py-5 md:px-7 md:py-7">
              <div className="flex items-center justify-between gap-4 border-b border-slate-900/10 pb-4">
                <div>
                  <div className="text-[0.72rem] tracking-[0.18em] text-[#2457d6]">HEADLINE</div>
                  <div className="mt-1 text-[1.18rem] font-semibold tracking-[-0.03em] text-slate-950">
                    今日头条
                  </div>
                </div>
                <a
                  href={resolveItemLink(lead)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full border border-slate-900/10 bg-white px-4 py-2 text-[0.82rem] font-medium text-slate-700 transition hover:border-[#2457d6] hover:text-[#2457d6]"
                >
                  {renderItemCtaLabel(lead)}
                </a>
              </div>

              <div className="mt-6">
                <div className="text-[0.74rem] tracking-[0.16em] text-slate-500">
                  {formatSourceLabel(lead.source)} / {formatPublishedAt(lead.publishedAt)}
                </div>
                <h1 className="mt-3 max-w-[15ch] text-[2.45rem] font-semibold leading-[1.02] tracking-[-0.06em] text-slate-950 md:text-[4rem]">
                  <a href={resolveItemLink(lead)} target="_blank" rel="noreferrer">
                    {buildDisplayTitle(lead)}
                  </a>
                </h1>
              </div>

              {heroImageUrl ? (
                <div className="relative mt-6 aspect-[16/8.8] overflow-hidden rounded-[26px] border border-slate-900/10 bg-slate-100">
                  <Image
                    src={heroImageUrl}
                    alt={buildDisplayTitle(heroVisual.item ?? lead)}
                    fill
                    priority
                    unoptimized
                    sizes="(min-width: 1280px) 56vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,15,30,0.02)_0%,rgba(8,15,30,0.34)_100%)]" />
                </div>
              ) : null}

              <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(260px,0.9fr)]">
                <div className="min-w-0">
                  <p className="text-[1.02rem] leading-8 text-slate-700">{summaryText(lead)}</p>
                </div>
                <div className="rounded-[20px] border border-[#d5e2ff] bg-[linear-gradient(180deg,#f7fbff_0%,#f1f6ff_100%)] px-5 py-5">
                  <div className="text-[0.72rem] tracking-[0.18em] text-[#2457d6]">为什么重要</div>
                  <p className="mt-3 text-[0.94rem] leading-8 text-slate-800">{lead.whyItMatters}</p>
                </div>
              </div>
            </section>

            <section className="mt-7 rounded-[28px] border border-slate-900/10 bg-white px-5 py-5 md:px-7 md:py-7">
              <div className="flex items-center justify-between gap-4 border-b border-slate-900/10 pb-4">
                <div>
                  <div className="text-[0.72rem] tracking-[0.18em] text-slate-500">SECTIONS</div>
                  <div className="mt-1 text-[1.4rem] font-semibold tracking-[-0.04em] text-slate-950">
                    分栏快读
                  </div>
                </div>
                <div className="text-[0.82rem] tracking-[0.14em] text-slate-500">
                  AI / 智能驾驶 / 具身智能 / 全球要闻 / 商业趋势
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {sectionViews.map((section) => (
                  <section
                    key={section.key}
                    className="rounded-[24px] border border-slate-900/10 bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] p-5"
                  >
                    <div className="flex items-end justify-between gap-3 border-b border-slate-900/10 pb-3">
                      <div>
                        <Link
                          href={`/sections/${section.key}?date=${issue.issueDate}`}
                          className="text-[0.72rem] tracking-[0.18em] text-[#2457d6] transition hover:text-[#173c9c]"
                        >
                          {section.title}
                        </Link>
                        <div className="mt-1 text-[1.1rem] font-semibold tracking-[-0.03em] text-slate-950">
                          {section.items.length} 条编辑入选
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-5">
                      {section.visibleItems.map((item, index) => (
                        <SectionStory
                          key={`${section.key}-${index}-${buildDisplayTitle(item)}`}
                          item={item}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-[24px] border border-slate-900/10 bg-white px-5 py-5">
              <div className="flex items-center justify-between gap-3 border-b border-slate-900/10 pb-4">
                <div>
                  <div className="text-[0.72rem] tracking-[0.18em] text-slate-500">HIGHLIGHTS</div>
                  <div className="mt-1 text-[1.18rem] font-semibold tracking-[-0.03em] text-slate-950">
                    今日重点
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-4">
                {topHighlights.map((item, index) => {
                  const thumbUrl = imageVariant(item.imageUrl, 480);

                  return (
                    <article
                      key={`${buildDisplayTitle(item)}-${index}`}
                      className="border-t border-slate-900/10 pt-4 first:border-t-0 first:pt-0"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-[0.72rem] tracking-[0.16em] text-[#2457d6]">
                          {(index + 1).toString().padStart(2, "0")}
                        </div>
                        <div className="text-[0.72rem] tracking-[0.14em] text-slate-500">
                          {formatSourceLabel(item.source)}
                        </div>
                      </div>
                      {thumbUrl ? (
                        <div className="relative mt-3 aspect-[16/10] overflow-hidden rounded-[18px] border border-slate-900/10 bg-slate-100">
                          <Image
                            src={thumbUrl}
                            alt={buildDisplayTitle(item)}
                            fill
                            unoptimized
                            sizes="(min-width: 1280px) 18vw, 100vw"
                            className="object-cover"
                          />
                        </div>
                      ) : null}
                      <h2 className="mt-3 text-[1.02rem] font-semibold leading-7 tracking-[-0.025em] text-slate-950">
                        <a
                          href={resolveItemLink(item)}
                          target="_blank"
                          rel="noreferrer"
                          className="transition hover:text-[#2457d6]"
                        >
                          {buildDisplayTitle(item)}
                        </a>
                      </h2>
                      <p className="mt-2 text-[0.92rem] leading-7 text-slate-700">{buildDeck(item)}</p>
                      <a
                        href={resolveItemLink(item)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex text-[0.8rem] font-medium text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-[#2457d6] hover:decoration-[#2457d6]"
                      >
                        {renderItemCtaLabel(item)}
                      </a>
                    </article>
                  );
                })}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
