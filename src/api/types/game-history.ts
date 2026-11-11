import type { Square } from './catalogue'
import type { EndingLabel, FinishReason, MoveName, PieceName, SideId } from './enums'
import type { GameClocks } from './game-summary'

/**
 * Piece as GET /jogos/{id} sends it. Only the fields the replay reads are typed.
 * A promoted piece keeps the moves of the pawn it replaced, which is how its type is traced back.
 */
export interface PlayedPiece {
  tipo: PieceName
  ladoId: SideId
  jogadasRealizadas: PlayedMove[]
}

/** A move that was played. Castling also lists the rook's move in `movimentosEspeciaisExecutados`. */
export interface PlayedMove {
  /** Number of turns that existed when the move was played: it grows with every move. */
  identificador: number
  casaOrigem: Square
  casaDestino: Square
  pecaCapturada: PlayedPiece | null
  nomeJogada: MoveName
  movimentosEspeciaisExecutados: PlayedMove[]
  /** Time of the move, in milliseconds (Unix epoch). */
  momento: number
}

interface PlayedSide {
  jogadasRealizadas: PlayedMove[]
}

/**
 * The parts of the full game (GET /jogos/{id}) that the game review reads; the type is partial.
 * The clocks are the time used by each side, which stays the same once the game has ended.
 */
export interface GameHistorySource extends GameClocks {
  id: number
  ladoBranco: PlayedSide
  ladoPreto: PlayedSide
  tabuleiro: { casas: (PlayedPiece | null)[][] }
  ladoIdAtual: SideId
  /** How the game ended, or null while it is still being played. */
  finalizado: { tipo: EndingLabel } | null
  /** Why the game ended, or null while it is still being played. */
  motivoFinalizacao: FinishReason | null
  /** The side that won, or null while the game runs and after every draw. */
  ladoIdVencedor: SideId | null
  /** The side that resigned, when motivoFinalizacao is "desistencia"; null otherwise. */
  ladoIdDesistente: SideId | null
}
