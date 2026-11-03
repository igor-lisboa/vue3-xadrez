# Frontend specification

This document describes what the frontend does, how each screen behaves, and how it looks. It is the reference for changes: a change that contradicts this file should update this file in the same change.

- Audience: developers working on this repository.
- Source of truth for the API: the OpenAPI description in the backend repository (`docs/api/openapi.yaml`). The Swagger page of the deployed API is at `/docs`.

## 1. Purpose

A browser client for a chess game. A player:

1. creates a game (or enters an existing one by id),
2. takes a side (White or Black), unless the game was created against the AI,
3. plays moves, offers or answers draws and resets, promotes pawns, and may resign.

The frontend holds no game rules of its own. The API decides what is legal and what has ended. The frontend only shows the state and sends the player's actions.

## 2. Screens and routes

| Screen | Route | Purpose |
| --- | --- | --- |
| Home | `/` | Choose player types and turn time, create a game, or enter a room |
| Select side | `/game/:id?side=0\|1` | Choose a free side of a game and join it |
| Game | `/game/:id/side/:sideId` | Board, clocks and actions |
| Promote pawn | `/game/:id/side/:sideId/promote-pawn` | Choose the piece for a promoted pawn |
| End game | `/game/:id/side/:sideId/end-game` | Result of a finished game; propose a reset |
| Answer proposal | `/game/:id/side/:sideId/answer-proposal/tie` or `/reset` | Accept or decline a draw or reset offer |

Any other path goes to Home.

Invalid route params (a game id that is not a non-negative integer, a side that is not 0 or 1, an unknown proposal type) send the player to Home.

### 2.1 Screen rules

The screen a player is on is decided by the game state, not chosen by the player. After each load of the game, the frontend resolves the screen with these rules, first match wins:

1. A draw offer waits for this player's answer → **Answer proposal (tie)**.
2. A reset offer waits for an answer → **Answer proposal (reset)**. The receiving side answers; the other side sees a waiting message on the same screen.
3. This side must promote a pawn → **Promote pawn**.
4. This side has no player (it was left empty) → **Select side**, with that side preselected.
5. The game has finished → **End game**.
6. Otherwise → **Game**.

When the resolved screen differs from the current one, the frontend navigates. When it is the same, it stays. A player can therefore be moved between screens by the other player's actions, through the socket events below.

## 3. Behaviour by screen

Texts quoted in this section are the English versions. Each language shows its own translation (section 6).

### 3.1 Home

- Loads the game types from the API (Human X Human, Human X AI, AI X AI). The label of each button is built from the player types of the two sides.
- A turn-time selector sits above the buttons. Options: 5 (default), 10, 15 minutes, 1 hour. Games without a time limit are not offered. The selected value is sent as `tempoDeTurnoEmMilisegundos`.
- Clicking a game type creates a game with that type and the selected turn time:
  - AI X AI: opens the game directly, as side 0 (White).
  - Any other type: opens Select side for the new game.
- "Enter a room": asks for a game id in a browser prompt. An empty answer or Cancel does nothing. A non-empty answer opens Select side for that id.
- While the types load, or a game is being created, a spinner replaces the content.
- A failed creation shows the error message and stays on Home.

### 3.2 Select side

- Loads the sides of the game that have no player.
- Shows one option per free side (White or Black). Nothing is preselected unless the screen was opened with a side in the link.
- **Join game** is disabled until a side is chosen. It joins as a human player.
- On success, opens the game on that side.
- On failure, shows the message and reloads the free sides.
- If no side is free: shows "This game has no available sides" and a **New game?** button to Home.
- If the free sides cannot be loaded: shows the error and goes to Home.

### 3.3 Game

Layout, top to bottom:

1. An information bar: game id and game type, for example `7 | Human X AI`.
2. The board, 8 × 8 squares. The board is shown from the player's side: Black sees it reversed.
3. The clocks (White, Black), only for games with a time limit.
4. Two buttons: **Resign** and **Offer draw**.

Board behaviour:

- **Select and move.** Clicking a piece of the player's side highlights its legal moves. Clicking a highlighted square plays that move, then reloads the game. Clicking another square clears the selection and selects that square's piece instead.
- **Legal moves.** The API lists the legal moves of the selected piece. A destination shows a green square; a capture shows a red square. The square tooltip shows the square name and, for special moves, the move name (for example "Short castling").
- **Check.** The king of the side on turn is shown dark red while that side is in check.
- **Turn.** When it is the player's turn, the board border is bright green.
- **AI X AI.** The board cannot be clicked; it only shows the game as it progresses.
- Each square shows its piece as a picture from the piece set (section 4).

Clocks:

- Show each side's remaining time as `HH:MM:SS`.
- The side on turn counts down every second in the browser. When that side reaches zero, the game is reloaded so the server can end it.
- Clocks are not shown when the game has no time limit.

Actions:

- **Resign**: asks the API to end the game for this side. On success, shows the message and goes to Home.
- **Offer draw**: offers a draw to the opponent, shows the message, and reloads the game. The screen then changes to the waiting or answer screen.

