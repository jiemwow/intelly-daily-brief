import { briefDate, quickHits, sections } from "../new-project-variants/data";

export default function ResearchDeskPage() {
  return (
    <main className="min-h-screen bg-[#eef2f5] px-4 py-6 text-slate-950 md:px-6 md:py-8">
      <div className="mx-auto max-w-[1620px]">
        <header className="mb-8 flex flex-col gap-4 border-b border-slate-900/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[0.72rem] tracking-[0.22em] text-slate-500">ROUTE 04 / RESEARCH DESK</div>
            <h1 className="mt-4 text-[2.8rem] font-semibold tracking-[-0.08em] md:text-[5rem]">像研究工作台一样阅读</h1>
          </div>
          <div className="text-[0.82rem] tracking-[0.14em] text-slate-500">{briefDate}</div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_300px]">
          <aside className="space-y-4 rounded-[30px] border border-slate-900/10 bg-white px-5 py-5">
            <div className="text-[0.72rem] tracking-[0.18em] text-slate-500">今日判断</div>
            <div className="text-[1.45rem] font-semibold leading-8 tracking-[-0.05em]">
              今天更像一张需要先建立判断的研究首页，而不是刷新闻。
            </div>
            <div className="border-t border-slate-900/8 pt-4 text-[0.86rem] leading-7 text-slate-600">
              先看主线，再看每个板块如何支持这个主线。
            </div>
          </aside>

          <div className="space-y-5">
            <section className="rounded-[30px] border border-slate-900/10 bg-white px-6 py-6">
              <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <div className="text-[0.72rem] tracking-[0.18em] text-slate-500">Main Hypothesis</div>
                  <h2 className="mt-4 max-w-[14ch] text-[2.2rem] font-semibold leading-[0.95] tracking-[-0.07em] md:text-[4rem]">
                    今天最值得看的，是科技赛道进入“部署验证”而非“能力展示”
                  </h2>
                </div>
                <div className="space-y-3">
                  {quickHits.map((item) => (
                    <div key={item} className="rounded-[20px] border border-slate-900/8 bg-slate-50 px-4 py-4 text-[0.92rem] leading-7 text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              {sections.map((section) => (
                <article key={section.title} className="rounded-[26px] border border-slate-900/10 bg-white px-5 py-5">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-900/8 pb-4">
                    <div>
                      <div className="text-[0.72rem] tracking-[0.18em] text-[#2457d6]">{section.title}</div>
                      <div className="mt-2 text-[0.9rem] leading-7 text-slate-600">{section.strap}</div>
                    </div>
                    <div className="text-[0.72rem] tracking-[0.18em] text-slate-400">3 条</div>
                  </div>
                  <div className="mt-4 space-y-4">
                    {section.items.map((story) => (
                      <div key={story.title} className="border-t border-slate-900/8 pt-4 first:border-t-0 first:pt-0">
                        <h3 className="text-[1rem] font-medium leading-7 tracking-[-0.02em]">{story.title}</h3>
                        <div className="mt-2 text-[0.76rem] tracking-[0.14em] text-slate-500">{story.meta}</div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </section>
          </div>

          <aside className="space-y-4">
            {[
              ["关键词", "AI 交付 / 运营质量 / 场景证明"],
              ["阅读路径", "先判断，再扫读，再对比"],
              ["打卡逻辑", "读完一轮主线后完成一次确认动作"],
            ].map(([label, value]) => (
              <section key={label} className="rounded-[26px] border border-slate-900/10 bg-white px-5 py-5">
                <div className="text-[0.72rem] tracking-[0.18em] text-slate-500">{label}</div>
                <div className="mt-3 text-[1rem] leading-8 text-slate-800">{value}</div>
              </section>
            ))}
          </aside>
        </section>
      </div>
    </main>
  );
}
