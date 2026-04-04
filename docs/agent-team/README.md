# Agent Team Handbook

这套 `Agent Team` 是新项目启动前的默认工作班底，目标是把前期的产品定义、资料验证、视觉探索和工程方案拆开并行推进，再由主负责人统一收敛。

## 团队结构

### 1. 主负责人 / Orchestrator
- 职责：拆题、分工、整合结论、保持方向一致、收敛最终决策。
- 默认动作：先看项目背景，再决定并行拉起哪些子 agent。
- 产出：任务拆解、决策记录、汇总结论、统一行动项。

### 2. 产品研究 Agent
- 职责：PRD、目标用户、使用场景、竞品、信息架构、需求边界。
- 产出：`项目定义 / PRD`、用户问题、功能优先级、竞品结论。
- 适合在：项目刚启动、问题定义不稳、需求边界模糊时优先介入。

### 3. 资料验证 Agent
- 职责：官方文档、一手资料、规范、政策、API/平台事实核验。
- 产出：事实结论、可靠来源链接、限制条件、术语边界。
- 适合在：需要核实平台能力、行业规则、技术事实时介入。

### 4. 视觉体验 Agent
- 职责：设计参考、版式方向、视觉语言、页面结构、原型建议。
- 产出：设计策略、视觉方向、原型结构、设计规范建议。
- 适合在：目标用户和核心场景已经明确后介入，避免空心视觉。

### 5. 工程架构 Agent
- 职责：项目骨架、技术选型、目录规划、接口与数据流、部署方案。
- 产出：工程方案、模块边界、目录结构、实施拆解。
- 适合在：PRD 稳定后介入，避免过早锁死技术方案。

## 默认协作流程

1. 主负责人读取项目背景，输出第一版问题拆分。
2. 并行拉起：
   - 产品研究 Agent
   - 资料验证 Agent
   - 视觉体验 Agent
3. 主负责人汇总为 `PRD 草案`。
4. 工程架构 Agent 基于 PRD 输出实施路线。
5. 进入执行前，再按项目需要增加临时 agent，例如：
   - 数据/爬虫 agent
   - QA / 测试 agent
   - 内容编辑 agent

## 长期默认沉淀

每个新项目至少保留四份文档：

- `docs/agent-team/templates/prd-template.md`
- `docs/agent-team/templates/research-template.md`
- `docs/agent-team/templates/design-template.md`
- `docs/agent-team/templates/architecture-template.md`

推荐配套阅读：

- `docs/agent-team/roles/overview.md`
- `docs/agent-team/runtime-roster.md`
- `docs/agent-team/startup-workflow.md`
- `docs/agent-team/skills-matrix.md`
- `docs/agent-team/launch-prompts.md`

## 当前默认技能包

### 已有能力
- `openai-docs`
- `imagegen`
- `agent-tools`
- `skill-installer`
- `plugin-creator`
- `skill-creator`

### 本次补装
- `doc`
- `frontend-skill`
- `playwright`
- `screenshot`

## 使用原则

- 不让多个 agent 直接各自给最终答案，统一由主负责人收口。
- 先定问题，再定视觉，再定工程，不反过来。
- 对事实和规范类问题，优先交给资料验证 Agent。
- 对页面结构和视觉风格类问题，优先交给视觉体验 Agent。
- 对实现路径和模块边界类问题，优先交给工程架构 Agent。
