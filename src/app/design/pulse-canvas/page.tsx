import { briefDate, quickHits, sections } from "../new-project-variants/data";

export default function PulseCanvasPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef3f8_0%,#e9f0f6_100%)] px-4 py-6 text-slate-950 md:px-6 md:py-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[0.72rem] tracking-[0.22em] text-slate-500">ROUTE 05 / PULSE CANVAS</div>
            <h1 className="mt-4 max-w-[10ch] text-[2.9rem] font-semibold leading-[0.92] tracking-[-0.08em] md:text-[5rem]">
              更轻盈、更有呼吸感的内容画布
            </h1>
          </div>
          <div className="rounded-full bg-white/70 px-4 py-2 text-[0.8rem] tracking-[0.14em] text-slate-500 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            {briefDate}
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <section className="rounded-[38px] bg-[linear-gradient(135deg,#fbfdff_0%,#f2f8ff_52%,#f8fbff_100%)] px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.07)]">
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <div className="text-[0.72rem] tracking-[0.2em] text-slate-500">PULSE</div>
                  <h2 className="mt-4 max-w-[12ch] text-[2.45rem] font-semibold leading-[0.9] tracking-[-0.08em] md:text-[4.5rem]">
                    今天的重点不是更多内容，而是更清楚的优先级
                  </h2>
                  <p className="mt-5 max-w-[40rem] text-[1rem] leading-8 text-slate-700">
                    这一路线强调轻盈、节奏和呼吸感。它像一张内容画布，通过柔和色块和流动结构引导阅读，而不是用大框和重卡片把页面切碎。
                  </p>
                </div>
                <div className="grid gap-3">
                  {quickHits.map((item, index) => (
                    <div
                      key={item}
                      className="rounded-[24px] bg-white/75 px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.03)] backdrop-blur-sm"
                    >
                      <div className="text-[0.68rem] tracking-[0.18em] text-[#2457d6]">0{index + 1}</div>
                      <p className="mt-2 text-[0.95rem] leading-7 text-slate-800">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {sections.map((section, index) => (
                <article
                  key={section.title}
                  className={[
                    "rounded-[30px] px-5 py-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)]",
                    index % 3 === 0
                      ? "bg-white"
                      : index % 3 === 1
                        ? "bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)]"
                        : "bg-[linear-gradient(180deg,#f6fbf9_0%,#edf8f3_100%)]",
                  ].join(" ")}
                >
                  <div className="text-[0.72rem] tracking-[0.18em] text-slate-500">{section.title}</div>
                  <h3 className="mt-2 text-[1.28rem] font-semibold tracking-[-0.04em]">{section.strap}</h3>
                  <div className="mt-4 space-y-4">
                    {section.items.map((story) => (
                      <div key={story.title} className="rounded-[18px] bg-white/70 px-4 py-4">
                        <div className="text-[0.95rem] font-medium leading-7 tracking-[-0.02em] text-slate-900">
                          {story.title}
                        </div>
                        <div className="mt-2 text-[0.76rem] tracking-[0.14em] text-slate-500">{story.meta}</div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-[28px] bg-white/80 px-5 py-5 shadow-[0_16px_36px_rgba(15,23,42,0.05)] backdrop-blur-sm">
              <div className="text-[0.72rem] tracking-[0.18em] text-slate-500">今日进度</div>
              <div className="mt-3 text-[2rem] font-semibold tracking-[-0.08em]">6 天</div>
              <div className="text-[0.8rem] tracking-[0.14em] text-slate-500">连续打卡</div>
            </section>
            <section className="rounded-[28px] bg-white/80 px-5 py-5 shadow-[0_16px_36px_rgba(15,23,42,0.05)] backdrop-blur-sm">
              <div className="text-[0.72rem] tracking-[0.18em] text-slate-500">这版的不同</div>
              <p className="mt-3 text-[0.94rem] leading-8 text-slate-700">
                这一路线最重“轻盈感”。它保留科技气质，但不做冷硬，也不做媒体头版，而是把首页做成每天都会再次打开的内容画布。
              </p>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
