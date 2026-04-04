import { cookies } from "next/headers";
import Link from "next/link";

import { MePanel } from "@/components/me-panel";
import { getIntellyTodayIssue } from "@/lib/intelly-issues";
import { getStoredUser, INTELLY_SESSION_COOKIE } from "@/lib/intelly-user";
import type { IntellyMeResponse } from "@/types/intelly";

export const metadata = {
  title: "Intelly | 我的",
  description: "查看打卡状态、登录状态与阅读偏好。",
};

export const dynamic = "force-dynamic";

export default async function MePage() {
  const cookieStore = await cookies();
  const sessionEmail = cookieStore.get(INTELLY_SESSION_COOKIE)?.value;
  const [{ user, settings }, issue] = await Promise.all([
    getStoredUser(sessionEmail),
    getIntellyTodayIssue(sessionEmail),
  ]);

  const initialState: IntellyMeResponse =
    sessionEmail && user?.email === sessionEmail
      ? {
          user,
          settings,
          currentStreak: issue.checkinStatus.currentStreak,
          todayCheckinStatus: issue.checkinStatus,
        }
      : {
          user: null,
          settings: null,
          currentStreak: 0,
          todayCheckinStatus: null,
        };

  return (
    <main className="min-h-screen bg-[#eef3f7] px-4 py-6 text-slate-950 md:px-6 md:py-8">
      <div className="mx-auto max-w-[1180px] rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,#fbfdff_0%,#f5f8fc_100%)] px-5 py-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] md:px-8 md:py-8">
        <header className="flex flex-col gap-4 border-b border-slate-900/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[0.74rem] tracking-[0.22em] text-slate-500">MY INTELLY</div>
            <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-slate-950">我的</h1>
            <p className="mt-2 max-w-[42rem] text-[0.95rem] leading-7 text-slate-600">
              这里集中管理登录状态、阅读偏好、推送方式和今天的打卡节奏。
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-[0.82rem] text-slate-500">
            <Link
              href="/"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 transition hover:border-[#2457d6] hover:text-[#2457d6]"
            >
              返回首页
            </Link>
            <Link
              href="/issues"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 transition hover:border-[#2457d6] hover:text-[#2457d6]"
            >
              历史简报
            </Link>
          </div>
        </header>

        <div className="mt-8">
          <MePanel initialState={initialState} />
        </div>
      </div>
    </main>
  );
}
