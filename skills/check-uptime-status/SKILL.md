---
name: check-uptime-status
description: Check the status of uptime monitors in elmah.io. Use when the user wants to know if their services are up, or investigate a downtime event.
---

# Check Uptime Status

## When To Use

- The user asks "is my site up?" or "what's the uptime status?"
- An alert has fired about a service being down
- The user wants to investigate a recent downtime incident
- The user wants to see response times or SLA compliance

## Workflow

1. **Get context** — call `system_get_context` then `organizations_list` and `logs_list` to identify the relevant workspace.

2. **List all monitors** — call `uptime_list` to get all configured uptime monitors and their current status.

3. **Identify issues** — for any monitor that is `down` or `degraded`:
   - Call `uptime_get_details` to get the full incident history, response times, and downtime duration.

4. **Correlate errors** — if a monitor is down or recently recovered, call `messages_list_recent` filtered to the downtime window to find related error messages that might explain the outage.

5. **Report status**:
   - Overall health summary (all up / partial outage / major outage)
   - Per-monitor status with response time if available
   - Incident details for any down/degraded monitors (start time, duration, affected URLs)
   - Related errors from the log during the downtime window
   - Recovery status (is it back up? when?)

## Output Shape

```
Uptime Status — <timestamp>

Overall: ALL UP | PARTIAL OUTAGE | MAJOR OUTAGE

Monitors:
  ✓ <name> (<url>) — UP, <avg response time>ms
  ✗ <name> (<url>) — DOWN since <timestamp> (<duration>)
    Incident: <description if available>
    Related errors: <n> errors logged during downtime

<If incidents found>:
Incident Timeline:
  <timestamp> — <status change>
  <timestamp> — <status change>
```

## Guardrails

- If no uptime monitors are configured, tell the user and suggest setting them up at https://elmah.io.
- Do not speculate on the cause of downtime — only report what the monitors and error logs show.
- If all monitors are healthy, keep the report brief: just confirm the all-up status and response times.
