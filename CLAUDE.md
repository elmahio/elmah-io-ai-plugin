# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Versioning

The plugin version lives in two places that must always match:

- `.claude-plugin/plugin.json`
- `.cursor-plugin/plugin.json`

Every release also needs a dated entry at the top of `CHANGELOG.md`.

Do not bump the version automatically, and do not bump it as part of an
ordinary change. The owner often makes several commits before cutting a
release. Instead, after finishing a change that affects users (skills, the
agent, MCP config, manifests, guardrails), ask whether this should be a new
version. If yes, ask which bump it is (patch, minor or major), then update both
manifests and add the changelog entry in the same commit. Changes that only
touch `tests/`, CI or docs usually don't need a release, but mention it if
unsure.

Marketplace installs only update when the version changes, so a user-facing fix
that ships without a bump may never reach installed copies.

## Commits and pushes

Always ask before committing or pushing, even after being told to go ahead with
a task.

## Tests

`claude plugin validate .` checks the manifests. The evals run every skill and
the agent against a mock MCP server (see `tests/README.md`) and use real API
credit in CI, so don't re-run them needlessly.
