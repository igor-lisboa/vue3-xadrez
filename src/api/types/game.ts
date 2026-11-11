import type { GameTypeId, PlayerTypeId, SideId, SideName, SquareName } from './enums'

/** Body of POST /jogos. Every field is optional on the server, the frontend always sends them. */
export interface CreateGameRequest {
  tipoJogo: GameTypeId
  /** Time each side has for the whole game, in milliseconds, -1 for no limit (not a limit per turn). */
  tempoTotalPorLadoEmMilisegundos: number
}

/** Answer of POST /jogos. Only the id is read by the frontend. */
export interface CreatedGame {
  id: number
}

/** Side that has no player yet (item of GET /jogos/{id}/lado-sem-jogador). */
export interface SideSlot {
  id: SideId
  lado: SideName
}

/** Body of POST /jogos/{id}/jogadores. */
export interface JoinPlayerRequest {
  ladoId: SideId
  tipoId: PlayerTypeId
}

/** Body of the answer routes. */
export interface AnswerRequest {
  resposta: boolean
}

/**
 * Body of PUT /jogos/{id}/empate/propoe to claim a draw for the position the next move would
 * make. Both squares are required.
 */
export interface IntendedMove {
  origem: SquareName
  destino: SquareName
}

/** Answer data of PUT /jogos/{id}/empate/propoe. */
export interface DrawProposalResult {
  /** True when a draw claim succeeded and the game ended. */
  reivindicado: boolean
  /** The move played by a claim that was not valid, or null. Not read: the game is reloaded. */
  jogadaRealizada: unknown
}
