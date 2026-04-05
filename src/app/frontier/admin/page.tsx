import { FrontierAction, FrontierShell, FrontierStat } from "@/components/frontier/frontier-ui";
import { listPushDeliveries } from "@/lib/push-delivery";
import { listIntellyIssues } from "@/lib/intelly-issues";
import { listIntellySources, summarizeIntellySources } from "@/lib/intelly-sources";

export const dynamic = "force-dynamic";

export default async function FrontierAdminPage() {
  const [issues, sources, deliveries] = await Promise.all([
    listIntellyIssues(),
    Promise.resolve(listIntellySources()),
    listPushDeliveries(),
  ]);
  const sourceSummary = summarizeIntellySources();

  return (
    <FrontierShell
      eyebrow="Ops Desk"
      title="运营台副本"
      description="这版把管理台重构成更具节奏感的运营视图，先用信息分组和层次设计替换现在偏工具页的感觉。"
      actions={
        <>
          <FrontierAction href="/frontier">返回前沿首页</FrontierAction>
          <FrontierAction href="/admin">现有管理台</FrontierAction>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FrontierStat label="Issues" value={issues.length} hint="已生成或归档的期数" />
        <FrontierStat label="Sources" value={sourceSummary.active} hint={`其中 RSS ${sourceSummary.activeRss} 个`} />
        <FrontierStat label="Deliveries" value={deliveries.length} hint="邮件、微信与 IM 的历史投递记录" />
        <FrontierStat label="Registry" value={sources.length} hint="信源注册表总条目数" />
      </section>
    </FrontierShell>
  );
}
