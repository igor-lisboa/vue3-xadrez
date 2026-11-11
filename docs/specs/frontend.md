# Frontend specification

This document describes what the frontend does, how each screen behaves, and how it looks. It is the reference for changes: a change that contradicts this file should update this file in the same change.

- Audience: developers working on this repository.
- Source of truth for the API: the OpenAPI description in the backend repository (`docs/api/openapi.yaml`). The Swagger page of the deployed API is at `/docs`.

## 1. Purpose

A browser client for a chess game. A player:

1. creates a game (or enters an existing one by id),
2. takes a side (White or Black), unless the game was created against the AI,
3. plays moves, offers, answers or claims draws, offers or answers resets, promotes pawns, and may resign.

The frontend holds no game rules of its own. The API decides what is legal, what has ended, who won, and when a draw can be claimed, following the FIDE Laws of Chess. The frontend only shows the state (`finalizado`, `motivoFinalizacao`, `ladoIdVencedor`, `empateReivindicavel`) and sends the player's actions. It has no copy of any draw, repetition or insufficient-material rule.

Anyone who knows a room number can also review that game's moves, without taking a side.

## 2. Screens and routes

| Screen | Route | Purpose |
| --- | --- | --- |
| Home | `/` | Choose player types and time per side, create a game, enter a room, or review a game |
| Select side | `/game/:id?side=0\|1` | Choose a free side of a game and join it |
| Game | `/game/:id/side/:sideId` | Board, clocks and actions |
| Promote pawn | `/game/:id/side/:sideId/promote-pawn` | Choose the piece for a promoted pawn |
| End game | `/game/:id/side/:sideId/end-game` | Result and winner of a finished game (with the details of a material draw); new game, propose a reset, or open the review |
| Answer proposal | `/game/:id/side/:sideId/answer-proposal/reset` | Accept or decline a reset offer |
| Game review | `/game/:id/review?side=0\|1` | Step through the moves of a game on the board. Open to anyone; not part of the game flow |

Any other path goes to Home.

Invalid route params (a game id that is not a non-negative integer, a side that is not 0 or 1) send the player to Home. A draw offer has no screen of its own (it is answered on Game), so `/answer-proposal/tie` is an unknown path and goes to Home too. On Game review, the `side` query only turns the board: a missing or invalid value shows it from White's side.

### 2.1 Screen rules

The screen a player is on is decided by the game state, not chosen by the player. After each load of the game, the frontend resolves the screen with these rules, first match wins:

1. A reset offer waits for an answer → **Answer proposal**. Both sides go there: the side that received the offer answers, and the side that made it sees a waiting message.
2. This side must promote a pawn → **Promote pawn**.
3. This side has no player (it was left empty) → **Select side**, with that side preselected.
4. The game has finished → **End game**.
5. Otherwise → **Game**.

An open draw offer is not a rule: it never stops play, so both sides stay on **Game** (section 3.3). Only a pending pawn promotion blocks moves.

When the resolved screen differs from the current one, the frontend navigates. When it is the same, it stays. A player can therefore be moved between screens by the other player's actions, through the socket events below.

## 3. Behaviour by screen

Texts quoted in this section are the English versions. Each language shows its own translation (section 6).

### 3.1 Home

- Loads the game types from the API (Human X Human, Human X AI, AI X AI). The label of each button is built from the player types of the two sides.
- A time selector sits above the buttons. Options: 5 (default), 10, 15 minutes per side, which is the time each side has for the whole game, not a limit per turn. Games without a time limit are not offered. The selected value is sent as `tempoTotalPorLadoEmMilisegundos` (the deprecated `tempoDeTurnoEmMilisegundos` is no longer sent).
- Clicking a game type creates a game with that type and the selected time:
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
2. The open draw offer, if there is one (see Draws below).
3. The board, 8 × 8 squares. The board is shown from the player's side: Black sees it reversed.
4. The clocks (White, Black), only for games with a time limit.
5. The buttons **Resign** and **Offer draw** (or **Claim draw**, see below).
6. On the player's turn, the option **Claim a draw with my next move**.

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

