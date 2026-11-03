import type { GameTypeId, PlayerTypeId, SideId, SideName } from './enums'

/** Body of POST /jogos. Every field is optional on the server, the frontend always sends them. */
export interface CreateGameRequest {
  tipoJogo: GameTypeId
  /** Turn time limit in milliseconds, -1 for no limit. */
  tempoDeTurnoEmMilisegundos: number
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
