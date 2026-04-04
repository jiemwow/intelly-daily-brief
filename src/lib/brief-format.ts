import type { BriefItem } from "@/types/brief";

export function formatPublishedAt(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));
}

export function formatSourceLabel(value: string): string {
  const normalized = value.replace(/\.com$|\.cn$/i, "");

  if (/^WSJ$/i.test(normalized)) {
    return "华尔街日报";
  }

  if (/^Business Insider$/i.test(normalized)) {
    return "商业内幕";
  }

  if (/^TechCrunch$/i.test(normalized)) {
    return "TechCrunch";
  }

  if (/^Reuters$/i.test(normalized)) {
    return "路透社";
  }

  if (/^Financial Times$/i.test(normalized)) {
    return "金融时报";
  }

  if (/^WIRED$/i.test(normalized)) {
    return "WIRED";
  }

  if (/^The Information$/i.test(normalized)) {
    return "The Information";
  }

  if (/^AP News$/i.test(normalized)) {
    return "美联社";
  }

  if (/^NYT World$|^NYT Business$/i.test(normalized)) {
    return "纽约时报";
  }

  if (/^OpenAI Developer Community$/i.test(normalized)) {
    return "OpenAI 开发者社区";
  }

  if (/^OpenAI Help Center$/i.test(normalized)) {
    return "OpenAI 帮助中心";
  }

  if (/^Anthropic Trust Center$/i.test(normalized)) {
    return "Anthropic 信任中心";
  }

  if (/^trust\.anthropic$/i.test(normalized)) {
    return "Anthropic";
  }

  if (/^jiemian$/i.test(normalized)) {
    return "界面新闻";
  }

  if (/^36Kr$/i.test(normalized)) {
    return "36Kr";
  }

  return normalized;
}

export function cleanChinesePunctuation(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/[？?][。.]$/g, "？")
    .replace(/[！!][。.]$/g, "！")
    .replace(/[。.]{2,}$/g, "。")
    .trim();
}

export function hasChinese(value: string): boolean {
  return /[\u4e00-\u9fff]/.test(value);
}

