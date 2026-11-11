import type {
  EndingLabel,
  FinishReason,
  RequestedActionName,
  SideId,
  SimplifiedCell,
  SquareName,
} from './enums'

export interface RequestedAction {
  acao: RequestedActionName
  ladoId: SideId
}

export interface EnPassantSummary {
  casaCaptura: SquareName
  casaPeao: SquareName
}

/**
 * The clocks of both sides, in milliseconds, read at one instant by the server. Time left is null
 * when the game has no limit. Time used is always sent. For a limited game, left plus used is the limit.
 */
export interface GameClocks {
  ladoBrancoTempoMilisegundosRestante: number | null
  ladoBrancoTempoMilisegundosGasto: number
  ladoPretoTempoMilisegundosRestante: number | null
  ladoPretoTempoMilisegundosGasto: number
}

/**
 * Summary of a game, from GET /jogos/{id}/simples?tabuleiroSuperSimplificado=true.
 * Only the fields the frontend reads are typed.
 */
export interface GameSummary extends GameClocks {
  id: number
  ladoIdAtual: SideId
  /**
   * Time each side has for the whole game, in milliseconds, -1 when the game has no limit.
   * It is not a limit per turn. Missing from an older backend, which sends only the deprecated name.
   */
  tempoTotalPorLadoEmMilisegundos?: number
  /** Deprecated name of tempoTotalPorLadoEmMilisegundos, with the same value. */
  tempoDeTurnoEmMilisegundos: number
  chequeLadoAtual: boolean
  acoesSolicitadas: RequestedAction[]
  empatePropostoPeloLadoId: SideId | null
  resetPropostoPeloLadoId: SideId | null
  ladosIdDeslogados: SideId[]
  enPassantCasaCaptura: EnPassantSummary | null
  finalizado: EndingLabel | null
  /** Why the game ended, or null while it runs. Unknown values are possible; the frontend falls back. */
  motivoFinalizacao: FinishReason | null
  /** The side that won, or null while the game runs and after every draw. */
  ladoIdVencedor: SideId | null
  /** The side that resigned, when motivoFinalizacao is "desistencia" (also for a draw); null otherwise. */
  ladoIdDesistente: SideId | null
  /**
   * True when the side on turn could claim a draw now (threefold repetition or 50-move rule)
   * for the position on the board. Always false once the game has ended.
   */
  empateReivindicavel: boolean
  /** Player types of both sides joined by " X ", for example "Humano X I.A.". */
  tipoJogo: string
  tabuleiro: (SimplifiedCell | null)[][]
}
