import Link from "next/link";

import { galleryRoutes } from "../new-project-variants/data";

export default function NewProjectGalleryPage() {
  return (
    <main className="min-h-screen bg-[#edf2f7] px-4 py-6 text-slate-950 md:px-6 md:py-8">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-8">
          <div className="text-[0.72rem] tracking-[0.26em] text-slate-500">
            HIGH-FI GALLERY / NEW PROJECT
          </div>
          <h1 className="mt-4 max-w-[12ch] text-[2.8rem] font-semibold leading-[0.92] tracking-[-0.08em] md:text-[4.8rem]">
            5 版完全不同的高保真方向
          </h1>
          <p className="mt-4 max-w-[48rem] text-[1rem] leading-8 text-slate-600">
            每一版都围绕同一个产品目标，但在版式骨架、视觉语言和阅读气质上明显不同。你可以逐一打开查看，再选一个主方向继续深挖。
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {galleryRoutes.map((route, index) => (
            <Link
              key={route.slug}
              href={`/design/${route.slug}`}
              className="rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,#fbfdff_0%,#f5f8fc_100%)] px-6 py-6 shadow-[0_16px_48px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
            >
              <div className="text-[0.72rem] tracking-[0.18em] text-[#2457d6]">
                0{index + 1}
              </div>
              <h2 className="mt-3 text-[1.55rem] font-semibold tracking-[-0.05em] text-slate-950">
                {route.title}
              </h2>
              <p className="mt-3 text-[0.95rem] leading-7 text-slate-600">{route.summary}</p>
              <div className="mt-6 text-[0.82rem] font-medium text-slate-950">打开查看</div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
