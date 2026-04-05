import path from "node:path";
import { promises as fs } from "node:fs";

import { enrichBrief } from "@/lib/brief-enrichment";
import { generateDailyBrief } from "@/lib/brief-pipeline";
import { writeArtifact } from "@/lib/io";
import { renderBriefEmail } from "@/renderers/email";
import type { DailyBrief } from "@/types/brief";

export async function readBriefByDate(issueDate: string): Promise<DailyBrief | null> {
  const artifactsDir = path.join(process.cwd(), "artifacts");

  try {
    const payload = await fs.readFile(path.join(artifactsDir, `daily-brief-${issueDate}.json`), "utf8");
    return JSON.parse(payload) as DailyBrief;
  } catch {
    return null;
  }
}

export function getCurrentIssueDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.BRIEF_TIMEZONE ?? "Asia/Shanghai",
  }).format(now);
}

function buildIssueDateAnchor(issueDate: string): Date {
  return new Date(`${issueDate}T12:00:00+08:00`);
}

export async function ensureBriefByDate(issueDate: string): Promise<DailyBrief> {
  const existing = await readBriefByDate(issueDate);
  if (existing) {
    return existing;
  }

  const previousMode = process.env.BRIEF_USE_CODEX_SUMMARY;
  process.env.BRIEF_USE_CODEX_SUMMARY ??= "0";

  try {
    const draftBrief = await generateDailyBrief(buildIssueDateAnchor(issueDate));
    const brief = {
      ...(await enrichBrief(draftBrief)),
      date: issueDate,
    };
    const artifactsDir = path.join(process.cwd(), "artifacts");

    try {
      await writeArtifact(
        artifactsDir,
        `daily-brief-${brief.date}.json`,
        JSON.stringify(brief, null, 2),
      );
      await writeArtifact(artifactsDir, `daily-brief-${brief.date}.html`, renderBriefEmail(brief));
    } catch {
      // Production runtimes may not persist local writes. We still return the generated brief.
    }

    return brief;
  } finally {
    if (previousMode === undefined) {
      delete process.env.BRIEF_USE_CODEX_SUMMARY;
    } else {
      process.env.BRIEF_USE_CODEX_SUMMARY = previousMode;
    }
  }
}

export async function readLatestBrief(): Promise<DailyBrief | null> {
  const artifactsDir = path.join(process.cwd(), "artifacts");

  try {
    const files = await fs.readdir(artifactsDir);
    const latestFile = files
      .filter((file) => /^daily-brief-\d{4}-\d{2}-\d{2}\.json$/.test(file))
      .sort()
      .at(-1);

    if (!latestFile) {
      return await ensureBriefByDate(getCurrentIssueDate());
    }

    const latestIssueDate = latestFile.replace(/^daily-brief-/, "").replace(/\.json$/, "");
    const todayIssueDate = getCurrentIssueDate();

    if (latestIssueDate < todayIssueDate) {
      return await ensureBriefByDate(todayIssueDate);
    }

    return await readBriefByDate(latestIssueDate);
  } catch {
    return await ensureBriefByDate(getCurrentIssueDate());
  }
}
