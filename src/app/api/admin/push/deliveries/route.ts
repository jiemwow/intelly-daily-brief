import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/admin-auth";
import { listPushDeliveries } from "@/lib/push-delivery";

export async function GET() {
  const access = await requireAdminApiAccess();
  if (!access.ok) {
    return access.response;
  }

  const items = await listPushDeliveries();
  return NextResponse.json({
    items,
    total: items.length,
  });
}
