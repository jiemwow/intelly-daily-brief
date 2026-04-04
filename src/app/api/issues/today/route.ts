import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getIntellyTodayIssue } from "@/lib/intelly-issues";
import { INTELLY_SESSION_COOKIE } from "@/lib/intelly-user";

export async function GET() {
  const sessionEmail = (await cookies()).get(INTELLY_SESSION_COOKIE)?.value;
  return NextResponse.json(await getIntellyTodayIssue(sessionEmail));
}
