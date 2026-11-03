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
- All code, identifiers, comments, file names and UI text are in **English**.
- Wire values from the API stay as the API sends them (Portuguese): query and body keys such as `tipoJogo`, `tempoDeTurnoEmMilisegundos`, `resposta`, the header `lado`, the enums `Branco`, `Rei`, `responderPropostaEmpate`, and the URL segments such as `/propoe` and `/responde`. Map them to English labels in `src/domain/labels.ts`.
- Server messages (`message` in the envelope) are shown as received.

### Structure (keep these rules)
- Source files stay **under 300 lines**. Split a file before it grows past that.
- Dependencies point inward:
  - `views/` → `composables/`, `components/`, `api/services/`, `domain/`
  - `composables/` → `api/services/`, `domain/`, `services/`, `router/`
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

- Every change ships with tests. Tests mirror `src/`: `tests/domain`, `tests/api`, `tests/composables`, `tests/components`, `tests/views`, `tests/router`, `tests/services`.
- Domain functions are tested as pure functions. Services are tested with `http` mocked. Composables and views are tested with services and `vue-router` mocked (see `tests/views/*.test.ts` for the pattern) and with `runComposable` (`tests/helpers/run-composable.ts`) when lifecycle hooks are needed.
- Watchers flush asynchronously: `await nextTick()` before asserting on state that a watcher updates.
- Use fake timers for the clock (`vi.useFakeTimers()`).
- Coverage thresholds are in `vite.config.ts`. Do not lower them to make a change pass.
- Shared fixtures are in `tests/helpers/fixtures.ts`.

## Architecture notes

- **Screen rules** are decided by `resolveGameScreen` (`src/domain/game-screen.ts`). The priority order is documented there and tested. Change the order only with a spec update.
- **Board** is built from the summary in `createBoardHouses`. The board is oriented for Black by reversing both the squares and the cells (`orientForSide`).
- **Board selection** is in `useChessBoard`: first click selects and fetches moves, a click on a highlighted square plays the move, then the game is reloaded.
- **Clock** runs in the browser in `useTurnClock`; the server stays the source of truth. When a side reaches zero, the game is reloaded.
- **Socket** (`useGameSocket`) maps game events to handlers by semantic name. The wire names are in `src/api/socket-events.ts`.
- **Environment** is read only through `src/config/env.ts`.

## Things to know

- The deployed API is behind Vercel deployment protection, so browser calls get a login redirect until it is disabled. Keep this in mind when debugging "network" failures.
- The API has no OpenAPI entry for socket events; they are documented in the spec and in `socket-events.ts`.
- URLs changed in the refactor (English paths). Bookmarks to the old Portuguese paths do not work.

## Workflow

- Work on a branch. The default branch is `main`. Do not commit or push unless the user asks.
- For new features, update `docs/specs/frontend.md` first, then code, then tests.
- Use the skills in `.claude/skills/` for the common recipes and the agents in `.claude/agents/` for review.
