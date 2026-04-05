import { cookies } from "next/headers";

import { getAdminAccessState, INTELLY_ADMIN_COOKIE } from "@/lib/admin-auth";
import { TechAction, TechRail, TechShell } from "@/components/frontier-tech/tech-ui";
import { TechMePanel } from "@/components/frontier-tech/tech-me-panel";
import { getIntellyTodayIssue } from "@/lib/intelly-issues";
import { getStoredUser, INTELLY_SESSION_COOKIE, readSessionEmail } from "@/lib/intelly-user";
import type { IntellyMeResponse } from "@/types/intelly";

export const dynamic = "force-dynamic";

export default async function FrontierTechMePage() {
  const cookieStore = await cookies();
  const sessionEmail = readSessionEmail(cookieStore.get(INTELLY_SESSION_COOKIE)?.value);
  const adminToken = cookieStore.get(INTELLY_ADMIN_COOKIE)?.value;
  const [{ user, settings }, issue] = await Promise.all([
    getStoredUser(sessionEmail),
    getIntellyTodayIssue(sessionEmail),
  ]);
  const adminState = getAdminAccessState(sessionEmail, adminToken);

  const initialState: IntellyMeResponse =
    sessionEmail && user?.email === sessionEmail
      ? {
          user,
          settings,
          currentStreak: issue.checkinStatus.currentStreak,
          todayCheckinStatus: issue.checkinStatus,
          ...adminState,
        }
      : {
          user: null,
          settings: null,
          currentStreak: 0,
          todayCheckinStatus: null,
          ...adminState,
        };

  return (
    <TechShell
      eyebrow="我的设置"
      title="个人偏好"
      description="集中管理登录状态、阅读偏好、微信与邮件推送，以及今天这期的打卡节奏。"
      actions={
        <>
          <TechAction href="/frontier-tech">返回首页</TechAction>
          <TechAction href="/frontier-tech/issues">历史归档</TechAction>
        </>
      }
    >
      <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <TechRail eyebrow="今日状态" title="阅读状态">
          <div className="space-y-4 text-[0.84rem] leading-7 text-[#98a4b7]">
            <p>当前连续 {issue.checkinStatus.currentStreak} 天，最佳 {issue.checkinStatus.bestStreak} 天。</p>
            <p>
              已完成 {issue.checkinStatus.completedSections}/{issue.checkinStatus.totalSections} 个板块，
              尚有 {issue.checkinStatus.pendingItems} 条待处理。
            </p>
          </div>
        </TechRail>
        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
          <TechMePanel initialState={initialState} />
        </div>
      </section>
    </TechShell>
  );
}
