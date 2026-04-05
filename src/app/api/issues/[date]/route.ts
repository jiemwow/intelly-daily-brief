import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getIntellyIssueByDate } from "@/lib/intelly-issues";
import { INTELLY_SESSION_COOKIE, readSessionEmail } from "@/lib/intelly-user";

type RouteContext = {
  params: Promise<{
    date: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { date } = await context.params;
  const sessionEmail = readSessionEmail((await cookies()).get(INTELLY_SESSION_COOKIE)?.value);
  const issue = await getIntellyIssueByDate(date, sessionEmail);

  if (!issue) {
    return NextResponse.json(
      {
        error: "Issue not found",
        issueDate: date,
      },
      { status: 404 },
    );
  }

  return NextResponse.json(issue);
}
