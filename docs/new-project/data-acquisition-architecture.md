# 数据采集架构方案

## 1. 目标

这套数据架构要同时满足 4 个要求：

- `内容丰富`
  同一板块不能只靠 1 到 2 个来源支撑。
- `可信度高`
  要优先保留官方源、一手源和稳定媒体，不做低质搬运站聚合。
- `来源稳定多样`
  不能单点依赖某一个 RSS 或某一个新闻 API。
- `结构化可运营`
  最终输出必须是可用于站内展示、邮件和 IM 推送的统一内容模型。

## 2. 总体策略

采用 `四层混合采集架构`：

### 第一层：RSS 与公开 Feed

适合：

- 官方博客
- 垂直媒体
- 新闻站专题栏目
- 行业组织与机构更新

特点：

- 成本低
- 稳定性高
- 易于版本化
- 适合作为每日常规供给的基础层

### 第二层：定向网页抓取

适合：

- 无 RSS 的重点站点
- 专题页、栏目页、榜单页
- 动态加载但内容价值高的页面

特点：

- 覆盖面扩展能力强
- 需要更强的失败重试、选择器治理和反脆弱设计

### 第三层：文档提取

适合：

- PDF 白皮书
- 公司公告
- 政策文件
- 研报与研究机构资料

特点：

- 可信度通常较高
- 更适合支撑 `全球要闻`、`商业趋势`、`具身智能` 中的深度条目

### 第四层：人工白名单与编辑增强

适合：

- 高价值但不稳定的来源
- 重要公司官网
- 特定媒体专题页

特点：

- 保证质量上限
- 适合作为核心板块的兜底层

## 3. 板块与信源策略

### AI

优先来源：

- 官方：OpenAI、Anthropic、Google DeepMind、Meta、Microsoft、NVIDIA
- 媒体：TechCrunch、The Verge、Reuters、Financial Times、WSJ
- 国内：36Kr、财联社、第一财经、界面、机器之心、量子位

### 智能驾驶

优先来源：

- 官方：Waymo、Tesla、Mobileye、Aurora、Zoox、Uber
- 媒体：Reuters、TechCrunch、The Verge、Financial Times
- 国内：新浪财经、36Kr、财联社、第一财经、界面、澎湃

### 具身智能

优先来源：

- 官方：Figure、Boston Dynamics、Agility、Tesla Optimus、Unitree、宇树、优必选
- 媒体：TechCrunch、IEEE Spectrum、Reuters、行业研究机构
- 国内：机器之心、量子位、36Kr、行业白皮书和官方公众号镜像源

### 全球要闻

优先来源：

- Reuters
- Associated Press
- Financial Times
- Bloomberg 类官方公开页面或摘要源
- 重点国际机构与政府公告

### 商业趋势

优先来源：

- Financial Times
- WSJ
- Reuters
- CNBC
- The Information
- 国内商业媒体与上市公司公告

## 4. 核心模块

### 4.1 Source Registry

维护统一信源注册表。

每个来源至少包含：

- `source_id`
- `name`
- `category`
- `channel_type`
  - `rss`
  - `crawler`
  - `pdf`
  - `manual`
- `domain`
- `topics`
- `regions`
- `trust_level`
- `fetch_interval`
- `status`

### 4.2 Collector Layer

按来源类型拆成独立适配器：

- `rss collector`
- `html crawler`
- `dynamic crawler`
- `pdf extractor`

输出统一原始结构：

- `source_id`
- `title`
- `url`
- `published_at`
- `raw_summary`
- `raw_content`
- `author`
- `image_url`
- `fetched_at`

### 4.3 Normalize Layer

把不同来源归一成统一候选内容。

要做的事：

- 标题清洗
- 时间标准化
- 来源归一
- 摘要抽取
- 语言识别
- 图片链接抽取

### 4.4 Quality Layer

这一层决定“内容可信且稳定”，必须独立存在。

核心能力：

- 去重
- 标题相似度聚合
- 同一事件多源合并
- 来源权重
- 噪声标题过滤
- 黑名单 / 白名单
- 可信度打分
- 板块分类

### 4.5 Editorial Layer

把候选内容转成简报成稿。

职责：

- 每板块选出 `3-5` 条
- 生成头条主稿
- 生成“今日重点”
- 生成站内展示版本
- 生成邮件版本
- 生成 IM 推送版本

## 5. 可信度与稳定性规则

### 可信度优先级

从高到低建议分为四档：

1. `官方源 / 原始发布`
2. `稳定主流媒体 / 行业权威媒体`
3. `垂直媒体 / 专题媒体`
4. `聚合站 / 转载站 / 不稳定站点`

规则：

- 同一事件出现多条时，优先保留更高可信度来源
- 聚合站与低质转载站默认不做头条来源
- 如果内容很重要但来源偏弱，必须等待更强来源确认或降权处理

### 稳定性规则

- 每个核心板块至少维护 `10-20` 个基础信源
- 任何单一来源不应承担超过 `30%` 的日常供给
- 抓取失败要有重试和告警
- 某来源持续失败时自动降级，不影响整期简报生成

## 6. 数据模型建议

最小核心表建议：

- `sources`
- `raw_articles`
- `normalized_articles`
- `article_clusters`
- `brief_issues`
- `brief_sections`
- `brief_items`

关键原则：

- 原始采集结果与最终成稿必须分开存
- 每日简报要版本化，不能只有一份“当前值”
- 图片、摘要、标题改写都应作为衍生字段保存，便于回溯

## 7. 图片策略

- 优先使用文章来源中的真实图片
- 无可靠图片时，不使用通用占位图伪装新闻主图
- 次要新闻可选配小图，但不能让图片质量反过来拖低页面质感
- 图片抽取作为采集层的可选增强，不阻塞核心简报生成

## 8. MVP 推荐落地顺序

### 第一阶段

- 建 `Source Registry`
- 接 RSS 采集
- 接核心官方源和主流媒体白名单
- 建统一归一化数据结构

### 第二阶段

- 接定向网页抓取
- 接动态页面抓取
- 接 PDF / 公告提取
- 建去重与可信度规则

### 第三阶段

- 建编辑层
- 输出站内简报、邮件简报、IM 推送版本
- 加告警、重试、人工修正入口

## 9. 项目与 Skill 的职责边界

### Skill 负责增强

- `playwright` / `playwright-interactive`
  用于动态网页验证、复杂页面抓取调试
- `pdf`
  用于 PDF 文档提取与结构化阅读
- `screenshot`
  用于页面取证、截图留档和竞品验证
- `agent-tools`
  用于补充搜索、发现额外来源、模型辅助处理

### 项目本身必须实现

- 信源注册表
- 抓取调度
- 去重与可信度评分
- 内容聚类
- 简报成稿
- 推送前内容结构化

也就是说：`skills 是加速器，不是数据基础设施本身。`

## 10. 第一批推荐信源

建议先从每个板块各接 `5-8` 个稳定源，不追求一开始就贪多。

首批优先：

- AI：OpenAI、Anthropic、TechCrunch、The Verge、Reuters、36Kr
- 智能驾驶：Waymo、Tesla、Reuters、TechCrunch、36Kr、第一财经
- 具身智能：Figure、Boston Dynamics、Unitree、Reuters、IEEE Spectrum
- 全球要闻：Reuters、AP、FT
- 商业趋势：FT、WSJ、CNBC、财联社、界面

第一阶段先把“稳定”做好，再扩张覆盖面。
