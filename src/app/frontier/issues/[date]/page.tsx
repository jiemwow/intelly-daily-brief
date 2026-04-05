import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FrontierAction, FrontierHero, FrontierShell, FrontierSidebarPanel, FrontierStoryCard } from "@/components/frontier/frontier-ui";
import { buildDeck, buildDisplayTitle, formatPublishedAt, formatSourceLabel } from "@/lib/brief-format";
import { getIntellyIssueByDate } from "@/lib/intelly-issues";
import { INTELLY_SESSION_COOKIE } from "@/lib/intelly-user";

type Props = {
  params: Promise<{ date: string }>;
};

export const dynamic = "force-dynamic";

export default async function FrontierIssueDetailPage({ params }: Props) {
  const { date } = await params;
  const sessionEmail = (await cookies()).get(INTELLY_SESSION_COOKIE)?.value;
  const issue = await getIntellyIssueByDate(date, sessionEmail);

  if (!issue) {
    notFound();
  }

  return (
    <FrontierShell
      eyebrow="Issue Detail"
      title={issue.headline}
      description={issue.trendLine}
      actions={
        <>
          <FrontierAction href="/frontier/issues">返回前沿归档</FrontierAction>
          <FrontierAction href={`/issues/${issue.issueDate}`}>现有详情页</FrontierAction>
        </>
      }
    >
      <div className="space-y-5">
        <FrontierHero
          kicker={`Issue ${issue.issueDate}`}
          title={issue.leadStory.title}
          summary={issue.leadStory.summary}
          meta={issue.leadStory.meta}
          href={issue.leadStory.url}
          image={issue.leadStory.image}
        />

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-5 md:grid-cols-2">
            {issue.sections.map((section, index) => (
              <div key={section.key} className="rounded-[28px] border border-[#1a1a1a]/10 bg-white/75 p-5 shadow-[0_16px_42px_rgba(48,35,24,0.06)]">
                <div className="border-b border-[#1a1a1a]/10 pb-4">
                  <div className="text-[0.72rem] uppercase tracking-[0.28em] text-[#8b5b40]">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-3 text-[1.45rem] leading-none tracking-[-0.04em] text-[#141414]">
                    <Link href={`/frontier/sections/${section.key}?date=${issue.issueDate}`}>{section.title}</Link>
                  </h3>
                  <div className="mt-2 text-[0.92rem] leading-7 text-[#615549]">{section.strap}</div>
                  <div className="mt-2 text-[0.92rem] leading-7 text-[#51473d]">{section.tone}</div>
                </div>
                <div className="mt-4 space-y-4">
                  {section.stories.map((story) => (
                    <FrontierStoryCard
                      key={story.url}
                      href={story.url}
                      title={story.title}
                      meta={story.sourceName}
                      summary={story.isCanonicalLink ? "直达原文，适合从这一栏继续深读。" : "当前仍为聚合入口，可继续回站查看整理版本。"}
                      cta={story.isCanonicalLink ? "原文" : "聚合"}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-5">
            <FrontierSidebarPanel eyebrow="Lead Meta" title="本期说明">
              <div className="space-y-3 text-[0.95rem] leading-7 text-[#564b3f]">
                <p>期号：{issue.issueDate}</p>
                <p>来源：{issue.leadStory.sourceName}</p>
                <p>阅读时长：{issue.leadStory.readTime}</p>
              </div>
            </FrontierSidebarPanel>

            <FrontierSidebarPanel eyebrow="Highlights" title="三条编辑判断">
              <div className="space-y-4">
                {issue.highlights.map((highlight) => (
                  <div key={highlight.label} className="border-t border-[#1a1a1a]/10 pt-4 first:border-t-0 first:pt-0">
                    <div className="text-[0.72rem] uppercase tracking-[0.2em] text-[#8b5b40]">{highlight.label}</div>
                    <div className="mt-2 text-[0.94rem] leading-7 text-[#151515]">{highlight.text}</div>
                  </div>
                ))}
              </div>
            </FrontierSidebarPanel>
          </div>
        </section>
      </div>
    </FrontierShell>
  );
}

