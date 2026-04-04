# Runtime Roster

## 默认编制

- `主负责人 / Orchestrator`
- `产品研究 Agent`
- `资料验证 Agent`
- `视觉体验 Agent`
- `工程架构 Agent`

## 使用方式

- 当前主会话默认充当 `主负责人`
- 每次新项目启动时，从 [launch-prompts.md](./launch-prompts.md) 复制对应角色提示词拉起 4 个子 agent
- 如果项目进入实现阶段，再按需补充临时角色：
  - 数据 / 爬虫 Agent
  - 测试 / QA Agent
  - 内容编辑 Agent

## 交接规则

- 所有子 agent 只向主负责人回交结构化结论
- 主负责人负责统一口径、筛掉冲突结论、生成最终版本
- 不允许多个子 agent 直接分别给出最终方案
