import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { listBriefCollectableManualSources, listBriefCollectableRssSources } from "@/lib/intelly-sources";
import type { BriefTopic, NewsItem, Region } from "@/types/brief";
import type {
  IntellySourcePriority,
  IntellySourceRegistryEntry,
  IntellySourceTrustLevel,
} from "@/types/intelly";

const execFileAsync = promisify(execFile);

type FeedConfig = {
  id: string;
  sourceId?: string;
  sourceName?: string;
  url?: string;
  query: string;
  region: Region;
  topic: BriefTopic;
  language: string;
  geo: string;
  ceid: string;
  weight: number;
  trustLevel?: IntellySourceTrustLevel;
  parserHints?: string[];
  timeWindowHours?: number;
};

type RssItem = {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description: string;
  imageUrl?: string;
};

export type NewsCollectionFeedDiagnostic = {
  id: string;
  sourceId?: string;
  sourceName?: string;
  topic: BriefTopic;
  region: Region;
  itemCount: number;
  status: "fulfilled" | "rejected";
  error?: string;
};

export type NewsCollectionDiagnostics = {
  items: NewsItem[];
  feeds: NewsCollectionFeedDiagnostic[];
};

const feedConfigs: FeedConfig[] = [
  {
    id: "global-ai-market",
    query:
      '(AI OR "artificial intelligence" OR "large language model" OR OpenAI OR Anthropic OR Gemini OR "Meta AI" OR Nvidia) when:1d',
    region: "global",
    topic: "ai",
    language: "en-US",
    geo: "US",
    ceid: "US:en",
    weight: 12,
  },
  {
    id: "global-ai-products",
    query:
      '("AI model" OR "model release" OR "AI agent" OR inference OR "AI chip" OR "data center" OR "AI regulation") when:1d',
    region: "global",
    topic: "ai",
    language: "en-US",
    geo: "US",
    ceid: "US:en",
    weight: 9,
  },
  {
    id: "global-ai-companies",
    query:
      '(OpenAI OR Anthropic OR Google DeepMind OR Meta AI OR Microsoft AI OR Nvidia AI) (launch OR release OR deal OR chip OR agent) when:1d',
    region: "global",
    topic: "ai",
    language: "en-US",
    geo: "US",
    ceid: "US:en",
    weight: 10,
  },
  {
    id: "global-ai-tier1",
    query:
      '(OpenAI OR Anthropic OR Microsoft OR Meta OR Nvidia) (Reuters OR "Financial Times" OR WSJ OR TechCrunch) when:1d',
    region: "global",
    topic: "ai",
    language: "en-US",
    geo: "US",
    ceid: "US:en",
    weight: 14,
  },
  {
    id: "china-ai-market",
    query:
      '(人工智能 OR AI OR 大模型 OR 生成式AI OR 智能体 OR 算力 OR AI应用) 中国 when:1d',
    region: "china",
    topic: "ai",
    language: "zh-CN",
    geo: "CN",
    ceid: "CN:zh-Hans",
    weight: 12,
  },
  {
    id: "china-ai-companies",
    query:
      '(阿里云 OR 百度 OR 腾讯混元 OR 字节豆包 OR 华为盘古 OR 月之暗面 OR 智谱 OR MiniMax) AI when:1d',
    region: "china",
    topic: "ai",
    language: "zh-CN",
    geo: "CN",
    ceid: "CN:zh-Hans",
    weight: 10,
  },
  {
    id: "china-ai-media-vertical",
    query:
      '(大模型 OR 智能体 OR AI应用 OR 算力 OR AI基础设施) (36氪 OR 雷峰网 OR 极客公园 OR 机器之心 OR 量子位 OR 智东西) when:2d',
    region: "china",
    topic: "ai",
    language: "zh-CN",
    geo: "CN",
    ceid: "CN:zh-Hans",
    weight: 14,
  },
  {
    id: "china-ai-official-champions",
    query:
      '(华为盘古 OR 百度文心 OR 腾讯混元 OR 阿里通义 OR 智谱 OR MiniMax OR 月之暗面) (发布 OR 开源 OR 上线 OR 推出 OR 升级) when:2d',
    region: "china",
    topic: "ai",
    language: "zh-CN",
    geo: "CN",
    ceid: "CN:zh-Hans",
    weight: 13,
  },
  {
    id: "global-autonomous-driving-market",
    query:
      '("autonomous driving" OR robotaxi OR self-driving OR ADAS OR Waymo OR Tesla FSD OR Mobileye OR Zoox OR Aurora) when:1d',
    region: "global",
    topic: "autonomous-driving",
    language: "en-US",
    geo: "US",
    ceid: "US:en",
    weight: 12,
  },
  {
    id: "global-autonomous-driving-policy",
    query:
      '("robotaxi permit" OR "self-driving investigation" OR "autonomous vehicle safety" OR "driverless" OR "AV regulation") when:1d',
    region: "global",
    topic: "autonomous-driving",
    language: "en-US",
    geo: "US",
    ceid: "US:en",
    weight: 9,
  },
  {
    id: "global-autonomous-driving-companies",
    query:
      '(Waymo OR Tesla FSD OR Uber autonomous OR Zoox OR Mobileye OR Aurora OR Nuro OR Gatik) (expansion OR rollout OR permit OR safety OR launch) when:1d',
    region: "global",
    topic: "autonomous-driving",
    language: "en-US",
    geo: "US",
    ceid: "US:en",
    weight: 11,
  },
  {
    id: "global-autonomous-driving-tier1",
    query:
      '(Waymo OR robotaxi OR "self-driving" OR "autonomous vehicle" OR "driverless") (Reuters OR TechCrunch OR "The Verge" OR WSJ OR "Financial Times") when:1d',
    region: "global",
    topic: "autonomous-driving",
    language: "en-US",
    geo: "US",
    ceid: "US:en",
    weight: 11,
  },
  {
    id: "global-autonomous-driving-techcrunch",
    url: "https://techcrunch.com/category/transportation/feed/",
    query: "",
    region: "global",
    topic: "autonomous-driving",
    language: "en-US",
    geo: "US",
    ceid: "US:en",
    weight: 15,
  },
  {
    id: "china-autonomous-driving-market",
    query:
      '(智能驾驶 OR 自动驾驶 OR 城市NOA OR Robotaxi OR 辅助驾驶 OR 无人驾驶) 中国 when:1d',
    region: "china",
    topic: "autonomous-driving",
    language: "zh-CN",
    geo: "CN",
    ceid: "CN:zh-Hans",
    weight: 12,
  },
  {
    id: "china-autonomous-driving-companies",
    query:
      '(萝卜快跑 OR 小马智行 OR 文远知行 OR 小鹏智驾 OR 华为乾崑 OR 理想NOA OR 比亚迪 天神之眼 OR Momenta) when:1d',
    region: "china",
    topic: "autonomous-driving",
    language: "zh-CN",
    geo: "CN",
    ceid: "CN:zh-Hans",
    weight: 11,
  },
  {
    id: "china-autonomous-driving-media",
    query:
      '(智能驾驶 OR 自动驾驶 OR 城市NOA OR Robotaxi OR 辅助驾驶) (36氪 OR 雷峰网 OR 盖世汽车 OR 亿欧汽车 OR 极客公园 OR 智东西) when:2d',
    region: "china",
    topic: "autonomous-driving",
    language: "zh-CN",
    geo: "CN",
    ceid: "CN:zh-Hans",
    weight: 15,
  },
  {
    id: "china-autonomous-driving-oem",
    query:
      '(华为乾崑 OR 小鹏智驾 OR 理想 NOA OR 蔚来 NOP+ OR 比亚迪 天神之眼 OR 极氪 NZP OR Momenta OR 地平线 OR 百度 Apollo) when:2d',
    region: "china",
    topic: "autonomous-driving",
    language: "zh-CN",
    geo: "CN",
    ceid: "CN:zh-Hans",
    weight: 14,
  },
  {
    id: "china-autonomous-driving-robotaxi",
    query:
      '(萝卜快跑 OR 文远知行 OR 小马智行 OR AutoX OR 毫末智行 OR 元戎启行) (运营 OR 扩张 OR 落地 OR 路测 OR 牌照) when:2d',
    region: "china",
    topic: "autonomous-driving",
    language: "zh-CN",
    geo: "CN",
    ceid: "CN:zh-Hans",
    weight: 14,
  },
  {
    id: "embodied-global-market",
    query:
      '("humanoid robot" OR robotics startup OR Figure AI OR Unitree OR Agility Robotics OR Apptronik OR "physical AI") when:2d',
    region: "global",
    topic: "embodied-intelligence",
    language: "en-US",
    geo: "US",
    ceid: "US:en",
    weight: 11,
  },
  {
    id: "embodied-china-market",
    query:
      '(具身智能 OR 人形机器人 OR 机器人公司 OR 宇树 OR 优必选 OR 智元机器人) when:2d',
    region: "china",
    topic: "embodied-intelligence",
    language: "zh-CN",
    geo: "CN",
    ceid: "CN:zh-Hans",
    weight: 11,
  },
  {
    id: "world-global",
    query: '("tariff" OR sanctions OR diplomacy OR conflict OR geopolitics) when:1d',
    region: "global",
    topic: "world",
    language: "en-US",
    geo: "US",
    ceid: "US:en",
    weight: 9,
  },
  {
    id: "business-global",
    url: "https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml",
    query: "",
    region: "global",
    topic: "business",
    language: "en-US",
    geo: "US",
    ceid: "US:en",
    weight: 10,
    parserHints: ["http1.1"],
  },
  {
    id: "business-china",
    query:
      '(商业 OR 公司财报 OR 融资 OR 并购 OR 上市 OR 市场) 中国 when:1d',
    region: "china",
    topic: "business",
    language: "zh-CN",
    geo: "CN",
    ceid: "CN:zh-Hans",
    weight: 10,
  },
];

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const topicMap: Record<BriefTopic, BriefTopic> = {
  ai: "ai",
  "autonomous-driving": "autonomous-driving",
  "embodied-intelligence": "embodied-intelligence",
  world: "world",
  business: "business",
};

