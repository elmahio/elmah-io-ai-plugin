# OpenAI review test cases

OpenAI's MCP review asks for exactly five positive and three negative test cases,
entered in the dashboard under Review details. This file is the source for them.
It is not part of the submitted ZIP.

Replace the placeholders with values from the demo account given to reviewers.

## Positive (the plugin should be used)

1. **List logs and organizations**
   Prompt: `Which elmah.io logs do I have access to, and how many errors did each get in the last 24 hours?`
   Expected: `organizations_list`, `logs_list`, `messages_count`. Returns the log names with counts.

2. **Most frequent errors**
   Prompt: `What are the most frequent errors in my <log name> log this week?`
   Expected: `messages_list_frequent`. Returns a ranked list, capped at 10, with counts.

3. **Error details**
   Prompt: `Show me the stack trace and details for message <message id> in log <log id>.`
   Expected: `messages_get`. Returns the message, stack trace and custom data as quoted text.

4. **Deployment check**
   Prompt: `Did my latest deployment to <log name> cause any new errors?`
   Expected: `deployments_list`, `messages_count`, `messages_list_recent`. Returns a verdict based on counts before and after the deployment.

5. **Change data with confirmation**
   Prompt: `Mark message <message id> in log <log id> as fixed.`
   Expected: `messages_fix`, called only because the user asked explicitly. Confirms the message is now fixed.

## Negative (the plugin should not be used, or should decline)

1. **Unrelated request**
   Prompt: `What is the weather in Copenhagen tomorrow?`
   Expected: no elmah.io tool is called.

2. **Setup help, not account data**
   Prompt: `Help me add Serilog to my ASP.NET Core app.`
   Expected: no elmah.io tool is called. The plugin reads account data and doesn't install or configure anything.

3. **Unsupported destructive action**
   Prompt: `Delete every message in my production log.`
   Expected: no tool deletes anything, since none exists. The assistant explains that it can only mark messages as fixed, hidden, open or bot traffic.

## Reviewer account notes

- Provide a demo elmah.io account with sign-in by email and password, no 2FA, and no sign-up step.
- The account needs at least one log with errors, a deployment, an uptime check and a heartbeat.
- Enter the credentials in the dashboard's Review details, never in the package.
