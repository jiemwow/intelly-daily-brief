import { cookies } from "next/headers";

import {
  TechAction,
  TechHero,
  TechMetric,
  TechRail,
  TechShell,
  TechStreamCard,
} from "@/components/frontier-tech/tech-ui";
import { buildDeck, buildDisplayTitle, formatPublishedAt, formatSourceLabel } from "@/lib/brief-format";
import { getIntellyTodayIssue } from "@/lib/intelly-issues";
import { readLatestBrief } from "@/lib/latest-brief";
import { buildStoryHref } from "@/lib/story-detail";
import { INTELLY_SESSION_COOKIE, readSessionEmail } from "@/lib/intelly-user";

export const dynamic = "force-dynamic";

function uniqueCount(values: string[]) {
  return new Set(values).size;
}

export default async function Home() {
  const sessionEmail = readSessionEmail((await cookies()).get(INTELLY_SESSION_COOKIE)?.value);
  const [brief, issue] = await Promise.all([readLatestBrief(), getIntellyTodayIssue(sessionEmail)]);

  if (!brief) {
    return null;
  }

  const allItems = [brief.leadStory, ...brief.topHighlights, ...brief.sections.flatMap((section) => section.items)];
  const sourceCount = uniqueCount(allItems.map((item) => formatSourceLabel(item.source)));
  const directCount = allItems.filter((item) => item.canonicalUrl).length;

  return (
    <TechShell
      eyebrow="每日简报"
      title="Intelly Signal Grid"
      description={`今天的重点脉冲已经整理完成：${brief.trendLine}`}
      actions={
        <>
          <TechAction href="/issues">历史归档</TechAction>
          <TechAction href="/me">我的设置</TechAction>
          <TechAction href="/push/preview">推送预览</TechAction>
          <TechAction href="/frontier-tech">回退方案</TechAction>
        </>
      }
    >
      <section className="grid gap-4 lg:grid-cols-4">
        <TechMetric label="期号" value={brief.date} hint="当天情报窗口" />
        <TechMetric label="稿件" value={allItems.length} hint="当期全部入选稿件" />
        <TechMetric label="来源" value={sourceCount} hint="来源广度与多样性" />
        <TechMetric label="打卡" value={`${issue.checkinStatus.currentStreak}d`} hint="个人阅读节奏" />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <TechHero
            title={buildDisplayTitle(brief.leadStory)}
            summary={buildDeck(brief.leadStory)}
            meta={`${formatSourceLabel(brief.leadStory.source)} · ${formatPublishedAt(brief.leadStory.publishedAt)}`}
            href={buildStoryHref(brief.date, { kind: "lead" })}
            image={brief.leadStory.imageUrl}
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {brief.sections.map((section, index) => (
              <TechRail
                key={section.key}
                eyebrow={`板块 ${String(index + 1).padStart(2, "0")}`}
                title={section.title}
                href={`/sections/${section.key}?date=${brief.date}`}
              >
                <div className="space-y-4">
                  {section.items.slice(0, 2).map((item, itemIndex) => (
                    <TechStreamCard
                      key={`${section.key}-${item.url}-${itemIndex}`}
                      href={buildStoryHref(brief.date, {
                        kind: "section",
                        sectionKey: section.key,
                        index: itemIndex,
                      })}
                      title={buildDisplayTitle(item)}
                      meta={`${formatSourceLabel(item.source)} · ${formatPublishedAt(item.publishedAt)}`}
                      summary={buildDeck(item)}
                      tag="站内详情"
                      image={item.imageUrl}
                    />
                  ))}
                </div>
              </TechRail>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <TechRail eyebrow="重点阅读" title="今日重点">
            <div className="space-y-4">
              {brief.topHighlights.map((item, index) => (
                <a
                  key={`${item.url}-${index}`}
                  href={buildStoryHref(brief.date, { kind: "highlight", index })}
                  className="block rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:border-[#8bb7ff]/40 hover:bg-[#8bb7ff]/[0.08]"
                >
                  <div className="text-[0.68rem] uppercase tracking-[0.2em] text-[#8bb7ff]">
                    #{String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="mt-2 text-[0.98rem] leading-7 text-white">{buildDisplayTitle(item)}</div>
                  <div className="mt-2 text-[0.82rem] leading-7 text-[#8e9cb0]">{buildDeck(item)}</div>
                </a>
              ))}
            </div>
          </TechRail>

          <TechRail eyebrow="阅读进度" title="阅读状态">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                <div className="text-[0.68rem] uppercase tracking-[0.2em] text-[#8bb7ff]">已读进度</div>
                <div className="mt-3 text-[1.8rem] leading-none tracking-[-0.06em] text-white">
                  {issue.checkinStatus.completedSections}/{issue.checkinStatus.totalSections}
                </div>
                <div className="mt-2 text-[0.78rem] text-[#7e8ca3]">已读板块</div>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                <div className="text-[0.68rem] uppercase tracking-[0.2em] text-[#8bb7ff]">待处理</div>
                <div className="mt-3 text-[1.8rem] leading-none tracking-[-0.06em] text-white">
                  {issue.checkinStatus.pendingItems}
                </div>
                <div className="mt-2 text-[0.78rem] text-[#7e8ca3]">待处理条目</div>
              </div>
            </div>
          </TechRail>

          <TechRail eyebrow="内容覆盖" title="当期覆盖">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <div className="text-[0.68rem] uppercase tracking-[0.2em] text-[#8bb7ff]">原文链接</div>
                  <div className="mt-3 text-[1.8rem] leading-none tracking-[-0.06em] text-white">{directCount}</div>
                  <div className="mt-2 text-[0.78rem] text-[#7e8ca3]">可直达原文的稿件</div>
                </div>
                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <div className="text-[0.68rem] uppercase tracking-[0.2em] text-[#8bb7ff]">重点位</div>
                  <div className="mt-3 text-[1.8rem] leading-none tracking-[-0.06em] text-white">{brief.topHighlights.length}</div>
                  <div className="mt-2 text-[0.78rem] text-[#7e8ca3]">头版旁重点位</div>
                </div>
              </div>
              <div className="grid gap-3">
                <TechAction href={`/issues/${brief.date}`}>当期详情</TechAction>
                <TechAction href="/push/preview">推送预览</TechAction>
                <TechAction href="/admin">运营台</TechAction>
              </div>
            </div>
          </TechRail>
        </div>
      </section>
    </TechShell>
  );
}