const regionMap: Record<Region, Region> = {
  china: "china",
  global: "global",
};

const trustedSourcePatterns = [
  /reuters/i,
  /associated press/i,
  /\bap\b/i,
  /bloomberg/i,
  /financial times/i,
  /\bwsj\b/i,
  /the information/i,
  /techcrunch/i,
  /the verge/i,
  /business insider/i,
  /venturebeat/i,
  /wired/i,
  /cnbc/i,
  /nvidia/i,
  /openai/i,
  /deepmind/i,
  /microsoft/i,
  /aws/i,
  /amazon web services/i,
  /google research/i,
  /technology review/i,
  /marktechpost/i,
  /hugging ?face/i,
  /figure/i,
  /unitree/i,
  /ieee/i,
  /associated press/i,
  /\bap\b/i,
  /the economist/i,
  /wardsauto/i,
  /electrek/i,
  /autonomous vehicle international/i,
  /the keyword/i,
  /the register/i,
  /waymo/i,
  /aurora/i,
  /mobileye/i,
  /36kr/i,
  /晚点/i,
  /财联社/i,
  /第一财经/i,
  /界面/i,
  /澎湃/i,
  /新浪财经/i,
  /21财经/i,
  /虎嗅/i,
  /量子位/i,
  /it之家/i,
  /机器之心/i,
  /雷峰网/i,
  /极客公园/i,
  /智东西/i,
  /盖世汽车/i,
  /亿欧汽车/i,
];

