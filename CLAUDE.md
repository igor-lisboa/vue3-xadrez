# CLAUDE.md

Guidance for Claude Code (and developers) working in this repository.

## What this is

A Vue 3 + TypeScript frontend for a chess game. It talks to the Chess API (see `.env.example` for the URL and `docs/specs/frontend.md` for the contract and the behaviour of every screen).

## Commands

- `npm run dev`: development server
- `npm run check`: typecheck, tests with coverage, and build. **Run this before reporting a task as done.**
- `npm test`, `npm run test:watch`, `npm run test:coverage`
- `npm run format`: Prettier

Node 20.19+ or 22.12+ is required.

## Conventions

### Language
- All code, identifiers, comments and file names are in **English**.
- UI text is never hard-coded in components or views. It lives in one message file per language under `src/i18n/messages/` (en, pt-BR, pt, fr, it, de). Each file implements the `Messages` interface, so a missing key fails the type check. Views read texts with `useLocale()`; components receive them as props. Add a key to every language file in the same change.
- Wire values from the API stay as the API sends them (Portuguese): query and body keys such as `tipoJogo`, `tempoDeTurnoEmMilisegundos`, `resposta`, the header `lado`, the enums `Branco`, `Rei`, `responderPropostaEmpate`, and the URL segments such as `/propoe` and `/responde`. Their translations for display are in the `labels` section of each message file.
- Server messages (`message` in the envelope) are shown as received.

### Structure (keep these rules)
- Source files stay **under 300 lines**. Split a file before it grows past that.
- Dependencies point inward:
  - `views/` → `composables/`, `components/`, `api/services/`, `domain/`
  - `composables/` → `api/services/`, `domain/`, `services/`, `router/`, `i18n/`, `config/`
  - `components/` → `domain/` (presentational; no HTTP, no router)
  - `domain/` → nothing app-specific except `api/types` (pure, no Vue, no HTTP)
- `api/services/*` is one file per API area. It wraps `http` and returns typed data. It never touches the DOM or the router.
- Views are thin: they compose composables and components. Business rules belong in `domain/`.
- Use the `useRequest` / `useLoader` composables for requests. They show errors consistently.
- Browser dialogs go through `src/services/dialogs.ts`, never `window.alert` directly.
- Route params are validated in `src/router/guards.ts` before a view mounts; views receive typed props.

### TypeScript
- `strict` and `noUncheckedIndexedAccess` are on. Do not use `any`; use `unknown` and narrow.
- Enums and wire types live in `src/api/types/`. Only type the fields the frontend reads, and say so in a comment when a type is partial.
- Prefer union types and template literal types (see `SquareName`, `SimplifiedCell`).

### Styling
- Keep the existing look (Bootstrap 5 classes, dark theme, the board CSS in `ChessBoard.vue`). Appearance changes need the user's decision, and must update `docs/specs/frontend.md` section 4.
- Board classes are English (`house-white`, `house-move`, `active-side-border`, ...). Keep `boardHouseClasses` in sync with the styles.

### Comments
- Comment the **why**, not the what. Domain functions get a short doc comment.
- Do not leave dead code, commented-out code or unused exports.

## Testing

- Every change ships with tests. Tests mirror `src/`: `tests/domain`, `tests/api`, `tests/composables`, `tests/components`, `tests/views`, `tests/router`, `tests/services`, `tests/i18n`, `tests/styles` (global CSS and `index.html`). `tests/tooling` checks the skill and agent files.
- Domain functions are tested as pure functions. Services are tested with `http` mocked. Composables and views are tested with services and `vue-router` mocked (see `tests/views/*.test.ts` for the pattern) and with `runComposable` (`tests/helpers/run-composable.ts`) when lifecycle hooks are needed.
- Watchers flush asynchronously: `await nextTick()` before asserting on state that a watcher updates.
- Use fake timers for the clock (`vi.useFakeTimers()`).
- Coverage thresholds are in `vite.config.ts`. Do not lower them to make a change pass.
- Shared fixtures are in `tests/helpers/fixtures.ts`.

## Architecture notes

