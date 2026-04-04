export type BriefTopic =
  | "ai"
  | "autonomous-driving"
  | "embodied-intelligence"
  | "world"
  | "business";
export type Region = "china" | "global";

export type BriefSectionKey =
  | "ai"
  | "autonomous-driving"
  | "embodied-intelligence"
  | "world"
  | "business";

export type NewsItem = {
  id: string;
  title: string;
  url: string;
  sourceId?: string;
  source: string;
  publishedAt: string;
  region: Region;
  topic: BriefTopic;
  summary?: string;
  rawContent?: string;
  score?: number;
  whyItMatters?: string;
  imageUrl?: string;
};

export type BriefItem = {
  title: string;
  summary: string;
  whyItMatters: string;
  source: string;
  publishedAt: string;
  url: string;
  canonicalUrl?: string;
  imageUrl?: string;
};

export type BriefSection = {
  key: BriefSectionKey;
  title: string;
  items: BriefItem[];
};

export type DailyBrief = {
  date: string;
  recipient: string;
  headline: string;
  trendLine: string;
  leadStory: BriefItem;
  topHighlights: BriefItem[];
  sections: BriefSection[];
};

export type BriefSectionConfig = {
  key: BriefSectionKey;
  title: string;
  topics: BriefTopic[];
  regions?: Region[];
  targetItems: number;
};

export type DateRange = {
  start: Date;
  end: Date;
};
