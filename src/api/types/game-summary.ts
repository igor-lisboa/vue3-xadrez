import type { EndingLabel, RequestedActionName, SideId, SimplifiedCell, SquareName } from './enums'

export interface RequestedAction {
  acao: RequestedActionName
  ladoId: SideId
}

export interface EnPassantSummary {
  casaCaptura: SquareName
  casaPeao: SquareName
}

/**
 * Summary of a game, from GET /jogos/{id}/simples?tabuleiroSuperSimplificado=true.
 * Only the fields the frontend reads are typed.
 */
export interface GameSummary {
  id: number
  ladoIdAtual: SideId
  ladoBrancoTempoMilisegundosRestante: number | null
  ladoPretoTempoMilisegundosRestante: number | null
  /** Turn time limit in milliseconds, -1 when the game has no limit. */
  tempoDeTurnoEmMilisegundos: number
  chequeLadoAtual: boolean
  acoesSolicitadas: RequestedAction[]
  empatePropostoPeloLadoId: SideId | null
  resetPropostoPeloLadoId: SideId | null
  ladosIdDeslogados: SideId[]
  enPassantCasaCaptura: EnPassantSummary | null
  finalizado: EndingLabel | null
  /** Player types of both sides joined by " X ", for example "Humano X I.A.". */
  tipoJogo: string
  tabuleiro: (SimplifiedCell | null)[][]
}
