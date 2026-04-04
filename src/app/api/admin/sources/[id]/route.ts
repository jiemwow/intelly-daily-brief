import { NextResponse } from "next/server";

import { getIntellySourceById, updateIntellySource } from "@/lib/intelly-sources";
import type { IntellySourcePriority, IntellySourceStatus } from "@/types/intelly";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type SourceUpdatePayload = {
  status?: IntellySourceStatus;
  priority?: IntellySourcePriority;
  fetchIntervalMinutes?: number;
  notes?: string;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const item = getIntellySourceById(id);

  if (!item) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }

  return NextResponse.json({ item });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const payload = (await request.json().catch(() => null)) as SourceUpdatePayload | null;

  if (!payload) {
    return NextResponse.json({ error: "Invalid source update payload" }, { status: 400 });
  }

  const item = updateIntellySource(id, payload);
  if (!item) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    item,
  });
}
