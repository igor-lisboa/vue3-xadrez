---
name: add-socket-event
description: Add or rename a game socket.io event in the Chess frontend (wire name in socket-events.ts, handler in useGameSocket consumers, spec section 7, tests). Use when the API starts sending a new game event or a screen must react to an existing one.
---

# Add a socket event

Socket events are not in the OpenAPI file. The backend repository (`igor-lisboa/tcc00339-gpms-xadrez-backend`) is the only source for their names, so confirm the exact wire name there before coding.

How the pieces fit:

- `src/api/socket-events.ts` has `SOCKET_EVENTS`: semantic name (English, camelCase) to wire name (as the API sends it, Portuguese).
- `src/composables/useGameSocket.ts` connects with the query `jogador = "{gameId}-{sideId}"` and calls the handler registered under the semantic name. `SocketHandlers` is derived from `SOCKET_EVENTS` (every key except `serverError`), so a new key becomes a valid handler name by itself.
- `useGameSocket(gameId, sideId, handlers)` is called by `GameView.vue`, `EndGameView.vue` and `AnswerProposalView.vue`. The socket is closed when the view unmounts.

## Steps

1. **Spec first.** Add a row to the table in `docs/specs/frontend.md` section 7 (event, screens that handle it, effect). If the event changes what a screen does, update section 3 for that screen too.
2. **Name.** Add the pair to `SOCKET_EVENTS` in `src/api/socket-events.ts`. The key says what happened in English (`moveMade`, `drawProposed`); the value is the wire name, unchanged. Wire names stay in Portuguese.
3. **Handle it.** In each view that must react, add the handler to its `useGameSocket(...)` call. Handlers normally reload the game (`useGameState`) or navigate; keep business rules in `src/domain/`, not in the handler. A screen that does not list the event ignores it.
4. **Text.** If the handler notifies the player, add the text with the `add-translation` skill and show it through `notify` from `@/services/dialogs` (never `window.alert`).
5. **Tests.**
   - `tests/composables/game-socket.test.ts`: the pattern is a fake socket whose `on` stores listeners in a map; call `listeners.get(SOCKET_EVENTS.<name>)?.()` and assert the handler ran once. Add the case for the new event.
   - The view test of every screen that handles it (`tests/views/game-events.test.ts` has the socket cases): the event triggers the expected reload or navigation.
6. **Check.** Run `npm run check`.

Do not add a handler for `serverError` (`uncaughtException`): `useGameSocket` already notifies the player with `game.connectionError`.
