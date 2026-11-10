# Frontend specification

This document describes what the frontend does, how each screen behaves, and how it looks. It is the reference for changes: a change that contradicts this file should update this file in the same change.

- Audience: developers working on this repository.
- Source of truth for the API: the OpenAPI description in the backend repository (`docs/api/openapi.yaml`). The Swagger page of the deployed API is at `/docs`.

## 1. Purpose

A browser client for a chess game. A player:

1. creates a game (or enters an existing one by id),
2. takes a side (White or Black), unless the game was created against the AI,
3. plays moves, offers or answers draws and resets, promotes pawns, and may resign.

The frontend holds no game rules of its own. The API decides what is legal and what has ended. The frontend only shows the state and sends the player's actions. The one exception is the material rule of section 3.5, which the frontend repeats only to explain a result the API has already decided.

Anyone who knows a room number can also review that game's moves, without taking a side.

## 2. Screens and routes

| Screen | Route | Purpose |
| --- | --- | --- |
| Home | `/` | Choose player types and turn time, create a game, enter a room, or review a game |
| Select side | `/game/:id?side=0\|1` | Choose a free side of a game and join it |
| Game | `/game/:id/side/:sideId` | Board, clocks and actions |
| Promote pawn | `/game/:id/side/:sideId/promote-pawn` | Choose the piece for a promoted pawn |
| End game | `/game/:id/side/:sideId/end-game` | Result of a finished game (with the details of a material draw); new game, propose a reset, or open the review |
| Answer proposal | `/game/:id/side/:sideId/answer-proposal/tie` or `/reset` | Accept or decline a draw or reset offer |
| Game review | `/game/:id/review?side=0\|1` | Step through the moves of a game on the board. Open to anyone; not part of the game flow |

Any other path goes to Home.

Invalid route params (a game id that is not a non-negative integer, a side that is not 0 or 1, an unknown proposal type) send the player to Home. On Game review, the `side` query only turns the board: a missing or invalid value shows it from White's side.

### 2.1 Screen rules

The screen a player is on is decided by the game state, not chosen by the player. After each load of the game, the frontend resolves the screen with these rules, first match wins:

1. A draw offer waits for an answer → **Answer proposal (tie)**.
2. A reset offer waits for an answer → **Answer proposal (reset)**.

   Both sides go to the same screen for rules 1 and 2: the side that received the offer answers, and the side that made it sees a waiting message.
3. This side must promote a pawn → **Promote pawn**.
4. This side has no player (it was left empty) → **Select side**, with that side preselected.
5. The game has finished → **End game**.
6. Otherwise → **Game**.

When the resolved screen differs from the current one, the frontend navigates. When it is the same, it stays. A player can therefore be moved between screens by the other player's actions, through the socket events below.

## 3. Behaviour by screen

Texts quoted in this section are the English versions. Each language shows its own translation (section 6).

### 3.1 Home

- Loads the game types from the API (Human X Human, Human X AI, AI X AI). The label of each button is built from the player types of the two sides.
- A turn-time selector sits above the buttons. Options: 5 (default), 10, 15 minutes. Games without a time limit are not offered. The selected value is sent as `tempoDeTurnoEmMilisegundos`.
- Clicking a game type creates a game with that type and the selected turn time:
  - AI X AI: opens the game directly, as side 0 (White).
  - Any other type: opens Select side for the new game.
