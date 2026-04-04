import { NextResponse } from "next/server";

import { listIntellyIssues } from "@/lib/intelly-issues";

export async function GET() {
  const items = await listIntellyIssues();

  return NextResponse.json({
    items,
    total: items.length,
  });
}
