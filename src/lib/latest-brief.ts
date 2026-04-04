import path from "node:path";
import { promises as fs } from "node:fs";

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

export async function readLatestBrief(): Promise<DailyBrief | null> {
  const artifactsDir = path.join(process.cwd(), "artifacts");

  try {
    const files = await fs.readdir(artifactsDir);
    const latestFile = files
      .filter((file) => /^daily-brief-\d{4}-\d{2}-\d{2}\.json$/.test(file))
      .sort()
      .at(-1);

    if (!latestFile) {
      return null;
    }

    return await readBriefByDate(latestFile.replace(/^daily-brief-/, "").replace(/\.json$/, ""));
  } catch {
    return null;
  }
}