- **Resign**: asks the API to end the game for this side, sending the side in the `lado` header (the API refuses a side resigning for the other one). The opponent wins. On success, shows the message and goes to Home.
- **Offer draw**: offers a draw to the opponent, shows the message, and reloads the game. Either side may offer at any time while the game runs, on turn or not. The button is hidden while an offer is open.

Draws:

- **An open offer never blocks the board.** Both players stay on this screen and either may move.
- **The side that received the offer** sees, above the board, "You received a draw proposal", the note "Making a move instead declines the offer." and the buttons **Accept** and **Decline**. Answering shows the message and reloads the game. Making a move instead declines the offer: the API clears it, and the panel closes when the game reloads.
- **The side that made the offer** sees "Waiting for the answer to the draw proposal..." in the same place. It closes when the answer arrives (`empatePropostoResposta`), also when the opponent declined by moving.
- **Claim draw.** When the API reports `empateReivindicavel` and it is the player's turn, **Claim draw** replaces **Offer draw**, with the line "This position lets you claim a draw (threefold repetition or 50-move rule)." under the buttons. It sends the same request as an offer, with no body; the API ends the game at once ("Empate reivindicado com sucesso!") and the player goes to End game. The value is reloaded after every move (the player's own move and the `jogadaRealizada` event), and the button is hidden once the game has ended. The frontend never checks repetitions or move counts itself.
- **Claim a draw with my next move** (advanced). On the player's turn, a switch under the buttons sends the next move played on the board as a draw claim for the position that move would make, instead of playing it. A warning under the switch says that if the claim is not valid, the move is played anyway and the opponent receives a draw offer. A valid claim ends the game without the move. A claim that is not valid shows the API's message followed by "The draw claim was not valid: your move was played and your opponent received a draw offer.", and the board reloads. The switch turns off after one move, and when the turn passes. `empateReivindicavel` does not cover this claim, so the switch is offered on every turn; it is not shown in an AI X AI game.

Live updates (socket events, see section 7): the game reloads when a move is made, a draw or reset is offered or answered, or the game finishes. When the opponent joins, the player is told so and the game reloads. A server error on the socket shows "Connection error with the server.".

When the game is loaded, the frontend asks the API to run the AI (`GET /ia`). A failure of that call is logged to the console and does not block the game.

### 3.4 Promote pawn

- Lists the pieces a pawn can be promoted to: Queen, Rook, Bishop, Knight.
- **Select piece** is disabled until a piece is chosen.
- On submit, shows the message and returns to the game on that side. A failure also returns to the game and shows the error.

### 3.5 End game

- Heading: the result of the game in the language in use (see section 6.2). The API uses the same ending for a checkmate and for a time out ("Vitória: Preto"), so the heading uses `motivoFinalizacao` as well: "Black wins by checkmate", or "Black wins: White ran out of time" for a time out. A resignation names the side that resigned from `ladoIdDesistente`, which the frontend never works out from the winner: "Black wins: White resigned". A resignation that ends as a draw (ending "Empate: Insuficiência material", reason `desistencia`, `ladoIdVencedor` null) is "Draw: White resigned, but Black had no material to checkmate". If `ladoIdDesistente` is missing, the heading shows the ending label and names nobody. A null or unknown reason also shows the ending label.
- **Winner.** Under the heading, "Winner: White" or "Winner: Black", from the API's `ladoIdVencedor`, also after a resignation (the opponent wins) or a time out. A draw shows no winner. The winner is never worked out from the ending label.
- **Time used.** Not shown on this screen; see the game review (section 3.7).
- **Details of a material draw.** The API ends a game as "Draw: insufficient material" when neither side can checkmate, and as "Draw: time out and the other side cannot checkmate" when the side on the move runs out of time and the other side cannot checkmate. A time out that the other side can convert is a win for that side, so it shows no details. A resignation that ends as a draw shows no details either: the side that resigned may still have pieces. For these two results only, the screen shows, under the heading:
  - **The cause**: "Neither side has enough pieces left to checkmate." or "White ran out of time." (or Black).
  - **The pieces left**, one line per side: the side's name and the pieces as pictures (King first, then Queen, Rook, Bishop, Knight, Pawn), named for screen readers.
  - **How the cause is found.** The cause comes from the ending the API chose; the frontend does not judge which pieces can checkmate (the API decides, and for example king and two knights against a bare king is not a draw). The cause of a time-out draw is the side on the move, which is the side that ran out of time. The clocks are not read, because the API keeps the time of the side on the move after the game has ended.
