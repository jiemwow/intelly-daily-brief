import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/admin-auth";
import { listIntellySources, summarizeIntellySources } from "@/lib/intelly-sources";

export async function GET() {
  const access = await requireAdminApiAccess();
  if (!access.ok) {
    return access.response;
  }

  const items = listIntellySources();

  return NextResponse.json({
    items,
    summary: summarizeIntellySources(),
  });
}
