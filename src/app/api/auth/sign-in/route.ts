import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAdminAccessState, INTELLY_ADMIN_COOKIE } from "@/lib/admin-auth";
import { getIntellyTodayIssue } from "@/lib/intelly-issues";
import { INTELLY_SESSION_COOKIE, signInLocalUser } from "@/lib/intelly-user";
import type { IntellyMeResponse } from "@/types/intelly";

export async function POST(request: Request) {
  const requestPayload = (await request.json().catch(() => null)) as { email?: string } | null;
  const email = requestPayload?.email?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "请输入有效邮箱地址。" }, { status: 400 });
  }

  const state = await signInLocalUser(email);
  const cookieStore = await cookies();
  cookieStore.set(INTELLY_SESSION_COOKIE, email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
  cookieStore.set(INTELLY_ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  });
  const issue = await getIntellyTodayIssue(email);
  const adminState = getAdminAccessState(email, null);
  const responsePayload: IntellyMeResponse = {
    user: state.user,
    settings: state.settings,
    currentStreak: issue.checkinStatus.currentStreak,
    todayCheckinStatus: issue.checkinStatus,
    ...adminState,
  };

  return NextResponse.json(responsePayload);
}
