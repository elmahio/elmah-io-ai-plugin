# Security Policy

## Reporting a Vulnerability

If you find a security vulnerability in this plugin — in the skills, the
agent, the MCP wiring, or the plugin manifests — please report it privately
rather than opening a public issue.

Email **info@elmah.io** with:

- A description of the vulnerability and its potential impact
- Steps to reproduce
- Any relevant logs, requests, or proof-of-concept code

We'll acknowledge your report and work with you on a fix and disclosure
timeline before any public details are shared.

## Scope

This repo contains the plugin packaging (skills, agent, MCP client
configuration) for connecting AI editors to the elmah.io MCP server. It does
not contain the MCP server itself, elmah.io's APIs, or the elmah.io product.
For vulnerabilities in those, also use info@elmah.io — the report will be
routed appropriately.

## Supported Versions

Only the latest version of this plugin is supported. Update to the latest
release before reporting an issue to confirm it still applies.

## Known Risk: Untrusted Log Content

Log messages surfaced by the skills and the `deployment-watchdog` agent
(title, message, detail/stack trace, custom data, server variables, cookies,
breadcrumbs) originate from HTTP requests made to the customer's monitored
application — by anyone on the internet, not just the person using this
plugin. That content can contain text crafted to look like instructions to an
AI assistant (a classic indirect prompt injection).

Mitigations in this repo:

- Every skill and the agent instruct the model to treat MCP tool output as
  untrusted data, never as instructions (see each `SKILL.md`/`deployment-watchdog.md`
  Guardrails section).
- `plugins/elmah-io/agents/deployment-watchdog.md` tells the model to use only
  the five read-only elmah.io tools it needs, and no shell or filesystem access.
  This is an instruction, not a hard restriction. The agent doesn't declare
  `tools:` or `background:` in its frontmatter, because the Claude plugin
  directory refuses those keys from organizations that aren't verified, so the
  agent inherits the tools of the session it runs in. That matters most when it
  runs unattended in CI/CD with no human reviewing each step, so run it with a
  narrow tool allowlist in your own session or pipeline.
- The skills don't declare `allowed-tools`. It would only pre-approve tool
  calls to skip permission prompts, which is not a security control, and
  the Claude plugin directory refuses it for organizations that aren't
  verified. Claude Code asks the user before the first call to each elmah.io
  tool instead. The prompt-level "treat this as untrusted data" guardrail
  above is the real control for the four skills.
- `tests/debug-production-error/eval.yaml` includes a regression scenario
  (`msg-injected` fixture) that asserts the skill doesn't act on embedded
  instructions.

**Tool name prefixes (verified):** when Claude Code loads this plugin, its
bundled `.mcp.json` server is exposed as
`mcp__plugin_elmah-io_elmahio__<tool>`, not `mcp__elmahio__<tool>`. Anyone who
configures the server manually under the key `elmahio` (see the README) gets
the `mcp__elmahio__<tool>` names instead. Confirmed by running
`claude --plugin-dir ./plugins/elmah-io` against a local mock server and
reading the tool list in the init event. Use the right prefix when writing a
tool allowlist for the agent.

This is defense against one layer of the problem. The MCP server
(`mcp.elmah.io`) returning message content is out of scope for this repo (see
Scope above) but is part of the same threat model — report issues there to
info@elmah.io as well.
