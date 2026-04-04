import { collectNewsWithDiagnostics } from "@/collectors";
import { sectionConfigs } from "@/config/brief";

async function main() {
  const { items, feeds } = await collectNewsWithDiagnostics();
  const registryBackedItems = items.filter((item) => item.sourceId);
  const registryFeedSummary = feeds
    .filter((feed) => feed.sourceId)
    .map((feed) => ({
      feedId: feed.id,
      sourceId: feed.sourceId,
      sourceName: feed.sourceName,
      topic: feed.topic,
      region: feed.region,
      status: feed.status,
      itemCount: feed.itemCount,
      error: feed.error,
    }))
    .sort((left, right) => {
      if (left.status !== right.status) {
        return left.status === "rejected" ? -1 : 1;
      }

      return right.itemCount - left.itemCount;
    });

  const registrySourceBreakdown = Array.from(
    registryBackedItems.reduce((map, item) => {
      const key = item.sourceId ?? "unknown";
      const current = map.get(key) ?? {
        sourceId: key,
        itemCount: 0,
        labels: new Set<string>(),
      };

      current.itemCount += 1;
      current.labels.add(item.source);
      map.set(key, current);
      return map;
    }, new Map<string, { sourceId: string; itemCount: number; labels: Set<string> }>()),
  )
    .map(([, value]) => ({
      sourceId: value.sourceId,
      itemCount: value.itemCount,
      labels: [...value.labels],
    }))
    .sort((left, right) => right.itemCount - left.itemCount);

  const sections = sectionConfigs.map((section) => {
    const candidates = items
      .filter((item) => section.topics.includes(item.topic))
      .filter((item) => !section.regions || section.regions.includes(item.region))
      .slice(0, 8);

    const uniqueSources = [...new Set(candidates.map((item) => item.source))];

    return {
      section: section.title,
      totalCandidates: items.filter(
        (item) =>
          section.topics.includes(item.topic) &&
          (!section.regions || section.regions.includes(item.region)),
      ).length,
      uniqueSources: uniqueSources.length,
      topSources: uniqueSources.slice(0, 5),
      topTitles: candidates.slice(0, 5).map((item) => ({
        title: item.title,
        source: item.source,
        score: item.score ?? 0,
      })),
    };
  });

  console.log(
    JSON.stringify(
      {
        totalItems: items.length,
        registryBackedItems: registryBackedItems.length,
        registryBackedSources: [...new Set(registryBackedItems.map((item) => item.sourceId))].length,
        registryFeeds: registryFeedSummary,
        registrySourceBreakdown,
        sections,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("Failed to inspect candidates");
  console.error(error);
  process.exit(1);
});
