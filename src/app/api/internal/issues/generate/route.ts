import path from "node:path";

import { NextResponse } from "next/server";

import { enrichBrief } from "@/lib/brief-enrichment";
import { generateDailyBrief } from "@/lib/brief-pipeline";
import { writeArtifact } from "@/lib/io";
import { renderBriefEmail } from "@/renderers/email";

export async function POST() {
  const draftBrief = await generateDailyBrief();
  const brief = await enrichBrief(draftBrief);
  const renderedEmail = renderBriefEmail(brief);
  const artifactsDir = path.join(process.cwd(), "artifacts");

  const jsonPath = await writeArtifact(
    artifactsDir,
    `daily-brief-${brief.date}.json`,
    JSON.stringify(brief, null, 2),
  );

  const htmlPath = await writeArtifact(
    artifactsDir,
    `daily-brief-${brief.date}.html`,
    renderedEmail,
  );

  return NextResponse.json({
    ok: true,
    issueDate: brief.date,
    jsonPath,
    htmlPath,
  });
}
