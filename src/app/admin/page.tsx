import Link from "next/link";

import { AdminConsole } from "@/components/admin-console";
import { listPushDeliveries } from "@/lib/push-delivery";
import { listIntellyIssues } from "@/lib/intelly-issues";
import { listIntellySources, summarizeIntellySources } from "@/lib/intelly-sources";

export const metadata = {
  title: "Intelly | 管理台",
  description: "查看 issue、信源状态与推送记录，并触发补跑。",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [issues, sources, deliveries] = await Promise.all([
    listIntellyIssues(),
    Promise.resolve(listIntellySources()),
    listPushDeliveries(),
  ]);
  const sourceSummary = summarizeIntellySources();

  return (
    <main className="min-h-screen bg-[#eef3f7] px-4 py-6 text-slate-950 md:px-6 md:py-8">
      <div className="mx-auto max-w-[1280px] rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,#fbfdff_0%,#f5f8fc_100%)] px-5 py-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] md:px-8 md:py-8">
        <header className="flex flex-col gap-4 border-b border-slate-900/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[0.74rem] tracking-[0.22em] text-slate-500">ADMIN CONSOLE</div>
            <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-slate-950">管理台</h1>
            <p className="mt-2 max-w-[48rem] text-[0.95rem] leading-7 text-slate-600">
              这里集中查看简报生成状态、信源状态和推送记录，也可以直接触发重建与补发。
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
              href="/issues"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 transition hover:border-[#2457d6] hover:text-[#2457d6]"
            >
              历史简报
            </Link>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-[20px] border border-slate-900/10 bg-white/80 px-4 py-4">
            <div className="text-[0.74rem] tracking-[0.18em] text-slate-500">ISSUES</div>
            <div className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-slate-950">{issues.length}</div>
          </div>
          <div className="rounded-[20px] border border-slate-900/10 bg-white/80 px-4 py-4">
            <div className="text-[0.74rem] tracking-[0.18em] text-slate-500">ACTIVE SOURCES</div>
            <div className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-slate-950">
              {sourceSummary.active}
            </div>
          </div>
          <div className="rounded-[20px] border border-slate-900/10 bg-white/80 px-4 py-4">
            <div className="text-[0.74rem] tracking-[0.18em] text-slate-500">ACTIVE RSS</div>
            <div className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-slate-950">
              {sourceSummary.activeRss}
            </div>
          </div>
          <div className="rounded-[20px] border border-slate-900/10 bg-white/80 px-4 py-4">
            <div className="text-[0.74rem] tracking-[0.18em] text-slate-500">PUSH LOGS</div>
            <div className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-slate-950">
              {deliveries.length}
            </div>
          </div>
        </section>

        <div className="mt-8">
          <AdminConsole issues={issues} sources={sources} deliveries={deliveries} />
        </div>
      </div>
    </main>
  );
}
