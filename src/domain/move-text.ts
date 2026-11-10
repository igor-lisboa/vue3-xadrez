import type { MoveName, PieceName } from '@/api/types/enums'
import { WHITE } from './constants'
import type { HistoryMove } from './replay'

/** Special moves worth naming in the move list. The others (double step, knight move) are plain moves. */
const NAMED_MOVES: MoveName[] = ['Roque Menor', 'Roque Maior', 'En Passant']

/**
 * A move as one short line, for example `Pawn E2 → E4`, `Knight G1 × F3` for a capture,
 * `Pawn E7 → E8 = Queen` for a promotion and `King E1 → G1 (Short castling)`.
 */
export function describeMove(
  move: HistoryMove,
  pieceLabels: Record<PieceName, string>,
  moveLabels: Record<NonNullable<MoveName>, string>,
): string {
  const arrow = move.captured ? '×' : '→'
  let text = `${pieceLabels[move.piece]} ${move.from} ${arrow} ${move.to}`
  if (move.promotedTo) {
    text += ` = ${pieceLabels[move.promotedTo]}`
  }
  if (move.moveName && NAMED_MOVES.includes(move.moveName)) {
    text += ` (${moveLabels[move.moveName]})`
  }
  return text
}

/** One row of the move list: a move of White and the answer of Black. */
export interface MovePair {
  number: number
  white: HistoryMove | null
  black: HistoryMove | null
}

/** Groups the moves by their number, so each row has White's move and Black's answer. */
export function pairMoves(moves: readonly HistoryMove[]): MovePair[] {
  const pairs: MovePair[] = []
  for (const move of moves) {
    let pair = pairs.at(-1)
    if (pair?.number !== move.number) {
      pair = { number: move.number, white: null, black: null }
      pairs.push(pair)
    }
    if (move.sideId === WHITE) {
      pair.white = move
    } else {
      pair.black = move
    }
  }
  return pairs
}