- "Enter a room": asks for a game id in a browser prompt. An empty answer or Cancel does nothing. A non-empty answer opens Select side for that id; an id that is not a non-negative integer sends the player back to Home (section 2).
- "Review a game": asks for a room number in a browser prompt, the same way, and opens Game review for that game (from White's side).
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
- The clocks stop when the game ends. A side that ran out shows `00:00:00`; a negative time from the API is never shown.
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

- Heading: the result of the game in the language in use (see section 6.2).
- **Details of a material draw.** The API ends a game as "Draw: insufficient material" when neither side can checkmate, and as "Draw: time out and the other side cannot checkmate" when the side on the move runs out of time and the other side cannot checkmate. A time out that the other side can convert is a win for that side, so it shows no details. For these two results only, the screen shows, under the heading:
  - **The cause**: "Neither side has enough pieces left to checkmate." or "White ran out of time." (or Black).
  - **The pieces left**, one line per side: the side's name, whether those pieces can checkmate, and the pieces as pictures (King first, then Queen, Rook, Bishop, Knight, Pawn), named for screen readers.
  - **How the cause is found.** The frontend repeats the API's material rule, counting the king. A side cannot checkmate only with a bare king, king and bishop, king and knight, or king and two knights; with any other pieces it can (for example king and two rooks, or king, queen and knight). Insufficient material is a draw only when both sides cannot checkmate. The cause of a time-out draw is the side on the move, which is the side that ran out of time. The clocks are not read, because the API keeps the time of the side on the move after the game has ended. The rule only explains the result; the API's result is always the one shown.
- **New game?** goes to Home.
- **Propose reset** offers a reset to the opponent, shows the message, and returns to the game. The reset can be answered on the Answer proposal screen.
- **Review game** opens Game review for this game, with the board turned to the player's side.
- The screen returns to the game when the opponent proposes a draw or reset, or answers one.

### 3.6 Answer proposal

- Shown with the kind of proposal in the heading: "You received a draw proposal" or "You received a reset proposal".
- Only the side that received the offer sees the options **Accept** and **Decline**. **Respond** is disabled until one is chosen.
- The other side sees "Waiting for the answer to the draw proposal..." (or reset) and nothing else.
- On submit, shows the message and returns to the game.
- The screen reloads when the answer arrives over the socket.

### 3.7 Game review

Lets anyone who knows the room number see how a game went, step by step. It is opened from End game (**Review game**) or from Home (**Review a game**). The viewer takes no side and cannot change the game.

- **Heading**: "Game review", then a line with the room and the result: "Room 7 · Black wins", or "Room 7 · Game in progress" for a game that has not finished. A game in progress shows the moves played up to the moment the screen opened; it does not follow new moves.
- **Details of a material draw**: the same as on End game (section 3.5).
- **Board.** Shows the game's **final position** when the screen opens (the current one, for a game in progress), from White's side, or from Black's side when the link has `?side=1` (End game adds the player's side). The board cannot be clicked. The move behind the position is marked with the board colours of section 4: the square the piece left is yellow, the square it reached is green, or red when it captured a piece. Special moves are named in the square tooltip.
- **Controls.** Four buttons go to the starting position, the previous move, the next move and the final position, and a text shows where the viewer is ("Move 12 of 40", or "Starting position"). A button that cannot go further is disabled. The keys Left, Right, Home and End do the same, except while a form control (such as the language list) has the focus.
- **Move list.** A table with one row per move number: White's move and Black's answer. Each move is a button that shows the position after it; the move on the board is highlighted. A long list scrolls inside its own box. A move reads `Pawn E2 → E4`; a capture uses `×` (`Knight G1 × F3`); a promotion adds the chosen piece (`Pawn E7 → E8 = Queen`); castling and en passant are named (`King E1 → G1 (Short castling)`). Piece and move names are in the language in use.
- **Where the positions come from.** The API keeps no earlier positions, so the frontend rebuilds them: it starts from the standard position and plays the moves of both sides in the order of the API's turn count (the rook of a castling, the pawn taken en passant and the piece chosen in a promotion included; the API does not name the chosen piece in the move, so it is read from the piece that keeps the promotion among its moves). The result is used only if it ends on the board the API reports.
- **When it cannot be replayed** (for example a game that did not start from the standard position), the board shows the final position only, with the note "The moves of this game cannot be replayed, so the board shows the final position only." A game with no moves says "No moves were played in this game."
- **A game that cannot be loaded** (for example a room that does not exist) shows the error and goes to Home.
- **New game?** goes to Home.

