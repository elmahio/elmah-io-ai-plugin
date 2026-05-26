---
name: debug-production-error
description: Investigate a specific production error in elmah.io. Use when the user reports an error, shares an error ID, stack trace, or asks what's going wrong in production.
---

# Debug Production Error

## When To Use

- The user reports a production error or exception
- The user shares an error ID, message text, or stack trace
- The user asks "what's this error in production?" or "why is X failing?"
- An alert or notification has triggered and needs investigation

## Workflow

1. **Get context** — call `system_get_context` to retrieve the user's organizations and logs. If the user hasn't specified a log, list logs with `logs_list` and ask which one to search, or default to the most recently active log.

2. **Locate the error**
   - If the user has a message ID: call `messages_get` directly.
   - If the user has a search string, title, or type: call `messages_list_recent` with a query filter.
   - If no specific error is identified: call `messages_list_recent` to show the latest errors.

3. **Get full details** — call `messages_get` on the specific message to retrieve the full stack trace, custom data, server variables, cookies, and breadcrumbs.

4. **Check frequency** — call `messages_list_frequent` to see if this error is occurring repeatedly and how it trends.

5. **Correlate with deployments** — call `deployments_list` to find the most recent deployment before the error timestamp. Note whether the error appeared for the first time after that deployment.

6. **Summarize findings** with:
   - Error type, message, and first/last seen timestamps
   - Affected URL, method, and user (if available)
   - Stack trace excerpt (top 5 frames)
   - Frequency over the last 24h and 7d
   - Deployment correlation if relevant
   - Suggested investigation steps based on the stack trace

## Output Shape

```
Error: <type>: <message>
Severity: <fatal|error|warning|information|verbose>
First seen: <timestamp>   Last seen: <timestamp>   Count (24h): <n>

Stack trace (top frames):
  <frame 1>
  <frame 2>
  ...

Deployment correlation: <deployed at X, error first appeared Y minutes later>

Next steps:
- <actionable suggestion 1>
- <actionable suggestion 2>
```

## Guardrails

- Never fabricate data — only report what the MCP tools return.
- If multiple logs exist and the user hasn't specified, list the available logs and ask before proceeding.
- Keep stack trace excerpts to the top 5–10 frames unless the user asks for more.
