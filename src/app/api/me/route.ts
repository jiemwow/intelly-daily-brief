import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAdminAccessState, INTELLY_ADMIN_COOKIE } from "@/lib/admin-auth";
import { getIntellyTodayIssue } from "@/lib/intelly-issues";
import { getStoredUser, INTELLY_SESSION_COOKIE, updateUserSettings } from "@/lib/intelly-user";
import type { IntellyMeResponse, IntellyUserSettings } from "@/types/intelly";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const cookieStore = await cookies();
  const sessionEmail = cookieStore.get(INTELLY_SESSION_COOKIE)?.value;
  const adminToken = cookieStore.get(INTELLY_ADMIN_COOKIE)?.value;
  const { user, settings } = await getStoredUser(sessionEmail);
  const adminState = getAdminAccessState(sessionEmail, adminToken);

  if (!sessionEmail || !user || user.email !== sessionEmail) {
    const payload: IntellyMeResponse = {
      user: null,
      settings: null,
      currentStreak: 0,
      todayCheckinStatus: null,
      ...adminState,
    };

    return NextResponse.json(payload);
  }

  const issue = await getIntellyTodayIssue(sessionEmail);
  const payload: IntellyMeResponse = {
    user,
    settings,
    currentStreak: issue.checkinStatus.currentStreak,
    todayCheckinStatus: issue.checkinStatus,
    ...adminState,
  };

  return NextResponse.json(payload);
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const sessionEmail = cookieStore.get(INTELLY_SESSION_COOKIE)?.value;
  const { user } = await getStoredUser(sessionEmail);

  if (!sessionEmail || !user || user.email !== sessionEmail) {
    return unauthorized();
  }

  const payload = (await request.json().catch(() => null)) as
    | (Partial<IntellyUserSettings> & { preferredTopics?: IntellyUserSettings["preferredSections"] })
    | null;
  if (!payload) {
    return NextResponse.json({ error: "无效设置内容。" }, { status: 400 });
  }

  const settings = await updateUserSettings(sessionEmail, {
    ...payload,
    preferredSections: payload.preferredSections ?? payload.preferredTopics,
  });
  return NextResponse.json({ ok: true, settings });
}
