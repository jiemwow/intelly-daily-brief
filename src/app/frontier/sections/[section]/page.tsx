import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { FrontierAction, FrontierShell, FrontierStoryCard } from "@/components/frontier/frontier-ui";
import { sectionConfigs } from "@/config/brief";
import { buildDeck, buildDisplayTitle, formatPublishedAt, formatSourceLabel } from "@/lib/brief-format";
import { readBriefByDate, readLatestBrief } from "@/lib/latest-brief";
import { INTELLY_SESSION_COOKIE } from "@/lib/intelly-user";

type Props = {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ date?: string }>;
};

export const dynamic = "force-dynamic";

export default async function FrontierSectionPage({ params, searchParams }: Props) {
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
    <FrontierShell
      eyebrow="Section File"
      title={sectionConfig.title}
      description={`按专栏方式展开 ${brief.date} 这一天的 ${sectionConfig.title} 板块，把首页的浅阅读切换成更适合连读的深页。`}
      actions={
        <>
          <FrontierAction href={`/frontier/issues/${brief.date}`}>返回当期</FrontierAction>
          <FrontierAction href={`/sections/${sectionConfig.key}?date=${brief.date}`}>现有板块页</FrontierAction>
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {sectionData.items.map((item, index) => (
          <FrontierStoryCard
            key={`${item.url}-${index}`}
            href={item.canonicalUrl ?? item.url}
            title={buildDisplayTitle(item)}
            meta={`${String(index + 1).padStart(2, "0")} · ${formatSourceLabel(item.source)} · ${formatPublishedAt(item.publishedAt)}`}
            summary={`${buildDeck(item)} 为什么重要：${item.whyItMatters}`}
            cta={item.canonicalUrl ? "查看原文" : "查看聚合页"}
            image={item.imageUrl}
          />
        ))}
      </div>
    </FrontierShell>
  );
}

