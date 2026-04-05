import { TechAction, TechRail, TechShell } from "@/components/frontier-tech/tech-ui";
import { readLatestBrief } from "@/lib/latest-brief";
import { buildPushPreviewPayload } from "@/renderers/push";

export const dynamic = "force-dynamic";

export default async function FrontierTechPushPreviewPage() {
  const brief = await readLatestBrief();
  if (!brief) {
    return null;
  }

  const payload = buildPushPreviewPayload(brief);

  return (
    <TechShell
      eyebrow="推送预览"
      title="今日推送草稿"
      description={payload.summary}
      actions={
        <>
          <TechAction href="/frontier-tech">返回首页</TechAction>
          <TechAction href="/frontier-tech/issues">历史归档</TechAction>
        </>
      }
    >
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <TechRail eyebrow="IM 版本" title="简版消息">
          <pre className="whitespace-pre-wrap text-[0.82rem] leading-7 text-[#d9e2f1]">{payload.compactText}</pre>
        </TechRail>
        <TechRail eyebrow="完整文本" title="长版推送">
          <pre className="max-h-[40rem] overflow-auto whitespace-pre-wrap text-[0.8rem] leading-7 text-[#d9e2f1]">{payload.text}</pre>
        </TechRail>
      </section>
    </TechShell>
  );
}