- **New game?** goes to Home.
- **Propose reset** offers a reset to the opponent, shows the message, and returns to the game. The reset can be answered on the Answer proposal screen.
- **Review game** opens Game review for this game, with the board turned to the player's side.
- The screen returns to the game when the opponent proposes a draw or reset, or answers one.
- The automatic draws "Draw: fivefold repetition", "Draw: 75-move rule" and "Draw: dead position" show the heading only.

### 3.6 Answer proposal

- Only for a reset offer (a draw offer is answered on Game, section 3.3). The heading is "You received a reset proposal".
- Only the side that received the offer sees the options **Accept** and **Decline**. **Respond** is disabled until one is chosen.
- The other side sees "Waiting for the answer to the reset proposal..." and nothing else.
- On submit, shows the message and returns to the game.
- The screen reloads when the answer arrives over the socket.

### 3.7 Game review

Lets anyone who knows the room number see how a game went, step by step. It is opened from End game (**Review game**) or from Home (**Review a game**). The viewer takes no side and cannot change the game.

- **Heading**: "Game review", then a line with the room, the result (the same heading as section 3.5) and, when the API names one (`ladoIdVencedor`), the winner: "Room 7 · Black wins by checkmate · Winner: Black", "Room 7 · Draw: dead position", or "Room 7 · Game in progress" for a game that has not finished. A game in progress shows the moves played up to the moment the screen opened; it does not follow new moves.
- **Time used**: under the heading, one line per side with the time it used in the game, from `ladoBrancoTempoMilisegundosGasto` and `ladoPretoTempoMilisegundosGasto`: "Time used (White): 00:12:34", "Time used (Black): 00:01:01". These values do not change after the game ends. Time used is shown whether or not the game has a time limit.
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
- **Typography and buttons.** Bootstrap 5 defaults. Headings are the page title (`h1`), a lead sentence (`lead`), and `h2` for "OR" on Home. Under "OR", **Enter a room** and **Review a game** sit side by side, and wrap on narrow phones. Action buttons are large (`btn-lg`) and bold. Choice groups are radio button groups (outlined primary buttons) side by side. On phones each option takes a full-width line of its own, with a small gap between them, because the joined buttons wrap their labels onto ragged rows.
- **Button variants.** Primary actions use light buttons with a white border. Offering or claiming a draw is red (`btn-danger`); offering a reset and declining a draw offer are dark (`btn-dark`).
- **Pieces.** All twelve pieces come from one SVG set, `src/assets/pieces/standard.svg` (the Wikimedia "cburnett" set, CC BY-SA 3.0; its license text is in the file). White and black pieces share the same drawing, so they look alike, and the pictures are not font glyphs, so they look the same on every device. The API's Unicode symbols are not used.
- **Board.** Square board with an 8 px rebeccapurple border, rounded corners. It is 656 px wide on large screens and shrinks to the screen width on phones (the 8 × 8 squares and the pictures scale with it). Light squares are white, dark squares grey (`#999`). Selected piece is yellow, possible move green, capture red, check dark red. Hovering a square shows light blue, pressing shows blue-violet. The board border is greenyellow when it is the player's turn.
- **End game.** The heading, then the winner as a `lead` line (none after a draw), then, for a material draw, a `lead` sentence with the cause and a dark list (`list-group`, one item per side, 656 px wide at most) where each item shows the side's name in bold and the pieces as 2 rem pictures. Below, the two buttons side by side in a `btn-group` (**New game?** light, **Propose reset** dark), and **Review game** (light) on its own line under them.
- **Game review.** The review screen has an `h1` ("Game review"), a `lead` line with the room and the result, and the time used by each side in two boxes side by side (a thin grey outline, rounded corners, a faint lighter background; the text wraps on a phone). Then the material details of a material draw (as on End game), the board (same look and colours as the game board, not clickable, highlighting the last move as origin yellow, destination green or red), a full-width group of four outlined light buttons (« ‹ › ») in a Bootstrap `btn-group`, `btn-lg`, 656 px wide at most, with the position text under it in grey. The move list: a `table-dark` table with no cell borders, only a faint line between rows; the move numbers and column titles are grey; each move is a soft dark chip (light text) and the move on the board is a filled light chip. The list is 656 px wide at most and 18 rem tall at most (it scrolls). The note for a game that cannot be replayed is a light alert. **New game?** (light) is at the bottom.
- **Spinner.** A light Bootstrap spinner in place of the content while loading.
- **Clocks.** A list of two Bootstrap list items, centred, with a blue pill badge showing the time. 25 % wide on screens wider than 576 px, full width on phones.
- **Actions.** Resign and Offer draw (or Claim draw) sit side by side on wider screens and stacked, full width, on phones. The claim hint is a small line under them.
- **Draw offer.** A light alert above the board, 656 px wide at most: for the side that received it, the offer in bold, the note in small text, and **Accept** (light) and **Decline** (dark) side by side; for the side that made it, the waiting sentence only.
- **Claim with the next move.** A Bootstrap switch (`form-switch`) under the actions, as wide as them, with its warning in small yellow text (`text-warning`).
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
| Games | `POST /jogos` | Create a game, with `tempoTotalPorLadoEmMilisegundos` |
| Games | `GET /jogos/{id}/simples?tabuleiroSuperSimplificado=true` | Game state, with the winner (`ladoIdVencedor`), the resigning side (`ladoIdDesistente`), the clocks and `empateReivindicavel` |
| Games | `GET /jogos/{id}` | Moves of both sides, the final board, the result (`finalizado.tipo`), the reason (`motivoFinalizacao`), the winner, the resigning side, the clocks and the side on the move, for the game review |
| Games | `GET /jogos/{id}/lado-sem-jogador` | Free sides |
| Players | `POST /jogos/{id}/jogadores` | Join a side (`tipoId` 0, human) |
| Players | `DELETE /jogos/{id}/jogadores/{ladoId}` with header `lado` = `ladoId` | Resign |
| Moves | `GET /jogos/{id}/pecas/{casa}/possiveis-jogadas` | Legal moves of a piece |
| Moves | `POST /jogos/{id}/pecas/{origem}/move/{destino}` | Play a move |
| Moves | `POST /jogos/{id}/promove-peao/{pecaId}` | Promote a pawn |
| Proposals | `PUT /jogos/{id}/empate/propoe`, no body, or `{ origem, destino }` | Offer or claim a draw; claim for the next move |
| Proposals | `PUT /jogos/{id}/reset/propoe` | Offer a reset |
| Proposals | `POST /jogos/{id}/{empate\|reset}/responde` with `{ resposta }` | Answer an offer |
| AI | `GET /ia` | Ask the server to run the AI |

