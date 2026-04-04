import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { markSectionAsRead } from "@/lib/intelly-checkins";
import { INTELLY_SESSION_COOKIE } from "@/lib/intelly-user";

type ReadingPayload = {
  issueDate?: string;
  sectionKey?: string;
};

export async function POST(request: Request) {
  const sessionEmail = (await cookies()).get(INTELLY_SESSION_COOKIE)?.value;
  const payload = (await request.json().catch(() => null)) as ReadingPayload | null;

  if (!payload?.issueDate || !payload?.sectionKey) {
    return NextResponse.json({ error: "issueDate and sectionKey are required." }, { status: 400 });
  }

  await markSectionAsRead(sessionEmail, payload.issueDate, payload.sectionKey);

  return NextResponse.json({
    ok: true,
    issueDate: payload.issueDate,
    sectionKey: payload.sectionKey,
    user: sessionEmail ?? "guest",
  });
}
