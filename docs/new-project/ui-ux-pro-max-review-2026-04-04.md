# UI/UX Pro Max 复盘记录

日期：2026-04-04  
对象：`/design/new-project-hifi`

## 1. 本轮使用结果

已使用 `ui-ux-pro-max` 生成并查询：

- `--design-system`：个人科技情报首页
- `--domain style`：编辑、科技、阅读界面风格
- `--domain typography`：编辑与科技方向排版组合
- `--domain landing`：首页结构模式
- `--domain color`：科技编辑类配色
- `--stack nextjs`：实现层约束

生成产物：

- [MASTER.md](/Users/jiem/Documents/New%20project/docs/new-project/design-system/intelly/MASTER.md)

## 2. 结论先行

这个 skill 有价值，但不能直接照抄。

它给出的第一版 `Design System` 推荐是：

- Pattern：`Minimal Single Column`
- Style：`Exaggerated Minimalism`
- Typography：`Newsreader + Roboto`
- Colors：`黑白 + 蓝色点缀`

这套建议只适合拿来做“约束提醒”，不适合直接成为我们首页的最终方向。  
原因很简单：它过度偏向 `landing page / statement page`，而我们的产品本质是 `个人科技情报首页`，需要的是精致的阅读秩序，而不是夸张的视觉口号。

## 3. 可以吸收的部分

### 配色

可以保留：

- 冷白或近白背景
- 深墨色正文
- 只保留一个蓝系强调色

原因：

- 这和我们原本的“科技简约、轻编辑感”方向一致
- 有助于去掉过多花哨色彩

### 排版逻辑

可以保留：

- 标题层级减少
- 首屏只保留一个真正的视觉中心
- 少卡片、少阴影、少重边框

原因：

- 这正好解决当前页面“看起来像很多盒子拼起来”的问题

### 实现约束

可以保留：

- `next/image` 做响应式图片
- 字体尽量在根布局统一
- 尽量避免布局跳动

## 4. 必须拒绝的部分

### 拒绝 1：`Exaggerated Minimalism`

这正是当前页面最容易继续走偏的方向。

问题：

- 它天然会推着页面走向“超大标题 + 过量留白 + 口号式首屏”
- 适合品牌落地页，不适合资讯首页

对我们来说，结果会是：

- 标题很大，但信息结构并不更清楚
- 页面看起来“设计过”，但不够耐读

### 拒绝 2：`Minimal Single Column`

这和我们的产品目标冲突。

问题：

- 我们需要分栏浏览和快速扫读
- 单列模型会牺牲板块感和信息效率

### 拒绝 3：过强的编辑 serif 主导

`Newsreader` 方向可以参考，但不能把整个页面带成传统报刊。

问题：

- 我们是科技产品，不是数字报纸
- 过多 serif 会削弱科技感和产品感

## 5. 当前页面最具体的问题

### 问题 1：首屏仍然是三块并列，视觉中心不够集中

见：

- [page.tsx:126](/Users/jiem/Documents/New%20project/src/app/design/new-project-hifi/page.tsx#L126)

当前是：

- 左侧导读
- 中间头条
- 右侧判断栏

这三块权重太接近，导致首屏没有一个真正被“举起来”的中心。

### 问题 2：左侧导读区仍然有较强的 landing 文案味

见：

- [page.tsx:130](/Users/jiem/Documents/New%20project/src/app/design/new-project-hifi/page.tsx#L130)

问题：

- “先读最重要的变化，再决定往哪一栏深入”更像概念说明
- 不像真实产品首页的内容入口

### 问题 3：头条标题仍然偏长，首屏压迫感还在

见：

- [page.tsx:172](/Users/jiem/Documents/New%20project/src/app/design/new-project-hifi/page.tsx#L172)

问题：

- 标题比上一版收了，但仍然太像宣言句
- 首页需要更像“新闻题目”，而不是“产品论点”

### 问题 4：右栏仍然是多个功能模块垂直堆叠

见：

- [page.tsx:206](/Users/jiem/Documents/New%20project/src/app/design/new-project-hifi/page.tsx#L206)

问题：

- 虽然比之前轻，但还是“一个判断块 + 一个习惯块 + 一个 open next 块”
- 这仍然属于模块思维，不够像连续页面

### 问题 5：下方五个板块仍然偏“图文专题卡”

见：

- [page.tsx:252](/Users/jiem/Documents/New%20project/src/app/design/new-project-hifi/page.tsx#L252)

问题：

- 图片、标题、三条内容的结构太统一
- 统一过头会让页面重新变成“模板重复”

## 6. 重新收敛后的方向

本轮复盘后，新的建议方向不是：

- 传统报纸
- 落地页极简
- SaaS 仪表盘

而是：

`Swiss Modernism 2.0 + 轻编辑阅读结构`

也就是：

- 结构上用严格栅格和更理性的页面秩序
- 阅读上保留少量编辑气质
- 视觉上坚持科技产品感

## 7. 下一版应如何改

### 首屏

- 改成 `一个主稿区 + 一个细辅助栏`
- 左侧不再放大段导读说明
- 用更短、更像真实头条的标题
- 主图继续保留，但让它服务头条，而不是成为“设计图”

### 右侧辅助栏

- 压缩成一列真正的信息索引
- 只保留：
  - 今日判断
  - 打卡状态
  - 三个下一步入口

不要再做多个独立模块感很强的区块。

### 五大板块

- 改成更像“连续栏目”
- 不是五个结构完全相同的图文块
- 允许：
  - 两个板块有图
  - 两个板块纯文字
  - 一个板块突出数据或短评

### 字体

- 中文主标题从当前偏报刊 serif 再收一点
- 页面整体以现代 sans 为主
- serif 只保留给少量关键标题或判断句

### 色彩

- 保留蓝系作为唯一强调色
- 去掉板块之间过多不同色相的浅底
- 整页更统一，板块差异主要靠秩序，不靠颜色

## 8. 执行建议

下一轮不要再做“风格探索页”，直接做：

1. 首屏重构
2. 五大板块重排
3. 字体体系和配色体系统一

先把这一版收成真正的基线，再继续扩页面。
