import type { BriefSectionConfig, BriefTopic, Region } from "@/types/brief";

export const briefRecipient = "jiem.yangjie@huawei.com";
export const briefTimezone = "Asia/Shanghai";
export const briefSendHour = 8;

export const sectionConfigs: BriefSectionConfig[] = [
  {
    key: "ai",
    title: "AI",
    topics: ["ai"],
    regions: ["global", "china"],
    targetItems: 4,
  },
  {
    key: "autonomous-driving",
    title: "智能驾驶",
    topics: ["autonomous-driving"],
    regions: ["global", "china"],
    targetItems: 4,
  },
  {
    key: "embodied-intelligence",
    title: "具身智能",
    topics: ["embodied-intelligence"],
    regions: ["global", "china"],
    targetItems: 3,
  },
  {
    key: "world",
    title: "全球要闻",
    topics: ["world"],
    regions: ["global"],
    targetItems: 3,
  },
  {
    key: "business",
    title: "商业趋势",
    topics: ["business"],
    regions: ["global", "china"],
    targetItems: 3,
  },
];

export const trackedTopics: BriefTopic[] = [
  "ai",
  "autonomous-driving",
  "embodied-intelligence",
  "world",
  "business",
];
export const trackedRegions: Region[] = ["global", "china"];

export function resolveBriefRecipient(): string {
  return process.env.BRIEF_RECIPIENT_EMAIL ?? briefRecipient;
}
