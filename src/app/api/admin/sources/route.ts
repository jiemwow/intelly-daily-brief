import { NextResponse } from "next/server";

import { listIntellySources, summarizeIntellySources } from "@/lib/intelly-sources";

export async function GET() {
  const items = listIntellySources();

  return NextResponse.json({
    items,
    summary: summarizeIntellySources(),
  });
}
