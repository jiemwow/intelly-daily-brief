import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { postIntellyTodayCheckin } from "@/lib/intelly-checkins";
import { getIntellyTodayIssue } from "@/lib/intelly-issues";
import { INTELLY_SESSION_COOKIE } from "@/lib/intelly-user";

export async function GET() {
  const sessionEmail = (await cookies()).get(INTELLY_SESSION_COOKIE)?.value;
  const issue = await getIntellyTodayIssue(sessionEmail);
  return NextResponse.json(issue.checkinStatus);
}

export async function POST() {
  const sessionEmail = (await cookies()).get(INTELLY_SESSION_COOKIE)?.value;
  const issue = await getIntellyTodayIssue(sessionEmail);

  try {
    return NextResponse.json(await postIntellyTodayCheckin(sessionEmail, issue.issueDate));
  } catch (error) {
    if (error instanceof Error && error.message === "READ_REQUIRED") {
      return NextResponse.json(
        { error: "请先至少阅读一个板块，再完成今日打卡。" },
        { status: 400 },
      );
    }

    throw error;
  }
}
