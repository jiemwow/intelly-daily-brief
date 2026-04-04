---
description: "Workspace instructions for the Daily Brief project: how to build, test, and make safe changes to the Next.js app + daily briefing pipeline."
---

# Daily Brief workspace instructions

## What this project is

This repository is a Next.js App Router project plus a TypeScript-based daily briefing pipeline. It generates a news brief every day from multiple sources, renders HTML email content, and exposes a Vercel cron route for scheduled execution.

## Key commands

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`
- `npm run brief:run`
- `npm run brief:inspect`

## Important files and directories

- `README.md` - product goals, local development steps, env variables, and architecture summary
- `docs/agent-team/` - reusable sub-agent team playbook, skill matrix, startup workflow, and delivery templates
- `src/app/` - Next.js pages, layouts, and API routes
- `src/app/api/cron/daily-brief/route.ts` - cron endpoint for scheduled brief generation
- `src/jobs/` - standalone job scripts for running and inspecting the daily brief pipeline
- `src/collectors/` - source collection and ingestion logic
- `src/lib/` - pipeline helpers, I/O, env, formatting, and date utilities
- `src/rankers/` - ranking and filtering of candidate items
- `src/renderers/` - HTML/email rendering logic
- `src/summarizers/` - summarization and enrichment logic
- `src/config/` - brief and site configuration
- `src/types/` - TypeScript model definitions
- `artifacts/` - generated brief outputs (`.json` and `.html`)

## How to help

- Prefer focused changes over broad rewrites.
- Keep generated output under `artifacts/`; do not treat `artifacts/` as source code.
- Align changes with the existing brief generation flow and README descriptions.
- Use the built-in scripts for validation: `lint`, `typecheck`, and the brief job scripts.

## Review guidance

- For code changes, run `npm run typecheck` and `npm run lint`.
- For pipeline or job changes, use `npm run brief:run` or `npm run brief:inspect` to validate behavior.
- For UI changes, verify the app works with `npm run dev` and the relevant page rendering.

## Notes

- This project uses TypeScript and Next.js App Router.
- The Vercel cron path is intended for scheduled execution; avoid hardcoding schedule logic outside the cron route.
- Environment variables are documented in `README.md` and loaded from `.env.local` in local development.
- New projects should default to the agent-team workflow under `docs/agent-team/` before implementation starts.

## Reusable project bootstrap

- The repository also contains a reusable agent-team handbook at `docs/agent-team/README.md`.
- New projects should start from the templates under `docs/templates/` before implementation begins.
- Default collaboration model:
  - Orchestrator splits work first
  - Product research and fact verification run in parallel
  - Visual direction follows once goals are clear
  - Engineering architecture follows once the PRD is stable
