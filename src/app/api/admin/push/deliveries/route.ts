import { NextResponse } from "next/server";

import { listPushDeliveries } from "@/lib/push-delivery";

export async function GET() {
  const items = await listPushDeliveries();
  return NextResponse.json({
    items,
    total: items.length,
  });
}
