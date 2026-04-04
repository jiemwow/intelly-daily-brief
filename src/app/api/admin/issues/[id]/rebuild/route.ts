import path from "node:path";

import { NextResponse } from "next/server";

import { enrichBrief } from "@/lib/brief-enrichment";
import { generateDailyBrief } from "@/lib/brief-pipeline";
import { writeArtifact } from "@/lib/io";
import { renderBriefEmail } from "@/renderers/email";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const targetDate = new Date(`${id}T08:00:00+08:00`);

  if (Number.isNaN(targetDate.getTime())) {
    return NextResponse.json({ error: "Invalid issue date" }, { status: 400 });
  }

  const draftBrief = await generateDailyBrief(targetDate);
  const brief = await enrichBrief(draftBrief);
  const renderedEmail = renderBriefEmail(brief);
  const artifactsDir = path.join(process.cwd(), "artifacts");

  const jsonPath = await writeArtifact(
    artifactsDir,
    `daily-brief-${brief.date}.json`,
    JSON.stringify(brief, null, 2),
  );
  const htmlPath = await writeArtifact(artifactsDir, `daily-brief-${brief.date}.html`, renderedEmail);

  return NextResponse.json({
    ok: true,
    rebuilt: true,
    issueDate: brief.date,
    jsonPath,
    htmlPath,
  });
}
