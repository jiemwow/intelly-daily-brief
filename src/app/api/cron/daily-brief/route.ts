import { NextResponse } from "next/server";

import { ensureBriefByDate, getCurrentIssueDate } from "@/lib/latest-brief";
import {
  listEnabledPushTargets,
  listScheduledPushTargets,
  sendPushDelivery,
} from "@/lib/push-delivery";

type PushChannel = "email" | "wechat" | "im";

async function resolveTargetsForRun(input: {
  issueDate: string;
  channel: PushChannel;
  manualRun: boolean;
  now: Date;
}) {
  if (input.manualRun) {
    return await listEnabledPushTargets(input.channel);
  }

  return await listScheduledPushTargets({
    issueDate: input.issueDate,
    channel: input.channel,
    now: input.now,
  });
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const url = new URL(request.url);
  const requestedIssueDate = url.searchParams.get("issueDate")?.trim();
  const requestedChannel = url.searchParams.get("channel")?.trim() as PushChannel | null;
  const dryRun = url.searchParams.get("dryRun") === "1";

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const issueDate = requestedIssueDate || getCurrentIssueDate();
  const now = new Date();
  const brief = await ensureBriefByDate(issueDate);
  const manualRun = Boolean(requestedIssueDate);
  const channels = requestedChannel ? [requestedChannel] : (["email", "wechat"] satisfies PushChannel[]);
  const deliveries = await Promise.all(
    channels.map(async (channel) => {
      const targetUsers = await resolveTargetsForRun({
        issueDate,
        channel,
        manualRun,
        now,
      });

      if (targetUsers.length === 0) {
        return {
          channel,
          status: "skipped",
          targets: [],
          reason: manualRun ? "No enabled recipients found." : "No recipients due in this dispatch window.",
        };
      }

      if (dryRun) {
        return {
          channel,
          status: "scheduled",
          targets: targetUsers,
        };
      }

      const delivery = await sendPushDelivery({
        issueDate,
        channel,
        targetUsers,
      });

      return {
        channel,
        status: delivery.status,
        targets: targetUsers,
        delivery,
      };
    }),
  );

  return NextResponse.json({
    ok: true,
    issueDate,
    mode: dryRun ? "dry-run" : manualRun ? "manual" : "scheduled",
    generatedAt: new Date().toISOString(),
    deliveries,
    brief,
  });
}