Live updates (socket events, see section 5): the game reloads when a move is made, a draw or reset is offered or answered, or the game finishes. When the opponent joins, the player is told so and the game reloads. A server error on the socket shows "Connection error with the server.".

When the game is loaded, the frontend asks the API to run the AI (`GET /ia`). A failure of that call is logged to the console and does not block the game.

### 3.4 Promote pawn

- Lists the pieces a pawn can be promoted to: Queen, Rook, Bishop, Knight.
- **Select piece** is disabled until a piece is chosen.
- On submit, shows the message and returns to the game on that side. A failure also returns to the game and shows the error.

### 3.5 End game

- Heading: the result of the game in English (see section 6.2).
- **New game?** goes to Home.
- **Propose reset** offers a reset to the opponent, shows the message, and returns to the game. The reset can be answered on the Answer proposal screen.
- The screen returns to the game when the opponent proposes a draw or reset, or answers one.

### 3.6 Answer proposal

- Shown with the kind of proposal in the heading: "You received a draw proposal" or "You received a reset proposal".
- Only the side that received the offer sees the options **Accept** and **Decline**. **Respond** is disabled until one is chosen.
- The other side sees "Waiting for the answer to the draw proposal..." (or reset) and nothing else.
- On submit, shows the message and returns to the game.
- The screen reloads when the answer arrives over the socket.

## 4. Look and feel

The visual design is kept as it was. Changes to appearance need a deliberate decision and an update to this section.

- **Theme.** Dark page background (Bootstrap `bg-dark`), white text, centred content. The header is the app title, linked to Home, with the language selector on the right (a small dark `form-select` that lists the languages by their own names, see section 6). The footer credits the author and the API repository in light grey.
- **Typography and buttons.** Bootstrap 5 defaults. Headings are the page title (`h1`), a lead sentence (`lead`), and `h2` for "OR" on Home. Action buttons are large (`btn-lg`) and bold. Choice groups are radio button groups (outlined primary buttons).
- **Button variants.** Primary actions use light buttons with a white border. Offering a draw is red (`btn-danger`); offering a reset is dark (`btn-dark`).
- **Pieces.** All twelve pieces come from one SVG set, `src/assets/pieces/standard.svg` (the Wikimedia "cburnett" set, CC BY-SA 3.0; its license text is in the file). White and black pieces share the same drawing, so they look alike, and the pictures are not font glyphs, so they look the same on every device. The API's Unicode symbols are not used.
- **Board.** 656 px square board with an 8 px rebeccapurple border, rounded corners. Each square is 80 px with a 66 px piece picture. Light squares are white, dark squares grey (`#999`). Selected piece is yellow, possible move green, capture red, check dark red. Hovering a square shows light blue, pressing shows blue-violet. The board border is greenyellow when it is the player's turn.
- **Spinner.** A light Bootstrap spinner in place of the content while loading.
- **Clocks.** A list of two Bootstrap list items, 25 % wide, centred, with a blue pill badge showing the time.

Known layout limitation: the board is a fixed 656 px. It does not scale down on phones. Changing this is a visual change and is not part of the current scope.

## 5. API contract used by the frontend

Base URL: `VITE_API_BASE_URL`. Every JSON answer has the envelope `{ message, data, success }`. A refused rule or an error is an HTTP 500 with the same envelope; the frontend shows `message` to the player.

The frontend's services, one file per area under `src/api/services/`:

| Area | Call | Used for |
| --- | --- | --- |
| Catalogue | `GET /tipos-de-jogo` | Home game types |
| Catalogue | `GET /tabela-equivalencia` | Square names and positions (A8 first) |
| Catalogue | `GET /tipos-de-peca` | Piece types, to read the pieces of the board |
| Catalogue | `GET /tipos-de-peca/promocao-peao` | Promotion choices |
| Games | `POST /jogos` | Create a game |
| Games | `GET /jogos/{id}/simples?tabuleiroSuperSimplificado=true` | Game state |
| Games | `GET /jogos/{id}/lado-sem-jogador` | Free sides |
| Players | `POST /jogos/{id}/jogadores` | Join a side (`tipoId` 0, human) |
| Players | `DELETE /jogos/{id}/jogadores/{ladoId}` | Resign |
| Moves | `GET /jogos/{id}/pecas/{casa}/possiveis-jogadas` | Legal moves of a piece |
| Moves | `POST /jogos/{id}/pecas/{origem}/move/{destino}` | Play a move |
| Moves | `POST /jogos/{id}/promove-peao/{pecaId}` | Promote a pawn |
| Proposals | `PUT /jogos/{id}/{empate\|reset}/propoe` | Offer a draw or reset |
| Proposals | `POST /jogos/{id}/{empate\|reset}/responde` with `{ resposta }` | Answer an offer |
| AI | `GET /ia` | Ask the server to run the AI |

Player actions identify the acting side with the `lado` header (0 or 1).

