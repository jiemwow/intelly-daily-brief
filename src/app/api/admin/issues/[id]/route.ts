import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/admin-auth";
import { readBriefByDate } from "@/lib/latest-brief";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const access = await requireAdminApiAccess();
  if (!access.ok) {
    return access.response;
  }

  const { id } = await context.params;
  const brief = await readBriefByDate(id);

  if (!brief) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  return NextResponse.json({
    issueDate: brief.date,
    headline: brief.headline,
    trendLine: brief.trendLine,
    sectionCount: brief.sections.length,
    brief,
  });
}
