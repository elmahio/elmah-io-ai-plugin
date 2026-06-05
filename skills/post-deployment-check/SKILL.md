---
name: post-deployment-check
description: Check for new or increased errors after a deployment. Use when the user just shipped code and wants to confirm nothing broke in production.
---

# Post-Deployment Check

## When To Use

- The user just deployed and says "check if anything broke"
- The user asks "any new errors since my deploy?"
- A deployment was recorded and the user wants a health snapshot
- Part of a CI/CD post-deploy verification step

## Workflow

1. **Get context** — call `system_get_context` then `logs_list` to identify the target log. If the user hasn't specified a log, use the first available one or ask.

2. **Find the deployment** — call `deployments_list` to get recent deployments. Identify the most recent one (or the one the user describes). Note its timestamp.

3. **Get pre-deployment baseline** — call `messages_count` for the period immediately before the deployment (e.g., 1 hour prior). Also call `messages_list_frequent` for the pre-deployment window if available.

4. **Get post-deployment errors** — call `messages_list_recent` filtered to errors after the deployment timestamp. Look for:
   - New error types not seen before the deployment
   - Existing errors with a sharp increase in count
   - Fatal or error severity messages in the first 15 minutes post-deploy

5. **Check uptime** — call `uptime_list` and `uptime_get_details` for any monitors in a down state.

6. **Report findings**:
   - Deployment details (version, timestamp, deployer if available)
   - Error rate before vs. after (count per hour)
   - List of new errors with count, severity, and first occurrence
   - List of errors with significant count increase (>2×)
   - Uptime monitor status
   - Overall verdict: HEALTHY / UNHEALTHY

## Output Shape

```
Deployment: <version> at <timestamp>

Error rate: <n>/hr before → <m>/hr after  (<+/- delta>%)

New errors after deploy:
  [ERROR] <type>: <message> — first seen <timestamp>, <n> occurrences
  ...

Uptime: <monitor name> — <status>

Verdict: HEALTHY | UNHEALTHY
<one-line summary>
```

## Guardrails

- If no deployments are found, tell the user and offer to check recent errors from the last hour instead.
- Do not mark as CRITICAL unless there are fatal errors or a downtime event.