const blockedSourcePatterns = [
  /新唐人/i,
  /benzinga/i,
  /hospitality/i,
  /travel/i,
  /netchoice/i,
  /chroniclejournal/i,
  /ibt/i,
  /markets\./i,
  /bitget/i,
  /msn/i,
  /yahoo/i,
  /investing\.com/i,
  /\bvice\b/i,
  /\baol\b/i,
  /ftn news/i,
  /101theeagle/i,
  /kcentv/i,
  /车家号/i,
  /24\/7 Wall St\./i,
  /iot insider/i,
  /drop site news/i,
  /huron daily tribune/i,
  /shenxuanche/i,
  /dm news/i,
  /dmnews/i,
  /austin american-statesman/i,
  /san antonio express-news/i,
  /marysville matters/i,
  /tom's hardware/i,
  /data center dynamics/i,
  /the next web/i,
  /open ?tools/i,
  /ad hoc news/i,
  /techstory/i,
  /national today/i,
  /tekedia/i,
  /the ?truth ?about ?cars/i,
  /khaleej times/i,
  /bloomberg ?tax/i,
  /not a tesla app/i,
  /the tech buzz/i,
  /chronicle-journal/i,
  /iotinsider/i,
  /fresnoalliance/i,
  /汽车之家/i,
  /sri lanka guardian/i,
  /finimize/i,
  /houston chronicle/i,
  /华人头条/i,
  /aerospace global news/i,
  /搜狐/i,
  /vanpeople/i,
  /or新媒体/i,
];

const weakTitlePatterns = [
  /\bhow to\b/i,
  /\breaders share\b/i,
  /\btravel tales\b/i,
  /\bprofit margins\b/i,
  /\bshares? dip\b/i,
  /\banalyst upgrades?\b/i,
  /\bbetting on\b/i,
  /\bstock\b/i,
  /\bprice target\b/i,
  /\bopinion\b/i,
  /\bcolumn\b/i,
  /\beditorial\b/i,
  /\bpodcast\b/i,
  /\bnewsletter\b/i,
  /\bvideo\b/i,
  /失业.*贫困/i,
  /history suggests otherwise/i,
  /county commission/i,
  /public pushback/i,
  /data center plans/i,
  /maritime and coastguard/i,
  /grand prize/i,
  /openclaw/i,
  /预售/i,
  /旅行版/i,
  /瓦罐/i,
  /service health dashboard/i,
  /\badmin keys\b/i,
  /data retention - openai platform/i,
  /- openai platform$/i,
  /\brelease notes\b/i,
  /\bhelp center\b/i,
  /openai\.profile/i,
  /realtime api interrupts too aggressively/i,
  /\bufo\b/i,
  /\baliens?\b/i,
  /deeper and less mechanical chatgpt answers/i,
];

