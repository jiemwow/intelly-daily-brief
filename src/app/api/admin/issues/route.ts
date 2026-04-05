import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/admin-auth";
import { listIntellyIssues } from "@/lib/intelly-issues";

export async function GET() {
  const access = await requireAdminApiAccess();
  if (!access.ok) {
    return access.response;
  }

  const items = await listIntellyIssues();

  return NextResponse.json({
    items,
    total: items.length,
  });
}
