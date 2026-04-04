# TrendRadar MCP 本地接入

这份说明记录当前工作区里 `TrendRadar` 的本地最小可用接入方式。

## 1. 安装位置

- 项目目录：`/Users/jiem/Documents/intelly-daily-brief/tools/TrendRadar`
- 依赖已通过 `uv sync` 完成安装

## 2. 启动方式

推荐直接使用 `STDIO`，不需要单独启动 HTTP 服务。

命令：

```bash
uv --directory "/Users/jiem/Documents/intelly-daily-brief/tools/TrendRadar" run python -m mcp_server.server
```

## 3. 通用 MCP 配置

```json
{
  "trendradar": {
    "command": "uv",
    "args": [
      "--directory",
      "/Users/jiem/Documents/intelly-daily-brief/tools/TrendRadar",
      "run",
      "python",
      "-m",
      "mcp_server.server"
    ],
    "type": "stdio"
  }
}
```

## 4. 说明

- `TrendRadar` 不是 Codex skill，而是独立 Python 项目
- MCP 入口定义在项目脚本 `trendradar-mcp`
- 如果客户端支持自定义 MCP Server，优先使用上面的 `uv --directory ...` 形式，路径最明确
