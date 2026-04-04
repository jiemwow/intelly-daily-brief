import { NextResponse } from "next/server";

import { readBriefByDate, readLatestBrief } from "@/lib/latest-brief";

type RequestPayload = {
  issueDate?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as RequestPayload | null;
  const brief = payload?.issueDate ? await readBriefByDate(payload.issueDate) : await readLatestBrief();

  if (!brief) {
    return NextResponse.json({ error: "Brief not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    published: true,
    issueDate: brief.date,
  });
}
