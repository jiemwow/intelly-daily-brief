import { sectionConfigs } from "@/config/brief";
import { formatPublishedAt, formatSourceLabel } from "@/lib/brief-format";
import { readLatestBrief } from "@/lib/latest-brief";
import type { BriefItem } from "@/types/brief";

function fallbackItem(title: string): BriefItem {
  return {
    title,
    summary: "这里会显示对应层级的内容摘要，用来验证主次关系和阅读顺序。",
    whyItMatters: "低保真阶段只验证信息架构，不验证视觉风格。",
    source: "结构占位",
    publishedAt: new Date().toISOString(),
    url: "https://example.com",
  };
}

export default async function LowFiDesignPage() {
  const brief = await readLatestBrief();
  const lead = brief?.leadStory ?? fallbackItem("头版主稿占位");
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
    <main className="min-h-screen bg-stone-100 px-4 py-5 text-stone-950">
      <div className="mx-auto max-w-[1500px] rounded-[20px] border-2 border-dashed border-stone-400 bg-white p-5 md:p-8">
        <header className="border-b-2 border-dashed border-stone-400 pb-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs tracking-[0.2em] text-stone-500">低保真信息架构</div>
              <h1 className="mt-2 font-serif text-5xl tracking-[-0.05em]">NYT 方向版面草图</h1>
            </div>
            <div className="text-right text-sm text-stone-500">
              <div>目标：验证主次关系与阅读路径</div>
              <div className="mt-1">{brief ? `${brief.date} 数据映射` : "未加载真实数据"}</div>
            </div>
          </div>
        </header>

        <section className="mt-5 grid gap-4 border-b-2 border-dashed border-stone-400 pb-5 lg:grid-cols-[1.5fr_0.85fr_0.65fr]">
          <article className="rounded-[16px] border-2 border-dashed border-stone-400 p-5">
            <div className="text-[11px] tracking-[0.18em] text-stone-500">A 区 / 头版主稿</div>
            <div className="mt-4 rounded-[14px] border-2 border-dashed border-stone-300 bg-stone-100/70 px-4 py-16 text-center text-sm text-stone-500">
              主图或信息图位置
            </div>
            <h2 className="mt-4 font-serif text-[2.7rem] leading-[1.02] tracking-[-0.05em]">
              {lead.title}
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-stone-700">{lead.summary}</p>
            <div className="mt-5 grid gap-4 text-sm text-stone-500 md:grid-cols-2">
              <div>来源：{formatSourceLabel(lead.source)}</div>
              <div>时间：{formatPublishedAt(lead.publishedAt)}</div>
            </div>
          </article>

          <aside className="rounded-[16px] border-2 border-dashed border-stone-400 p-5">
            <div className="text-[11px] tracking-[0.18em] text-stone-500">B 区 / 次重点快读</div>
            <div className="mt-4 space-y-4">
              {topHighlights.map((item, index) => (
                <article key={`${item.title}-${index}`} className="rounded-[14px] border-2 border-dashed border-stone-300 p-4">
                  <div className="text-[11px] tracking-[0.16em] text-stone-500">重点 0{index + 1}</div>
                  <h3 className="mt-2 text-xl font-semibold leading-8">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-stone-700">{item.summary}</p>
                </article>
              ))}
            </div>
          </aside>

          <aside className="rounded-[16px] border-2 border-dashed border-stone-400 p-5">
            <div className="text-[11px] tracking-[0.18em] text-stone-500">C 区 / 编辑雷达</div>
            <div className="mt-4 rounded-[14px] border-2 border-dashed border-stone-300 p-4">
              <div className="text-[11px] tracking-[0.16em] text-stone-500">趋势判断</div>
              <p className="mt-3 text-lg leading-8 text-stone-800">{brief?.trendLine ?? "这里放全局判断。"}</p>
            </div>
            <div className="mt-4 space-y-3">
              {sections.map((section) => (
                <div key={section.key} className="rounded-[12px] border-2 border-dashed border-stone-300 px-4 py-3">
                  <div className="text-sm text-stone-600">{section.title}</div>
                  <div className="mt-1 text-2xl font-semibold">{section.items.length}</div>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="mt-5 rounded-[16px] border-2 border-dashed border-stone-400 p-5">
          <div className="text-[11px] tracking-[0.18em] text-stone-500">D 区 / 四栏专题版面</div>
          <div className="mt-4 grid gap-4 xl:grid-cols-4">
            {sections.map((section, sectionIndex) => (
              <section key={section.key} className="rounded-[14px] border-2 border-dashed border-stone-300 p-4">
                <div className="text-[11px] tracking-[0.16em] text-stone-500">版面 0{sectionIndex + 1}</div>
                <h3 className="mt-2 font-serif text-[1.8rem] tracking-[-0.04em]">{section.title}</h3>
                <div className="mt-4 space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <article key={`${section.key}-${item.title}-${itemIndex}`} className="rounded-[12px] border border-dashed border-stone-300 p-3">
                      <div className="text-[11px] tracking-[0.16em] text-stone-500">稿件 0{itemIndex + 1}</div>
                      <h4 className="mt-2 text-base font-semibold leading-7">{item.title}</h4>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
