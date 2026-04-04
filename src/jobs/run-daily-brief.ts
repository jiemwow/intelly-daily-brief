import path from "node:path";

import { enrichBrief } from "@/lib/brief-enrichment";
import { generateDailyBrief } from "@/lib/brief-pipeline";
import { writeArtifact } from "@/lib/io";
import { renderBriefEmail } from "@/renderers/email";

async function main() {
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

  console.log(JSON.stringify({ brief, jsonPath, htmlPath }, null, 2));
}

main().catch((error) => {
  console.error("Failed to run daily brief job");
  console.error(error);
  process.exit(1);
});
