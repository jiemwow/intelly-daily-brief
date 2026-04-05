import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { TechCheckinPanel } from "@/components/frontier-tech/tech-checkin-panel";
import { TechAction, TechHero, TechRail, TechShell, TechStreamCard } from "@/components/frontier-tech/tech-ui";
import { getIntellyIssueByDate } from "@/lib/intelly-issues";
import { buildStoryHref } from "@/lib/story-detail";
import { INTELLY_SESSION_COOKIE, readSessionEmail } from "@/lib/intelly-user";

type Props = {
  params: Promise<{ date: string }>;
};

export const dynamic = "force-dynamic";

export default async function IssueDetailPage({ params }: Props) {
  const { date } = await params;
  const sessionEmail = readSessionEmail((await cookies()).get(INTELLY_SESSION_COOKIE)?.value);
  const issue = await getIntellyIssueByDate(date, sessionEmail);

  if (!issue) {
    notFound();
  }

  return (
    <TechShell
      eyebrow="当期详情"
      title={issue.headline}
      description={issue.trendLine}
      actions={
        <>
          <TechAction href="/issues">返回归档</TechAction>
          <TechAction href="/me">我的设置</TechAction>
          <TechAction href={`/frontier-tech/issues/${issue.issueDate}`}>回退方案</TechAction>
        </>
      }
    >
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <TechHero
            title={issue.leadStory.title}
            summary={issue.leadStory.summary}
            meta={issue.leadStory.meta}
            href={buildStoryHref(issue.issueDate, { kind: "lead" })}
            image={issue.leadStory.image}
          />
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {issue.sections.map((section, index) => (
              <TechRail
                key={section.key}
                eyebrow={`板块 ${String(index + 1).padStart(2, "0")}`}
                title={section.title}
                href={`/sections/${section.key}?date=${issue.issueDate}`}
              >
                <div className="space-y-4">
                  {section.stories.map((story) => (
                    <TechStreamCard
                      key={story.url}
                      href={buildStoryHref(issue.issueDate, {
                        kind: "section",
                        sectionKey: section.key,
                        index: section.stories.findIndex((item) => item.url === story.url),
                      })}
                      title={story.title}
                      meta={story.sourceName}
                      summary={
                        story.isCanonicalLink
                          ? "直连原文，可从这里进入完整阅读。"
                          : "当前仍为聚合入口，可先在站内完成结构化速读。"
                      }
                      tag="站内详情"
                    />
                  ))}
                </div>
              </TechRail>
            ))}
          </section>
        </div>

        <div className="space-y-5">
          <TechCheckinPanel issueDate={issue.issueDate} initialStatus={issue.checkinStatus} />

          <TechRail eyebrow="编辑判断" title="三条判断">
            <div className="grid gap-4">
              {issue.highlights.map((highlight) => (
                <div key={highlight.label} className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <div className="text-[0.68rem] uppercase tracking-[0.2em] text-[#8bb7ff]">{highlight.label}</div>
                  <div className="mt-3 text-[0.9rem] leading-7 text-[#dbe4f3]">{highlight.text}</div>
                </div>
              ))}
            </div>
          </TechRail>

          <TechRail eyebrow="导读" title="继续阅读">
            <div className="space-y-3">
              {issue.sections.map((section) => (
                <TechStreamCard
                  key={section.key}
                  href={`/sections/${section.key}?date=${issue.issueDate}`}
                  title={`进入 ${section.title}`}
                  meta={`${section.stories.length} 条内容`}
                  summary="把首页速读切换成该板块的连续阅读，并完成对应的已读标记。"
                  tag="板块页"
                />
              ))}
            </div>
          </TechRail>
        </div>
      </section>
    </TechShell>
  );
}