Player actions identify the acting side with the `lado` header (0 or 1).

Every request sends the `Accept-Language` header with the language the player chose (`en`, `pt-BR`, `pt`, `fr`, `it` or `de`), so the API can answer its messages in that language.

Requested actions in a game state (`acoesSolicitadas`): `responderPropostaReset` and `promocaoPeao` drive the screen rules; `responderPropostaEmpate` only shows the draw offer on Game.

Fields of the game state read for the result and draws:

- `finalizado`: the ending label (one of the 12 of `GET /tipos-de-finalizacao`, ids 0 to 11), or null while the game runs.
- `motivoFinalizacao`: why the game ended (one of the values of `GET /enumeracoes` `motivosFinalizacao`), or null while the game runs. It tells a checkmate from a time out, and a resignation draw from a resignation win. Values the frontend does not know fall back to the ending label.
- `ladoIdVencedor`: 0 (White), 1 (Black), or null while the game runs and after every draw.
- `ladoIdDesistente`: the side that resigned (0 or 1), set when `motivoFinalizacao` is `desistencia`, also for a draw; null otherwise. Never inferred from `ladoIdVencedor`.
- The clocks, in milliseconds, on every game response and on the socket events: `ladoBrancoTempoMilisegundosRestante` and `ladoPretoTempoMilisegundosRestante` (time left, never negative; null when the game has no limit), and `ladoBrancoTempoMilisegundosGasto` and `ladoPretoTempoMilisegundosGasto` (time used). The time limit is `tempoTotalPorLadoEmMilisegundos`: the time per side for the whole game, not a limit per turn, -1 for no limit. An older backend sends only the deprecated `tempoDeTurnoEmMilisegundos`, which has the same value, and the frontend reads that name when the new one is missing.
- `empatePropostoPeloLadoId`: the side with an open draw offer, or null. An open offer is cleared when the side that received it moves, and when the game ends in any other way.
- `empateReivindicavel`: true when the side on turn could claim a draw now (threefold repetition or 50-move rule) for the position on the board; always false once the game has ended.

