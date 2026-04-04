import { NextResponse } from "next/server";
import path from "node:path";

import { deliverBrief } from "@/delivery";
import { enrichBrief } from "@/lib/brief-enrichment";
import { generateDailyBrief } from "@/lib/brief-pipeline";
import { writeArtifact } from "@/lib/io";
import { readBriefByDate } from "@/lib/latest-brief";
import { renderBriefEmail } from "@/renderers/email";

function formatIssueDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.BRIEF_TIMEZONE ?? "Asia/Shanghai",
  }).format(now);
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const requestedIssueDate = new URL(request.url).searchParams.get("issueDate")?.trim();

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const issueDate = requestedIssueDate || formatIssueDate();
  let brief = await readBriefByDate(issueDate);

  if (!brief) {
    const previousMode = process.env.BRIEF_USE_CODEX_SUMMARY;
    process.env.BRIEF_USE_CODEX_SUMMARY ??= "0";

    try {
      const draftBrief = await generateDailyBrief();
      brief = await enrichBrief(draftBrief);

      const artifactsDir = path.join(process.cwd(), "artifacts");
      await writeArtifact(
        artifactsDir,
        `daily-brief-${brief.date}.json`,
        JSON.stringify(brief, null, 2),
      );
      await writeArtifact(artifactsDir, `daily-brief-${brief.date}.html`, renderBriefEmail(brief));
    } finally {
      if (previousMode === undefined) {
        delete process.env.BRIEF_USE_CODEX_SUMMARY;
      } else {
        process.env.BRIEF_USE_CODEX_SUMMARY = previousMode;
      }
    }
  }

  const delivery = await deliverBrief(brief);

  return NextResponse.json({
    ok: true,
    issueDate,
    mode: delivery.mode,
    generatedAt: new Date().toISOString(),
    delivery,
    brief,
  });
}