## 4. Look and feel

The visual design is kept as it was. Changes to appearance need a deliberate decision and an update to this section.

- **Theme.** Dark page background (Bootstrap `bg-dark`), white text, centred content. The header is the app title, linked to Home, with the language selector on the right (a small dark `form-select` that lists the languages by their own names, see section 6). The footer credits the author and the API repository in light grey.
- **Typography and buttons.** Bootstrap 5 defaults. Headings are the page title (`h1`), a lead sentence (`lead`), and `h2` for "OR" on Home. Under "OR", **Enter a room** and **Review a game** sit side by side, and wrap on narrow phones. Action buttons are large (`btn-lg`) and bold. Choice groups are radio button groups (outlined primary buttons).
- **Button variants.** Primary actions use light buttons with a white border. Offering a draw is red (`btn-danger`); offering a reset is dark (`btn-dark`).
- **Pieces.** All twelve pieces come from one SVG set, `src/assets/pieces/standard.svg` (the Wikimedia "cburnett" set, CC BY-SA 3.0; its license text is in the file). White and black pieces share the same drawing, so they look alike, and the pictures are not font glyphs, so they look the same on every device. The API's Unicode symbols are not used.
- **Board.** Square board with an 8 px rebeccapurple border, rounded corners. It is 656 px wide on large screens and shrinks to the screen width on phones (the 8 × 8 squares and the pictures scale with it). Light squares are white, dark squares grey (`#999`). Selected piece is yellow, possible move green, capture red, check dark red. Hovering a square shows light blue, pressing shows blue-violet. The board border is greenyellow when it is the player's turn.
- **End game.** The heading, then, for a material draw, a `lead` sentence with the cause and a dark list (`list-group`, one item per side, 656 px wide at most) where each item shows the side's name in bold, a pill badge (green "Can checkmate", grey "Cannot checkmate") and the pieces as 2 rem pictures. Below, the two buttons side by side in a `btn-group` (**New game?** light, **Propose reset** dark), and **Review game** (light) on its own line under them.
- **Game review.** The review screen has an `h1` ("Game review"), a `lead` line with the room and the result, the material details of a material draw (as on End game), the board (same look and colours as the game board, not clickable, highlighting the last move as origin yellow, destination green or red), a row of four outlined light buttons (« ‹ › ») in a Bootstrap `btn-group` with the position text under it, and the move list: a `table-dark` small table, 656 px wide at most and 18 rem tall at most (it scrolls), whose moves are small buttons (outlined light, filled light for the move on the board). The note for a game that cannot be replayed is a light alert. **New game?** (light) is at the bottom.
- **Spinner.** A light Bootstrap spinner in place of the content while loading.
- **Clocks.** A list of two Bootstrap list items, centred, with a blue pill badge showing the time. 25 % wide on screens wider than 576 px, full width on phones.
- **Actions.** Resign and Offer draw sit side by side on wider screens and stacked, full width, on phones.
- **Phones.** Layout works from 320 px wide with a 16 px gutter on each side and no horizontal scrolling. The page does not zoom: a double tap or a pinch never resizes the screen (scrolling still works). Taps on squares do not wait for double-tap zoom, and long presses do not select the text of the board.
- **Install.** The app can be installed on the home screen as a web app (PWA). Installing needs no app store. See the install rules below.
- **Install rules.** The app ships a web app manifest (name, icons, standalone display) and a service worker. The service worker stores the app's own files so the app opens when the connection is slow. It never stores API answers: game data always comes from the server.
  - On browsers that allow installing (Chrome and Edge on Android and desktop), an **Install app** button is shown at the bottom of every screen until the app is installed. It opens the browser's install dialog.
  - On iPhone and iPad (Safari has no install dialog), the button is replaced by a short hint: tap Share, then Add to Home Screen.
  - Once the app runs from the home screen, neither the button nor the hint is shown.

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
| Games | `GET /jogos/{id}` | Moves of both sides, the final board, the result (`finalizado.tipo`) and the side on the move, for the game review |
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

