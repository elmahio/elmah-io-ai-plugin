# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Versioning

The plugin version lives in three places that must always match:

- `plugins/elmah-io/.claude-plugin/plugin.json`
- `plugins/elmah-io/.cursor-plugin/plugin.json`
- `.openai-plugin/plugin.json`

`scripts/build-openai-zip.mjs` fails if they differ. It builds the OpenAI
submission ZIP into `dist/` (run by the `openai-package` workflow). The ZIP is
uploaded manually in the OpenAI dashboard; there is no upload API.

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

## Layout

The plugin lives in `plugins/elmah-io/` so the Claude plugin directory can be
submitted that folder alone. It refuses scripts and package files from
organizations that aren't Verified, and `tests/` and `scripts/` have both. Keep
those, `.github/` and `.openai-plugin/` outside the folder, and don't add
`.mjs`, `.sh` or package manager files inside it. Cursor manifest paths can't
use `..`, so each editor's manifest stays next to the skills. The root
`.claude-plugin/marketplace.json` and `.cursor-plugin/marketplace.json` point
at the folder.

## Commits and pushes

Always ask before committing or pushing, even after being told to go ahead with
a task.

## Tests

`claude plugin validate .` checks the manifests. The evals run every skill and
the agent against a mock MCP server (see `tests/README.md`) and use real API
credit in CI, so don't re-run them needlessly.
