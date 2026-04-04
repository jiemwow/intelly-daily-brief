# 第一批信源清单

这份清单用于初始化 `Source Registry`。目标不是一上来追求“大而全”，而是先建立一组 `稳定、可信、分布合理` 的基础信源。

## 1. 录入原则

- 每个板块首批先接 `5-8` 个高价值来源
- 至少覆盖：
  - `官方源`
  - `主流媒体`
  - `垂直媒体`
- 首批以 `RSS / 公开 Feed` 为主，降低维护成本
- 无 RSS 但价值高的来源可进入 `crawler_backlog`
- 首批不接明显依赖重 JS 渲染、反爬严格且替代性强的站点

## 2. 推荐字段

每个来源建议初始化以下字段：

- `source_id`
- `name`
- `domain`
- `channel_type`
- `entry_url`
- `topics`
- `regions`
- `trust_level`
- `priority`
- `fetch_interval_minutes`
- `status`
- `notes`

## 3. 首批来源

### AI

| source_id | name | channel_type | topics | regions | trust_level | priority | notes |
|---|---|---|---|---|---|---|---|
| ai-openai | OpenAI News | rss/manual | ai | global | official | high | 官方动态优先源 |
| ai-anthropic | Anthropic News | rss/manual | ai | global | official | high | 官方动态优先源 |
| ai-google-deepmind | Google DeepMind Blog | rss/manual | ai | global | official | high | 模型与研究进展 |
| ai-nvidia-blog | NVIDIA Blog | rss/manual | ai | global | official | medium | 平台、芯片、生态 |
| ai-techcrunch | TechCrunch AI | rss | ai | global | mainstream | high | 作为日常供给源 |
| ai-theverge | The Verge AI | rss | ai | global | mainstream | medium | 行业趋势和产品动态 |
| ai-reuters | Reuters Tech / AI | rss/manual | ai | global | mainstream | high | 高可信通用源 |
| ai-36kr | 36Kr AI | rss/manual | ai | china | vertical | high | 国内重点媒体 |
| ai-jiqizhixin | 机器之心 | rss/manual | ai | china | vertical | medium | 国内垂直媒体 |
| ai-liangziwei | 量子位 | rss/manual | ai | china | vertical | medium | 国内垂直媒体 |

### 智能驾驶

| source_id | name | channel_type | topics | regions | trust_level | priority | notes |
|---|---|---|---|---|---|---|---|
| ad-waymo | Waymo Blog | rss/manual | autonomous-driving | global | official | high | 官方运营和发布 |
| ad-tesla | Tesla News / Blog | rss/manual | autonomous-driving | global | official | medium | 需结合质量过滤 |
| ad-mobileye | Mobileye Newsroom | rss/manual | autonomous-driving | global | official | medium | 行业核心玩家 |
| ad-aurora | Aurora Blog | rss/manual | autonomous-driving | global | official | medium | 重卡与自动驾驶 |
| ad-techcrunch | TechCrunch Transportation | rss | autonomous-driving | global | mainstream | high | 稳定媒体来源 |
| ad-reuters | Reuters Autos / Tech | rss/manual | autonomous-driving | global | mainstream | high | 高可信来源 |
| ad-36kr | 36Kr 汽车 / 智驾 | rss/manual | autonomous-driving | china | vertical | high | 国内重点源 |
| ad-yicai | 第一财经汽车 | rss/manual | autonomous-driving | china | mainstream | medium | 商业与产业视角 |
| ad-caixin-lite | 财联社相关栏目 | rss/manual | autonomous-driving | china | mainstream | medium | 快讯与行业进展 |

### 具身智能

| source_id | name | channel_type | topics | regions | trust_level | priority | notes |
|---|---|---|---|---|---|---|---|
| embodied-figure | Figure News | rss/manual | embodied-intelligence | global | official | high | 人形机器人重点源 |
| embodied-bd | Boston Dynamics | rss/manual | embodied-intelligence | global | official | high | 机器人官方源 |
| embodied-agility | Agility Robotics | rss/manual | embodied-intelligence | global | official | medium | 物流与机器人 |
| embodied-unitree | Unitree | rss/manual | embodied-intelligence | china | official | high | 国内重点玩家 |
| embodied-ubtech | 优必选 | rss/manual | embodied-intelligence | china | official | medium | 国内重点玩家 |
| embodied-ieee | IEEE Spectrum Robotics | rss/manual | embodied-intelligence | global | mainstream | high | 稳定专业媒体 |
| embodied-techcrunch | TechCrunch Robotics | rss/manual | embodied-intelligence | global | mainstream | medium | 行业动态补充 |
| embodied-jiqizhixin | 机器之心 | rss/manual | embodied-intelligence | china | vertical | medium | 国内垂直补充 |

### 全球要闻

| source_id | name | channel_type | topics | regions | trust_level | priority | notes |
|---|---|---|---|---|---|---|---|
| world-reuters | Reuters World | rss | world | global | mainstream | high | 核心全局来源 |
| world-ap | AP News | rss/manual | world | global | mainstream | high | 全球要闻基础源 |
| world-ft | Financial Times World | manual/crawler | world | global | mainstream | medium | 深度商业与国际议题 |
| world-ec | European Commission News | rss/manual | world | global | official | low | 政策与监管补充 |
| world-whitehouse | White House Briefing | rss/manual | world | global | official | low | 政策与国际议题补充 |

### 商业趋势

| source_id | name | channel_type | topics | regions | trust_level | priority | notes |
|---|---|---|---|---|---|---|---|
| biz-ft | Financial Times Companies / Markets | manual/crawler | business | global | mainstream | high | 深度商业趋势 |
| biz-wsj | WSJ Business | manual/crawler | business | global | mainstream | high | 商业信号强 |
| biz-cnbc | CNBC Business | rss/manual | business | global | mainstream | medium | 企业与市场事件 |
| biz-theinformation | The Information | manual/crawler | business | global | mainstream | medium | 科技商业趋势 |
| biz-reuters | Reuters Business | rss | business | global | mainstream | high | 稳定广覆盖 |
| biz-caijing | 财联社/界面商业栏目 | rss/manual | business | china | mainstream | high | 国内商业趋势 |
| biz-yicai | 第一财经商业栏目 | rss/manual | business | china | mainstream | medium | 国内商业趋势 |

## 4. crawler_backlog

以下来源价值高，但不建议第一天就纳入自动化主链：

- Bloomberg 公开页面
- The Information
- FT 部分专题页
- WSJ 部分专题页
- 公司公告中心的非标准列表页
- 需要登录或强 JS 渲染才能稳定获取内容的页面

建议做法：

- 先登记为 `manual` 或 `crawler_backlog`
- 等主链 RSS 稳定后再逐个接入

## 5. 板块最低供给线

MVP 阶段建议设定：

- `AI`：10 个活跃来源
- `智能驾驶`：8 个活跃来源
- `具身智能`：6 个活跃来源
- `全球要闻`：5 个活跃来源
- `商业趋势`：7 个活跃来源

当某板块低于最低供给线时，应进入“补源”待办，而不是让低质量来源自动补位。
