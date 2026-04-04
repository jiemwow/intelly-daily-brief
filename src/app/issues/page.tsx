import { cookies } from "next/headers";
import Link from "next/link";

import { getIntellyCheckinHistory } from "@/lib/intelly-checkins";
import { listIntellyIssues } from "@/lib/intelly-issues";
import { INTELLY_SESSION_COOKIE } from "@/lib/intelly-user";

export const metadata = {
  title: "Intelly | 历史简报",
  description: "回看最近几期简报与打卡记录。",
};

export const dynamic = "force-dynamic";

export default async function IssuesArchivePage() {
  const sessionEmail = (await cookies()).get(INTELLY_SESSION_COOKIE)?.value;
  const [issues, checkinHistory] = await Promise.all([
    listIntellyIssues(),
    getIntellyCheckinHistory(sessionEmail, 14),
  ]);

  return (
    <main className="min-h-screen bg-[#eff3f7] px-4 py-6 text-slate-950 md:px-6 md:py-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,#fbfdff_0%,#f5f8fc_100%)] px-5 py-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] md:px-8 md:py-8">
          <header className="flex flex-col gap-4 border-b border-slate-900/10 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-[0.74rem] tracking-[0.22em] text-slate-500">ISSUE ARCHIVE</div>
              <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-slate-950">
                历史简报
              </h1>
              <p className="mt-2 max-w-[42rem] text-[0.95rem] leading-7 text-slate-600">
                今天的简报之外，也可以回看过去几期的头条、板块和当时的阅读节奏。
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-[0.82rem] text-slate-500">
              <Link
                href="/"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 transition hover:border-[#2457d6] hover:text-[#2457d6]"
              >
                返回首页
              </Link>
              <Link
                href="/design/new-project-hifi"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 transition hover:border-[#2457d6] hover:text-[#2457d6]"
              >
                查看高保真稿
              </Link>
            </div>
          </header>

          <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-4">
              {issues.map((issue, index) => (
                <Link
                  key={issue.issueDate}
                  href={`/issues/${issue.issueDate}`}
                  className="group rounded-[22px] border border-slate-900/10 bg-white/80 px-5 py-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_32px_rgba(15,23,42,0.06)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-[#2457d6] px-2.5 py-1 text-[0.74rem] tracking-[0.16em] text-white">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="text-[0.8rem] tracking-[0.16em] text-slate-500">{issue.issueDate}</div>
                    </div>
                    <div className="text-[0.8rem] text-slate-500">{issue.sectionCount} 个板块</div>
                  </div>
                  <h2 className="mt-4 text-[1.18rem] font-semibold leading-8 tracking-[-0.03em] text-slate-950 transition group-hover:text-[#173c9c]">
                    {issue.headline}
                  </h2>
                  <div className="mt-2 text-[0.92rem] leading-7 text-slate-600">
                    头条来源：{issue.leadSourceName}
                  </div>
                </Link>
              ))}
            </div>

            <aside className="rounded-[24px] border border-slate-900/10 bg-white/80 px-5 py-5">
              <div className="text-[0.72rem] tracking-[0.18em] text-slate-500">CHECKIN HISTORY</div>
              <div className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-slate-950">
                {checkinHistory.currentStreak} 天
              </div>
              <div className="mt-1 text-[0.84rem] text-slate-500">
                当前连续打卡，最佳 {checkinHistory.bestStreak} 天
              </div>

              <div className="mt-5 space-y-3 border-t border-slate-900/10 pt-4">
                {checkinHistory.items.length > 0 ? (
                  checkinHistory.items.map((item) => (
                    <div
                      key={item.issueDate}
                      className="flex items-start justify-between gap-3 border-t border-slate-900/8 pt-3 first:border-t-0 first:pt-0"
                    >
                      <div>
                        <div className="text-[0.92rem] font-medium text-slate-900">{item.issueDate}</div>
                        <div className="text-[0.8rem] text-slate-500">连续 {item.currentStreak} 天</div>
                      </div>
                      <div className="text-[0.78rem] tracking-[0.12em] text-slate-400">DONE</div>
                    </div>
                  ))
                ) : (
                  <p className="text-[0.92rem] leading-7 text-slate-500">还没有打卡记录，今天这期可以作为第一天。</p>
                )}
              </div>
            </aside>
          </section>
        </div>
      </div>
    </main>
  );
}
