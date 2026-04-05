import { cookies } from "next/headers";

import { FrontierAction, FrontierShell, FrontierSidebarPanel } from "@/components/frontier/frontier-ui";
import { MePanel } from "@/components/me-panel";
import { getAdminAccessState, INTELLY_ADMIN_COOKIE } from "@/lib/admin-auth";
import { getIntellyTodayIssue } from "@/lib/intelly-issues";
import { getStoredUser, INTELLY_SESSION_COOKIE } from "@/lib/intelly-user";
import type { IntellyMeResponse } from "@/types/intelly";

export const dynamic = "force-dynamic";

export default async function FrontierMePage() {
  const cookieStore = await cookies();
  const sessionEmail = cookieStore.get(INTELLY_SESSION_COOKIE)?.value;
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
    <FrontierShell
      eyebrow="Reader Profile"
      title="我的设置"
      description="这一版把个人页改成更像一本刊物的订阅与节奏控制台，强调账号、推送偏好和阅读习惯的整体感。"
      actions={
        <>
          <FrontierAction href="/frontier">返回前沿首页</FrontierAction>
          <FrontierAction href="/me">现有我的页</FrontierAction>
        </>
      }
    >
      <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <FrontierSidebarPanel eyebrow="Today" title="今日阅读状态">
          <div className="space-y-4 text-[0.95rem] leading-7 text-[#564a3f]">
            <p>当前连续 {issue.checkinStatus.currentStreak} 天，历史最佳 {issue.checkinStatus.bestStreak} 天。</p>
            <p>
              今日已完成 {issue.checkinStatus.completedSections}/{issue.checkinStatus.totalSections} 个板块，
              仍有 {issue.checkinStatus.pendingItems} 条待处理。
            </p>
          </div>
        </FrontierSidebarPanel>
        <div className="rounded-[30px] border border-[#1a1a1a]/10 bg-white/70 p-5 shadow-[0_20px_60px_rgba(48,35,24,0.06)]">
          <MePanel initialState={initialState} />
        </div>
      </section>
    </FrontierShell>
  );
}