function localizeTitleText(input: string): string {
  let title = cleanChinesePunctuation(input);

  const heuristics: Array<[RegExp, string]> = [
    [/^Admin Keys - OpenAI Platform$/i, "OpenAI 平台上线管理员密钥功能"],
    [/^Data retention - OpenAI Platform$/i, "OpenAI 平台更新数据保留策略说明"],
    [/^A call for deeper and less mechanical ChatGPT answers$/i, "开发者呼吁 ChatGPT 给出更深入、少模板感的回答"],
    [/^US presses search for a missing serviceman as Iran calls on public to find ['“]?enemy pilot['”]?$/i, "美方持续搜寻失踪军人，伊朗呼吁公众寻找“敌方飞行员”"],
    [/^Iran War Live Updates: U\.S\. Searches for Missing Airman as Trump Repeats Threats Over Strait$/i, "伊朗局势追踪：美方搜寻失踪飞行员，特朗普再就海峡局势发出威胁"],
    [/^Death toll from Afghan quake rises, including 8 members of refugee family returned from Iran$/i, "阿富汗地震死亡人数上升，含刚从伊朗返回的难民家庭 8 名成员"],
    [/^Artemis II astronauts are more than halfway to the moon as they seek to break Apollo 13'?s record$/i, "阿耳忒弥斯二号航程过半，NASA 冲击阿波罗 13 号远距载人飞行纪录"],
    [/^As Trump orders UFO data released, a question hangs: If aliens exist, what would they think of us\?$/i, "特朗普下令公开 UFO 档案后，美国再起外星生命讨论"],
    [/^Trump.?s go-it-alone certainty confronts the uncertainties of war$/i, "特朗普的单边主义判断正遭遇战争现实的不确定性"],
    [/^Slovak PM says EU should drop sanctions on Russian oil and gas to boost energy security$/i, "斯洛伐克总理称欧盟应取消对俄油气制裁以保障能源安全"],
    [/^Anthropic$/i, "Anthropic 公布最新平台动态"],
  ];

  for (const [pattern, localized] of heuristics) {
    if (pattern.test(title)) {
      return localized;
    }
  }

  title = title
    .replace(/^Russia and Ukraine trade deadly strikes as Zelenskyy travels to Istanbul for talks with Erdogan$/i, "俄乌继续激烈交火，泽连斯基赴伊斯坦布尔与埃尔多安会谈")
    .replace(/^US presses search for a missing serviceman as Iran calls on public to find ['“]?enemy pilot['”]?$/i, "美方持续搜寻失踪军人，伊朗呼吁公众寻找“敌方飞行员”")
    .replace(/^Iran War Live Updates:/i, "伊朗局势追踪：")
    .replace(/^Death toll from Afghan quake rises,/i, "阿富汗地震死亡人数上升，")
    .replace(/^Artemis II astronauts are more than halfway to the moon/i, "阿耳忒弥斯二号航程已过半")
    .replace(/\bRussia and Ukraine\b/gi, "俄乌")
    .replace(/\bRussia\b/gi, "俄罗斯")
    .replace(/\bUkraine\b/gi, "乌克兰")
    .replace(/\bIran\b/gi, "伊朗")
    .replace(/\bIsrael\b/gi, "以色列")
    .replace(/\bTrump'?s\b/gi, "特朗普的")
    .replace(/\bTrump\b/gi, "特朗普")
    .replace(/\bSlovak PM\b/gi, "斯洛伐克总理")
    .replace(/\bEU\b/g, "欧盟")
    .replace(/\bRussian oil and gas\b/gi, "俄罗斯油气")
    .replace(/\benergy security\b/gi, "能源安全")
    .replace(/\btrade deadly strikes\b/gi, "爆发激烈交火")
    .replace(/\btravels to\b/gi, "前往")
    .replace(/\bfor talks with\b/gi, "与")
    .replace(/\bmissing serviceman\b/gi, "失踪军人")
    .replace(/\benemy pilot\b/gi, "敌方飞行员")
    .replace(/\bwar\b/gi, "战争")
    .replace(/\bstrikes?\b/gi, "打击")
    .replace(/\bsanctions?\b/gi, "制裁")
    .replace(/\bboost\b/gi, "提升")
    .replace(/\bdrop\b/gi, "取消")
    .replace(/\bshould\b/gi, "应")
    .replace(/\bdeadly\b/gi, "激烈")
    .replace(/\btravels?\b/gi, "前往")
    .replace(/\btalks?\b/gi, "会谈")
    .replace(/\bdata retention\b/gi, "数据保留")
    .replace(/\bLive Updates\b/gi, "最新进展")
    .replace(/\bSearches for Missing Airman\b/gi, "搜寻失踪飞行员")
    .replace(/\bRepeats Threats Over Strait\b/gi, "再就海峡局势发出威胁")
    .replace(/\bDeath toll\b/gi, "死亡人数")
    .replace(/\bquake rises\b/gi, "上升")
    .replace(/\bincluding\b/gi, "其中包括")
    .replace(/\bmembers of refugee family returned from\b/gi, "名刚从…返回的难民家庭成员")
    .replace(/\bmore than halfway to the moon\b/gi, "飞往月球航程过半")
    .replace(/\bseek to break Apollo 13'?s record\b/gi, "冲击阿波罗 13 号纪录")
    .replace(/\bJiemian\.com\b/gi, "")
    .replace(/\bAI\b/g, "AI")
    .replace(/\bOpenAI\b/g, "OpenAI")
    .replace(/\bAnthropic\b/g, "Anthropic")
    .replace(/\bChatGPT\b/g, "ChatGPT")
    .replace(/\badmin\b/gi, "管理")
    .replace(/\bkeys\b/gi, "密钥")
    .replace(/\bplatform\b/gi, "平台")
    .replace(/\brelease notes\b/gi, "发布说明")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([，。！？])/g, "$1")
    .trim();

  if (!hasChinese(title) || /[A-Za-z]{8,}.*[A-Za-z]{8,}/.test(title)) {
    if (/Iran.+Missing Airman|Strait/i.test(input)) {
      return "伊朗局势追踪：美方搜寻失踪飞行员，特朗普再就海峡局势发出威胁";
    }

    if (/Afghan quake rises|refugee family returned from Iran/i.test(input)) {
      return "阿富汗地震死亡人数上升，含刚从伊朗返回的难民家庭 8 名成员";
    }

    if (/Artemis II.+halfway to the moon/i.test(input)) {
      return "阿耳忒弥斯二号航程过半，NASA 冲击阿波罗 13 号远距载人飞行纪录";
    }
  }

  return cleanChinesePunctuation(title);
}

export function buildDisplayTitle(item: BriefItem): string {
  return localizeTitleText(item.title);
}

export function buildDeck(item: BriefItem): string {
  return cleanChinesePunctuation(
    item.summary
      .replace(/\s+(Jiemian\.com|jiemian\.com|trust\.anthropic\.com)$/i, "")
      .trim(),
  );
}
