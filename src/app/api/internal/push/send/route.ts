import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/admin-auth";
import { sendPushDelivery } from "@/lib/push-delivery";

type RequestPayload = {
  issueDate?: string;
  channel?: "email" | "wechat" | "im";
  targetUsers?: string[];
};

export async function POST(request: Request) {
  const access = await requireAdminApiAccess();
  if (!access.ok) {
    return access.response;
  }

  const payload = (await request.json().catch(() => null)) as RequestPayload | null;
  const channel = payload?.channel;

  if (!channel) {
    return NextResponse.json({ error: "channel is required" }, { status: 400 });
  }

  try {
    const delivery = await sendPushDelivery({
      issueDate: payload?.issueDate,
      channel,
      targetUsers: payload?.targetUsers,
    });

    return NextResponse.json({
      ok: true,
      delivery,
    });
  } catch (error) {
    const detail = error instanceof Error && "detail" in error ? (error as { detail?: unknown }).detail : null;
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Push delivery failed",
        detail,
      },
      { status: 502 },
    );
  }
}
