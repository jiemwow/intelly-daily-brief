import { notFound } from "next/navigation";

import { TechAction, TechHero, TechRail, TechShell, TechStreamCard } from "@/components/frontier-tech/tech-ui";
import { buildDisplayTitle, formatPublishedAt, formatSourceLabel } from "@/lib/brief-format";
import { ensureBriefByDate, readBriefByDate } from "@/lib/latest-brief";
import { buildStoryHref, getStoryDetail } from "@/lib/story-detail";

type Props = {
  params: Promise<{ date: string; storyId: string }>;
};

export const dynamic = "force-dynamic";

export default async function StoryDetailPage({ params }: Props) {
  const { date, storyId } = await params;
  const brief = (await readBriefByDate(date)) ?? (await ensureBriefByDate(date).catch(() => null));

  if (!brief) {
    notFound();
  }

  const story = getStoryDetail(brief, storyId);
  if (!story) {
    notFound();
  }

  const relatedSection = story.sectionKey
    ? brief.sections.find((section) => section.key === story.sectionKey)
    : undefined;
  const sourceCtaLabel = story.canonicalUrl ? "查看原文" : "查看聚合页";

  return (
    <TechShell
      eyebrow="内容详情"
      title={buildDisplayTitle({ ...story, url: story.originalUrl })}
      description={story.summary}
      actions={
        <>
          <TechAction href={`/issues/${date}`}>返回当期</TechAction>
          {story.sectionKey ? (
            <TechAction href={`/sections/${story.sectionKey}?date=${date}`}>返回板块</TechAction>
          ) : null}
          <TechAction href={story.originalUrl}>{sourceCtaLabel}</TechAction>
        </>
      }
    >
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <TechHero
            title={story.title}
            summary={story.summary}
            meta={`${formatSourceLabel(story.source)} · ${formatPublishedAt(story.publishedAt)} · ${story.sectionTitle}`}
            href={story.originalUrl}
            image={story.imageUrl}
          />
          <TechRail eyebrow="为什么重要" title="编辑提炼">
            <div className="text-[0.96rem] leading-8 text-[#d9e2f1]">{story.whyItMatters}</div>
          </TechRail>
        </div>

        <div className="space-y-5">
          <TechRail eyebrow="阅读信息" title="来源与去向">
            <div className="space-y-3 text-[0.88rem] leading-7 text-[#98a4b7]">
              <p>来源：{formatSourceLabel(story.source)}</p>
              <p>发布时间：{formatPublishedAt(story.publishedAt)}</p>
              <p>所属位置：{story.sectionTitle}</p>
            </div>
          </TechRail>

          {relatedSection ? (
            <TechRail eyebrow="继续阅读" title={`返回 ${relatedSection.title}`}>
              <div className="space-y-3">
                {relatedSection.items.slice(0, 3).map((item, index) => (
                  <TechStreamCard
                    key={`${relatedSection.key}-${item.url}-${index}`}
                    href={buildStoryHref(date, {
                      kind: "section",
                      sectionKey: relatedSection.key,
                      index,
                    })}
                    title={buildDisplayTitle(item)}
                    meta={`${formatSourceLabel(item.source)} · ${formatPublishedAt(item.publishedAt)}`}
                    summary={item.summary}
                    tag="站内详情"
                    image={item.imageUrl}
                  />
                ))}
              </div>
            </TechRail>
          ) : null}
        </div>
      </section>
    </TechShell>
  );
}
