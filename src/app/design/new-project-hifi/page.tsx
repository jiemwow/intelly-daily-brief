import { cookies } from "next/headers";
import Image from "next/image";
import type { Metadata } from "next";

import { CheckinPanel } from "@/components/checkin-panel";
import { getIntellyTodayIssue, listIntellyIssues } from "@/lib/intelly-issues";
import { INTELLY_SESSION_COOKIE } from "@/lib/intelly-user";

export const metadata: Metadata = {
  title: "Intelly | 新项目高保真",
  description: "个人科技情报首页的高保真方向稿。",
};

export const dynamic = "force-dynamic";

export default async function NewProjectHifiPage() {
  const sessionEmail = (await cookies()).get(INTELLY_SESSION_COOKIE)?.value;
  const issue = await getIntellyTodayIssue(sessionEmail);
  const recentIssues = (await listIntellyIssues()).slice(0, 3);
  const headline = issue.leadStory;
  const railItems = issue.highlights;
  const sectionColumns = issue.sections;
  const leadSection = sectionColumns[0];
  const secondarySections = sectionColumns.slice(1);
  const readySectionCount = sectionColumns.filter((section) => section.status !== "gap").length;
  const gapSectionCount = sectionColumns.length - readySectionCount;
  const leadSectionSources = leadSection ? [...new Set(leadSection.stories.map((story) => story.sourceName))] : [];
  const leadSectionDirectCount = leadSection
    ? leadSection.stories.filter((story) => story.isCanonicalLink).length
    : 0;
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f7fbff_0%,#eef2f6_42%,#edf1f5_100%)] px-4 py-5 text-slate-950 md:px-6 lg:px-8">
      <div className="mx-auto max-w-[1640px]">
        <div className="overflow-hidden rounded-[24px] border border-[#d9e1ea] bg-[#fbfcfd] shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
          <div className="h-px bg-[linear-gradient(90deg,rgba(36,87,214,0)_0%,rgba(36,87,214,0.38)_18%,rgba(36,87,214,0.14)_52%,rgba(36,87,214,0)_100%)]" />
          <header className="border-b border-slate-200/90 bg-[linear-gradient(180deg,rgba(248,251,255,0.82)_0%,rgba(251,252,253,0.96)_100%)] px-5 py-4 md:px-8 md:py-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:gap-8">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[#2457d6]" />
                    <div className="text-[0.72rem] tracking-[0.32em] text-slate-400">INTELLY</div>
                  </div>
                  <div className="mt-2 text-[1.28rem] font-semibold tracking-[-0.035em] text-slate-950">
                    个人科技情报首页
                  </div>
                </div>
                <p className="max-w-[42rem] text-[0.92rem] leading-7 text-slate-600">
                  帮个人用户在 3 到 5 分钟内完成一次有效阅读。先给判断，再给头条，再给你分栏快读与打卡节奏。
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[0.82rem] text-slate-500">
                <nav className="flex items-center gap-5 rounded-full border border-slate-200/80 bg-white/75 px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <a href="#lead" className="transition-colors duration-200 hover:text-[#2457d6] text-slate-900">
                    今日首页
                  </a>
                  <a href="#sections" className="transition-colors duration-200 hover:text-[#2457d6]">
                    板块快读
                  </a>
                  <a href="#habit" className="transition-colors duration-200 hover:text-[#2457d6]">
                    打卡
                  </a>
                  <a href="/issues" className="transition-colors duration-200 hover:text-[#2457d6]">
                    历史简报
                  </a>
                  <a href="/me" className="transition-colors duration-200 hover:text-[#2457d6]">
                    {sessionEmail ? "我的账号" : "登录 / 我的"}
                  </a>
                  <a href="/admin" className="transition-colors duration-200 hover:text-[#2457d6]">
                    管理台
                  </a>
                </nav>
                <div className="h-4 w-px bg-slate-200" />
                <div>{issue.issueDate}</div>
                <div className="rounded-full border border-[#cfe0ff] bg-[linear-gradient(180deg,#f1f6ff_0%,#eaf2ff_100%)] px-3 py-1.5 text-[#2457d6] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                  连续打卡 {issue.checkinStatus.currentStreak} 天
                </div>
                <div className="hidden rounded-full border border-slate-200/80 bg-white/75 px-3 py-1.5 text-[0.76rem] text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] md:block">
                  今日已整理 {readySectionCount} 个真实板块{gapSectionCount > 0 ? `，${gapSectionCount} 个待补强` : ""}
                </div>
                <div className="hidden rounded-full border border-slate-200/80 bg-white/75 px-3 py-1.5 text-[0.76rem] text-slate-600 md:block">
                  {sessionEmail ? `已登录：${sessionEmail}` : "当前为访客"}
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 border-t border-slate-200/80 pt-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="text-[0.72rem] tracking-[0.28em] text-slate-400">RECENT ISSUES</div>
              <div className="grid gap-2 lg:grid-cols-3 lg:gap-3">
                {recentIssues.map((entry) => (
                  <a
                    key={entry.issueDate}
                    href={`/issues/${entry.issueDate}`}
                    className="group rounded-[16px] border border-slate-200/80 bg-white/75 px-4 py-3 transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[0.78rem] tracking-[0.14em] text-[#2457d6]">{entry.issueDate}</div>
                      <div className="text-[0.76rem] text-slate-400">{entry.sectionCount} 个板块</div>
                    </div>
                    <div className="mt-2 text-[0.95rem] font-medium tracking-[-0.025em] text-slate-950 transition-colors duration-200 group-hover:text-[#173c9c]">
                      {entry.headline}
                    </div>
                    <div className="mt-1 text-[0.82rem] leading-6 text-slate-500">
                      头条来源：{entry.leadSourceName}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </header>

          <section
            id="lead"
            className="grid gap-0 border-b border-slate-200 xl:grid-cols-[minmax(0,1fr)_300px]"
          >
            <article className="px-5 py-6 md:px-8 md:py-8">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_240px] xl:grid-cols-[minmax(0,1fr)_220px]">
                <div className="group relative min-h-[360px] overflow-hidden rounded-[20px] bg-slate-100 ring-1 ring-slate-200/80">
                  {headline.image ? (
                    <>
                      <Image
                        src={headline.image}
                        alt={headline.title}
                        fill
                        priority
                        loading="eager"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                        sizes="(max-width: 1280px) 100vw, 900px"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,14,24,0.08)_0%,rgba(8,14,24,0.38)_58%,rgba(8,14,24,0.64)_100%)]" />
                      <div className="absolute inset-x-0 bottom-0 px-6 py-6 md:px-7">
                        <div className="text-[0.76rem] tracking-[0.2em] text-white/72">{headline.meta}</div>
                        <h1 className="mt-3 max-w-[13ch] text-[2.05rem] font-semibold leading-[1.02] tracking-[-0.05em] text-white md:text-[2.95rem]">
                          {headline.title}
                        </h1>
                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          <a
                            href="#sections"
                            className="rounded-full bg-white px-4 py-2 text-[0.82rem] font-medium text-slate-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f5f8ff]"
                          >
                            阅读今日内容
                          </a>
                          <a
                            href={headline.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[0.82rem] font-medium text-white/92 backdrop-blur transition-all duration-200 hover:bg-white/15"
                          >
                            {headline.isCanonicalLink ? "原文" : "聚合页"}：{headline.sourceName}
                          </a>
                          <span className="text-[0.78rem] tracking-[0.16em] text-white/70">{headline.readTime}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full flex-col justify-end bg-[linear-gradient(180deg,#f8fbff_0%,#edf3fb_100%)] px-6 py-6 md:px-7">
                      <div className="text-[0.76rem] tracking-[0.2em] text-slate-500">{headline.meta}</div>
                      <h1 className="mt-3 max-w-[13ch] text-[2.05rem] font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950 md:text-[2.95rem]">
                        {headline.title}
                      </h1>
                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <a
                          href="#sections"
                          className="rounded-full bg-slate-950 px-4 py-2 text-[0.82rem] font-medium text-white transition-all duration-200 hover:-translate-y-0.5"
                        >
                          阅读今日内容
                        </a>
                        <a
                          href={headline.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-[0.82rem] font-medium text-slate-700 transition-all duration-200 hover:bg-slate-50"
                        >
                          {headline.isCanonicalLink ? "原文" : "聚合页"}：{headline.sourceName}
                        </a>
                        <span className="text-[0.78rem] tracking-[0.16em] text-slate-500">{headline.readTime}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between border-t border-slate-200 pt-5 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-px w-6 bg-[#2457d6]" />
                      <div className="text-[0.72rem] tracking-[0.24em] text-slate-400">今日索引</div>
                    </div>
                    <ol className="mt-4 space-y-4">
                      {railItems.map((item, index) => (
                        <li
                          key={item.label}
                          className="group rounded-[14px] border-t border-slate-200 pt-4 transition-all duration-200 first:border-t-0 first:pt-0 hover:bg-white/80 hover:px-3 hover:py-3 hover:shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                        >
                          <div className="text-[0.78rem] tracking-[0.16em] text-[#2457d6]">0{index + 1}</div>
                          <div className="mt-2 flex items-center justify-between gap-3">
                            <div className="text-[0.92rem] font-medium tracking-[-0.018em] text-slate-950">
                              {item.label}
                            </div>
                            <span className="text-[0.78rem] text-slate-300 transition-colors duration-200 group-hover:text-[#2457d6]">
                              ↗
                            </span>
                          </div>
                          <p className="mt-2 text-[0.92rem] leading-7 text-slate-600">{item.text}</p>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div
                    id="habit"
                    className="mt-6 border-t border-slate-200 pt-5"
                  >
                    <CheckinPanel issueDate={issue.issueDate} initialStatus={issue.checkinStatus} />
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-6 border-t border-slate-200 pt-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div>
                  <p className="max-w-[54rem] text-[0.98rem] leading-8 text-slate-700">{headline.summary}</p>
                </div>
                <div className="grid gap-3 text-[0.93rem] leading-7 text-slate-600">
                  <div className="border-t border-slate-200 pt-3 first:border-t-0 first:pt-0">
                    <div className="text-[0.72rem] tracking-[0.18em] text-slate-400">今日判断</div>
                    <p className="mt-2">{issue.trendLine}</p>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <div className="text-[0.72rem] tracking-[0.18em] text-slate-400">主稿标题</div>
                    <p className="mt-2">{issue.headline}</p>
                  </div>
                </div>
              </div>
            </article>

            <aside className="border-t border-slate-200 bg-[linear-gradient(180deg,#fcfdff_0%,#fafbfd_100%)] px-5 py-6 md:px-8 xl:border-l xl:border-t-0">
              <div className="flex items-center gap-2">
                <span className="h-px w-6 bg-[#2457d6]" />
                <div className="text-[0.72rem] tracking-[0.24em] text-slate-400">继续阅读</div>
              </div>
              <div className="mt-4 space-y-4">
                {sectionColumns.map((section, index) => (
                  <a
                    key={section.title}
                    href={`/sections/${section.key}?date=${issue.issueDate}`}
                    className="group block rounded-[14px] border-t border-slate-200 pt-4 transition-all duration-200 first:border-t-0 first:pt-0 hover:bg-white/80 hover:px-3 hover:py-3 hover:shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-[0.8rem] tracking-[0.16em] text-[#2457d6]">0{index + 1}</div>
                      <div className="text-[0.78rem] text-slate-500">{section.strap}</div>
                    </div>
                    <h2 className="mt-2 text-[1.08rem] font-medium tracking-[-0.03em] text-slate-950 transition-transform duration-200 group-hover:translate-x-0.5">
                      {section.title}
                    </h2>
                    <p className="mt-2 text-[0.92rem] leading-7 text-slate-600">{section.tone}</p>
                  </a>
                ))}
              </div>
            </aside>
          </section>

          <section id="sections" className="px-5 py-8 md:px-8 md:py-10">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-[0.72rem] tracking-[0.28em] text-slate-400">CORE SECTIONS</div>
                <h2 className="mt-3 text-[1.78rem] font-semibold tracking-[-0.04em] text-slate-950 md:text-[2.15rem]">
                  {sectionColumns.length} 个核心板块，按阅读顺序排好
                </h2>
              </div>
              <p className="max-w-[36rem] text-[0.95rem] leading-7 text-slate-600">
                所有条目都来自当日内容池，优先保留有判断价值、可追到原文、能支撑继续深读的消息。
              </p>
            </div>

            <div className="mt-8 grid gap-6">
              {leadSection ? (
                <article
                  className={`group rounded-[22px] px-4 py-5 ring-1 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,23,42,0.06)] md:px-5 md:py-6 ${leadSection.visual.surface} ${leadSection.visual.ring}`}
                >
                <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-full px-2.5 py-1 text-[0.76rem] tracking-[0.18em] text-white transition-transform duration-200 group-hover:scale-[1.04]"
                      style={{ backgroundColor: leadSection.visual.accent }}
                    >
                      01
                    </div>
                    <div>
                      <div className="text-[0.76rem] tracking-[0.2em]" style={{ color: leadSection.visual.accent }}>
                        {leadSection.title}
                      </div>
                      <div className="mt-1 text-[0.88rem] text-slate-500">{leadSection.strap}</div>
                    </div>
                  </div>
                  <div className="hidden text-[0.8rem] text-slate-500 md:block">优先阅读</div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_320px]">
                  <div className="grid gap-5">
                    {leadSection.image ? (
                      <div className="relative aspect-[16/9] overflow-hidden rounded-[18px] bg-slate-100">
                        <Image
                          src={leadSection.image}
                          alt={leadSection.title}
                          fill
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                          sizes="(max-width: 1280px) 100vw, 900px"
                        />
                      </div>
                    ) : (
                      <div className="flex min-h-[220px] items-end rounded-[18px] bg-[linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] p-5 text-[0.94rem] leading-7 text-slate-600">
                        本栏暂无可用配图，先保留真实条目与原文链接。
                      </div>
                    )}

                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-[0.76rem] tracking-[0.14em] text-slate-500">
                          <span>{leadSection.stories.length} 条核心条目</span>
                          <span className="h-3 w-px bg-slate-200" />
                          <span>{leadSectionDirectCount} 条直连原文</span>
                          <span className="h-3 w-px bg-slate-200" />
                          <span>{leadSectionSources.length} 个来源</span>
                        </div>
                        <p className="mt-3 max-w-[42rem] text-[1.04rem] leading-8 tracking-[-0.026em] text-slate-950">
                          {leadSection.tone}
                        </p>
                      </div>

                      <div className="rounded-[16px] border border-white/70 bg-white/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                        <div className="text-[0.72rem] tracking-[0.18em] text-slate-400">SOURCE MIX</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {leadSectionSources.map((sourceName) => (
                            <span
                              key={sourceName}
                              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[0.78rem] text-slate-600"
                            >
                              {sourceName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[18px] border border-white/75 bg-white/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                      <div>
                        <div className="text-[0.72rem] tracking-[0.18em] text-slate-400">SECTION INDEX</div>
                        <div className="mt-1 text-[0.92rem] font-medium text-slate-950">本栏索引</div>
                      </div>
                      <div
                        className="rounded-full px-2.5 py-1 text-[0.74rem] tracking-[0.16em] text-white"
                        style={{ backgroundColor: leadSection.visual.accent }}
                      >
                        PRIORITY
                      </div>
                    </div>

                    <div className="mt-3 space-y-3">
                      {leadSection.stories.map((story, index) => (
                        <a
                          key={story.url}
                          href={story.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group/story block border-t border-slate-200 pt-3 first:border-t-0 first:pt-0"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="text-[0.75rem] tracking-[0.16em] text-slate-400">
                              {String(index + 1).padStart(2, "0")}
                            </div>
                            <div className="text-[0.72rem] tracking-[0.16em] text-slate-400">
                              {story.isCanonicalLink ? "DIRECT" : "AGG"}
                            </div>
                          </div>
                          <p className="mt-2 inline-flex items-start gap-3 text-[0.93rem] leading-7 text-slate-700 transition-colors duration-200 group-hover/story:text-slate-950">
                            <span>{story.title}</span>
                            <span className="pt-0.5 text-slate-300 transition-all duration-200 group-hover/story:translate-x-0.5 group-hover/story:text-[#2457d6]">
                              ↗
                            </span>
                          </p>
                          <div className="mt-1 text-[0.8rem] tracking-[0.04em] text-slate-500">
                            {story.isCanonicalLink ? "来源" : "聚合来源"}：{story.sourceName}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
                </article>
              ) : null}

              <div className="grid gap-6 xl:grid-cols-2">
                {secondarySections.map((section, offset) => {
                  const number = offset + 2;
                  const hasImage = Boolean(section.image);
                  const tag =
                    number === 2 ? "重点追踪" : number === 3 ? "场景验证" : number === 4 ? "环境变量" : "商业观察";

                  return (
                    <article
                      key={section.key}
                      className={`group rounded-[22px] px-4 py-5 ring-1 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,23,42,0.05)] md:px-5 md:py-6 ${section.visual.surface} ${section.visual.ring}`}
                    >
                      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="rounded-full px-2.5 py-1 text-[0.76rem] tracking-[0.18em] text-white transition-transform duration-200 group-hover:scale-[1.04]"
                            style={{ backgroundColor: section.visual.accent }}
                          >
                            {String(number).padStart(2, "0")}
                          </div>
                          <div>
                            <div className="text-[0.76rem] tracking-[0.2em]" style={{ color: section.visual.accent }}>
                              {section.title}
                            </div>
                            <div className="mt-1 text-[0.9rem] text-slate-500">{section.strap}</div>
                          </div>
                        </div>
                        <div className="text-[0.86rem] text-slate-500">
                          {tag}
                        </div>
                      </div>

                      <div className="grid gap-5 pt-5 xl:grid-cols-[132px_minmax(0,1fr)]">
                        <div className="space-y-3">
                          <span
                            className="inline-flex w-fit rounded-full border border-white/70 bg-white/75 px-2.5 py-1 text-[0.78rem] leading-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
                            style={{ color: section.visual.accent }}
                          >
                            {tag}
                          </span>
                        </div>

                        <div className="grid gap-4">
                          {hasImage ? (
                            <div className="relative h-[168px] overflow-hidden rounded-[16px] bg-slate-100">
                              <Image
                                src={section.image!}
                                alt={section.title}
                                fill
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                                sizes="(max-width: 1280px) 100vw, 520px"
                              />
                            </div>
                          ) : null}

                          <p className="text-[1rem] leading-8 tracking-[-0.026em] text-slate-950">{section.tone}</p>

                          {section.status === "gap" ? (
                            <div className="rounded-[16px] border border-dashed border-slate-300/90 bg-white/55 px-4 py-4 text-[0.92rem] leading-7 text-slate-500">
                              {section.note}
                            </div>
                          ) : (
                            <div className="grid gap-3">
                              {section.stories.map((story, index) => (
                              <a
                                key={story.url}
                                href={story.url}
                                target="_blank"
                                rel="noreferrer"
                                className="group/story grid w-full grid-cols-[28px_minmax(0,1fr)] gap-3 border-t border-slate-200 pt-3 text-left first:border-t-0 first:pt-0"
                              >
                                <div className="text-[0.75rem] tracking-[0.16em] text-slate-400">0{index + 1}</div>
                                <div>
                                  <p className="inline-flex items-start gap-3 text-[0.93rem] leading-7 text-slate-700 transition-colors duration-200 group-hover/story:text-slate-950">
                                    <span>{story.title}</span>
                                    <span className="pt-0.5 text-slate-300 transition-all duration-200 group-hover/story:translate-x-0.5" style={{ color: "inherit" }}>
                                      ↗
                                    </span>
                                  </p>
                                  <div className="mt-1 text-[0.8rem] tracking-[0.04em] text-slate-500">
                                    {story.isCanonicalLink ? "来源" : "聚合来源"}：{story.sourceName}
                                  </div>
                                </div>
                              </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
