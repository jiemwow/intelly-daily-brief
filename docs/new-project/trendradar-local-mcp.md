# TrendRadar 本地 MCP 接入

`TrendRadar` 已安装在：

- `tools/TrendRadar`

## 1. 本地启动方式

在项目根目录运行：

```bash
cd tools/TrendRadar
uv run python -m mcp_server.server
```

如果需要 HTTP 模式：

```bash
cd tools/TrendRadar
uv run python -m mcp_server.server --transport http --port 3333
```

## 2. STDIO 配置示例

适合大多数支持 MCP 的客户端：

```json
{
  "mcpServers": {
    "trendradar": {
      "command": "uv",
      "args": [
        "--directory",
        "/Users/jiem/Documents/intelly-daily-brief/tools/TrendRadar",
        "run",
        "python",
        "-m",
        "mcp_server.server"
      ]
    }
  }
}
```

## 3. 说明

- 当前本机 `uv` 路径可用
- `trendradar-mcp --help` 会直接拉起服务，因此建议直接使用上面的 `uv run python -m mcp_server.server`
- 如果客户端连不上，优先检查：
  - `which uv`
  - 目录路径是否正确
  - 端口 `3333` 是否被占用（HTTP 模式）
