# elmah.io AI Plugin

Error monitoring and log management for your production apps, directly from your AI editor.

This plugin connects any MCP-compatible AI editor to the [elmah.io MCP server](https://mcp.elmah.io), giving you and your AI agent direct access to production logs, error details, deployment history, and uptime monitors — without leaving your editor.

## Supported Editors

| Editor | Manifest |
|---|---|
| Cursor | `.cursor-plugin/` |
| Claude Code | `.claude-plugin/` |
| Any MCP-compatible editor | Point at `https://mcp.elmah.io/mcp` |

## Installation

**OAuth (recommended):**

```json
{
  "mcpServers": {
    "elmah.io": {
      "url": "https://mcp.elmah.io/mcp",
      "auth": {
        "CLIENT_ID": "ai-plugin"
      }
    }
  }
}
```

On first use, your editor will prompt you to sign in with your elmah.io account. Access tokens expire after 30 days; re-authenticate if you see auth errors.

**API key:**

```json
{
  "mcpServers": {
    "elmah.io": {
      "url": "https://mcp.elmah.io/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

## Skills

| Skill | Description |
|---|---|
| `debug-production-error` | Investigate a specific error by ID, message, or stack trace |
| `post-deployment-check` | Verify production health after shipping code |
| `investigate-frequent-errors` | Find and prioritize your highest-impact errors |
| `check-uptime-status` | Check monitor status and investigate downtime events |

### Usage examples

```
Debug this production error: NullReferenceException in OrderService
```

```
Run a post-deployment check after my latest deploy
```

```
What are the most frequent errors in my production log this week?
```

```
Is my site up? Check uptime status
```

## Agents

**`deployment-watchdog`** — A background agent that monitors for regressions for 30 minutes after a deployment. Alerts immediately on fatal errors or downtime; otherwise reports back with a final HEALTHY / UNHEALTHY verdict.

```
Start the deployment watchdog for version 2.4.1
```

## MCP Tools Available

Once connected, the following elmah.io tools are available to your AI agent:

- `organizations_list` / `organizations_get_details` — list organizations and get quota/stats
- `logs_list` / `logs_get_details` — list logs and get configuration details
- `messages_list_recent` — fetch recent log messages with filtering
- `messages_list_frequent` — get the most frequently occurring errors
- `messages_get` — fetch a single message with full details (stack trace, custom data, etc.)
- `messages_count` — count messages matching a query
- `deployments_list` — list deployments with timestamps and versions
- `uptime_list` / `uptime_get_details` — list uptime monitors and get incident history
- `heartbeats_list` / `heartbeats_get_details` — list heartbeat monitors and check health
- `users_get_current` — get the authenticated user
- `system_get_context` — get system information like current date and time

## Requirements

- An active [elmah.io](https://elmah.io) account
- At least one log configured in elmah.io

## License

Apache 2.0 — see [LICENSE](LICENSE)