const strongKeywordPatterns: Record<BriefTopic, RegExp[]> = {
  ai: [
    /\bartificial intelligence\b/i,
    /\bai\b/i,
    /openai/i,
    /anthropic/i,
    /google ai/i,
    /gemini/i,
    /gpt/i,
    /模型/i,
    /大模型/i,
    /智能体/i,
    /融资/i,
    /发布/i,
    /开源/i,
    /算力/i,
    /推理/i,
  ],
  "autonomous-driving": [
    /\bautonomous\b/i,
    /self-driving/i,
    /driverless/i,
    /waymo/i,
    /fsd/i,
    /robotaxi/i,
    /cybercab/i,
    /zoox/i,
    /mobileye/i,
    /aurora/i,
    /nuro/i,
    /gatik/i,
    /pony\.?ai/i,
    /weride/i,
    /apollo/i,
    /momenta/i,
    /horizon robotics/i,
    /自动驾驶/i,
    /智能驾驶/i,
    /智驾/i,
    /辅助驾驶/i,
    /noa/i,
    /城市noa/i,
    /乾崑/i,
    /天神之眼/i,
    /xngp/i,
    /nop\+/i,
    /nzp/i,
    /萝卜快跑/i,
    /小马智行/i,
    /文远知行/i,
    /bluecruise/i,
    /量产/i,
    /路测/i,
    /落地/i,
  ],
  "embodied-intelligence": [
    /\bhumanoid\b/i,
    /\brobotics?\b/i,
    /\bphysical ai\b/i,
    /figure/i,
    /unitree/i,
    /agility robotics/i,
    /apptronik/i,
    /boston dynamics/i,
    /具身智能/i,
    /人形机器人/i,
    /机器人/i,
  ],
  world: [
    /\bworld\b/i,
    /\bgeopolitics?\b/i,
    /\bdiplomac/i,
    /\btariff/i,
    /\bsanction/i,
    /\belection/i,
    /\bconflict\b/i,
    /全球/i,
    /国际/i,
    /关税/i,
    /制裁/i,
    /地缘/i,
  ],
  business: [
    /\bbusiness\b/i,
    /\bcompany\b/i,
    /\bearnings\b/i,
    /\bipo\b/i,
    /\bacquisition\b/i,
    /\bfunding\b/i,
    /\blayoffs?\b/i,
    /\bmarkets?\b/i,
    /财报/i,
    /融资/i,
    /并购/i,
    /上市/i,
    /商业/i,
    /公司/i,
  ],
};

function buildFeedUrl(config: FeedConfig): string {
  if (config.url) {
    return config.url;
  }

  const params = new URLSearchParams({
    q: config.query,
    hl: config.language,
    gl: config.geo,
    ceid: config.ceid,
  });

  return `https://news.google.com/rss/search?${params.toString()}`;
}

function decodeHtml(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&#x27;", "'");
}

function stripTags(value: string): string {
  return decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function cleanText(value: string): string {
  return stripTags(decodeHtml(value));
}

function readTag(block: string, tagName: string): string {
  const match = block.match(new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, "i"));
  return match?.[1]?.trim() ?? "";
}