- **Screen rules** are decided by `resolveGameScreen` (`src/domain/game-screen.ts`). The priority order is documented there and tested. Change the order only with a spec update.
- **Board** is built from the summary in `createBoardHouses`. The board is oriented for Black by reversing both the squares and the cells (`orientForSide`).
- **Game review** is its own screen (`/game/:id/review`, `GameReviewView`), open to anyone with the room number; End game and Home link to it. `useGameReplay` loads `GET /jogos/{id}` and `buildReplay` (`src/domain/replay.ts`) rebuilds every position from the move lists, because the API keeps no snapshots. A replay that does not end on the API's final board is discarded and only the final position is shown. Shared fixtures for it are in `tests/helpers/history.ts`.
- **The API decides every ending** (FIDE rules): the frontend reads `finalizado`, `ladoIdVencedor` (the winner, never worked out from the label) and `empateReivindicavel`, and keeps no copy of any draw, repetition or material rule.
- **Material draw** details come from `explainMaterialDraw` (`src/domain/material.ts`). It handles two draws: "Empate: Insuficiência material" and "Empate: Tempo esgotado sem material" (the side on the move ran out). It reads the cause from the ending and lists the pieces left; it does not judge whether they can mate.
- **Draws** are in `src/domain/draw.ts` and `useDrawActions`. An open draw offer never blocks the board: it is answered on the Game screen (`DrawOfferPanel`), and a move by the receiver declines it. **Claim draw** replaces **Offer draw** when `empateReivindicavel` is true on the player's turn; both call `PUT /empate/propoe` with no body. The "claim with my next move" switch routes the next board move through `proposeDraw` with `{ origem, destino }` (via the `playMove` option of `useChessBoard`). Only a reset offer has the Answer proposal screen.
- **Board selection** is in `useChessBoard`: first click selects and fetches moves, a click on a highlighted square plays the move, then the game is reloaded.
- **Clock** runs in the browser in `useTurnClock`; the server stays the source of truth. When a side reaches zero, the game is reloaded.
- **Socket** (`useGameSocket`) maps game events to handlers by semantic name. The wire names are in `src/api/socket-events.ts`.
- **Environment** is read only through `src/config/env.ts`.
- **Language** is chosen in the header and kept by `src/services/locale.ts` (localStorage key `chess.locale`). `src/i18n/` has no Vue imports; the language itself is reactive only in the service and `useLocale`.

## Things to know

- The deployed API is behind Vercel deployment protection, so browser calls get a login redirect until it is disabled. Keep this in mind when debugging "network" failures.
- The API has no OpenAPI entry for socket events; they are documented in the spec and in `socket-events.ts`.
- URLs changed in the refactor (English paths). Bookmarks to the old Portuguese paths do not work.

## Git

AI agents (Claude Code, Codex, Copilot and their subagents) run **read-only** git commands only. Commands that change the repository or the remote are run by the user, a real person.

- Allowed: `git status`, `diff`, `log`, `show`, `blame`, `ls-files`, `rev-parse`, `branch --list`, `remote -v`, and other commands that only read.
- Not allowed: `git add`, `commit`, `push`, `pull`, `fetch`, `checkout`, `switch`, `branch` (create, rename, delete), `merge`, `rebase`, `reset`, `restore`, `revert`, `stash`, `tag`, `cherry-pick`, `mv`, `rm`, `clean`, `config`, and anything else that changes the index, the working tree through git, refs, history, the config or the remote.
- When the work needs one of these, give the user the exact commands to run (for example the branch to create, the files to stage and the commit message) and stop there.
- The only exception: the user explicitly tells the agent, in the current message, to run that command. The permission covers that one time; it does not carry over to later tasks. A request such as "give me a commit" or "give me a commit title" asks for the text, not for the command to be run.

## Workflow

- Work on a branch. The default branch is `main`. The user creates the branch, commits and pushes (see Git below).
- For new features, update `docs/specs/frontend.md` first, then code, then tests.
- Use the skills (common recipes) and the agents (review, tests) of the project. They are shared by Claude Code, Codex and Copilot: edit only the canonical files in `.agents/skills/` and `.agents/agents/`, then run `npm run sync:agents` to regenerate `.claude/`, `.github/agents/` and `.codex/agents/` (`npm run check:agents` verifies them; see the `manage-agent-files` skill).
