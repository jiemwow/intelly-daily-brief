import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getIntellyTodayIssue } from "@/lib/intelly-issues";
import { INTELLY_SESSION_COOKIE, readSessionEmail } from "@/lib/intelly-user";

export async function GET() {
  const sessionEmail = readSessionEmail((await cookies()).get(INTELLY_SESSION_COOKIE)?.value);
  return NextResponse.json(await getIntellyTodayIssue(sessionEmail));
}
