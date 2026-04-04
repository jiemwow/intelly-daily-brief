export type IntellySectionVisual = {
  accent: string;
  surface: string;
  ring: string;
};

export type IntellyLeadStory = {
  title: string;
  summary: string;
  meta: string;
  image?: string;
  readTime: string;
  sourceName: string;
  url: string;
  isCanonicalLink?: boolean;
};

export type IntellyHighlight = {
  label: string;
  text: string;
};

export type IntellyStoryItem = {
  title: string;
  sourceName: string;
  url: string;
  isCanonicalLink?: boolean;
};

export type IntellySection = {
  key: string;
  title: string;
  strap: string;
  tone: string;
  image?: string;
  visual: IntellySectionVisual;
  stories: IntellyStoryItem[];
  status?: "ready" | "gap";
  note?: string;
};

export type IntellyCheckinStatus = {
  currentStreak: number;
  bestStreak: number;
  completedSections: number;
  totalSections: number;
  pendingItems: number;
  checkedInToday: boolean;
  lastCheckinDate?: string;
};

export type IntellyIssueView = {
  issueDate: string;
  headline: string;
  trendLine: string;
  leadStory: IntellyLeadStory;
  highlights: IntellyHighlight[];
  sections: IntellySection[];
  checkinStatus: IntellyCheckinStatus;
};

export type IntellyCheckinResponse = {
  success: boolean;
  issueDate: string;
  currentStreak: number;
  bestStreak: number;
  checkedInToday: boolean;
  lastCheckinDate?: string;
};

export type IntellyCheckinHistoryEntry = {
  issueDate: string;
  currentStreak: number;
  bestStreak: number;
  checkedAt: string;
};

export type IntellyCheckinHistoryResponse = {
  items: IntellyCheckinHistoryEntry[];
  currentStreak: number;
  bestStreak: number;
};

export type IntellyIssueArchiveEntry = {
  issueDate: string;
  headline: string;
  leadTitle: string;
  leadSourceName: string;
  sectionCount: number;
};

export type IntellyPreferredSection = "ai" | "autonomous-driving" | "embodied-intelligence" | "world" | "business";

export type IntellyUserSettings = {
  preferredSections: IntellyPreferredSection[];
  pushEmailEnabled: boolean;
  pushWechatEnabled: boolean;
  dailyPushTime: string;
};

export type IntellyUserProfile = {
  email: string;
  displayName: string;
};

export type IntellyMeResponse = {
  user: IntellyUserProfile | null;
  settings: IntellyUserSettings | null;
  currentStreak: number;
  todayCheckinStatus: IntellyCheckinStatus | null;
};

export type IntellySourceChannelType = "rss" | "manual" | "crawler" | "pdf";

export type IntellySourceTrustLevel = "official" | "mainstream" | "vertical";

export type IntellySourcePriority = "high" | "medium" | "low";

export type IntellySourceStatus = "active" | "paused" | "backlog";

export type IntellySourceRegistryEntry = {
  sourceId: string;
  name: string;
  domain: string;
  channelType: IntellySourceChannelType;
  entryUrl: string;
  topics: string[];
  regions: string[];
  trustLevel: IntellySourceTrustLevel;
  priority: IntellySourcePriority;
  fetchIntervalMinutes: number;
  status: IntellySourceStatus;
  notes: string;
  rssUrl?: string;
  language?: string;
  parserHints?: string[];
};