function readTagWithAttributes(block: string, tagName: string): string {
  const match = block.match(new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)</${tagName}>`, "i"));
  return match?.[1]?.trim() ?? "";
}

function readAtomLink(block: string): string {
  const alternateMatch = block.match(
    /<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["'][^>]*\/?>/i,
  );
  if (alternateMatch?.[1]) {
    return decodeHtml(alternateMatch[1]);
  }

  const directMatch = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
  return decodeHtml(directMatch?.[1] ?? "");
}

function readSource(block: string): string {
  const match = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
  return stripTags(match?.[1] ?? "");
}

function readAttribute(block: string, tagName: string, attribute: string): string {
  const match = block.match(
    new RegExp(`<${tagName}[^>]*${attribute}=["']([^"']+)["'][^>]*\\/?>`, "i"),
  );
  return decodeHtml(match?.[1] ?? "");
}

function readDescriptionImage(block: string): string {
  const description = readTag(block, "description") || readTagWithAttributes(block, "content");
  const match = description.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
  return decodeHtml(match?.[1] ?? "");
}

function readItemImage(block: string): string {
  return (
    readAttribute(block, "media:content", "url") ||
    readAttribute(block, "media:thumbnail", "url") ||
    readAttribute(block, "enclosure", "url") ||
    readAttribute(block, "itunes:image", "href") ||
    readDescriptionImage(block)
  );
}

function normalizeSource(source: string): string {
  const normalized = source.trim();

  if (/36\s*kr/i.test(normalized)) {
    return "36Kr";
  }

  if (/wsj/i.test(normalized)) {
    return "WSJ";
  }

  if (/techcrunch/i.test(normalized)) {
    return "TechCrunch";
  }

  if (/business insider/i.test(normalized)) {
    return "Business Insider";
  }

  if (/wired/i.test(normalized)) {
    return "WIRED";
  }

  if (/financial times/i.test(normalized)) {
    return "Financial Times";
  }

  if (/thomson reuters|reuters/i.test(normalized)) {
    return "Reuters";
  }

  if (/news\.sina|finance\.sina|新浪财经/i.test(normalized)) {
    return "新浪财经";
  }

  if (/21财经/i.test(normalized)) {
    return "21财经";
  }

  if (/leiphone/i.test(normalized)) {
    return "雷峰网";
  }

  if (/zhidx/i.test(normalized)) {
    return "智东西";
  }

  if (/geekpark/i.test(normalized)) {
    return "极客公园";
  }

  if (/jiemian/i.test(normalized)) {
    return "界面新闻";
  }

  if (/yicai/i.test(normalized)) {
    return "第一财经";
  }

  if (/cls\.cn/i.test(normalized)) {
    return "财联社";
  }

  if (/智源社区/i.test(normalized)) {
    return "智源社区";
  }

  if (/搜狐/i.test(normalized)) {
    return "搜狐";
  }

  return normalized;
}

function resolveSourceWeight(
  priority: IntellySourcePriority,
  trustLevel: IntellySourceTrustLevel,
): number {
  const priorityWeight = {
    high: 14,
    medium: 10,
    low: 6,
  }[priority];

  const trustWeight = {
    official: 6,
    mainstream: 4,
    vertical: 5,
  }[trustLevel];

  return priorityWeight + trustWeight;
}

function resolveSourceLanguage(source: IntellySourceRegistryEntry, region: Region): string {
  if (source.language) {
    return source.language;
  }

  return region === "china" ? "zh-CN" : "en-US";
}

function mapRegistryRssFeeds(): FeedConfig[] {
  return listBriefCollectableRssSources().flatMap((source) =>
    source.topics.flatMap((topic) =>
      source.regions.flatMap((region) => {
        if (!(topic in topicMap) || !(region in regionMap) || !source.rssUrl) {
          return [];
        }

        return [
          {
            id: `registry-${source.sourceId}-${region}-${topic}`,
            sourceId: source.sourceId,
            sourceName: source.name,
            url: source.rssUrl,
            query: "",
            region: regionMap[region as Region],
            topic: topicMap[topic as BriefTopic],
            language: resolveSourceLanguage(source, regionMap[region as Region]),
            geo: region === "china" ? "CN" : "US",
            ceid: region === "china" ? "CN:zh-Hans" : "US:en",
            weight: resolveSourceWeight(source.priority, source.trustLevel),
            trustLevel: source.trustLevel,
            parserHints: source.parserHints,
            timeWindowHours: source.trustLevel === "official" ? 72 : 48,
          },
        ];
      }),
    ),
  );
}

function buildManualSourceQuery(topic: BriefTopic, source: IntellySourceRegistryEntry, region: Region): string {
  const domainTerm = `site:${source.domain}`;
  const topicQueryMap: Record<BriefTopic, string> = {
    ai:
      region === "china"
        ? "(人工智能 OR 大模型 OR 生成式AI OR 智能体 OR AI应用 OR 算力 OR 开源模型)"
        : '(AI OR "artificial intelligence" OR "AI model" OR "AI agent" OR "foundation model")',
    "autonomous-driving":
      region === "china"
        ? "(智能驾驶 OR 自动驾驶 OR 智驾 OR 城市NOA OR Robotaxi OR 辅助驾驶 OR 无人驾驶)"
        : '("autonomous driving" OR self-driving OR robotaxi OR ADAS OR driverless)',
    "embodied-intelligence":
      region === "china"
        ? "(具身智能 OR 人形机器人 OR 机器人 OR 机器狗)"
        : '("embodied intelligence" OR humanoid robot OR robotics OR physical AI)',
    world:
      region === "china"
        ? "(国际 OR 全球 OR 地缘 OR 外交 OR 关税 OR 制裁)"
        : "(world OR geopolitics OR diplomacy OR tariff OR sanctions OR conflict)",
    business:
      region === "china"
        ? "(商业 OR 公司 OR 融资 OR 财报 OR 上市 OR 并购 OR 市场)"
        : "(business OR companies OR earnings OR funding OR IPO OR acquisition OR markets)",
  };

  return `${domainTerm} ${topicQueryMap[topic]} when:3d`;
}

function mapRegistryManualFeeds(): FeedConfig[] {
  return listBriefCollectableManualSources().flatMap((source) =>
    source.topics.flatMap((topic) =>
      source.regions.flatMap((region) => {
        if (!(topic in topicMap) || !(region in regionMap)) {
          return [];
        }

        return [
          {
            id: `registry-manual-${source.sourceId}-${region}-${topic}`,
            sourceId: source.sourceId,
            sourceName: source.name,
            query: buildManualSourceQuery(topic as BriefTopic, source, region as Region),
            region: regionMap[region as Region],
            topic: topicMap[topic as BriefTopic],
            language: resolveSourceLanguage(source, regionMap[region as Region]),
            geo: region === "china" ? "CN" : "US",
            ceid: region === "china" ? "CN:zh-Hans" : "US:en",
            weight: resolveSourceWeight(source.priority, source.trustLevel) + 2,
            trustLevel: source.trustLevel,
            parserHints: source.parserHints,
            timeWindowHours: region === "china" ? 72 : 48,
          },
        ];
      }),
    ),
  );
}

function parseRss(xml: string): RssItem[] {
  const items = xml.match(/<item>([\s\S]*?)<\/item>/gi) ?? [];

  if (items.length > 0) {
    return items.map((item) => ({
      title: cleanText(readTag(item, "title")),
      link: decodeHtml(readTag(item, "link")),
      pubDate: readTag(item, "pubDate"),
      source: cleanText(readSource(item)),
      description: cleanText(readTag(item, "description")),
      imageUrl: readItemImage(item),
    }));
  }

  const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/gi) ?? [];

  return entries.map((entry) => ({
    title: cleanText(readTagWithAttributes(entry, "title")),
    link: readAtomLink(entry),
    pubDate: readTag(entry, "published") || readTag(entry, "updated"),
    source: cleanText(readTagWithAttributes(entry, "source")),
    description: cleanText(
      readTagWithAttributes(entry, "summary") || readTagWithAttributes(entry, "content"),
    ),
    imageUrl: readItemImage(entry),
  }));
}

function makeId(region: Region, topic: BriefTopic, link: string): string {
  return createHash("sha1").update(`${region}:${topic}:${link}`).digest("hex").slice(0, 16);
}

function inferScore(publishedAt: string, source: string): number {
  const ageHours = Math.max(
    0,
    (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60),
  );
  const freshness = Math.max(0, 100 - ageHours * 4);

  const sourceBoost =
    /reuters|bloomberg|financial times|wsj|the information|36kr|晚点|财联社|第一财经|界面|澎湃/i.test(
      source,
    )
      ? 8
      : 0;

  return Math.round(freshness + sourceBoost);
}

function cleanTitle(title: string, source: string): string {
  const suffix = source ? new RegExp(`\\s+-\\s+${source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") : null;
  const withoutExactSource = suffix ? title.replace(suffix, "") : title;
  return withoutExactSource
    .replace(/\s+-\s+(?:[a-z0-9.-]+\.(?:com|cn|net)|新浪财经客户端|搜狐网|wsj\.com|techcrunch\.com)$/i, "")
    .replace(/\s+-\s+36\s*kr$/i, "")
    .trim();
}

function cleanSummary(summary: string, title: string, source: string): string {
  const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedSource = source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const normalized = summary
    .replace(/\s+/g, " ")
    .replace(/^More\b/i, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#8217;|&#39;/g, "'")
    .replace(/&#8211;/g, "-")
    .replace(/&#8230;/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(
      /\s+(36kr\.com|36\s*Kr|WSJ|Financial Times|techcrunch\.com|新浪财经客户端|新浪财经|新浪新闻_手机新浪网|news\.sina\.com\.cn|finance\.sina\.cn|21财经|Business Insider|MSN|搜狐网|sasac\.gov\.cn)$/i,
      "",
    )
    .replace(/Jiemian\.com|jiemian\.com|36kr\.com|第一财经|财联社|雷峰网|智东西|界面新闻|极客公园|亿矿通/gi, " ")
    .replace(new RegExp(`^(?:${escapedTitle})(?:\\s+${escapedSource})?\\s+${escapedTitle}`, "i"), title)
    .replace(new RegExp(`^(?:${escapedTitle})(?:\\s+${escapedSource})?`, "i"), "")
    .replace(/\s+/g, " ")
    .trim();

  const strippedSource = source
    ? normalized.replace(
        new RegExp(`\\s+${escapedSource}$`, "i"),
        "",
      )
    : normalized;

  if (!strippedSource || strippedSource === title) {
    return /[。！？?!]$/.test(title) ? title : `${title}。`;
  }

  return strippedSource;
}

function normalizeForDedup(value: string): string {
  return value
    .toLowerCase()
    .replace(/[“”"'`’‘]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "");
}

function sourceBoost(source: string): number {
  if (blockedSourcePatterns.some((pattern) => pattern.test(source))) {
    return -18;
  }

  if (trustedSourcePatterns.some((pattern) => pattern.test(source))) {
    return 14;
  }

  return 0;
}

function keywordBoost(title: string, topic: BriefTopic): number {
  return strongKeywordPatterns[topic].reduce(
    (score, pattern) => (pattern.test(title) ? score + 6 : score),
    0,
  );
}

function titlePenalty(title: string): number {
  return weakTitlePatterns.reduce(
    (score, pattern) => (pattern.test(title) ? score - 20 : score),
    0,
  );
}

function topicFitPenalty(title: string, topic: BriefTopic): number {
  if (topic === "ai") {
    if (
      /\b(data center|maritime|coastguard|property tax|income tax|service health|status page)\b/i.test(
        title,
      ) ||
      /(服务状态|状态页|发布说明|更新日志)/.test(title)
    ) {
      return -26;
    }

    return 0;
  }

  if (topic === "embodied-intelligence") {
    if (/\bsoftware\b/i.test(title) && !/\brobot/i.test(title)) {
      return -18;
    }

    return 0;
  }

  if (topic === "autonomous-driving") {
    if (
      (/\bhumanoid|robotics?|physical ai\b/i.test(title) || /(具身智能|人形机器人|机器人)/.test(title)) &&
      !(/\bautonomous|self-driving|driverless|robotaxi|adas|fsd\b/i.test(title) ||
        /(自动驾驶|智能驾驶|智驾|辅助驾驶|noa|robotaxi)/i.test(title))
    ) {
      return -28;
    }

    if (
      (/\border|priced?|launch(?:ed)?|sedan|suv\b/i.test(title) || /(订单|售价|上市|新车|首周订单量)/.test(title)) &&
      !(/\bautonomous|self-driving|driverless|robotaxi|adas|fsd|cybercab\b/i.test(title) ||
        /(自动驾驶|智能驾驶|智驾|辅助驾驶|noa|robotaxi|天神之眼|乾崑|xngp|nop\+|nzp)/i.test(title))
    ) {
      return -24;
    }
  }

  if (topic === "world") {
    if (
      /\b(stock|earnings|ipo|funding|model release|ai|artificial intelligence|lawsuit)\b/i.test(title) ||
      /\b(ufo|alien|extraterrestrial)\b/i.test(title) ||
      /(财报|融资|大模型|诉讼|智能体|外星人|不明飞行物)/.test(title)
    ) {
      return -24;
    }

    return 0;
  }

  if (topic === "business") {
    const hasBusinessSignal =
      /\b(business|company|companies|earnings|ipo|funding|acquisition|merger|market|markets|tariff|trade|semiconductor)\b/i.test(
        title,
      ) || /(商业|公司|财报|融资|并购|重组|上市|出口|半导体|市场|关税|贸易)/.test(title);

    if (
      /\bwar|conflict|diplomacy|sanction|divorce|student loans?|holy week|travelers?\b/i.test(title) ||
      /\bearthquake|aftershock|magnitude\b/i.test(title) ||
      /^\d{2}:\d{2}:\d{2}/.test(title) ||
      /^【.+】$/.test(title) ||
      /(冲突|制裁|外交|离婚|留学贷款|游客|地震|余震|快讯|电视精编版)/.test(title)
    ) {
      return -18;
    }

    if (
      !hasBusinessSignal &&
      (/\biran|israel|tehran|nuclear|evacuat/i.test(title) || /(伊朗|以色列|德黑兰|核电站|撤离)/.test(title))
    ) {
      return -30;
    }

    return 0;
  }

  if (
    /\b(grand prize|lottery|ticket)\b/i.test(title) ||
    /\b(metro|train|rail)\b/i.test(title) ||
    /\b(supercharger|charging)\b/i.test(title) ||
    /(预售|旅行版|瓦罐|售价|起售|新车图赏|充电站)/.test(title)
  ) {
    return -30;
  }

  if (/\btesla\b/i.test(title) && !/\b(fsd|cybercab|robotaxi|autonomous|self-driving|driverless)\b/i.test(title)) {
    return -30;
  }

  return 0;
}

function isUsefulItem(item: NewsItem, config?: FeedConfig): boolean {
  const score = item.score ?? 0;
  const minimumScore = config?.sourceId ? 34 : 45;
  const normalizedTitle = normalizeForDedup(item.title);
  const normalizedSource = normalizeForDedup(item.source);

  if (score < minimumScore) {
    return false;
  }

  if (normalizedTitle.length < 8 || normalizedTitle === normalizedSource) {
    return false;
  }

  if (blockedSourcePatterns.some((pattern) => pattern.test(item.source))) {
    return false;
  }

  if (/OpenAI Developer Community|OpenAI Help Center|Anthropic Trust Center/i.test(item.source)) {
    return false;
  }

  if (weakTitlePatterns.some((pattern) => pattern.test(item.title))) {
    return false;
  }

  const combinedText = `${item.title} ${item.summary ?? ""}`;
  const allowBroadTopicCheck =
    config?.trustLevel === "official" ||
    (Boolean(config?.sourceId) && (config?.topic === "world" || config?.topic === "business"));
  const passesTopicCheck =
    allowBroadTopicCheck
      ? combinedText.trim().length > 12
      : strongKeywordPatterns[item.topic].some((pattern) => pattern.test(combinedText));

  if (!passesTopicCheck) {
    return false;
  }

  return true;
}

function normalizeItem(item: RssItem, config: FeedConfig): NewsItem | null {
  if (!item.title || !item.link || !item.pubDate) {
    return null;
  }

  const publishedAt = new Date(item.pubDate);
  if (Number.isNaN(publishedAt.getTime())) {
    return null;
  }

  const source = normalizeSource(item.source || config.sourceName || "Google News");
  const title = cleanTitle(item.title, source);
  const summary = cleanSummary(item.description, title, source);
  const score =
    inferScore(publishedAt.toISOString(), source) +
    sourceBoost(source) +
    keywordBoost(title, config.topic) +
    titlePenalty(title) +
    topicFitPenalty(title, config.topic) +
    config.weight;

  return {
    id: makeId(config.region, config.topic, item.link),
    title,
    url: item.link,
    sourceId: config.sourceId,
    source,
    publishedAt: publishedAt.toISOString(),
    region: config.region,
    topic: config.topic,
    summary,
    rawContent: item.description,
    score,
    imageUrl: item.imageUrl || undefined,
  };
}

function dedupe(items: NewsItem[]): NewsItem[] {
  const seen = new Map<string, NewsItem>();

  for (const item of items) {
    const key = `${item.region}:${item.topic}:${normalizeForDedup(item.title)}`;
    const existing = seen.get(key);

    if (!existing || (item.score ?? 0) > (existing.score ?? 0)) {
      seen.set(key, item);
    }
  }

  return [...seen.values()];
}

export async function collectNewsWithDiagnostics(): Promise<NewsCollectionDiagnostics> {
  const activeFeedConfigs = [...mapRegistryRssFeeds(), ...mapRegistryManualFeeds(), ...feedConfigs];

  const results = await Promise.allSettled(
    activeFeedConfigs.map(async (config) => {
      const feedUrl = buildFeedUrl(config);
      const curlArgs = [
        "--silent",
        "--show-error",
        "--location",
        "--max-time",
        "20",
        "--retry",
        "1",
        "--retry-delay",
        "1",
        "--user-agent",
        userAgent,
        feedUrl,
      ];

      if (config.parserHints?.includes("http1.1")) {
        curlArgs.splice(0, 0, "--http1.1");
      }

      let xml = "";

      try {
        const { stdout } = await execFileAsync("curl", curlArgs);
        xml = stdout;
      } catch (curlError) {
        const response = await fetch(feedUrl, {
          headers: {
            "user-agent": userAgent,
          },
        });

        if (!response.ok) {
          throw curlError;
        }

        xml = await response.text();
      }

      const maxAgeMs = (config.timeWindowHours ?? 24) * 60 * 60 * 1000;
      const items = parseRss(xml)
        .map((item) => normalizeItem(item, config))
        .filter((item): item is NewsItem => item !== null)
        .filter((item) => isUsefulItem(item, config))
        .filter((item) => Date.now() - new Date(item.publishedAt).getTime() <= maxAgeMs);

      return items;
    }),
  );

  const fulfilledResults = results.filter(
    (result): result is PromiseFulfilledResult<NewsItem[]> => result.status === "fulfilled",
  );
  const fulfilled = fulfilledResults.map((result) => result.value).flat();
  const feeds = results.map<NewsCollectionFeedDiagnostic>((result, index) => {
    const config = activeFeedConfigs[index];

    if (result.status === "fulfilled") {
      return {
        id: config?.id ?? "unknown",
        sourceId: config?.sourceId,
        sourceName: config?.sourceName,
        topic: config?.topic ?? "ai",
        region: config?.region ?? "global",
        itemCount: result.value.length,
        status: "fulfilled",
      };
    }

    return {
      id: config?.id ?? "unknown",
      sourceId: config?.sourceId,
      sourceName: config?.sourceName,
      topic: config?.topic ?? "ai",
      region: config?.region ?? "global",
      itemCount: 0,
      status: "rejected",
      error: result.reason instanceof Error ? result.reason.message : String(result.reason),
    };
  });

  const rejectedCount = results.length - fulfilledResults.length;
  if (rejectedCount > 0) {
    const failedFeedIds = results.reduce<string[]>((accumulator, result, index) => {
      if (result.status === "rejected") {
        accumulator.push(activeFeedConfigs[index]?.id ?? "unknown");
      }

      return accumulator;
    }, []);

    console.warn(
      `News collection completed with ${rejectedCount} feed failure(s): ${failedFeedIds.join(", ")}.`,
    );
  }

  if (fulfilled.length === 0) {
    throw new Error("All news feeds failed during collection.");
  }

  return {
    items: dedupe(fulfilled).sort((left, right) => (right.score ?? 0) - (left.score ?? 0)),
    feeds,
  };
}

export async function collectNews(): Promise<NewsItem[]> {
  const { items } = await collectNewsWithDiagnostics();
  return items;
}
