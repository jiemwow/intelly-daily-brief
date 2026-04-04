import { briefDate, sections } from "../new-project-variants/data";

export default function MosaicNewsroomPage() {
  return (
    <main className="min-h-screen bg-[#f3f5f9] px-4 py-6 text-slate-950 md:px-6 md:py-8">
      <div className="mx-auto max-w-[1620px]">
        <header className="mb-8">
          <div className="text-[0.72rem] tracking-[0.22em] text-slate-500">ROUTE 03 / MOSAIC NEWSROOM</div>
          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <h1 className="max-w-[10ch] text-[2.8rem] font-semibold leading-[0.92] tracking-[-0.08em] md:text-[5rem]">
              图像与节奏主导的资讯首页
            </h1>
            <div className="text-[0.82rem] tracking-[0.14em] text-slate-500">{briefDate}</div>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-5 md:grid-cols-2">
            <article className="relative min-h-[420px] overflow-hidden rounded-[34px] bg-slate-900 p-8 text-white md:col-span-2">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-70"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80')",
                }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.06)_0%,rgba(15,23,42,0.78)_100%)]" />
              <div className="relative max-w-[32rem]">
                <div className="text-[0.72rem] tracking-[0.18em] text-white/70">Lead Story</div>
                <h2 className="mt-4 text-[2.4rem] font-semibold leading-[0.95] tracking-[-0.07em] md:text-[4rem]">
                  今天的科技重点不该被平均阅读
                </h2>
                <p className="mt-4 text-[1rem] leading-8 text-white/85">
                  这一路线把首页当成真正的媒体头版处理，用主视觉、拼贴节奏和强弱大小关系直接定义阅读顺序。
                </p>
              </div>
            </article>

            {sections.slice(0, 4).map((section, index) => (
              <article
                key={section.title}
                className={[
                  "overflow-hidden rounded-[30px] border border-slate-900/10 p-6",
                  index % 2 === 0 ? "bg-white" : "bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)]",
                ].join(" ")}
              >
                <div className="aspect-[16/10] rounded-[22px] bg-[linear-gradient(135deg,#dbe7ff_0%,#f3f7ff_100%)]" />
                <div className="mt-5 text-[0.72rem] tracking-[0.18em] text-slate-500">{section.title}</div>
                <h3 className="mt-2 text-[1.35rem] font-semibold leading-8 tracking-[-0.04em]">{section.items[0].title}</h3>
                <p className="mt-2 text-[0.92rem] leading-7 text-slate-600">{section.strap}</p>
              </article>
            ))}
          </div>

          <aside className="space-y-5">
            <section className="rounded-[30px] border border-slate-900/10 bg-white px-5 py-5">
              <div className="text-[0.72rem] tracking-[0.18em] text-slate-500">News Pulse</div>
              <div className="mt-4 space-y-4">
                {sections[4].items.map((item, index) => (
                  <article key={item.title} className="border-t border-slate-900/8 pt-4 first:border-t-0 first:pt-0">
                    <div className="text-[0.68rem] tracking-[0.18em] text-slate-400">0{index + 1}</div>
                    <h4 className="mt-2 text-[1rem] font-medium leading-7 tracking-[-0.02em]">{item.title}</h4>
                    <div className="mt-2 text-[0.76rem] tracking-[0.14em] text-slate-500">{item.meta}</div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[30px] border border-slate-900/10 bg-[linear-gradient(180deg,#fafcff_0%,#eff4fb_100%)] px-5 py-5">
              <div className="text-[0.72rem] tracking-[0.18em] text-slate-500">为什么不同</div>
              <p className="mt-4 text-[0.94rem] leading-8 text-slate-700">
                这一路线最重“首页节奏”。它不靠规则分栏，而靠大小、图像和不对称来让用户先被吸进去，再开始扫读。
              </p>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
