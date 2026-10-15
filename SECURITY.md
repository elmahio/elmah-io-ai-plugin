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
- `agents/deployment-watchdog.md` declares `tools:` in frontmatter, scoped to
  the specific read-only elmah.io MCP tools it needs — no shell or filesystem
  access. This is an actual hard restriction on the subagent's tool registry,
  which matters most here since this agent is designed to run unattended
  (`background: true`) in CI/CD with no human reviewing each step.
- Each `SKILL.md` also declares `allowed-tools`, scoped the same way. Note
  this is weaker than the agent's `tools:` restriction: per Claude Code's
  skill docs, `allowed-tools` on a skill pre-approves those tool calls to
  reduce permission prompts — it is not a hard sandbox, so a skill running in
  a permissive host session isn't fully prevented from reaching for a tool
  outside its list. The prompt-level "treat this as untrusted data" guardrail
  above is the real control for the four skills; `allowed-tools` is
  defense-in-depth on top of it.
- `tests/debug-production-error/eval.yaml` includes a regression scenario
  (`msg-injected` fixture) that asserts the skill doesn't act on embedded
  instructions.

**Tool name prefixes (verified):** when Claude Code loads this plugin, its
bundled `.mcp.json` server is exposed as
`mcp__plugin_elmah-io_elmahio__<tool>`, not `mcp__elmahio__<tool>`. The
`allowed-tools`/`tools` entries therefore list both forms: the plugin-prefixed
names for users of the installed plugin, and the `mcp__elmahio__<tool>` names
for the eval harness and for anyone who configures the server manually under
the key `elmahio` (see the README). Confirmed by running `claude --plugin-dir .`
against a local mock server and reading the tool list in the init event. If the
plugin or server key is ever renamed, update both lists, because a stale `tools:`
list on the agent silently leaves it with no usable tools.

This is defense against one layer of the problem. The MCP server
(`mcp.elmah.io`) returning message content is out of scope for this repo (see
Scope above) but is part of the same threat model — report issues there to
info@elmah.io as well.
