# elmah.io AI Plugin

Error monitoring and log management for your production apps, directly from your AI editor.

This plugin connects any MCP-compatible AI editor to the [elmah.io MCP server](https://mcp.elmah.io), giving you and your AI agent direct access to production logs, error details, deployment history, and uptime monitors — without leaving your editor.

## Supported Editors

| Editor | Manifest |
|---|---|
| Cursor | `.cursor-plugin/` |
| Claude Code | `.claude-plugin/` |
| ChatGPT and Codex | `.openai-plugin/` |
| Any MCP-compatible editor | Point at `https://mcp.elmah.io/mcp` |

## Installation

### Cursor

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

### Claude Code

**OAuth (recommended):**

```json
{
  "mcpServers": {
    "elmah.io": {
      "type": "http",
      "url": "https://mcp.elmah.io/mcp",
      "oauth": {
        "clientId": "ai-plugin"
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
      "type": "http",
      "url": "https://mcp.elmah.io/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

### OpenAI (ChatGPT and Codex)

The plugin is packaged for OpenAI's plugin directory from `.openai-plugin/`. It bundles the four skills and the elmah.io MCP server, and signs in with your elmah.io account over OAuth. The `deployment-watchdog` agent is not included, since OpenAI plugins don't support agents.

To build the package, run:

```sh
node scripts/build-openai-zip.mjs
```

This validates the manifest against OpenAI's submission limits and writes `dist/elmah-io-openai-<version>.zip`. GitHub Actions runs the same build on every push and pull request once the skill evals have passed, and attaches the ZIP to the run as an artifact. Upload it in the [OpenAI dashboard](https://platform.openai.com/plugins) to submit or update the plugin. Changes to the manifest or skills go through OpenAI's review. Changes to the MCP server's tools are picked up by OpenAI's daily scan.

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

Once connected, the following elmah.io tools are available to your AI agent.

**Read-only**

- `organizations_list` / `organizations_get_details`: list organizations and get quota/stats
- `logs_list` / `logs_get_details`: list logs and get configuration details
- `messages_list_recent`: fetch recent log messages with filtering
- `messages_list_frequent`: get the most frequently occurring errors
- `messages_get`: fetch a single message with full details (stack trace, custom data, etc.)
- `messages_count`: count messages matching a query
- `deployments_list`: list deployments with timestamps and versions
- `uptime_list` / `uptime_get_details`: list uptime monitors and get incident history
- `heartbeats_list` / `heartbeats_get_details`: list heartbeat monitors and check health
- `recommendations_list` / `recommendations_get_details`: list and read automated suggestions for improving your monitoring setup, security and configuration
- `users_get_current`: get the authenticated user
- `system_get_context`: get system information like current date and time

**Change data**

These tools modify messages in your log. The server tells the agent to call them only when you have explicitly asked, and none of the plugin's skills or agents use them.

- `messages_fix` / `messages_open`: mark a message as fixed, or reopen it
- `messages_hide` / `messages_unhide`: hide a message, or unhide it
- `messages_bot` / `messages_unbot`: mark messages as bot traffic (1-500 per call), or undo it

## Requirements

- An active [elmah.io](https://elmah.io) account
- At least one log configured in elmah.io

## License

Apache 2.0 — see [LICENSE](LICENSE)
