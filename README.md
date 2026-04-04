# Intelly Daily Brief

一份面向 `AI`、`智能驾驶`、`具身智能`、`全球要闻`、`商业趋势` 的每日情报简报系统，聚焦过去 24 小时内的全球与中国重点动态，并以更像新闻首页与晨报的方式组织内容。

## 产品目标

每天北京时间 `08:00` 生成并发送一份简报，覆盖过去 24 小时的：

- AI
- 智能驾驶
- 具身智能
- 全球要闻
- 商业趋势

当前默认收件邮箱是 `jiem.yangjie@huawei.com`。

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- Vercel Cron
- OpenAI（可选，用于更强的结构化总结）
- Resend 或 SMTP + HTML Email（已接入可选投递）

## 当前进展

当前仓库已经完成这些能力：

- Source Registry 驱动的 RSS / 聚合抓取
- 按板块聚合、去重、来源归一和基础质量过滤
- 中文摘要与“为什么重要”的规则化生成
- 本地 JSON / HTML 产物输出
- 正式首页直接读取最新简报 JSON，以新闻首页方式展示
- 历史期刊页、板块详情页、阅读打卡与本地用户设置
- Vercel Cron 路由
- Resend / SMTP 可选投递

当前仍在持续增强：

- 更强的中文信源覆盖和国内智能驾驶深度
- 更高质量的正文提炼与中文标题归一
- 正式上线环境下的真实发信与监控

## 本地开发

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

运行静态检查：

```bash
npm run lint
npm run typecheck
```

手动生成一份简报：

```bash
npm run brief:run
```

检查当前候选新闻质量：

```bash
npm run brief:inspect
```

## 环境变量

将 `.env.example` 复制为 `.env.local` 后填写变量值。

核心变量：

- `OPENAI_API_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM_EMAIL`
- `BRIEF_RECIPIENT_EMAIL`
- `BRIEF_TIMEZONE`
- `CRON_SECRET`
- `APP_URL`

## 项目结构

```txt
src/
  app/
  config/
  jobs/
  lib/
  types/
docs/
```

## 投递流程

1. 从 Source Registry 与聚合信源抓取候选新闻
2. 统一格式并去重
3. 按相关度、可信度和影响力排序
4. 生成结构化简报
5. 渲染响应式 HTML 邮件
6. 通过 Resend 或 SMTP 配合定时任务投递

## 说明

- 首页不再是占位仪表盘，而是会优先渲染 `artifacts/` 下最新生成的一份简报。
- 如果没有配置 `RESEND_API_KEY` 或可用 SMTP，cron 路由会回退到本地 outbox 记录，但仍然生成简报内容。
- 当前生成结果在：
  - `artifacts/daily-brief-YYYY-MM-DD.json`
  - `artifacts/daily-brief-YYYY-MM-DD.html`
- 更完整的部署步骤见 `docs/deployment-checklist.md`