Every request sends the `Accept-Language` header with the language the player chose (`en`, `pt-BR`, `pt`, `fr`, `it` or `de`), so the API can answer its messages in that language.

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
- **API messages.** Error and confirmation messages that come from the API are shown exactly as the API sends them. The frontend tells the API the language in use with the `Accept-Language` header (section 5); the API answers in that language when it supports it, and in Portuguese (for example "Esse lado já foi escolhido") when it does not.
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
| Empate: Tempo esgotado sem material | Draw: time out and the other side cannot checkmate |
| Empate: Rei afogado | Draw: stalemate |
| Empate: Comum acordo | Draw: by agreement |
| Empate: Regra das 3 posições | Draw: threefold repetition |
| Desistência: Um jogador deixou a partida | Resignation: a player left the game |

Move names are shown as "Short castling", "Long castling", "Pawn double step", "Pawn promotion", "En passant", "Knight move". Each language has its own names for these values.

### 6.3 URLs

Route paths are in English (`promote-pawn`, `end-game`, `answer-proposal`, `review`). The side query parameter is `side`. Links made with the previous paths do not work any more.

## 7. Socket events

The socket connects to the API base URL with the query `jogador = "{gameId}-{sideId}"`. The event names are the API's own (see `src/api/socket-events.ts`). They are not in the OpenAPI description.

| Event | Handled by | Effect |
| --- | --- | --- |
| `adversarioEntrou` | Game | Notify the player, reload |
| `jogadaRealizada` | Game | Reload |
| `empateProposto` | Game, End game | Reload (Game); End game returns to Game |
| `empatePropostoResposta` | Game, Answer proposal, End game | Reload (Game, Answer proposal); End game returns to Game |
| `resetProposto` | Game, End game | Same as `empateProposto` |
| `resetPropostoResposta` | Game, Answer proposal, End game | Same as `empatePropostoResposta` |
| `jogoFinalizado` | Game | Reload |
| `uncaughtException` | All game screens | Notify "Connection error with the server." |

The socket is closed when the screen is left.

## 8. Errors and loading

- A failed request shows its error with a browser alert. Errors without a server message say "Unexpected error. Please try again." or "Could not reach the server. Please try again later.", in the selected language. The same goes for the two configuration errors (no API address, or an answer that is not JSON).
- A failed load of the game sends the player to Home.
- A failed load of free sides sends the player to Home.
- A failed load of a game to review sends the viewer to Home.
- Actions that fail keep the player on the screen and reload the game where that makes sense.
- While an action is running, the screen shows the spinner in place of the content.

## 9. Non-functional requirements

- **Language.** TypeScript in strict mode. No `any` in application code.
- **Structure.** Source files under 300 lines. One responsibility per file. Pure rules live in `src/domain/` and do not import Vue or HTTP code.
- **Tests.** Each domain function, service, composable, component and view has tests. Coverage thresholds (lines 90 %, functions 90 %, branches 85 %, statements 90 %) are enforced by `npm run test:coverage`.
- **Build.** `npm run build` type-checks and builds without errors.
- **Browsers.** Current versions of Chrome, Edge, Firefox and Safari, on desktop, Android and iOS.

## 10. Open points

- The deployed API is behind Vercel deployment protection, which redirects anonymous requests to a login page. Until the protection is disabled, the frontend cannot reach the API from a browser.
- The API's castling check does not verify the squares the king passes through (a known deviation documented in the API).
- The API messages are translated only if the API answers in the language sent in `Accept-Language` (sections 5 and 6.1). Until it does, they stay in Portuguese.
- The socket events are not in the OpenAPI description. If the API changes them, update `src/api/socket-events.ts` and section 7.
