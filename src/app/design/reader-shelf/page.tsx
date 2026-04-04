import { briefDate, sections } from "../new-project-variants/data";

export default function ReaderShelfPage() {
  return (
    <main className="min-h-screen bg-[#f4f1eb] px-4 py-6 text-stone-900 md:px-6 md:py-8">
      <div className="mx-auto max-w-[1560px]">
        <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[0.72rem] tracking-[0.22em] text-stone-500">ROUTE 02 / READER SHELF</div>
            <h1 className="mt-4 text-[2.7rem] font-semibold tracking-[-0.07em] md:text-[4.6rem]">
              像一个个人阅读中枢
            </h1>
          </div>
          <div className="text-[0.82rem] tracking-[0.14em] text-stone-500">{briefDate}</div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="rounded-[32px] border border-stone-900/10 bg-[#fbfaf7] px-5 py-5 shadow-[0_18px_48px_rgba(41,37,36,0.06)]">
            <div className="text-[0.72rem] tracking-[0.18em] text-stone-500">我的阅读</div>
            <div className="mt-4 space-y-4">
              <div className="rounded-[22px] bg-[#efe8dd] px-4 py-4">
                <div className="text-[2rem] font-semibold tracking-[-0.08em]">6</div>
                <div className="text-[0.8rem] tracking-[0.14em] text-stone-600">连续打卡天数</div>
              </div>
              <div className="rounded-[22px] bg-white px-4 py-4">
                <div className="text-[0.82rem] leading-7 text-stone-700">
                  今天建议先看 AI，再回到商业趋势，最后把具身智能加入稍后读。
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-[32px] border border-stone-900/10 bg-[#fbfaf7] px-6 py-6 shadow-[0_18px_48px_rgba(41,37,36,0.05)]"
              >
                <div className="flex items-end justify-between gap-4 border-b border-stone-900/10 pb-4">
                  <div>
                    <div className="text-[0.72rem] tracking-[0.18em] text-stone-500">{section.title}</div>
                    <h2 className="mt-2 text-[1.5rem] font-semibold tracking-[-0.05em]">{section.strap}</h2>
                  </div>
                  <div className="text-[0.78rem] tracking-[0.14em] text-stone-500">Shelf View</div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {section.items.map((story) => (
                    <article key={story.title} className="rounded-[24px] border border-stone-900/10 bg-white px-4 py-4">
                      <div className="aspect-[4/3] rounded-[18px] bg-[linear-gradient(135deg,#efe8dd_0%,#f8f4ed_100%)]" />
                      <h3 className="mt-4 text-[1rem] font-medium leading-7 tracking-[-0.02em]">
                        {story.title}
                      </h3>
                      <div className="mt-3 text-[0.76rem] tracking-[0.14em] text-stone-500">{story.meta}</div>
                      <div className="mt-4 text-[0.8rem] font-medium text-stone-700">加入稍后读</div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
