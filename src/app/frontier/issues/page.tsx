import { cookies } from "next/headers";

import { FrontierAction, FrontierShell, FrontierSidebarPanel, FrontierStoryCard } from "@/components/frontier/frontier-ui";
import { getIntellyCheckinHistory } from "@/lib/intelly-checkins";
import { listIntellyIssues } from "@/lib/intelly-issues";
import { INTELLY_SESSION_COOKIE, readSessionEmail } from "@/lib/intelly-user";

export const dynamic = "force-dynamic";

export default async function FrontierIssuesPage() {
  const sessionEmail = readSessionEmail((await cookies()).get(INTELLY_SESSION_COOKIE)?.value);
  const [issues, history] = await Promise.all([
    listIntellyIssues(),
    getIntellyCheckinHistory(sessionEmail, 14),
  ]);

  return (
    <FrontierShell
      eyebrow="Archive Room"
      title="历史归档"
      description="这一页把原来的历史列表改成更像“编辑部刊号墙”的样子，适合你快速纵览每天的主题与头条变化。"
      actions={
        <>
          <FrontierAction href="/frontier">返回前沿首页</FrontierAction>
          <FrontierAction href="/issues">现有归档页</FrontierAction>
        </>
      }
    >
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-5 md:grid-cols-2">
          {issues.map((issue) => (
            <FrontierStoryCard
              key={issue.issueDate}
              href={`/frontier/issues/${issue.issueDate}`}
              title={issue.headline}
              meta={`${issue.issueDate} · ${issue.sectionCount} 个板块`}
              summary={`头条来源 ${issue.leadSourceName}。这一期可以继续查看完整头条、五个板块和当日的阅读节奏。`}
              cta="进入当期"
            />
          ))}
        </div>

        <FrontierSidebarPanel eyebrow="Check-in" title="阅读轨迹">
          <div className="space-y-4">
            <div className="rounded-[18px] border border-[#1a1a1a]/10 bg-white/70 px-4 py-4">
              <div className="text-[0.72rem] uppercase tracking-[0.18em] text-[#8b5b40]">Current</div>
              <div className="mt-2 text-[2rem] leading-none tracking-[-0.06em] text-[#151515]">
                {history.currentStreak} 天
              </div>
              <div className="mt-2 text-[0.88rem] text-[#65584b]">最佳 {history.bestStreak} 天</div>
            </div>
            {history.items.map((item) => (
              <div key={item.issueDate} className="border-t border-[#1a1a1a]/10 pt-4 first:border-t-0 first:pt-0">
                <div className="text-[0.84rem] uppercase tracking-[0.18em] text-[#8b5b40]">{item.issueDate}</div>
                <div className="mt-2 text-[0.96rem] text-[#151515]">连续 {item.currentStreak} 天</div>
              </div>
            ))}
          </div>
        </FrontierSidebarPanel>
      </section>
    </FrontierShell>
  );
}
