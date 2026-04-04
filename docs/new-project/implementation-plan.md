# 工程方案 / 实施路线

## 1. 技术目标

- 先做一个可上线的 `个人资讯简报 + 打卡` MVP
- 让数据采集、内容编辑、站内展示、推送分发彼此解耦
- 保证后续可以继续增加信源、板块和推送渠道，而不需要推倒重来

## 2. 技术栈与原因

- `Next.js`
  同时承载 Web、H5、站内 API 和基础管理页面
- `Auth.js`
  先支持邮箱登录，后续预留 OAuth / 微信扩展位
- `PostgreSQL`
  适合保存用户、简报、打卡、推送和信源数据
- `Prisma`
  方便快速建立和演进数据模型
- `Tailwind CSS`
  适合快速构建高密度、设计感强的扁平化界面
- `Vercel Cron`
  用于定时生成简报
- `Resend`
  用于邮件分发
- `微信/IM Bridge`
  用于后续微信侧推送，不直接耦合在 Web 层

## 3. 核心模块

### 用户与登录

- `user`
- `auth`
- `profile settings`

### 内容采集

- `source registry`
- `collector adapters`
- `normalize pipeline`
- `quality scoring`

### 简报生成

- `issue builder`
- `section selector`
- `editorial formatter`

### 打卡系统

- `daily check-in`
- `streak calculator`
- `reward hooks`

### 推送系统

- `email delivery`
- `im delivery`
- `delivery logs`

## 4. 数据流 / 状态流

1. 定时任务拉起采集器
2. 不同来源写入原始内容表
3. 归一化后写入标准内容表
4. 去重、聚类、打分
5. 生成每日 `brief issue`
6. 站内页面读取 `brief issue`
7. 邮件与 IM 推送从同一份 issue 派生
8. 用户阅读后触发打卡记录

## 5. 目录结构

建议从第一天就按领域拆分：

- `src/modules/auth`
- `src/modules/user`
- `src/modules/sources`
- `src/modules/ingestion`
- `src/modules/editorial`
- `src/modules/brief`
- `src/modules/checkin`
- `src/modules/push`
- `src/modules/ui`

## 6. 外部依赖

- RSS feed
- 官方博客与公告页
- 动态网页抓取能力
- PDF 文档提取能力
- 邮件服务
- 微信 / IM 发送桥接

## 7. 测试与验收

- 采集层：
  - 给定一组信源，能稳定抓到结构化候选内容
- 编辑层：
  - 每天都能生成一份完整 issue
- 展示层：
  - Web 和移动端都能稳定展示同一份简报
- 打卡层：
  - 用户每天只能完成一次有效打卡
- 推送层：
  - 邮件与 IM 都能读取同一份 issue 内容

## 8. 部署方案

- Web 与 API：`Vercel`
- 数据库：托管 PostgreSQL
- 定时任务：`Vercel Cron`
- 推送桥接：单独服务或现有桥接层

## 9. 风险与取舍

- 先保证数据质量和生成稳定性，再扩张内容广度
- 先把微信看作分发渠道，而不是首要使用端
- 先做统一 issue 模型，避免 Web、邮件、IM 各自拼内容

## 10. 开发阶段拆分

### 第一阶段

- 建用户、简报、打卡、推送四套核心模型
- 建 RSS 采集与基础信源注册表
- 生成第一版站内简报页面

### 第二阶段

- 接动态抓取和 PDF 提取
- 建去重、聚类和可信度规则
- 接邮件推送

### 第三阶段

- 接微信 / IM 推送
- 优化打卡激励
- 加内容运营与人工修正入口