`PUT /jogos/{id}/empate/propoe` answers `data` `{ reivindicado, jogadaRealizada }`. Without a body it claims when the position allows it (`reivindicado: true`, the game ends) and otherwise leaves an offer. With `{ origem, destino }` (both required, or the API refuses with "Informe a casa de origem e a casa de destino da jogada pretendida") it claims for the position that move would make: a valid claim ends the game without the move; otherwise the move is played (`jogadaRealizada` is its record) and an offer is left.

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
| Empate: Regra das 5 posições | Draw: fivefold repetition |
| Empate: Regra 75 movimentos | Draw: 75-move rule |
| Empate: Posição morta | Draw: dead position |
| `ladoIdVencedor` 0 / 1 | Winner: White / Winner: Black |
| `motivoFinalizacao` with a winner | Heading of the win, for example "Black wins by checkmate" or "Black wins: White ran out of time" (one text per reason in each language) |
| `motivoFinalizacao` `desistencia` without a winner | "Draw: White resigned, but Black had no material to checkmate" (the names come from `ladoIdDesistente`) |
| `tempoTotalPorLadoEmMilisegundos` | Time each side has for the whole game: "5 minutes per side" (not a limit per turn) |

Move names are shown as "Short castling", "Long castling", "Pawn double step", "Pawn promotion", "En passant", "Knight move". Each language has its own names for these values.

### 6.3 URLs

Route paths are in English (`promote-pawn`, `end-game`, `answer-proposal`, `review`). The side query parameter is `side`. Links made with the previous paths do not work any more.

## 7. Socket events

The socket connects to the API base URL with the query `jogador = "{gameId}-{sideId}"`. The event names are the API's own (see `src/api/socket-events.ts`). They are not in the OpenAPI description.

| Event | Handled by | Effect |
| --- | --- | --- |
| `adversarioEntrou` | Game | Notify the player, reload |
| `jogadaRealizada` | Game | The clocks in the payload are shown at once, then the game is reloaded (this also refreshes `empateReivindicavel`, which the frontend reads from the reloaded state) |
| `empateProposto` | Game, End game | Reload (Game); End game returns to Game |
| `empatePropostoResposta` | Game, End game | Reload (Game); End game returns to Game. Also sent, with no payload, to the proposer when the opponent moved instead of answering |
| `resetProposto` | Game, End game | Same as `empateProposto` |
| `resetPropostoResposta` | Game, Answer proposal, End game | Reload (Game, Answer proposal); End game returns to Game |
| `jogoFinalizado` | Game | The clocks in the payload are shown at once, then the game is reloaded. The payload is `{ jogoFinalizacao, motivoFinalizacao, ladoIdVencedor, ladoIdDesistente, and the four clocks }`; the ending texts come from the reloaded state |
| `uncaughtException` | All game screens | Notify "Connection error with the server." |

The socket is closed when the screen is left.

The events `responderPropostaEmpate`, `responderPropostaReset` and `promocaoPeao` are sent again on every save while they wait. The frontend does not listen to them: a pending answer or promotion is read from `acoesSolicitadas` in the reloaded game, and the screen follows it only when the player is not on it yet (`useGameState`). A repeated event therefore never opens a second screen or dialog.

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
