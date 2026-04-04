import Link from "next/link";

import { readLatestBrief } from "@/lib/latest-brief";
import { buildPushPreviewPayload } from "@/renderers/push";

export const dynamic = "force-dynamic";

export default async function PushPreviewPage() {
  const brief = await readLatestBrief();

  if (!brief) {
    return (
      <main className="min-h-screen bg-[#edf2f7] px-4 py-8 text-slate-950">
        <div className="mx-auto max-w-5xl rounded-[28px] border border-white/70 bg-white px-6 py-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <div className="text-[0.74rem] tracking-[0.18em] text-slate-500">PUSH PREVIEW</div>
          <h1 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-slate-950">
            暂无可预览推送
          </h1>
          <p className="mt-3 text-[0.96rem] leading-7 text-slate-600">
            还没有最新一期简报产物，等日报生成后这里会自动显示推送内容。
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-[#2457d6] hover:text-[#2457d6]"
          >
            返回首页
          </Link>
        </div>
      </main>
    );
  }

  const payload = buildPushPreviewPayload(brief);

  return (
    <main className="min-h-screen bg-[#edf2f7] px-4 py-8 text-slate-950">
      <div className="mx-auto max-w-6xl rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,#fbfdff_0%,#f5f8fc_100%)] px-6 py-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] md:px-8 md:py-8">
        <header className="flex flex-col gap-4 border-b border-slate-900/10 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[0.74rem] tracking-[0.18em] text-slate-500">PUSH PREVIEW</div>
            <h1 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-slate-950">
              推送概览
            </h1>
            <p className="mt-3 max-w-3xl text-[0.96rem] leading-7 text-slate-600">{payload.summary}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <Link
              href="/"
              className="rounded-full border border-slate-900/10 bg-white px-4 py-2 transition hover:border-[#2457d6] hover:text-[#2457d6]"
            >
              返回首页
            </Link>
            <Link
              href={`/issues/${brief.date}`}
              className="rounded-full border border-slate-900/10 bg-white px-4 py-2 transition hover:border-[#2457d6] hover:text-[#2457d6]"
            >
              查看当期详情
            </Link>
          </div>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <section className="rounded-[24px] border border-slate-900/10 bg-white px-5 py-5">
              <div className="text-[0.72rem] tracking-[0.18em] text-slate-500">消息结构</div>
              <div className="mt-4 space-y-4">
                {payload.sections.map((section) => (
                  <div key={section.title} className="rounded-[18px] border border-slate-900/8 bg-[#f8fbff] px-4 py-4">
                    <div className="text-[0.84rem] tracking-[0.16em] text-[#2457d6]">{section.title}</div>
                    <div className="mt-3 space-y-3">
                      {section.items.map((item) => (
                        <div key={`${section.title}-${item.title}`} className="border-t border-slate-900/8 pt-3 first:border-t-0 first:pt-0">
                          <div className="text-[0.98rem] font-medium leading-7 text-slate-950">{item.title}</div>
                          <div className="mt-1 text-[0.82rem] leading-6 text-slate-500">
                            {item.source} / {item.publishedAt}
                          </div>
                          <div className="mt-1 text-[0.88rem] leading-7 text-slate-700">{item.note}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[24px] border border-slate-900/10 bg-white px-5 py-5">
              <div className="text-[0.72rem] tracking-[0.18em] text-slate-500">IM 简版</div>
              <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-[18px] bg-[#f8fbff] px-4 py-4 text-[0.86rem] leading-7 text-slate-700">
                {payload.compactText}
              </pre>
            </section>

            <section className="rounded-[24px] border border-slate-900/10 bg-white px-5 py-5">
              <div className="text-[0.72rem] tracking-[0.18em] text-slate-500">完整文本</div>
              <pre className="mt-4 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-[18px] bg-[#f8fbff] px-4 py-4 text-[0.84rem] leading-7 text-slate-700">
                {payload.text}
              </pre>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
