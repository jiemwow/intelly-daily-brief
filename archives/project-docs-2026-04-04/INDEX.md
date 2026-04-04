# 项目文档归档

归档日期：2026-04-04

这个目录用于保存“每日简报”项目当前阶段的核心文档、配置和输出样例，方便后续继续开发、迁移环境或快速回顾项目背景。

## 包含内容

- `README.md`
  项目总体说明与启动方式。
- `docs/architecture.md`
  当前技术架构与任务流说明。
- `docs/design-notes.md`
  视觉方向、设计参考与页面风格记录。
- `src/config/brief.ts`
  简报核心业务配置。
- `src/config/site.ts`
  站点与品牌配置。
- `.env.example`
  环境变量示例。
- `vercel.json`
  定时任务与部署配置。
- `next.config.ts`
  Next.js 配置。
- `package.json`
  项目脚本与依赖。
- `tsconfig.json`
  TypeScript 配置。
- `artifacts/daily-brief-2026-04-04.json`
  最新结构化简报数据样例。
- `artifacts/daily-brief-2026-04-04.html`
  最新 HTML 简报样例。

## 使用建议

- 后续继续开发时，优先阅读 `README.md`、`docs/architecture.md` 和 `docs/design-notes.md`。
- 需要恢复运行环境时，对照 `.env.example`、`package.json`、`next.config.ts`、`vercel.json`。
- 需要快速理解当前输出目标时，直接查看 `artifacts/` 中的 JSON 和 HTML 样例。
