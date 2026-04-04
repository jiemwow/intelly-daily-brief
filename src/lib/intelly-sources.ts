import path from "node:path";
import { readFileSync, writeFileSync } from "node:fs";

import type { BriefTopic, Region } from "@/types/brief";
import type {
  IntellySourcePriority,
  IntellySourceRegistryEntry,
  IntellySourceStatus,
} from "@/types/intelly";

const sourceRegistryFilePath = path.join(
  process.cwd(),
  "src",
  "data",
  "intelly",
  "source-registry.json",
);

const supportedTopics = new Set<BriefTopic>([
  "ai",
  "autonomous-driving",
  "embodied-intelligence",
  "world",
  "business",
]);
const supportedRegions = new Set<Region>(["global", "china"]);

function readSourceRegistry(): IntellySourceRegistryEntry[] {
  try {
    const payload = readFileSync(sourceRegistryFilePath, "utf8");
    const parsed = JSON.parse(payload) as IntellySourceRegistryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSourceRegistry(entries: IntellySourceRegistryEntry[]) {
  writeFileSync(sourceRegistryFilePath, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
}

export function listIntellySources(): IntellySourceRegistryEntry[] {
  return readSourceRegistry();
}

export function getIntellySourceById(sourceId: string): IntellySourceRegistryEntry | null {
  return listIntellySources().find((source) => source.sourceId === sourceId) ?? null;
}

export function updateIntellySource(
  sourceId: string,
  updates: Partial<Pick<IntellySourceRegistryEntry, "status" | "priority" | "fetchIntervalMinutes" | "notes">>,
): IntellySourceRegistryEntry | null {
  const entries = listIntellySources();
  const index = entries.findIndex((entry) => entry.sourceId === sourceId);

  if (index < 0) {
    return null;
  }

  const nextEntry: IntellySourceRegistryEntry = {
    ...entries[index],
    status: (updates.status as IntellySourceStatus | undefined) ?? entries[index].status,
    priority: (updates.priority as IntellySourcePriority | undefined) ?? entries[index].priority,
    fetchIntervalMinutes: updates.fetchIntervalMinutes ?? entries[index].fetchIntervalMinutes,
    notes: updates.notes ?? entries[index].notes,
  };
  entries[index] = nextEntry;
  writeSourceRegistry(entries);
  return nextEntry;
}

export function listActiveRssSources(): IntellySourceRegistryEntry[] {
  return listIntellySources().filter(
    (source) => source.status === "active" && source.channelType === "rss" && Boolean(source.rssUrl),
  );
}

export function listActiveManualSources(): IntellySourceRegistryEntry[] {
  return listIntellySources().filter(
    (source) => source.status === "active" && source.channelType === "manual",
  );
}

export function listBriefCollectableRssSources(): IntellySourceRegistryEntry[] {
  return listActiveRssSources().filter(
    (source) =>
      source.topics.some((topic) => supportedTopics.has(topic as BriefTopic)) &&
      source.regions.some((region) => supportedRegions.has(region as Region)),
  );
}

export function listBriefCollectableManualSources(): IntellySourceRegistryEntry[] {
  return listActiveManualSources().filter(
    (source) =>
      source.topics.some((topic) => supportedTopics.has(topic as BriefTopic)) &&
      source.regions.some((region) => supportedRegions.has(region as Region)),
  );
}

export function summarizeIntellySources() {
  const sourceRegistry = listIntellySources();
  const activeSources = sourceRegistry.filter((source) => source.status === "active");
  const backlogSources = sourceRegistry.filter((source) => source.status === "backlog");
  const pausedSources = sourceRegistry.filter((source) => source.status === "paused");
  const activeRssSources = listActiveRssSources();
  const activeManualSources = listActiveManualSources();

  return {
    total: sourceRegistry.length,
    active: activeSources.length,
    paused: pausedSources.length,
    backlog: backlogSources.length,
    activeRss: activeRssSources.length,
    activeManual: activeManualSources.length,
    topics: Array.from(
      sourceRegistry.reduce((topics, source) => {
        source.topics.forEach((topic) => topics.add(topic));
        return topics;
      }, new Set<string>()),
    ),
    channels: Array.from(
      sourceRegistry.reduce((channels, source) => {
        channels.add(source.channelType);
        return channels;
      }, new Set<string>()),
    ),
  };
}
