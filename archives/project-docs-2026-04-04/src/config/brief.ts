import type { BriefSectionConfig, BriefTopic, Region } from "@/types/brief";

export const briefRecipient = "jiem.yangjie@huawei.com";
export const briefTimezone = "Asia/Shanghai";
export const briefSendHour = 8;

export const sectionConfigs: BriefSectionConfig[] = [
  {
    key: "global-ai",
    title: "全球人工智能",
    region: "global",
    topic: "ai",
    targetItems: 3,
  },
  {
    key: "china-ai",
    title: "中国人工智能",
    region: "china",
    topic: "ai",
    targetItems: 3,
  },
  {
    key: "global-autonomous-driving",
    title: "全球智能驾驶",
    region: "global",
    topic: "autonomous-driving",
    targetItems: 3,
  },
  {
    key: "china-autonomous-driving",
    title: "中国智能驾驶",
    region: "china",
    topic: "autonomous-driving",
    targetItems: 3,
  },
];

export const trackedTopics: BriefTopic[] = ["ai", "autonomous-driving"];
export const trackedRegions: Region[] = ["global", "china"];

export function resolveBriefRecipient(): string {
  return process.env.BRIEF_RECIPIENT_EMAIL ?? briefRecipient;
}
