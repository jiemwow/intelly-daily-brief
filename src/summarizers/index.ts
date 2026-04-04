import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { cleanChinesePunctuation, hasChinese } from "@/lib/brief-format";
import { readOptionalEnv } from "@/lib/env";
import type { BriefItem, NewsItem } from "@/types/brief";

const execFileAsync = promisify(execFile);

type EditorialPayload = {
  lead_id: string;
  trend_line: string;
  items: Array<{
    id: string;
    title: string;
    summary: string;
    why_it_matters: string;
  }>;
};

type RewriteRule = {
  pattern: RegExp;
  title: string;
  summary: string;
  why: string;
};

function cleanSentence(value: string): string {
  return cleanChinesePunctuation(value.replace(/\s+/g, " ").trim());
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#8217;|&#39;/g, "'")
    .replace(/&#8211;/g, "-")
    .replace(/&#8220;|&#8221;/g, "\"")
    .replace(/&#8230;/g, "…")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function stripSourceTail(value: string): string {
  return cleanSentence(
    decodeHtmlEntities(value)
      .replace(/<[^>]+>/g, " ")
      .replace(/\[\.\.\.\]|\[&#8230;\]/g, " ")
      .replace(/\bThe post .+ appeared first on .+$/i, " ")
      .replace(
        /Jiemian\.com|jiemian\.com|AP News|Reuters|NYT World|NYT Business|MarkTechPost|TechCrunch|Business Insider|The Verge|36kr\.com|36Kr|雷峰网|智东西|财联社|界面新闻|第一财经|极客公园|亿矿通/gi,
        " ",
      )
      .replace(/\s+[-|·]\s+[A-Za-z0-9.\u4e00-\u9fff ]+$/u, "")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function stripRepeatedTitle(text: string, title: string): string {
  const normalizedTitle = cleanSentence(title).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!normalizedTitle) {
    return cleanSentence(text);
  }

  return cleanSentence(
    text
      .replace(new RegExp(`^(?:${normalizedTitle})(?:\\s+${normalizedTitle})+`, "iu"), normalizedTitle)
      .replace(new RegExp(`^(?:${normalizedTitle})(?:\\s+[A-Za-z0-9.]+)?\\s+${normalizedTitle}`, "iu"), normalizedTitle)
      .trim(),
  );
}

function normalizeAlertTitle(title: string): string {
  return cleanSentence(title)
    .replace(/^\d{2}:\d{2}:\d{2}【(.+)】$/u, "$1")
    .replace(/^【(.+)】$/u, "$1")
    .replace(/[。！？]$/u, "");
}

function summarizeFromLocalizedTitle(item: NewsItem): string | null {
  const title = normalizeAlertTitle(hasChinese(item.title) ? item.title : localizeEnglishTitle(item.title));
  if (!title || title.length < 8) {
    return null;
  }

  if (/布什尔核电站撤离198人/.test(title)) {
    return "俄国家原子能公司已从伊朗布什尔核电站撤离 198 人，显示中东局势升级已开始影响关键能源设施运营。";
  }

  if (/车险|保险/.test(title) && /L2|L4|自动驾驶|辅助驾驶/.test(title)) {
    return "北京首次推出覆盖 L2 至 L4 自动驾驶的新车险，自费升级辅助驾驶车辆也被纳入保障范围。";
  }

  if (/小马智行/.test(title) && /Robotaxi|共建模式/.test(title)) {
    return "小马智行称，今年新增 Robotaxi 车辆中接近一半采用共建模式落地，说明其扩张开始更多依赖合作运营。";
  }

  if (/易控智驾|矿山无人驾驶/.test(title)) {
    return "易控智驾披露矿山无人驾驶最新运营成绩，说明自动驾驶正在重载和封闭场景继续验证商业可行性。";
  }

  if (/文远知行/.test(title) && /Grab|新加坡/.test(title)) {
    return "文远知行与 Grab 在新加坡启动自动驾驶出行服务，意味着中国 Robotaxi 公司继续向海外城市复制运营能力。";
  }

  if (/商汤/.test(title) && /AI原生云|算力/.test(title)) {
    return "商汤披露 AI 原生云和算力服务实践，重点在于通过统一调度与工具链优化降低企业训练和推理成本。";
  }

  if (/千问3\.6\s?Plus|3\.6Plus/.test(title)) {
    return "阿里千问 3.6 Plus 登顶全球模型调用榜，反映其模型 API 使用量和开发者采用度继续走高。";
  }

  if (/利润.*消失|被ST/.test(title)) {
    return "这家公司因虚减利润被实施 ST，说明财务造假和利润失真问题已经开始触发更严厉的监管后果。";
  }

  if (/宇树|机器人集群控制|出货量/.test(title)) {
    return "宇树科技首次展示机器人集群控制技术，并预计今年出货量将达到 1 万到 2 万台，释放量产提速信号。";
  }

  if (/机器人租赁市场/.test(title)) {
    return "机器人租赁需求正在升温，说明企业客户对短期部署和低成本试用具身智能设备的接受度在提高。";
  }

  if (/自动化产线投产|具身智能商业化/.test(title)) {
    return "这家公司宣布关键零部件自动化产线投产，意味着具身智能硬件供应链开始向规模化制造迈进。";
  }

  if (/中国机器人公司日薪50万招人/.test(title)) {
    return "国内机器人公司开出高薪抢人，说明具身智能赛道对核心工程与算法人才的争夺正在升温。";
  }

  if (/土耳其两周狂抛近120吨黄金/.test(title)) {
    return "土耳其在两周内大幅减持黄金，反映当地资金调度和风险对冲策略正在发生明显变化。";
  }

  if (/霍尔木兹海峡/.test(title)) {
    return "伊朗表示允许运载必需品的船只通过霍尔木兹海峡，意在缓和外界对能源运输中断的担忧。";
  }

  if (/Slovak PM says EU should drop sanctions on Russian oil and gas/i.test(item.title)) {
    return "斯洛伐克总理主张欧盟取消对俄罗斯油气制裁，认为这有助于缓解当前能源安全压力。";
  }

  if (/Death toll from Afghan quake rises/i.test(item.title)) {
    return "阿富汗地震死亡人数继续上升，其中包括一个刚从伊朗返回的难民家庭 8 名成员。";
  }

  if (/Artemis II astronauts are more than halfway to the moon/i.test(item.title)) {
    return "阿耳忒弥斯二号任务已飞越地月航程过半，NASA 正尝试刷新阿波罗 13 号保持的远距载人飞行纪录。";
  }

  if (/anthropic/i.test(item.title) && normalizeForCompare(item.title) === "anthropic") {
    return "Anthropic 相关动态进入候选池，但当前公开信息过少，暂不适合作为需要快速扫读的核心条目。";
  }

  if (item.topic === "world") {
    return `${title}，这件事正在影响全球市场对地缘风险、政策走向和企业经营环境的判断。`;
  }

  if (item.topic === "business") {
    return `${title}，这背后反映的是资金流向、资源配置或政策变化对商业预期的直接冲击。`;
  }

  if (item.topic === "autonomous-driving") {
    return `${title}，重点要看它如何影响智能驾驶的落地节奏、责任边界和商业化进展。`;
  }

  if (item.topic === "embodied-intelligence") {
    return `${title}，重点要看这是不是从演示能力走向真实量产和部署的信号。`;
  }

  if (item.topic === "ai") {
    return `${title}，重点要看相关模型、平台或算力能力是否开始进入更大规模的企业和开发者场景。`;
  }

  return `${title}。`;
}

function extractContentHint(item: NewsItem): string {
  const fragments = [item.rawContent, item.summary]
    .filter(Boolean)
    .map((value) => stripRepeatedTitle(stripSourceTail(value ?? ""), item.title))
    .filter((value) => value.length >= 12)
    .filter((value) => normalizeForCompare(value) !== normalizeForCompare(item.title));

  if (fragments.length === 0) {
    return normalizeAlertTitle(item.title);
  }

  return cleanSentence(fragments.join(" "));
}

function pickLeadSentence(text: string): string | null {
  const normalized = stripSourceTail(text);
  if (!normalized || normalized.length < 18) {
    return null;
  }

  const segments = normalized
    .split(/(?<=[。！？!?])|(?<=\.)\s+/u)
    .map((segment) => cleanSentence(segment))
    .filter(Boolean)
    .filter((segment) => segment.length >= 18)
    .filter(
      (segment) =>
        !/点击|查看更多|继续阅读|阅读原文|广告|订阅|版权所有|责任编辑|本文来自|免责声明|图片来源/u.test(
          segment,
        ),
    );

  return segments[0] ?? null;
}

function summarizeFromContentHint(item: NewsItem): string | null {
  const hint = extractContentHint(item);
  const primarySentence = pickLeadSentence(hint);

  if (!primarySentence) {
    return null;
  }

  const normalizedTitle = normalizeForCompare(item.title);
  const normalizedSentence = normalizeForCompare(primarySentence);

  if (normalizedSentence === normalizedTitle) {
    return null;
  }

  if (hasChinese(primarySentence)) {
    return primarySentence.length > 88 ? `${primarySentence.slice(0, 86)}…` : primarySentence;
  }

  const english = primarySentence.toLowerCase();

  if (/sanctions?.*russian oil and gas|energy security/.test(english)) {
    return "斯洛伐克总理主张欧盟取消对俄罗斯油气制裁，理由是当前能源安全压力仍高。";
  }

  if (/russia and ukraine|zelenskyy|erdogan|istanbul/.test(english)) {
    return "俄乌继续发生致命打击，泽连斯基前往伊斯坦布尔与埃尔多安会谈，地区局势仍在升温。";
  }

  if (/anthropic/.test(english) && /trust|security|policy|status/.test(english)) {
    return "Anthropic 披露了最新的平台或信任体系动态，重点应看这是否影响其对外服务与企业采用预期。";
  }

  if (/openai/.test(english) && /platform|policy|retention|security/.test(english)) {
    return "OpenAI 更新了平台侧规则或能力说明，重点要看这些变化是否会影响企业接入、数据管理与产品落地。";
  }

  if (/video editing has always had a dirty secret|erases objects from videos|floating instrument/.test(english)) {
    return "Netflix 开源 VOID 模型，可在视频中移除人物或物体的同时补全被遮挡区域与物理细节。";
  }

  return null;
}

function normalizeForCompare(value: string): string {
  return cleanSentence(value)
    .toLowerCase()
    .replace(/[“”"'`’‘]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function isSummaryUsable(summary: string | undefined, title: string): boolean {
  if (!summary) {
    return false;
  }

  if (
    /这条.+新闻反映了过去二十四小时内值得关注的产业动向|该消息聚焦.+反映.+(最新变化|最新进展)|该消息聚焦.+全球环境变量/.test(
      summary,
    )
  ) {
    return false;
  }

  const normalizedSummary = normalizeForCompare(summary);
  const normalizedTitle = normalizeForCompare(title);

  return normalizedSummary.length > 12 && normalizedSummary !== normalizedTitle;
}

function isWhyUsable(why: string | undefined): boolean {
  if (!why) {
    return false;
  }

  if (
    /这条新闻有助于判断.+最新方向|这条新闻有助于判断.+最新变化|产品或模型更新往往会直接改变市场对能力上限|融资与投资动作通常意味着资本市场正在重新评估该赛道/.test(
      why,
    )
  ) {
    return false;
  }

  return true;
}

const rewriteRules: RewriteRule[] = [
  {
    pattern: /^Meta.?s Secret AI Hardware Push Signals Race for Post-Smartphone Future$/i,
    title: "Meta 秘密推进 AI 硬件，后智能手机入口争夺升温",
    summary: "Meta 正低调加码 AI 硬件布局，显示头部科技公司已开始为后智能手机时代的新入口提前卡位。",
    why: "当头部平台公司把关注点从模型竞争延伸到终端与入口控制，行业竞争就会从软件能力进一步转向设备与生态之争。",
  },
  {
    pattern: /^Nvidia launches enterprise AI agent platform with Adobe, Salesforce, SAP among 17 adopters at GTC 2026$/i,
    title: "英伟达发布企业级 AI Agent 平台，Adobe 与 Salesforce 等首批接入",
    summary: "英伟达在 GTC 2026 上推出企业级 AI Agent 平台，并联合 Adobe、Salesforce、SAP 等首批客户推进落地。",
    why: "这说明大模型竞争正在从能力展示转向企业级交付，平台化与生态绑定将成为下一阶段的重要分水岭。",
  },
  {
    pattern: /^Competition or .co-opetition.: how is convergence shaping Sino-US AI race\\?$/i,
    title: "中美 AI 竞争走向竞合并存，产业收敛正在重塑赛跑方式",
    summary: "围绕中美 AI 竞赛的最新讨论指出，竞争与合作正在同时存在，产业链与应用侧的收敛趋势值得持续关注。",
    why: "中美在 AI 领域的竞合关系会影响技术扩散、供应链选择和全球企业的战略布局，是判断未来格局的重要变量。",
  },
  {
    pattern: /^Why Anthropic and OpenAI want to go public$/i,
    title: "Anthropic 与 OpenAI 为何同时走向上市",
    summary: "Anthropic 与 OpenAI 的上市意愿正在升温，显示头部模型公司已把资本市场视作下一阶段竞争资源。",
    why: "一旦头部公司转向公开资本市场，模型研发、算力投入与商业化节奏都可能被进一步放大。",
  },
  {
    pattern: /^Anthropic is having a moment in the private markets; SpaceX could spoil the party$/i,
    title: "Anthropic 估值热度升高，SpaceX 或分流一级市场关注",
    summary: "一级市场对 Anthropic 的关注仍在升温，但 SpaceX 潜在融资预期可能重新分配大型科技资产的资金关注度。",
    why: "头部 AI 公司在一级市场的估值变化，往往会提前影响融资环境、竞争预期和资本对赛道的资源倾斜。",
  },
  {
    pattern: /^These AI Whiz Kids Dropped Out of College and Got Investors to Pay Their Bills$/i,
    title: "一批 AI 创业少年辍学融资，一级市场继续追逐新故事",
    summary: "WSJ 报道显示，部分年轻 AI 创业者在离开校园后迅速获得投资支持，折射出一级市场对新一代 AI 创业叙事的持续追捧。",
    why: "资本愿意为更早期、更年轻的 AI 创业团队买单，往往意味着市场仍在押注模型之外的新入口和新应用形态。",
  },
  {
    pattern: /^America’s AI chip rules keep changing/i,
    title: "美国 AI 芯片出口规则频繁调整，全球供应链承压",
    summary: "美国围绕 AI 芯片的出口限制不断变化，正在把不确定性传导到全球算力采购与供应链安排。",
    why: "芯片规则变化直接牵动模型训练成本、企业采购节奏和跨境技术合作，是 AI 产业链的上游风向标。",
  },
  {
    pattern: /^OpenAI’s Top Executive Fidji Simo To Take Medical Leave from Company$/i,
    title: "OpenAI 高管 Fidji Simo 将暂时休假",
    summary: "OpenAI 管理层再现人事变动，核心高管 Fidji Simo 将因个人原因短期离岗。",
    why: "对头部模型公司而言，管理层稳定度会直接影响组织节奏、产品推进与资本市场预期。",
  },
  {
    pattern: /^OpenAI's Fidji Simo Is Taking Medical Leave Amid an Executive Shake-Up$/i,
    title: "OpenAI 管理层调整之际，Fidji Simo 暂时休假",
    summary: "在管理层仍处调整期的背景下，OpenAI 核心高管 Fidji Simo 再次带来组织层面的新变量。",
    why: "组织与治理变化往往会影响头部 AI 公司的决策效率和外部信心，值得持续跟踪。",
  },
  {
    pattern: /^Musk asks SpaceX IPO banks to buy Grok AI subscriptions, NYT reports$/i,
    title: "报道称马斯克要求参与 SpaceX IPO 的投行采购 Grok 订阅",
    summary: "纽约时报称，马斯克正推动参与 SpaceX IPO 的银行购买 Grok 订阅，以扩大其 AI 产品的企业渗透。",
    why: "如果属实，这意味着头部 AI 产品的商业化正在向更强绑定的渠道策略和生态协同演进。",
  },
  {
    pattern: /^Meta's AI push is reshaping how work gets done inside the company$/i,
    title: "Meta 的 AI 战略正在重塑内部工作方式",
    summary: "Meta 正把 AI 更深入地嵌入内部流程，用于推动研发、运营与决策效率的再组织。",
    why: "头部平台公司先在内部大规模采用 AI，通常会成为其后续对外产品化和商业落地的重要前置信号。",
  },
  {
    pattern: /^Microsoft released 3 new AI models, ramping up competition with its close partner, OpenAI$/i,
    title: "微软连发三款 AI 模型，与 OpenAI 的竞合进一步升温",
    summary: "微软连续推出新模型，显示其在关键能力层面正加快自有布局，不再只依赖 OpenAI。",
    why: "微软与 OpenAI 关系的细微变化，会直接影响全球模型格局、渠道生态与企业客户选择。",
  },
  {
    pattern: /^Exclusive \| ServiceNow CEO Builds New Business Model Around AI$/i,
    title: "ServiceNow 围绕人工智能重塑商业模式",
    summary: "ServiceNow 正尝试把 AI 能力更直接地嵌入其产品与收入模型，推动商业模式升级。",
    why: "企业软件厂商如何把 AI 变成可计费能力，是判断生成式 AI 是否真正进入规模化变现的关键指标。",
  },
  {
    pattern: /^DeepSeek.?s New AI Model .* Victory for Huawei$/i,
    title: "The Information：DeepSeek 新模型有望利好华为 AI 生态",
    summary: "The Information 认为，DeepSeek 新模型的发布可能进一步带动华为算力与生态体系受益。",
    why: "国内模型厂商与本土算力生态的协同程度，正在成为观察中国 AI 竞争格局的关键变量。",
  },
  {
    pattern: /^Microsoft to invest .*10 billion.*Japan.*AI.*cyber defence expansion$/i,
    title: "微软拟在日本追加百亿美元投入，扩张 AI 与网络安全能力",
    summary: "微软计划在日本进一步加码 AI 与网络安全基础设施，强化其在亚太区域的企业服务布局。",
    why: "头部云厂商在重点区域的资本开支，往往能提前反映全球 AI 基础设施竞争的重心迁移。",
  },
  {
    pattern: /^OpenAI chief operating officer takes on new role in shake-up$/i,
    title: "OpenAI 高层重组继续推进，运营负责人接下新角色",
    summary: "英国金融时报报道称，OpenAI 管理层重组仍在推进，核心运营高管的职责调整再度释放组织变化信号。",
    why: "头部模型公司的管理层分工变化，往往会直接影响产品推进节奏、资源分配和外界对公司治理稳定性的判断。",
  },
  {
    pattern: /^Tencent launches ClawPro enterprise AI agent platform built on OpenClaw$/i,
    title: "腾讯推出面向企业的智能体平台 ClawPro",
    summary: "腾讯发布基于 OpenClaw 的企业级智能体平台 ClawPro，继续加码 AI Agent 落地路径。",
    why: "大厂推动企业级智能体平台化，意味着国内 AI 竞争正从模型能力继续向应用平台与交付效率延伸。",
  },
  {
    pattern: /^Uber CEO Says Some Drivers Use Tesla's Full Self-Driving$/i,
    title: "Uber CEO 称部分司机已开始使用特斯拉 FSD",
    summary: "Uber 管理层公开提到平台司机已经在实际运营中使用特斯拉 FSD，侧面反映辅助驾驶正进入更真实的运营场景。",
    why: "当辅助驾驶开始渗透到营运车辆场景，行业就不再只讨论技术能力，还要面对安全、责任与平台治理问题。",
  },
  {
    pattern: /^Uber Drivers Are Already Using Tesla’s AI on the Road as Dara Khosrowshahi Signals Comfort With the Shift$/i,
    title: "Uber 平台司机已开始在真实道路场景中使用特斯拉 FSD",
    summary: "Uber CEO 对司机使用特斯拉 FSD 的现象表达相对开放态度，显示辅助驾驶已开始触碰平台运营边界。",
    why: "平台企业对辅助驾驶的态度变化，可能影响未来出行生态中的责任划分、风控要求和商业模式。",
  },
  {
    pattern: /^2026\.8 Official Tesla Release Notes - Software Updates$/i,
    title: "特斯拉发布 2026.8 版本软件更新说明",
    summary: "特斯拉公布 2026.8 版本软件更新，继续推进其智能驾驶与车载体验的迭代节奏。",
    why: "软件更新频率和能力变化是观察特斯拉智驾路线落地速度与用户覆盖范围的重要窗口。",
  },
  {
    pattern: /^Tesla rolls out the 2026\.8\.6 update, which hints at FSD v14 launch in Europe/i,
    title: "特斯拉推送 2026.8.6 更新，欧洲 FSD v14 落地信号升温",
    summary: "特斯拉最新版本更新被视为欧洲 FSD v14 推进的前置信号，显示其区域化智能驾驶节奏仍在加快。",
    why: "欧洲市场的 FSD 推进不仅关系到特斯拉海外扩张，也会影响外界对其智驾合规与复制能力的判断。",
  },
  {
    pattern: /^Tesla Unveils New UI Features for FSD in Europe$/i,
    title: "特斯拉为欧洲 FSD 推出新界面功能",
    summary: "特斯拉正在为欧洲市场的 FSD 体验补充新的界面交互设计，释放区域化推进信号。",
    why: "FSD 在不同区域的功能和界面调整，往往反映其合规推进与本地化落地的最新节奏。",
  },
  {
    pattern: /^Tennessee to Test Driverless Trucks on I-40 Freight Corridor$/i,
    title: "田纳西将在 I-40 货运走廊测试无人卡车",
    summary: "美国田纳西州计划在 I-40 货运走廊启动无人卡车测试，自动驾驶重卡继续向干线物流场景渗透。",
    why: "重卡与货运干线是自动驾驶最具商业化潜力的场景之一，测试推进速度具有较强行业风向意义。",
  },
  {
    pattern: /^NTSB Blames Ford BlueCruise In Fatal Crashes, Asks For Federal Oversight$/i,
    title: "美国国家运输安全委员会要求加强对福特 BlueCruise 的联邦监管",
    summary: "美国国家运输安全委员会将福特 BlueCruise 与致命事故关联，并呼吁联邦层面加强监管。",
    why: "辅助驾驶相关事故和监管态度变化，会直接影响行业对量产节奏、责任界面与安全标准的预期。",
  },
  {
    pattern: /^The final days of the Tesla Model X and S are here\. All bets are on the Cybercab\.$/i,
    title: "特斯拉押注 Cybercab，Model S 与 Model X 进一步边缘化",
    summary: "TechCrunch 认为，特斯拉正把更多资源和外界预期引向 Cybercab，传统高端车型的重要性持续下降。",
    why: "特斯拉资源重心向 Robotaxi 倾斜，有助于判断其智能驾驶商业化路线是否开始从乘用车转向专用运营场景。",
  },
  {
    pattern: /^Robotaxi companies refuse to say how often their AVs need remote help$/i,
    title: "多家 Robotaxi 公司仍不愿披露远程接管频率",
    summary: "Robotaxi 企业对远程协助和人工接管频率的披露仍较有限，暴露行业在透明度上的共同短板。",
    why: "远程接管频率是判断自动驾驶真实成熟度和运营安全边界的重要指标，信息透明度会影响监管与公众信任。",
  },
  {
    pattern: /^Uber and WeRide ramp up robotaxi operations in Dubai$/i,
    title: "Uber 与文远知行在迪拜加码 Robotaxi 运营",
    summary: "Uber 与文远知行正在扩大迪拜的 Robotaxi 运营力度，中东成为自动驾驶商业化扩张的新试验场。",
    why: "海外运营城市的扩张速度，是衡量 Robotaxi 是否具备跨区域复制能力和商业化韧性的关键信号。",
  },
  {
    pattern: /^Waymo starts robotaxi services at San Antonio International Airport$/i,
    title: "Waymo 在圣安东尼奥国际机场启动 Robotaxi 服务",
    summary: "Waymo 把 Robotaxi 服务延伸到机场场景，继续扩大其高频出行节点的覆盖范围。",
    why: "机场等高流量场景对调度、安全和运营效率要求更高，落地进展往往最能反映头部玩家的商业成熟度。",
  },
  {
    pattern: /^'System failure' paralyzes Baidu robotaxis in China$/i,
    title: "百度 Robotaxi 因系统故障短时停摆引发关注",
    summary: "TechCrunch 报道称，百度 Robotaxi 因系统故障出现停摆，再次把自动驾驶稳定性问题推到台前。",
    why: "自动驾驶的大规模运营不仅比拼功能上线速度，更考验系统稳定性、应急机制与公众信任。",
  },
  {
    pattern: /^Manus探秘：这家中国初创AI公司已“不知所踪”$/i,
    title: "Manus 去向成谜，这家中国 AI 初创公司再引关注",
    summary: "围绕 Manus 近况的最新报道显示，这家曾受关注的中国 AI 初创公司目前公开动向有限，外界对其进展再起疑问。",
    why: "对国内 AI 创业公司而言，融资、团队与产品节奏一旦失去连续公开信号，市场对其兑现能力的判断会迅速转向。",
  },
];

function findRewrite(title: string): RewriteRule | null {
  const normalized = cleanSentence(title);

  for (const rule of rewriteRules) {
    if (rule.pattern.test(normalized)) {
      return rule;
    }
  }

  return null;
}

function localizeEnglishTitle(title: string): string {
  const rewriteTitle = findRewrite(title)?.title;
  if (rewriteTitle) {
    return rewriteTitle;
  }

  const normalized = cleanSentence(title).replace(/[–—]/g, "-");

  const heuristicRules: Array<[RegExp, string]> = [
    [/Netflix AI Team Just Open-Sourced VOID: an AI Model That Erases Objects From Videos/i, "Netflix 开源视频物体擦除模型 VOID"],
    [/One Company.?s Effort to Make an AI-Ready Catalog of Everything We Buy/i, "一家公司试图为现实商品世界建立 AI 可读目录"],
    [/Autonomous vehicles are driving the auto industry toward humanoid robots/i, "自动驾驶技术正把汽车业推向人形机器人竞赛"],
    [/What Robotics Experts Think of Tesla.?s Optimus Robot/i, "机器人专家如何看待特斯拉 Optimus"],
    [/Iran War Live Updates:.*Israel Launches Fresh Strikes on Tehran/i, "伊朗局势升级，以色列再次空袭德黑兰"],
    [/Trump Slashed Funding for Science\. Now the U\.S\. Faces a Costly Brain Drain\./i, "特朗普削减科研经费，美国面临高成本人才外流"],
    [/Trump Slashed .*Science.*Brain Drain/i, "特朗普削减科研经费，美国面临高成本人才外流"],
  ];

  for (const [pattern, localized] of heuristicRules) {
    if (pattern.test(normalized)) {
      return localized;
    }
  }

  return normalized
    .replace(/\bAI\b/gi, "AI")
    .replace(/\bOpenAI\b/gi, "OpenAI")
    .replace(/\bAnthropic\b/gi, "Anthropic")
    .replace(/\bTesla\b/gi, "特斯拉")
    .replace(/\bWaymo\b/gi, "Waymo")
    .replace(/\bUber\b/gi, "Uber")
    .replace(/\bMicrosoft\b/gi, "微软")
    .replace(/\bMeta\b/gi, "Meta")
    .replace(/\bApple\b/gi, "苹果")
    .replace(/\bNvidia\b/gi, "英伟达")
    .replace(/\brobotaxi\b/gi, "Robotaxi")
    .replace(/\bhumanoid robots?\b/gi, "人形机器人")
    .replace(/\bautonomous vehicles?\b/gi, "自动驾驶汽车")
    .replace(/\bbrain drain\b/gi, "人才外流")
    .replace(/\bscience\b/gi, "科研")
    .replace(/\bfunding\b/gi, "资金")
    .replace(/\bopen-sourced?\b/gi, "开源")
    .replace(/\blaunch(?:ed|es)?\b/gi, "推出")
    .replace(/\bwar\b/gi, "战争")
    .replace(/\bstrikes?\b/gi, "打击")
    .replace(/\bTehran\b/gi, "德黑兰")
    .replace(/\bIran\b/gi, "伊朗")
    .replace(/\bIsrael\b/gi, "以色列");
}

function topicDisplayName(topic: NewsItem["topic"]): string {
  switch (topic) {
    case "ai":
      return "人工智能";
    case "autonomous-driving":
      return "智能驾驶";
    case "embodied-intelligence":
      return "具身智能";
    case "world":
      return "全球要闻";
    case "business":
      return "商业趋势";
  }
}

function buildFallbackSummary(item: NewsItem): string {
  const contentDrivenSummary = summarizeFromContentHint(item);
  if (contentDrivenSummary) {
    return contentDrivenSummary;
  }

  if (isSummaryUsable(item.summary, item.title) && item.summary && hasChinese(item.summary)) {
    const cleanedSummary = stripRepeatedTitle(stripSourceTail(item.summary), item.title);
    if (normalizeForCompare(cleanedSummary) !== normalizeForCompare(item.title)) {
      return cleanedSummary;
    }
  }

  const localizedSummary = summarizeFromLocalizedTitle(item);
  if (localizedSummary) {
    return localizedSummary;
  }

  const englishContext = `${item.title} ${item.summary ?? ""}`.toLowerCase();
  const board = item.region === "china" ? "中国" : "全球";
  const topic = topicDisplayName(item.topic);
  const normalizedTitle = cleanSentence(item.title).replace(/[。！？]$/u, "");

  if (/\b(iran|israel|tehran|war|strike|airman|missile|ceasefire)\b/.test(englishContext)) {
    return "中东局势仍在升级，军事行动与人员搜救进展继续推高全球市场对地缘风险的关注。";
  }

  if (/\b(brain drain|science|funding|research funding|slashed funding)\b/.test(englishContext)) {
    return "美国科研经费收缩正在外溢为人才流失风险，政策变化开始影响长期创新能力与产业竞争力。";
  }

  if (/\b(open-source|open sourced|open-sourced|model|agent platform|launches enterprise ai agent platform)\b/.test(englishContext)) {
    return "相关公司发布了新的模型或平台能力，重点不只是技术更新，而是它准备把能力更快推向真实产品与用户场景。";
  }

  if (/\b(catalog of everything we buy|catalog)\b/.test(englishContext)) {
    return "这家公司正尝试把现实商品世界整理成 AI 可理解的数据底座，为购物、检索和推荐场景提供更可用的基础设施。";
  }

  if (/\bautonomous vehicles\b.*\bhumanoid robots\b|\bhumanoid robot\b|\boptimus\b|\brobotics experts\b/.test(englishContext)) {
    return "自动驾驶与机器人技术开始出现更深的能力复用，汽车产业链正在把感知、控制与硬件能力外溢到人形机器人方向。";
  }

  if (/\b(robotaxi|fsd|driverless|waymo|cruise|bluecruise|cybercab)\b/.test(englishContext)) {
    return "这条消息对应的是自动驾驶从功能迭代走向真实运营的最新信号，重点应看商业化节奏、安全边界和量产推进。";
  }

  if (/\b(funding|valuation|private markets|ipo|raises?|investment|acquisition|layoff|earnings)\b/.test(englishContext)) {
    return "这条消息主要反映公司估值、融资或资本配置的新变化，比概念叙事更接近真实的商业温度。";
  }

  if (hasChinese(normalizedTitle)) {
    if (item.topic === "ai" && /开源|模型|平台/.test(normalizedTitle)) {
      return "这条消息的核心是相关公司拿出了新的模型或平台能力，重点应看它会不会更快进入真实产品和用户场景。";
    }

    if (item.topic === "ai" && /目录|AI 可读/.test(normalizedTitle)) {
      return "这条消息的重点不是概念包装，而是有人在为现实商品世界建立更适合 AI 调用的数据底座。";
    }

    if (item.topic === "autonomous-driving" && /人形机器人|机器人竞赛/.test(normalizedTitle)) {
      return "这条消息反映的是自动驾驶能力开始向机器人迁移，汽车产业链的感知与控制技术正在外溢到新硬件形态。";
    }

    if (item.topic === "embodied-intelligence" && /Optimus|机器人专家|人形机器人/.test(normalizedTitle)) {
      return "这条消息聚焦人形机器人真实能力而不是演示效果，更值得看技术成熟度、成本和可部署性。";
    }

    if (item.topic === "world" && /局势升级|空袭|德黑兰|以色列|伊朗/.test(normalizedTitle)) {
      return "中东局势仍在升级，军事行动与搜救进展继续推高全球市场对地缘风险的关注。";
    }

    if (item.topic === "business" && /科研经费|人才外流/.test(normalizedTitle)) {
      return "科研经费收缩开始外溢为人才流失风险，政策变化正在影响一国长期创新能力与产业竞争力。";
    }

    if (item.topic === "ai") {
      return `这条新闻聚焦“${normalizedTitle}”，重点是看相关公司或机构在人工智能产品、模型或组织动作上的最新推进。`;
    }

    if (item.topic === "autonomous-driving") {
      return `这条新闻聚焦“${normalizedTitle}”，重点是看智能驾驶在量产、运营、监管或车企落地上的最新进展。`;
    }

    if (item.topic === "embodied-intelligence") {
      return `这条新闻聚焦“${normalizedTitle}”，重点是看具身智能在机器人产品化、部署节奏或真实场景验证上的最新变化。`;
    }

    if (item.topic === "world") {
      return `这条新闻聚焦“${normalizedTitle}”，反映正在影响科技与商业判断的全球外部环境变化。`;
    }

    return `这条新闻聚焦“${normalizedTitle}”，重点是看公司动作、资本市场或产业链变化对商业趋势的影响。`;
  }

  return `这条${board}${topic}新闻对应的是当天值得优先关注的一项新变化，重点在于它可能改变该板块接下来的产品、资本或监管预期。`;
}

function buildFallbackWhy(item: NewsItem): string {
  const title = item.title.toLowerCase();
  const normalizedTitle = cleanSentence(item.title);

  if (/科研经费|人才外流/.test(normalizedTitle)) {
    return "当科研投入开始影响人才流向时，问题就不只是财政收缩，而是长期创新供给和产业竞争力会被同步削弱。";
  }

  if (/局势升级|空袭|德黑兰|以色列|伊朗/.test(normalizedTitle)) {
    return "这类全球事件会直接改变市场风险偏好、政策预期和科技公司的外部经营环境，是当天阅读顺序里的上游变量。";
  }

  if (/开源|模型|平台/.test(normalizedTitle) && item.topic === "ai") {
    return "模型和平台更新最值得看的不是发布本身，而是它是否把能力边界和应用落地速度又往前推了一步。";
  }

  if (/人形机器人|Optimus|机器人专家/.test(normalizedTitle)) {
    return "这类讨论能帮助我们区分机器人赛道里的真实可交付能力和演示型热度，减少只看视频带来的误判。";
  }

  if (item.topic === "world") {
    if (/war|strike|missile|sanction|tariff|election|diplom|ceasefire|iran|israel/i.test(title)) {
      return "这类全球事件会直接改变市场风险偏好、政策预期和科技公司的外部经营环境，是当天阅读顺序里的上游变量。";
    }

    return "这类国际环境变量虽然不一定直接来自科技行业，但常常会先一步改变资本、政策与企业决策的边界。";
  }

  if (item.topic === "business") {
    if (/earnings|ipo|funding|acquisition|layoff|brain drain|science funding|investment/i.test(title)) {
      return "这类公司动作和资源流向变化，往往比口号更能说明市场真正把资金和信心投向了哪里。";
    }

    return "商业趋势板块更看重资源、利润和组织变化，因为它们通常最早反映景气度和市场风险偏好的转向。";
  }

  if (/\b(fund|raise|investment|funding)\b|融资/.test(title)) {
    return "融资与投资动作通常意味着资本市场正在重新评估该赛道的增长空间，也可能带来后续产品化和商业化提速。";
  }

  if (/发布|launch|introduc|推出|release|open source|开源|模型/i.test(title)) {
    return "产品或模型更新往往会直接改变市场对能力上限、竞争格局和落地节奏的判断。";
  }

  if (/监管|policy|regulation|法案|标准|rule/i.test(title)) {
    return "政策与规则变化会直接影响企业的合规边界、上线节奏和商业化预期，值得持续跟踪。";
  }

  if (/robotaxi|fsd|waymo|自动驾驶|智能驾驶|辅助驾驶|noa|路测/i.test(title)) {
    return "这类进展通常能够反映自动驾驶从测试走向规模化落地的速度，也会影响行业对安全与商业模式的判断。";
  }

  if (/robot|robotics|humanoid|具身智能|人形机器人|机器人/i.test(title)) {
    return "具身智能相关进展比拼的不只是演示效果，更是交付能力、场景密度和真实部署节奏。";
  }

  if (/tariff|sanction|geopolit|关税|制裁|出口管制|地缘/i.test(title)) {
    return "这类外部变量会直接改变科技公司和资本市场的预期边界，是判断当天阅读优先级的重要背景。";
  }

  if (/earnings|ipo|funding|acquisition|layoff|财报|融资|并购|裁员/i.test(title)) {
    return "公司财报、融资和交易动作通常比概念叙事更能直接反映商业趋势与市场风险偏好。";
  }

  if (/合作|partnership|deal|签约|integration|deploy/i.test(title)) {
    return "合作与落地类新闻通常比概念性表述更接近真实商业进展，能帮助判断技术是否正在进入更大规模的应用场景。";
  }

  if (item.topic === "ai") {
    return "这条新闻有助于判断人工智能能力演进、产品竞争与产业采用的最新方向。";
  }

  if (item.topic === "autonomous-driving") {
    return "这条新闻有助于判断智能驾驶在技术成熟度、量产节奏与市场预期上的最新变化。";
  }

  if (item.topic === "embodied-intelligence") {
    return "这条新闻有助于判断具身智能从演示走向真实交付的速度和可信度。";
  }

  if ((item.topic as string) === "world") {
    return "这条新闻有助于判断影响科技与商业决策的全球外部环境是否正在变化。";
  }

  return "这条新闻有助于判断公司经营、资本动作和市场情绪的最新变化。";
}

function toFallbackBriefItem(item: NewsItem): BriefItem {
  const rewrite = findRewrite(item.title);
  const localizedTitle = hasChinese(item.title)
    ? cleanSentence(item.title)
    : rewrite?.title ?? localizeEnglishTitle(item.title);

  return {
    title: localizedTitle,
    summary: rewrite?.summary ?? buildFallbackSummary(item),
    whyItMatters:
      rewrite?.why ??
      (isWhyUsable(item.whyItMatters) ? item.whyItMatters ?? buildFallbackWhy(item) : buildFallbackWhy(item)),
    source: item.source,
    publishedAt: item.publishedAt,
    url: item.url,
    imageUrl: item.imageUrl || undefined,
  };
}

async function summarizeWithCodex(items: NewsItem[]): Promise<EditorialPayload | null> {
  const codexBinary = readOptionalEnv("CODEX_BIN") ?? "codex";
  const enabled = readOptionalEnv("BRIEF_USE_CODEX_SUMMARY");

  if (enabled === "0") {
    return null;
  }

  let tempDir = "";

  try {
    tempDir = await mkdtemp(path.join(tmpdir(), "brief-codex-"));
    const schemaPath = path.join(tempDir, "schema.json");
    const outputPath = path.join(tempDir, "output.json");

    await writeFile(
      schemaPath,
      JSON.stringify(
        {
          $schema: "https://json-schema.org/draft/2020-12/schema",
          type: "object",
          properties: {
            lead_id: { type: "string" },
            trend_line: { type: "string" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  summary: { type: "string" },
                  why_it_matters: { type: "string" },
                },
                required: ["id", "title", "summary", "why_it_matters"],
                additionalProperties: false,
              },
            },
          },
          required: ["lead_id", "trend_line", "items"],
          additionalProperties: false,
        },
        null,
        2,
      ),
    );

    const prompt = [
      "你是中文科技晨报的资深编辑，请把下面入选的新闻条目整理成一份统一风格的简报成稿。",
      "输出要求：",
      "1. 所有输出必须是简体中文。",
      "2. title 要像中文晨报标题，准确、克制、信息密度高，不要英文化直译腔。",
      "3. summary 用一句话概括事实本身，不要空话，不要重复标题。",
      "4. why_it_matters 用一句话说明为什么值得关注，要体现行业判断，而不是模板句。",
      "5. trend_line 用一句中文判断概括今天最值得注意的总趋势，不要写时间范围、候选条数、抓取流程。",
      "6. lead_id 选出最适合作为头版主稿的那一条，标准是行业重要性最高、最能代表今天的变化，而不是最吸睛。",
      "7. 保留每条新闻的 id 原样返回。",
      "8. 不要输出 schema 之外的字段。",
      "",
      JSON.stringify(
        {
          items: items.map((item) => ({
            id: item.id,
            title: item.title,
            localized_title: hasChinese(item.title) ? cleanSentence(item.title) : localizeEnglishTitle(item.title),
            source: item.source,
            topic: topicDisplayName(item.topic),
            region: item.region === "china" ? "中国" : "全球",
            publishedAt: item.publishedAt,
            summary: item.summary ?? "",
            content_hint: extractContentHint(item).slice(0, 700),
          })),
        },
        null,
        2,
      ),
    ].join("\n");

    await execFileAsync(
      codexBinary,
      [
        "exec",
        "--skip-git-repo-check",
        "--color",
        "never",
        "--disable",
        "plugins",
        "-C",
        process.cwd(),
        "--output-schema",
        schemaPath,
        "-o",
        outputPath,
        prompt,
      ],
      {
        timeout: 90000,
        maxBuffer: 1024 * 1024 * 8,
      },
    );

    const raw = await readFile(outputPath, "utf8");
    const parsed = JSON.parse(raw) as EditorialPayload;

    return {
      lead_id: parsed.lead_id,
      trend_line: cleanSentence(parsed.trend_line),
      items: parsed.items.map((item) => ({
        id: item.id,
        title: cleanSentence(item.title),
        summary: cleanSentence(item.summary),
        why_it_matters: cleanSentence(item.why_it_matters),
      })),
    };
  } catch {
    return null;
  } finally {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  }
}

export async function summarizeEditorialPackage(items: NewsItem[]): Promise<{
  leadId: string | null;
  trendLine: string | null;
  items: Map<string, BriefItem>;
}> {
  const uniqueItems = items.filter(
    (item, index) => items.findIndex((candidate) => candidate.id === item.id) === index,
  );

  const enriched = await summarizeWithCodex(uniqueItems);

  if (!enriched) {
    return {
      leadId: uniqueItems[0]?.id ?? null,
      trendLine: null,
      items: new Map(uniqueItems.map((item) => [item.id, toFallbackBriefItem(item)])),
    };
  }

  const itemMap = new Map<string, BriefItem>();

  for (const item of uniqueItems) {
    const enrichedItem = enriched.items.find((entry) => entry.id === item.id);
    const localizedTitle = hasChinese(item.title) ? cleanSentence(item.title) : localizeEnglishTitle(item.title);

    itemMap.set(item.id, {
      title: enrichedItem?.title ?? localizedTitle,
      summary: enrichedItem?.summary ?? buildFallbackSummary(item),
      whyItMatters:
        enrichedItem?.why_it_matters ??
        (isWhyUsable(item.whyItMatters) ? item.whyItMatters ?? buildFallbackWhy(item) : buildFallbackWhy(item)),
      source: item.source,
      publishedAt: item.publishedAt,
      url: item.url,
      imageUrl: item.imageUrl || undefined,
    });
  }

  return {
    leadId: enriched.lead_id,
    trendLine: enriched.trend_line,
    items: itemMap,
  };
}