Requested actions in a game state (`acoesSolicitadas`) drive the screen rules: `responderPropostaEmpate`, `responderPropostaReset`, `promocaoPeao`.

## 6. Language and labels

### 6.1 Languages and text

The frontend's text is available in six languages. The language is chosen with the selector in the header, which is shown on every screen and lists each language by its own name:

| Code | Shown as |
| --- | --- |
| `en` (default) | English |
| `pt-BR` | Português (Brasil) |
| `pt` | Português (Portugal) |
| `fr` | Français |
| `it` | Italiano |
| `de` | Deutsch |

- **Choice.** The choice is kept in the browser (`localStorage`, key `chess.locale`), so it survives a reload. Without a stored choice, the frontend uses the first browser language it supports (for example `pt-PT` gives Português (Portugal), `fr-CA` gives Français) and falls back to English.
- **Switching.** Changing the language changes all visible text at once, on the current screen. It does not reload the game, and the `lang` attribute of the page is updated.
- **Where the text lives.** One message file per language under `src/i18n/messages/`. Each file has every key, so a missing translation fails the type check.
- **API messages.** Error and confirmation messages that come from the API are shown exactly as the API sends them, in Portuguese (for example "Esse lado já foi escolhido"). Translating them would need a change in the API.
- **Board and clock values** that come from the API stay as received. The game type in the information bar is the one exception: the player type names the API sends in Portuguese (`Humano`, `I.A.`) are translated with the player type labels of the language in use.

### 6.2 Labels translated

The API uses Portuguese identifiers. The frontend keeps them on the wire and in code, and translates them for display in each language's message file. The English values are:

| API value | English |
| --- | --- |
| Branco / Preto | White / Black |
| Humano / I.A. | Human / AI |
| Rei, Rainha, Torre, Bispo, Cavalo, Peão | King, Queen, Rook, Bishop, Knight, Pawn |
| Vitória: Branco | White wins |
| Vitória: Preto | Black wins |
| Empate: Regra 50 movimentos | Draw: 50-move rule |
| Empate: Insuficiência material | Draw: insufficient material |
| Empate: Rei afogado | Draw: stalemate |
| Empate: Comum acordo | Draw: by agreement |
| Empate: Regra das 3 posições | Draw: threefold repetition |
| Desistência: Um jogador deixou a partida | Resignation: a player left the game |
| Tempo esgotado: o tempo de um jogador acabou | Time out: a player ran out of time |

Move names are shown as "Short castling", "Long castling", "Pawn double step", "Pawn promotion", "En passant", "Knight move". Each language has its own names for these values.

### 6.3 URLs

Route paths are in English (`promote-pawn`, `end-game`, `answer-proposal`). The side query parameter is `side`. Links made with the previous paths do not work any more.

## 7. Socket events

The socket connects to the API base URL with the query `jogador = "{gameId}-{sideId}"`. The event names are the API's own (see `src/api/socket-events.ts`). They are not in the OpenAPI description.

| Event | Handled by | Effect |
| --- | --- | --- |
| `adversarioEntrou` | Game | Notify the player, reload |
| `jogadaRealizada` | Game | Reload |
| `empateProposto`, `empatePropostoResposta` | Game, Answer proposal | Reload (Game); Answer proposal reloads; End game returns to Game |
| `resetProposto`, `resetPropostoResposta` | Game, Answer proposal | Same as draw events |
| `jogoFinalizado` | Game | Reload |
| `uncaughtException` | All game screens | Notify "Connection error with the server." |

The socket is closed when the screen is left.

## 8. Errors and loading

- A failed request shows its error with a browser alert. Errors without a server message say "Unexpected error. Please try again." or "Could not reach the server. Please try again later.", in the selected language. The same goes for the two configuration errors (no API address, or an answer that is not JSON).
- A failed load of the game sends the player to Home.
- A failed load of free sides sends the player to Home.
- Actions that fail keep the player on the screen and reload the game where that makes sense.
- While an action is running, the screen shows the spinner in place of the content.

## 9. Non-functional requirements

- **Language.** TypeScript in strict mode. No `any` in application code.
- **Structure.** Source files under 300 lines. One responsibility per file. Pure rules live in `src/domain/` and do not import Vue or HTTP code.
- **Tests.** Each domain function, service, composable, component and view has tests. Coverage thresholds (lines 90 %, functions 90 %, branches 85 %, statements 90 %) are enforced by `npm run test:coverage`.
- **Build.** `npm run build` type-checks and builds without errors.
- **Browsers.** Current versions of Chrome, Edge, Firefox and Safari.

## 10. Open points

- The deployed API is behind Vercel deployment protection, which redirects anonymous requests to a login page. Until the protection is disabled, the frontend cannot reach the API from a browser.
- The API's castling check does not verify the squares the king passes through (a known deviation documented in the API).
- The API messages are in Portuguese and are not translated (section 6.1).
- The board is not responsive (section 4).
- The socket events are not in the OpenAPI description. If the API changes them, update `src/api/socket-events.ts` and section 7.
