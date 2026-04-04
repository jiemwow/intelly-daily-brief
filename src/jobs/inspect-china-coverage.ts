import { collectNewsWithDiagnostics } from "@/collectors";

async function main() {
  const result = await collectNewsWithDiagnostics();

  const totals = result.items.reduce<Record<string, number>>((accumulator, item) => {
    const key = `${item.topic}:${item.region}`;
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});

  const chinaTopSources = Object.entries(
    result.items
      .filter((item) => item.region === "china")
      .reduce<Record<string, number>>((accumulator, item) => {
        accumulator[item.source] = (accumulator[item.source] ?? 0) + 1;
        return accumulator;
      }, {}),
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 20);

  const sampleBy = (topic: "ai" | "autonomous-driving" | "embodied-intelligence" | "business") =>
    result.items
      .filter((item) => item.topic === topic && item.region === "china")
      .slice(0, 8)
      .map((item) => ({
        title: item.title,
        source: item.source,
        sourceId: item.sourceId ?? "",
        score: item.score ?? 0,
      }));

  console.log(
    JSON.stringify(
      {
        totals,
        chinaTopSources,
        samples: {
          ai: sampleBy("ai"),
          autonomousDriving: sampleBy("autonomous-driving"),
          embodied: sampleBy("embodied-intelligence"),
          business: sampleBy("business"),
        },
        failedFeeds: result.feeds
          .filter((feed) => feed.status === "rejected")
          .map((feed) => ({
            id: feed.id,
            sourceId: feed.sourceId ?? "",
            sourceName: feed.sourceName ?? "",
            error: feed.error ?? "",
          }))
          .slice(0, 30),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("Failed to inspect China coverage");
  console.error(error);
  process.exit(1);
});
