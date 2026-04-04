import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CheckinPanel } from "@/components/checkin-panel";
import { getIntellyIssueByDate } from "@/lib/intelly-issues";
import { INTELLY_SESSION_COOKIE } from "@/lib/intelly-user";

type IssueDetailPageProps = {
  params: Promise<{
    date: string;
  }>;
};

export default async function IssueDetailPage({ params }: IssueDetailPageProps) {
  const { date } = await params;
  const sessionEmail = (await cookies()).get(INTELLY_SESSION_COOKIE)?.value;
  const issue = await getIntellyIssueByDate(date, sessionEmail);

  if (!issue) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#eef3f7] px-4 py-6 text-slate-950 md:px-6 md:py-8">
      <div className="mx-auto max-w-[1320px] rounded-[30px] border border-white/75 bg-[linear-gradient(180deg,#fbfdff_0%,#f6f9fc_100%)] px-5 py-6 shadow-[0_28px_90px_rgba(15,23,42,0.08)] md:px-8 md:py-8">
        <header className="flex flex-col gap-4 border-b border-slate-900/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[0.74rem] tracking-[0.22em] text-slate-500">ISSUE DETAIL</div>
            <h1 className="mt-2 max-w-[18ch] text-[2rem] font-semibold tracking-[-0.05em] text-slate-950 md:text-[2.4rem]">
              {issue.headline}
            </h1>
            <p className="mt-2 max-w-[48rem] text-[0.96rem] leading-7 text-slate-600">{issue.trendLine}</p>
          </div>
          <div className="flex flex-wrap gap-3 text-[0.82rem] text-slate-500">
            <Link
              href="/issues"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 transition hover:border-[#2457d6] hover:text-[#2457d6]"
            >
              返回历史简报
            </Link>
            <Link
              href="/design/new-project-hifi"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 transition hover:border-[#2457d6] hover:text-[#2457d6]"
            >
              高保真首页
            </Link>
          </div>
        </header>

        <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <article className="rounded-[24px] border border-slate-900/10 bg-white/80 px-5 py-5 md:px-6 md:py-6">
            {issue.leadStory.image ? (
              <div className="relative aspect-[16/9] overflow-hidden rounded-[22px] border border-slate-900/10 bg-slate-100">
                <Image
                  src={issue.leadStory.image}
                  alt={issue.leadStory.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1280px) 100vw, 920px"
                />
              </div>
            ) : null}

            <div className="mt-5 text-[0.8rem] tracking-[0.16em] text-slate-500">{issue.leadStory.meta}</div>
            <h2 className="mt-3 text-[1.7rem] font-semibold leading-[1.12] tracking-[-0.04em] text-slate-950 md:text-[2.1rem]">
              {issue.leadStory.title}
            </h2>
            <p className="mt-4 text-[1rem] leading-8 text-slate-700">{issue.leadStory.summary}</p>
            <div className="mt-4">
              <a
                href={issue.leadStory.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-[0.84rem] font-medium text-slate-900 transition hover:border-[#2457d6] hover:text-[#2457d6]"
              >
                {issue.leadStory.isCanonicalLink ? "查看原文" : "查看聚合页"}
              </a>
            </div>

            <div className="mt-8 grid gap-5">
              {issue.sections.map((section, index) => (
                <section
                  key={section.key}
                  className={`rounded-[22px] border border-slate-900/10 px-4 py-5 ${section.visual.surface}`}
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-900/8 pb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="rounded-full px-2.5 py-1 text-[0.74rem] tracking-[0.16em] text-white"
                        style={{ backgroundColor: section.visual.accent }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <h3 className="text-[1.02rem] font-semibold tracking-[-0.025em] text-slate-950">
                          <Link href={`/sections/${section.key}?date=${issue.issueDate}`}>{section.title}</Link>
                        </h3>
                        <div className="mt-1 text-[0.86rem] text-slate-500">{section.strap}</div>
                      </div>
                    </div>
                    <div className="text-[0.78rem] tracking-[0.16em] text-slate-400">
                      {section.stories.length} 条
                    </div>
                  </div>

                  <p className="mt-4 text-[0.96rem] leading-8 text-slate-700">{section.tone}</p>

                  {section.status === "gap" ? (
                    <div className="mt-4 rounded-[16px] border border-dashed border-slate-300 bg-white/70 px-4 py-4 text-[0.92rem] leading-7 text-slate-500">
                      {section.note}
                    </div>
                  ) : (
                    <div className="mt-4 grid gap-3">
                      {section.stories.map((story) => (
                        <a
                          key={story.url}
                          href={story.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-[16px] border border-white/80 bg-white/75 px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.05)]"
                        >
                          <div className="text-[0.92rem] font-medium leading-7 text-slate-900">{story.title}</div>
                          <div className="mt-2 text-[0.82rem] text-slate-500">
                            {story.isCanonicalLink ? "来源" : "聚合来源"}：{story.sourceName}
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          </article>

          <aside className="grid gap-5">
            <div className="rounded-[24px] border border-slate-900/10 bg-white/80 px-5 py-5">
              <div className="text-[0.72rem] tracking-[0.18em] text-slate-500">ISSUE META</div>
              <div className="mt-3 text-[1.8rem] font-semibold tracking-[-0.05em] text-slate-950">
                {issue.issueDate}
              </div>
              <div className="mt-2 text-[0.9rem] leading-7 text-slate-600">
                本期共有 {issue.sections.length} 个板块，头条来源 {issue.leadStory.sourceName}。
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-900/10 bg-white/80 px-5 py-5">
              <CheckinPanel issueDate={issue.issueDate} initialStatus={issue.checkinStatus} />
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
