import { cookies } from "next/headers";

import { TechAction, TechRail, TechShell, TechStreamCard } from "@/components/frontier-tech/tech-ui";
import { getIntellyCheckinHistory } from "@/lib/intelly-checkins";
import { listIntellyIssues } from "@/lib/intelly-issues";
import { INTELLY_SESSION_COOKIE } from "@/lib/intelly-user";

export const dynamic = "force-dynamic";

export default async function FrontierTechIssuesPage() {
  const sessionEmail = (await cookies()).get(INTELLY_SESSION_COOKIE)?.value;
  const [issues, history] = await Promise.all([
    listIntellyIssues(),
    getIntellyCheckinHistory(sessionEmail, 14),
  ]);

  return (
    <TechShell
      eyebrow="历史简报"
      title="时间归档"
      description="按日期回看每一期头条和板块变化，更适合追踪几天内的热点切换。"
      actions={
        <>
          <TechAction href="/frontier-tech">返回首页</TechAction>
          <TechAction href="/frontier-tech/me">我的设置</TechAction>
        </>
      }
    >
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4 md:grid-cols-2">
          {issues.map((issue) => (
            <TechStreamCard
              key={issue.issueDate}
              href={`/frontier-tech/issues/${issue.issueDate}`}
              title={issue.headline}
              meta={`${issue.issueDate} · ${issue.sectionCount} 个板块`}
              summary={`头条来源 ${issue.leadSourceName}，适合继续进入该期做深读。`}
              tag="期刊"
            />
          ))}
        </div>
        <TechRail eyebrow="阅读记录" title="打卡轨迹">
          <div className="space-y-4">
            <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
              <div className="text-[0.68rem] uppercase tracking-[0.2em] text-[#8bb7ff]">当前连续</div>
              <div className="mt-3 text-[1.9rem] leading-none tracking-[-0.06em] text-white">{history.currentStreak}</div>
              <div className="mt-2 text-[0.78rem] text-[#7e8ca3]">当前连续天数</div>
            </div>
            {history.items.map((item) => (
              <div key={item.issueDate} className="border-t border-white/10 pt-4 first:border-t-0 first:pt-0">
                <div className="text-[0.72rem] uppercase tracking-[0.2em] text-[#8bb7ff]">{item.issueDate}</div>
                <div className="mt-2 text-[0.9rem] text-[#cfd7e6]">连续 {item.currentStreak} 天</div>
              </div>
            ))}
          </div>
        </TechRail>
      </section>
    </TechShell>
  );
}
