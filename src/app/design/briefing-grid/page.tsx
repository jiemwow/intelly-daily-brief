import { briefDate, lead, quickHits, sections } from "../new-project-variants/data";

export default function BriefingGridPage() {
  return (
    <main className="min-h-screen bg-[#edf2f7] px-4 py-6 text-slate-950 md:px-6 md:py-8">
      <div className="mx-auto max-w-[1560px]">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[0.72rem] tracking-[0.26em] text-slate-500">ROUTE 01 / BRIEFING GRID</div>
            <h1 className="mt-4 text-[2.8rem] font-semibold tracking-[-0.08em] md:text-[4.8rem]">
              结构先于装饰
            </h1>
          </div>
          <div className="rounded-full border border-slate-900/10 bg-white px-4 py-2 text-[0.8rem] tracking-[0.14em] text-slate-500">
            {briefDate}
          </div>
        </header>

        <section className="overflow-hidden rounded-[36px] border border-white/80 bg-[linear-gradient(180deg,#fbfdff_0%,#f4f8fc_100%)] shadow-[0_24px_90px_rgba(15,23,42,0.08)]">
          <div className="grid gap-0 xl:grid-cols-[1.2fr_320px]">
            <section className="border-b border-slate-900/10 px-6 py-8 xl:border-b-0 xl:border-r xl:px-8">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div>
                  <div className="text-[0.72rem] tracking-[0.2em] text-slate-500">TODAY</div>
                  <h2 className="mt-4 max-w-[12ch] text-[2.5rem] font-semibold leading-[0.9] tracking-[-0.08em] md:text-[4.6rem]">
                    {lead.title}
                  </h2>
                  <p className="mt-5 max-w-[42rem] text-[1rem] leading-8 text-slate-700">{lead.summary}</p>
                  <div className="mt-6 flex gap-3">
                    <div className="rounded-full bg-[#2457d6] px-4 py-2 text-[0.85rem] font-medium text-white">阅读今日简报</div>
                    <div className="rounded-full border border-slate-900/10 bg-white px-4 py-2 text-[0.85rem] font-medium text-slate-700">完成打卡</div>
                  </div>
                </div>
                <div className="rounded-[28px] border border-slate-900/10 bg-white p-5">
                  <div className="text-[0.72rem] tracking-[0.18em] text-slate-500">今日重点</div>
                  <div className="mt-4 space-y-4">
                    {quickHits.map((item, index) => (
                      <div key={item} className="border-t border-slate-900/8 pt-4 first:border-t-0 first:pt-0">
                        <div className="text-[0.68rem] tracking-[0.18em] text-slate-400">0{index + 1}</div>
                        <p className="mt-2 text-[0.95rem] leading-7 text-slate-800">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <aside className="px-6 py-8">
              <div className="space-y-4">
                <div className="rounded-[24px] border border-slate-900/10 bg-white px-4 py-4">
                  <div className="text-[0.72rem] tracking-[0.18em] text-slate-500">今日判断</div>
                  <p className="mt-3 text-[0.96rem] leading-8 text-slate-800">{lead.note}</p>
                </div>
                <div className="rounded-[24px] border border-[#2457d6]/12 bg-[linear-gradient(180deg,#f8fbff_0%,#f2f7ff_100%)] px-4 py-4">
                  <div className="text-[2rem] font-semibold tracking-[-0.08em]">6</div>
                  <div className="text-[0.76rem] tracking-[0.16em] text-slate-500">连续打卡</div>
                </div>
              </div>
            </aside>
          </div>

          <div className="border-t border-slate-900/10 px-6 py-6 md:px-8">
            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {sections.map((section) => (
                <section key={section.title} className="rounded-[26px] border border-slate-900/10 bg-white px-5 py-5">
                  <div className="border-b border-slate-900/8 pb-4">
                    <div className="text-[0.72rem] tracking-[0.18em] text-[#2457d6]">{section.title}</div>
                    <div className="mt-2 text-[0.92rem] leading-7 text-slate-600">{section.strap}</div>
                  </div>
                  <div className="mt-4 space-y-4">
                    {section.items.map((story, index) => (
                      <article key={story.title} className="border-t border-slate-900/8 pt-4 first:border-t-0 first:pt-0">
                        <div className="text-[0.68rem] tracking-[0.18em] text-slate-400">0{index + 1}</div>
                        <h3 className="mt-2 text-[1rem] font-medium leading-7 tracking-[-0.025em] text-slate-950">
                          {story.title}
                        </h3>
                        <div className="mt-2 text-[0.76rem] tracking-[0.16em] text-slate-500">{story.meta}</div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
