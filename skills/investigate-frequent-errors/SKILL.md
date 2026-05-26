---
name: investigate-frequent-errors
description: Analyze the most common errors in a log to find the highest-impact issues to fix. Use when the user wants to understand their error landscape or prioritize what to fix next.
---

# Investigate Frequent Errors

## When To Use

- The user asks "what are our most common errors?"
- The user wants to know what to fix to reduce noise/alert fatigue
- A periodic error review or sprint planning session
- The user asks "what's causing the most errors in production?"

## Workflow

1. **Get context** — call `system_get_context` then `logs_list`. If the user hasn't specified a log, present the list and ask, or default to the one with the highest message count.

2. **Get frequent errors** — call `messages_list_frequent` to retrieve the top error groups by occurrence count. This is the primary data source for this skill.

3. **Get recent context** — call `messages_list_recent` to see the latest activity and confirm which frequent errors are still active (not just historical noise).

4. **Get details on top offenders** — for the top 3–5 most frequent error groups, call `messages_get` on a representative message to get full stack trace and context.

5. **Correlate with deployments** — call `deployments_list` to note if the top errors started or spiked around a specific deployment.

6. **Prioritize and present** errors using this scoring:
   - **P1**: Fatal severity, or any error appearing >100 times in 24h
   - **P2**: Error severity appearing >20 times in 24h, or any error with a recent spike
   - **P3**: Warning severity or low-frequency errors

7. **Suggest fixes** based on the error type and stack trace:
   - Null reference / unhandled exceptions → add null checks or guard clauses
   - Database errors → connection pool, query timeout, missing index
   - HTTP 4xx/5xx client errors → input validation, authentication, upstream dependency
   - Unhandled promise rejections → add `.catch()` or try/catch

## Output Shape

```
Top errors in <log name> (last 7 days):

P1 — <n> occurrences
  [FATAL] <type>: <message>
  First seen: <date>   Last seen: <date>
  Stack: <top frame>
  Suggested fix: <one-line suggestion>

P2 — <n> occurrences
  [ERROR] <type>: <message>
  ...

Summary: <total unique error types>, <total occurrences>, <most affected area>
Recommended first fix: <highest-impact item>
```

## Guardrails

- Cap the list at 10 errors unless the user asks for more.
- Do not invent fixes — only suggest based on the actual error type and stack trace.
- If `messages_list_frequent` returns no data, fall back to `messages_list_recent` and group manually by title.
