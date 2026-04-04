import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionReadTracker } from "@/components/section-read-tracker";
import { sectionConfigs } from "@/config/brief";
import { buildDeck, buildDisplayTitle, formatPublishedAt, formatSourceLabel } from "@/lib/brief-format";
import { readBriefByDate, readLatestBrief } from "@/lib/latest-brief";
import { INTELLY_SESSION_COOKIE } from "@/lib/intelly-user";

type SectionDetailPageProps = {
  params: Promise<{
    section: string;
  }>;
  searchParams: Promise<{
    date?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function SectionDetailPage({ params, searchParams }: SectionDetailPageProps) {
  const [{ section }, { date }] = await Promise.all([params, searchParams]);
  const sessionEmail = (await cookies()).get(INTELLY_SESSION_COOKIE)?.value;
  const sectionConfig = sectionConfigs.find((item) => item.key === section);

  if (!sectionConfig) {
    notFound();
  }

  const brief = date ? await readBriefByDate(date) : await readLatestBrief();
  if (!brief) {
    notFound();
  }

  const sectionData = brief.sections.find((item) => item.key === sectionConfig.key);
  if (!sectionData) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#eef3f7] px-4 py-6 text-slate-950 md:px-6 md:py-8">
      <div className="mx-auto max-w-[1180px] rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,#fbfdff_0%,#f5f8fc_100%)] px-5 py-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] md:px-8 md:py-8">
        <header className="flex flex-col gap-4 border-b border-slate-900/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[0.74rem] tracking-[0.22em] text-slate-500">SECTION DETAIL</div>
            <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-slate-950">
              {sectionConfig.title}
            </h1>
            <p className="mt-2 max-w-[42rem] text-[0.95rem] leading-7 text-slate-600">
              查看这一栏在 {brief.date} 的完整内容集合，适合从首页继续深读。
            </p>
            <p className="mt-2 text-[0.82rem] text-slate-500">
              {sessionEmail ? `当前阅读身份：${sessionEmail}` : "当前以访客身份阅读。"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-[0.82rem] text-slate-500">
            <Link
              href={`/issues/${brief.date}`}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 transition hover:border-[#2457d6] hover:text-[#2457d6]"
            >
              回到当期简报
            </Link>
            <Link
              href="/issues"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 transition hover:border-[#2457d6] hover:text-[#2457d6]"
            >
              历史简报
            </Link>
          </div>
        </header>

        <section className="mt-8 grid gap-4">
          <SectionReadTracker issueDate={brief.date} sectionKey={sectionConfig.key} />
          {sectionData.items.map((item, index) => (
            <article
              key={`${item.url}-${index}`}
              className="rounded-[22px] border border-slate-900/10 bg-white/80 px-5 py-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-[0.8rem] tracking-[0.16em] text-[#2457d6]">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="text-[0.78rem] text-slate-500">
                  {formatSourceLabel(item.source)} / {formatPublishedAt(item.publishedAt)}
                </div>
              </div>
              <h2 className="mt-3 text-[1.2rem] font-semibold leading-8 tracking-[-0.03em] text-slate-950">
                {buildDisplayTitle(item)}
              </h2>
              <p className="mt-3 text-[0.96rem] leading-8 text-slate-700">{buildDeck(item)}</p>
              <p className="mt-3 text-[0.92rem] leading-7 text-slate-600">
                为什么重要：{item.whyItMatters}
              </p>
              <div className="mt-4">
                <a
                  href={item.canonicalUrl ?? item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-[0.84rem] font-medium text-slate-900 transition hover:border-[#2457d6] hover:text-[#2457d6]"
                >
                  {item.canonicalUrl ? "查看原文" : "查看聚合页"}
                </a>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
