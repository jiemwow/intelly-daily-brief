import { NextResponse } from "next/server";

import { listIntellySources, summarizeIntellySources } from "@/lib/intelly-sources";

export async function POST() {
  const summary = summarizeIntellySources();
  const preview = listIntellySources()
    .filter((source) => source.status === "active")
    .slice(0, 5)
    .map((source) => ({
      sourceId: source.sourceId,
      name: source.name,
      channelType: source.channelType,
      topics: source.topics,
      entryUrl: source.entryUrl,
    }));

  return NextResponse.json({
    success: true,
    stage: "rss-registry-ready",
    message: "信源注册表已接入可执行 RSS 配置，下一步可继续扩展 crawler 适配器。",
    summary,
    preview,
  });
}
