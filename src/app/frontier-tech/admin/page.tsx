import { requireAdminPageAccess } from "@/lib/admin-auth";
import { TechAdminConsole } from "@/components/frontier-tech/tech-admin-console";
import { TechAction, TechMetric, TechShell } from "@/components/frontier-tech/tech-ui";
import { listPushDeliveries } from "@/lib/push-delivery";
import { listIntellyIssues } from "@/lib/intelly-issues";
import { listIntellySources, summarizeIntellySources } from "@/lib/intelly-sources";

export const dynamic = "force-dynamic";

export default async function FrontierTechAdminPage() {
  await requireAdminPageAccess();
  const [issues, sources, deliveries] = await Promise.all([
    listIntellyIssues(),
    Promise.resolve(listIntellySources()),
    listPushDeliveries(),
  ]);
  const summary = summarizeIntellySources();

  return (
    <TechShell
      eyebrow="运营台"
      title="运营概览"
      description="查看 issue、信源与推送记录的总览，判断今天这期的生产和投递状态。"
      actions={
        <>
          <TechAction href="/frontier-tech">返回首页</TechAction>
          <TechAction href="/frontier-tech/issues">历史归档</TechAction>
        </>
      }
    >
      <div className="space-y-5">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <TechMetric label="期数" value={issues.length} hint="历史期数" />
          <TechMetric label="信源" value={sources.length} hint={`Active ${summary.active}`} />
          <TechMetric label="RSS" value={summary.activeRss} hint="当前激活的 RSS 源" />
          <TechMetric label="推送" value={deliveries.length} hint="全部投递记录" />
        </section>
        <TechAdminConsole issues={issues} sources={sources} deliveries={deliveries} />
      </div>
    </TechShell>
  );
}
