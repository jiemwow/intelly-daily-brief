import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { TechAction, TechRail, TechShell, TechStreamCard } from "@/components/frontier-tech/tech-ui";
import { TechSectionReadTracker } from "@/components/frontier-tech/tech-section-read-tracker";
import { sectionConfigs } from "@/config/brief";
import { buildDeck, buildDisplayTitle, formatPublishedAt, formatSourceLabel } from "@/lib/brief-format";
import { readBriefByDate, readLatestBrief } from "@/lib/latest-brief";
import { INTELLY_SESSION_COOKIE } from "@/lib/intelly-user";

type Props = {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ date?: string }>;
};

export const dynamic = "force-dynamic";

export default async function FrontierTechSectionPage({ params, searchParams }: Props) {
  const [{ section }, { date }] = await Promise.all([params, searchParams]);
  void (await cookies()).get(INTELLY_SESSION_COOKIE)?.value;

  const sectionConfig = sectionConfigs.find((item) => item.key === section);
  if (!sectionConfig) {
    notFound();
  }

  const brief = date ? await readBriefByDate(date) : await readLatestBrief();
  if (!brief) {
    notFound();
  }

  const sectionData = brief.sections.find((item) => item.key === section);
  if (!sectionData) {
    notFound();
  }

  return (
    <TechShell
      eyebrow="板块详情"
      title={sectionConfig.title}
      description={`查看 ${brief.date} 这一天 ${sectionConfig.title} 的完整内容集合，适合从首页继续深读。`}
      actions={
        <>
          <TechAction href={`/frontier-tech/issues/${brief.date}`}>返回当期</TechAction>
          <TechAction href="/frontier-tech/issues">返回归档</TechAction>
        </>
      }
    >
      <div className="space-y-5">
        <TechSectionReadTracker issueDate={brief.date} sectionKey={sectionConfig.key} />
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sectionData.items.map((item, index) => (
            <TechStreamCard
              key={`${item.url}-${index}`}
              href={item.canonicalUrl ?? item.url}
              title={buildDisplayTitle(item)}
              meta={`${formatSourceLabel(item.source)} · ${formatPublishedAt(item.publishedAt)}`}
              summary={`${buildDeck(item)} 为什么重要：${item.whyItMatters}`}
              tag={item.canonicalUrl ? "原文" : "聚合"}
              image={item.imageUrl}
            />
          ))}
        </section>
        <TechRail eyebrow="板块说明" title="这一栏怎么看">
          <div className="text-[0.92rem] leading-8 text-[#9aa6bb]">
            这一页保留该板块的完整稿件集合，适合从首页的快速扫读切到更完整的连续阅读。
          </div>
        </TechRail>
      </div>
    </TechShell>
  );
}
