import type {
  EndingLabel,
  FinishReason,
  PieceName,
  SideId,
  SimplifiedCell,
} from '@/api/types/enums'
import { BLACK, WHITE } from './constants'
import { pieceNameOf, sideOf } from './replay'

/** Draw because neither side can checkmate. */
const MATERIAL_DRAW: EndingLabel = 'Empate: Insuficiência material'
/** Draw because the side on the move ran out of time and the other side cannot checkmate. */
const TIME_OUT_DRAW: EndingLabel = 'Empate: Tempo esgotado sem material'

/** Order of the pieces in a side's list: the king first, the pawns last. */
const PIECE_ORDER: readonly PieceName[] = ['Rei', 'Rainha', 'Torre', 'Bispo', 'Cavalo', 'Peão']

interface SideMaterial {
  sideId: SideId
  pieces: PieceName[]
}

/** Why the game was drawn: neither side can mate, or the side on the move ran out of time. */
type MaterialDrawCause = { kind: 'material' } | { kind: 'timeOut'; sideId: SideId }

export interface MaterialReport {
  cause: MaterialDrawCause
  /** White first, then Black. */
  sides: [SideMaterial, SideMaterial]
}

/** The facts of the game the report is built from. */
interface MaterialSource {
  ending: EndingLabel | null
  /** Why the game ended. A resignation is not explained here: the side that resigned may still have pieces. */
  reason: FinishReason | null
  /** The final board, in any order. */
  cells: readonly (SimplifiedCell | null)[]
  /** The side that was on the move when the game ended. */
  sideOnMove: SideId
}

/** The pieces a side has on the board, the king first. */
export function piecesLeft(cells: readonly (SimplifiedCell | null)[], sideId: SideId): PieceName[] {
  return cells
    .filter((cell): cell is SimplifiedCell => cell !== null && sideOf(cell) === sideId)
    .map(pieceNameOf)
    .sort((a, b) => PIECE_ORDER.indexOf(a) - PIECE_ORDER.indexOf(b))
}

/**
 * Explains a draw that depends on material, or returns null for any other result: the cause
 * and the pieces each side has left. The API alone decides which pieces can mate, so the
 * frontend reads the cause from the ending and never judges the material itself.
 * The side that ran out of time is the side on the move. The clocks are not read: the API
 * keeps counting the time of the side on the move after the game has ended.
 */
export function explainMaterialDraw(source: MaterialSource): MaterialReport | null {
  let cause: MaterialDrawCause
  if (source.reason === 'desistencia') {
    return null
  }
  if (source.ending === MATERIAL_DRAW) {
    cause = { kind: 'material' }
  } else if (source.ending === TIME_OUT_DRAW) {
    cause = { kind: 'timeOut', sideId: source.sideOnMove }
  } else {
    return null
  }
  const sideMaterial = (sideId: SideId): SideMaterial => ({
    sideId,
    pieces: piecesLeft(source.cells, sideId),
  })
  return { cause, sides: [sideMaterial(WHITE), sideMaterial(BLACK)] }
}
