import { sectionConfigs } from "@/config/brief";
import {
  buildDeck,
  buildDisplayTitle,
  formatPublishedAt,
  formatSourceLabel,
} from "@/lib/brief-format";
import { readLatestBrief } from "@/lib/latest-brief";
import type { BriefItem } from "@/types/brief";

function fallbackItem(title: string): BriefItem {
  return {
    title,
    summary: "当前页面会优先展示最新生成的真实简报内容；如果还没生成，这里会显示结构化占位。",
    whyItMatters: "高保真阶段验证排版气质、层级与图文关系。",
    source: "系统预览",
    publishedAt: new Date().toISOString(),
    url: "https://example.com",
  };
}

function StoryStack({
  title,
  items,
}: {
  title: string;
  items: BriefItem[];
}) {
  return (
    <section className="border-t border-slate-900/10 pt-4">
      <div className="flex items-end justify-between gap-3 border-b border-slate-900/8 pb-3">
        <h3 className="text-[1.34rem] font-semibold leading-none tracking-[-0.045em] text-slate-950">
          {title}
        </h3>
        <span className="text-[10px] tracking-[0.18em] text-stone-500">{items.length} 条</span>
      </div>
      <div className="divide-y divide-slate-900/8">
        {items.map((item, index) => (
          <article key={`${title}-${item.title}-${index}`} className="py-4">
            <div className="text-[10px] tracking-[0.16em] text-slate-500">
              {formatSourceLabel(item.source)} / {formatPublishedAt(item.publishedAt)}
            </div>
            <h4 className="mt-2 text-[0.95rem] font-medium leading-7 tracking-[-0.01em] text-slate-950">
              {buildDisplayTitle(item)}
            </h4>
            <p className="mt-2 text-[0.9rem] leading-7 text-slate-700">{buildDeck(item)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default async function HighFiDesignPage() {
  const brief = await readLatestBrief();
  const lead = brief?.leadStory ?? fallbackItem("头版主稿");
  const topHighlights = brief?.topHighlights ?? [
    fallbackItem("重点 01"),
    fallbackItem("重点 02"),
    fallbackItem("重点 03"),
  ];
  const sections =
    brief?.sections ??
    sectionConfigs.map((section) => ({
      key: section.key,
      title: section.title,
      items: Array.from({ length: section.targetItems }, (_, index) =>
        fallbackItem(`${section.title} 稿件 ${index + 1}`),
      ),
    }));

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#eef4ff_0%,#e7edf7_42%,#dfe7f2_100%)] px-3 py-4 text-slate-950 md:px-5 md:py-6">
      <div className="mx-auto max-w-[1540px] overflow-hidden rounded-[18px] border border-white/85 bg-[#f8fafc] shadow-[0_22px_72px_rgba(15,23,42,0.1)]">
        <div className="h-px bg-[linear-gradient(90deg,transparent,rgba(37,99,235,0.55),transparent)]" />
        <header className="border-b border-slate-900/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(239,246,255,0.34))] px-4 py-5 md:px-8">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
            <div className="flex flex-wrap items-center gap-3 text-[10px] tracking-[0.24em] text-slate-500">
              <span>视觉提案</span>
              <span className="h-px w-8 bg-slate-300/90" />
              <span>高保真</span>
              <span className="h-px w-8 bg-slate-300/90" />
              <span>NYT 方向</span>
            </div>
            <div className="text-center">
              <div className="text-[11px] tracking-[0.22em] text-slate-500">头版式科技新闻首页</div>
              <h1 className="mt-2 text-[2.5rem] font-semibold leading-none tracking-[-0.08em] text-slate-950 md:text-[4.35rem]">
                每日简报
              </h1>
            </div>
            <div className="text-left text-[11px] tracking-[0.18em] text-slate-500 lg:text-right">
              <div>{brief ? `${brief.date} 设计稿` : "高保真草案"}</div>
              <div className="mt-1">主图 + 主稿 + 次重点 + 分栏专题</div>
            </div>
          </div>
        </header>

        <section className="grid gap-0 border-b border-slate-900/10 lg:grid-cols-[1.55fr_0.95fr]">
          <article className="border-b border-slate-900/10 px-4 py-6 lg:border-b-0 lg:border-r lg:border-r-slate-900/10 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.12fr)_300px]">
              <div>
                <div className="text-[11px] tracking-[0.22em] text-slate-500">头版主稿</div>
                <h2 className="mt-3 max-w-4xl text-[2.15rem] font-semibold leading-[0.94] tracking-[-0.065em] text-slate-950 md:text-[3.95rem]">
                  {buildDisplayTitle(lead)}
                </h2>
                <p className="mt-5 max-w-[34rem] text-[0.96rem] leading-8 text-slate-700">
                  {buildDeck(lead)}
                </p>
                <p className="mt-5 max-w-[34rem] border-l-2 border-[#2563eb] pl-4 text-[0.95rem] leading-8 text-slate-800">
                  {lead.whyItMatters}
                </p>
              </div>

              <div>
                <div className="aspect-[4/5] rounded-[14px] border border-slate-900/8 bg-[linear-gradient(180deg,rgba(59,130,246,0.12),rgba(15,23,42,0.03)),radial-gradient(circle_at_top_right,rgba(255,255,255,0.82),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent)]" />
                <div className="mt-4 border-t border-slate-900/8 pt-3 text-sm leading-7 text-slate-600">
                  <div className="text-[10px] tracking-[0.18em] text-slate-500">图像策略</div>
                  <p className="mt-2">
                    主图只服务头版主稿，用来增强最重要新闻的视觉锚点，不给每条新闻平均配图。
                  </p>
                </div>
              </div>
            </div>
          </article>

          <aside className="px-4 py-6 lg:px-8">
            <div className="border-b border-slate-900/8 pb-4">
              <div className="text-[11px] tracking-[0.22em] text-slate-500">次重点快读</div>
            </div>
            <div className="divide-y divide-slate-900/8">
              {topHighlights.map((item, index) => (
                <article key={`${item.title}-${index}`} className="py-5">
                  <div className="text-[10px] tracking-[0.18em] text-slate-500">重点 0{index + 1}</div>
                  <h3 className="mt-2 text-[1.22rem] font-semibold leading-tight tracking-[-0.035em] text-slate-950">
                    {buildDisplayTitle(item)}
                  </h3>
                  <p className="mt-3 text-[0.9rem] leading-7 text-slate-700">{buildDeck(item)}</p>
                  <div className="mt-3 text-[10px] tracking-[0.16em] text-slate-500">
                    {formatSourceLabel(item.source)} / {formatPublishedAt(item.publishedAt)}
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </section>

        <section className="border-b border-slate-900/10 px-4 py-5 md:px-8">
          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr_1.2fr]">
            <div className="border-r border-slate-900/8 pr-5">
              <div className="text-[11px] tracking-[0.22em] text-slate-500">编辑判断</div>
              <p className="mt-3 text-[1.14rem] leading-8 text-slate-900">
                {brief?.trendLine ?? "这里放当天最重要的全局判断。"}
              </p>
            </div>
            <div className="border-r border-slate-900/8 pr-5">
              <div className="text-[11px] tracking-[0.22em] text-slate-500">图文编排规则</div>
              <ul className="mt-3 space-y-2 text-[0.92rem] leading-7 text-slate-700">
                <li>主图只给头版主稿，不平均分配。</li>
                <li>重点栏只保留 2 到 3 条快读，不展开到过深。</li>
                <li>正文专题栏以纯文字快速扫读为主。</li>
              </ul>
            </div>
            <div>
              <div className="text-[11px] tracking-[0.22em] text-slate-500">新闻切分规则</div>
              <ul className="mt-3 space-y-2 text-[0.92rem] leading-7 text-slate-700">
                <li>最重要的一条进入头版主稿。</li>
                <li>次重点进入快读栏，补充当天判断。</li>
                <li>其余按四个主题分栏，支持横向对比阅读。</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="px-4 py-6 md:px-8">
          <div className="grid gap-6 xl:grid-cols-4">
            {sections.map((section) => (
              <StoryStack key={section.key} title={section.title} items={section.items} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
