import { FrontierAction, FrontierShell, FrontierSidebarPanel } from "@/components/frontier/frontier-ui";
import { readLatestBrief } from "@/lib/latest-brief";
import { buildPushPreviewPayload } from "@/renderers/push";

export const dynamic = "force-dynamic";

export default async function FrontierPushPreviewPage() {
  const brief = await readLatestBrief();
  if (!brief) {
    return null;
  }

  const payload = buildPushPreviewPayload(brief);

  return (
    <FrontierShell
      eyebrow="Push Draft"
      title="推送预览"
      description={payload.summary}
      actions={
        <>
          <FrontierAction href="/frontier">返回前沿首页</FrontierAction>
          <FrontierAction href="/push/preview">现有推送页</FrontierAction>
        </>
      }
    >
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="rounded-[30px] border border-[#1a1a1a]/10 bg-white/75 p-5 shadow-[0_20px_60px_rgba(48,35,24,0.06)]">
          <div className="text-[0.72rem] uppercase tracking-[0.3em] text-[#8b5b40]">Message Structure</div>
          <div className="mt-5 space-y-5">
            {payload.sections.map((section) => (
              <div key={section.title} className="rounded-[22px] border border-[#1a1a1a]/10 bg-[linear-gradient(180deg,#fffdf8,#f6ecdf)] p-4">
                <div className="text-[0.8rem] uppercase tracking-[0.18em] text-[#8b5b40]">{section.title}</div>
                <div className="mt-4 space-y-4">
                  {section.items.map((item) => (
                    <div key={`${section.title}-${item.title}`} className="border-t border-[#1a1a1a]/10 pt-4 first:border-t-0 first:pt-0">
                      <div className="text-[1rem] leading-7 text-[#181818]">{item.title}</div>
                      <div className="mt-1 text-[0.82rem] leading-6 text-[#726658]">
                        {item.source} · {item.publishedAt}
                      </div>
                      <div className="mt-2 text-[0.9rem] leading-7 text-[#51483d]">{item.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <FrontierSidebarPanel eyebrow="Compact" title="IM 版本">
            <pre className="whitespace-pre-wrap text-[0.86rem] leading-7 text-[#4f463b]">{payload.compactText}</pre>
          </FrontierSidebarPanel>
          <FrontierSidebarPanel eyebrow="Full Text" title="完整文本">
            <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap text-[0.84rem] leading-7 text-[#4f463b]">{payload.text}</pre>
          </FrontierSidebarPanel>
        </div>
      </section>
    </FrontierShell>
  );
}

