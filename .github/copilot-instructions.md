# Copilot instructions

Vue 3 + TypeScript chess frontend. The rules are in `AGENTS.md` (summary) and `CLAUDE.md` (full); screen behaviour and the API contract are in `docs/specs/frontend.md`.

- Run `npm run check` (typecheck, tests with coverage, build) before saying a task is done.
- Code, comments and file names are English. UI text lives only in `src/i18n/messages/` (six languages, same keys in every file). API wire values stay in Portuguese as the API sends them.
- Layers point inward: views, then composables and components, then `api/services` and `domain`. `domain/` is pure. Components have no HTTP or router. Files stay under 300 lines.
- TypeScript is strict: no `any`.
- Every change ships with tests under `tests/`, mirroring `src/`. Do not lower the coverage thresholds in `vite.config.ts`.
- Do not change the look (Bootstrap 5, dark theme) without the user's decision.
- Run read-only git commands only (`status`, `diff`, `log`, `show`). The user runs every git command that changes the repository or the remote (`add`, `commit`, `push`, `checkout`, `branch`, `reset`, `stash`, ...); give the user the commands instead. See "Git" in `CLAUDE.md`.
- Skills are in `.agents/skills/` and agents in `.github/agents/`. Both are generated: edit the files in `.agents/` and run `npm run sync:agents`.
