# AGENTS.md

Instructions for coding agents (Codex, Copilot and others) in this repository. `CLAUDE.md` has the full rules; `docs/specs/frontend.md` has the behaviour of every screen and the API contract. Read both before a non-trivial change.

## What this is

A Vue 3 + TypeScript frontend for a chess game. It talks to the Chess API (URL in `.env.example`). Node 20.19+ or 22.12+.

## Commands

- `npm run dev`: development server
- `npm run check`: typecheck, tests with coverage, and build. Run it before reporting a task as done.
- `npm test`, `npm run test:coverage`, `npm run typecheck`
- `npm run format`: Prettier (no semicolons, single quotes, 100 columns)
- `npm run sync:agents` / `npm run check:agents`: regenerate / verify the per-tool skill and agent files

## Rules

- **Language.** Code, identifiers, comments and file names are English. UI text is never hard-coded in components or views: it lives in `src/i18n/messages/` (one file per language: en, pt-BR in `pt-br.ts`, pt, fr, it, de). Add a key to the `Messages` interface and to all six files in the same change. API wire values stay as the API sends them (Portuguese): `tipoJogo`, `lado`, `Branco`, `Rei`, `/propoe`. Their display names are in the `labels` section of the message files. Server messages are shown as received.
- **Structure.** Source files stay under 300 lines. Dependencies point inward: `views/` use `composables/`, `components/`, `api/services/`, `domain/`; `composables/` use `api/services/`, `domain/`, `services/`, `router/`; `components/` use `domain/` only (presentational, no HTTP, no router); `domain/` is pure (no Vue, no HTTP, only `api/types`). `api/services/*` is one file per API area, wraps `http`, returns typed data, never touches the DOM or the router. Views are thin; business rules live in `domain/`.
- **Requests and dialogs.** Use `useRequest` / `useLoader` for requests. Browser dialogs go through `src/services/dialogs.ts`. Route params are validated in `src/router/guards.ts`; views receive typed props. Environment is read only through `src/config/env.ts`.
- **TypeScript.** `strict` and `noUncheckedIndexedAccess`. No `any`; use `unknown` and narrow. Wire types and enums live in `src/api/types/`; type only the fields the frontend reads and say so in a comment.
- **Styling.** Keep the existing look (Bootstrap 5, dark theme, board CSS in `ChessBoard.vue`). Appearance changes need the user's decision and an update to `docs/specs/frontend.md` section 4.
- **Comments.** Explain why, not what. No dead code, commented-out code or unused exports.

## Testing

Every change ships with tests. Tests mirror `src/` (`tests/domain`, `api`, `composables`, `components`, `views`, `router`, `services`, `i18n`; `tests/tooling` checks the skill and agent files). Domain functions are tested as pure functions; services with `http` mocked; composables and views with services and `vue-router` mocked (see `tests/views/*.test.ts`), and `runComposable` from `tests/helpers/run-composable.ts` when lifecycle hooks are needed. Fixtures are in `tests/helpers/fixtures.ts`. Use fake timers for the clock and `await nextTick()` after watcher-driven changes. Coverage thresholds are in `vite.config.ts`; never lower them.

## Workflow

- Work on a branch (default branch `main`). Agents run read-only git commands only (`status`, `diff`, `log`, `show`). The user runs every git command that changes the repository or the remote (`add`, `commit`, `push`, `checkout`, `branch`, `reset`, `stash`, ...): give the user the commands instead. Only an explicit instruction in the current message allows running one, and only that once. See "Git" in `CLAUDE.md`.
- For new features, update `docs/specs/frontend.md` first, then code, then tests.
- Skills (recipes) are in `.agents/skills/`, which Codex and Copilot read directly. Agents are written in `.agents/agents/` and generated into `.codex/agents/` (Codex), `.github/agents/` (Copilot) and `.claude/` (Claude Code). Edit only `.agents/`, then run `npm run sync:agents`.

## Skills

`add-api-call`, `add-screen`, `add-translation`, `add-socket-event`, `sync-docs`, `pwa-check`, `verify`, `manage-agent-files`. Agents: `code-reviewer`, `i18n-reviewer`, `review-api-contract`, `test-writer`.
