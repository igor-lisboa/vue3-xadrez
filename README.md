# Chess Frontend

Web client for a chess game. Players create a game against another human or against the AI, pick a turn time limit, and play move by move. The game state lives in the [Chess API](https://github.com/igor-lisboa/tcc00339-gpms-xadrez-backend), and this app shows it and sends the players' actions.

Built with Vue 3, TypeScript, Vite, Bootstrap 5 and socket.io for live updates.

## Features

- Create a human vs human, human vs AI, or AI vs AI game
- Choose a turn time limit (none, 5, 10, 15 minutes, or 1 hour)
- Join an existing game by its id, on a free side
- Play with click-to-move: select a piece to see its legal moves, click a highlighted square to move
- Pawn promotion, draw offers and reset offers, with accept or decline
- Live updates over socket.io, and a countdown clock when the game has a time limit
- Resign a game

The full behaviour, screens and API contract are described in [docs/specs/frontend.md](docs/specs/frontend.md).

## Requirements

- Node.js 20.19 or newer, or 22.12 or newer (required by Vite 8)
- npm

## Getting started

```bash
cp .env.example .env
npm install
npm run dev
```

Open the address printed by Vite (`http://localhost:5173` by default).

## Configuration

Set in `.env` (see [.env.example](.env.example)):

| Variable | Description |
| --- | --- |
| `VITE_APP_TITLE` | Title shown in the header |
| `VITE_API_BASE_URL` | Base URL of the Chess API. Its Swagger documentation is served at `/docs` |

The API must be reachable from the browser. The Vercel deployment used by default may require a Vercel login when deployment protection is enabled; disable that protection (or point `VITE_API_BASE_URL` to another deployment) for the app to work.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the development server |
| `npm run build` | Type-checks the project and builds it for production into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run typecheck` | Runs the TypeScript checker (`vue-tsc`) |
| `npm test` | Runs the test suite once |
| `npm run test:watch` | Runs the tests in watch mode |
| `npm run test:coverage` | Runs the tests and reports coverage (thresholds enforced) |
| `npm run check` | Type-check, tests with coverage, and build. Run this before opening a pull request |
| `npm run format` | Formats the source and test files with Prettier |

## Project structure

```text
src/
  api/          HTTP client, typed API schemas (api/types), one service per API area (api/services)
  components/   Reusable presentational components (common/, game/, layout/)
  composables/  Stateful logic shared by views (requests, game state, socket, clock, board)
  config/       Typed environment variables
  domain/       Pure chess-app rules and helpers, with no Vue or HTTP code
  router/       Routes, route params, guards and screen navigation
  services/     Browser dialogs wrapper
  views/        One view per screen
tests/          Mirrors src/ (domain, api, composables, components, views, router)
docs/specs/     Functional specification of the frontend
```

Dependencies point inward: views use composables and components, composables use services and the domain, and the domain depends on nothing else in the app.

## Testing

Tests use [Vitest](https://vitest.dev) with jsdom and [Vue Test Utils](https://test-utils.vuejs.org). The domain layer is tested as pure functions; services are tested against a mocked HTTP client; composables and views are tested with mocked services and a mocked router. Coverage thresholds are set in `vite.config.ts`.

## Contributing

See [CLAUDE.md](CLAUDE.md) for the conventions, and the skills in `.claude/skills/` for step-by-step recipes (adding a screen, adding an API call, reviewing an API change).

## Deployment

`public/_redirects` makes single-page routing work on Netlify. Any static host with an SPA fallback works the same way: build with `npm run build` and serve `dist/`.

## Credits

Developed by [Igor Lisbôa](https://github.com/igor-lisboa). Uses the API from [tcc00339-gpms-xadrez-backend](https://github.com/igor-lisboa/tcc00339-gpms-xadrez-backend).
