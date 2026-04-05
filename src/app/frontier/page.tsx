import { cookies } from "next/headers";
import Link from "next/link";

import {
  FrontierAction,
  FrontierColumn,
  FrontierHero,
  FrontierShell,
  FrontierSidebarPanel,
  FrontierStat,
  FrontierStoryCard,
} from "@/components/frontier/frontier-ui";
import { siteConfig } from "@/config/site";
import {
  buildDeck,
  buildDisplayTitle,
  formatPublishedAt,
  formatSourceLabel,
} from "@/lib/brief-format";
import { getIntellyTodayIssue } from "@/lib/intelly-issues";
import { readLatestBrief } from "@/lib/latest-brief";
import { INTELLY_SESSION_COOKIE, readSessionEmail } from "@/lib/intelly-user";

export const dynamic = "force-dynamic";

function uniqueSourceCount(labels: string[]) {
  return new Set(labels).size;
}

export default async function FrontierHomePage() {
  const sessionEmail = readSessionEmail((await cookies()).get(INTELLY_SESSION_COOKIE)?.value);
  const [brief, issue] = await Promise.all([readLatestBrief(), getIntellyTodayIssue(sessionEmail)]);

  if (!brief) {
    return null;
  }

  const allItems = [brief.leadStory, ...brief.topHighlights, ...brief.sections.flatMap((section) => section.items)];
  const sourceCount = uniqueSourceCount(allItems.map((item) => formatSourceLabel(item.source)));
  const imageCount = allItems.filter((item) => item.imageUrl).length;

  return (
    <FrontierShell
      eyebrow="Frontier Edition"
      title="Intelly Frontier"
      description={`${siteConfig.description} 这一版不是替换现有首页，而是给我们一套更强的编辑部风格副本，用来测试整站视觉升级。`}
      actions={
        <>
          <FrontierAction href="/">现有正式首页</FrontierAction>
          <FrontierAction href="/frontier/issues">前沿归档</FrontierAction>
          <FrontierAction href="/frontier/me">我的设置</FrontierAction>
          <FrontierAction href="/frontier/admin">运营台</FrontierAction>
        </>
      }
    >
      <section className="grid gap-4 lg:grid-cols-4">
        <FrontierStat label="Issue" value={brief.date} hint="新版视觉副本读取同一份真实日报产物。" />
        <FrontierStat label="Stories" value={allItems.length} hint="当前简报的全部入选稿件数。" />
        <FrontierStat label="Sources" value={sourceCount} hint="当天真正覆盖到的来源广度。" />
        <FrontierStat label="Images" value={imageCount} hint="可直接用于编辑位与板块卡面的图片数。" />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <FrontierHero
            kicker="Lead Story"
            title={buildDisplayTitle(brief.leadStory)}
            summary={buildDeck(brief.leadStory)}
            meta={`${formatSourceLabel(brief.leadStory.source)} · ${formatPublishedAt(brief.leadStory.publishedAt)}`}
            href={brief.leadStory.canonicalUrl ?? brief.leadStory.url}
            image={brief.leadStory.imageUrl}
          />

          <div className="grid gap-5 xl:grid-cols-2">
            {brief.sections.map((section, index) => (
              <FrontierColumn
                key={section.key}
                index={String(index + 1).padStart(2, "0")}
                title={section.title}
                strap={`这一栏保留 ${section.items.length} 条精选，用于更接近“编辑部首页”的分栏阅读。`}
                count={`${section.items.length} 条`}
                href={`/frontier/sections/${section.key}?date=${brief.date}`}
              >
                {section.items.slice(0, 2).map((item) => (
                  <FrontierStoryCard
                    key={`${section.key}-${item.url}`}
                    href={item.canonicalUrl ?? item.url}
                    title={buildDisplayTitle(item)}
                    meta={`${formatSourceLabel(item.source)} · ${formatPublishedAt(item.publishedAt)}`}
                    summary={buildDeck(item)}
                    cta={item.canonicalUrl ? "查看原文" : "查看聚合页"}
                    image={item.imageUrl}
                  />
                ))}
              </FrontierColumn>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <FrontierSidebarPanel eyebrow="Reading Rhythm" title="今日节奏">
            <div className="space-y-4 text-[0.95rem] leading-7 text-[#564a3f]">
              <p>{issue.trendLine}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[18px] border border-[#1a1a1a]/8 bg-white/70 px-4 py-4">
                  <div className="text-[0.72rem] uppercase tracking-[0.18em] text-[#8b5b40]">打卡</div>
                  <div className="mt-2 text-[1.8rem] leading-none tracking-[-0.06em] text-[#161616]">
                    {issue.checkinStatus.currentStreak}
                  </div>
                  <div className="mt-2 text-[0.84rem] text-[#6b5d50]">当前连续天数</div>
                </div>
                <div className="rounded-[18px] border border-[#1a1a1a]/8 bg-white/70 px-4 py-4">
                  <div className="text-[0.72rem] uppercase tracking-[0.18em] text-[#8b5b40]">完成度</div>
                  <div className="mt-2 text-[1.8rem] leading-none tracking-[-0.06em] text-[#161616]">
                    {issue.checkinStatus.completedSections}/{issue.checkinStatus.totalSections}
                  </div>
                  <div className="mt-2 text-[0.84rem] text-[#6b5d50]">已读板块</div>
                </div>
              </div>
            </div>
          </FrontierSidebarPanel>

          <FrontierSidebarPanel eyebrow="Highlights" title="今日重点">
            <div className="space-y-4">
              {brief.topHighlights.map((item, index) => (
                <div key={`${item.url}-${index}`} className="border-t border-[#1a1a1a]/10 pt-4 first:border-t-0 first:pt-0">
                  <div className="text-[0.72rem] uppercase tracking-[0.18em] text-[#8b5b40]">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="mt-2 text-[1rem] leading-7 text-[#151515]">{buildDisplayTitle(item)}</div>
                  <div className="mt-2 text-[0.88rem] leading-7 text-[#62584d]">{buildDeck(item)}</div>
                </div>
              ))}
            </div>
          </FrontierSidebarPanel>

          <FrontierSidebarPanel eyebrow="Navigation" title="站内路径">
            <div className="grid gap-3 text-[0.9rem] text-[#564a3f]">
              <Link href={`/frontier/issues/${brief.date}`} className="rounded-[18px] border border-[#1a1a1a]/10 bg-white/70 px-4 py-3 transition hover:border-[#9f5734] hover:text-[#9f5734]">
                查看当期详情
              </Link>
              <Link href="/frontier/push/preview" className="rounded-[18px] border border-[#1a1a1a]/10 bg-white/70 px-4 py-3 transition hover:border-[#9f5734] hover:text-[#9f5734]">
                查看推送预览
              </Link>
              <Link href="/frontier/issues" className="rounded-[18px] border border-[#1a1a1a]/10 bg-white/70 px-4 py-3 transition hover:border-[#9f5734] hover:text-[#9f5734]">
                浏览历史归档
              </Link>
            </div>
          </FrontierSidebarPanel>
        </div>
      </section>
    </FrontierShell>
  );
}
