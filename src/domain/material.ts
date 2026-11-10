import type { EndingLabel, PieceName, SideId, SimplifiedCell } from '@/api/types/enums'
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
  canCheckmate: boolean
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
 * Whether these pieces (the king included) can give checkmate. This copies the backend's rule
 * so the screen can explain a draw; it never decides a result. Only a bare king, king and bishop,
 * king and knight, and king and two knights cannot mate. Same-colour bishops are not detected.
 */
export function canCheckmate(pieces: readonly PieceName[]): boolean {
  if (pieces.length < 2) {
    return false
  }
  if (pieces.length === 2) {
    return pieces.some((piece) => piece === 'Rainha' || piece === 'Torre' || piece === 'Peão')
  }
  if (pieces.length === 3) {
    return pieces.filter((piece) => piece === 'Cavalo').length !== 2
  }
  return true
}

/**
 * Explains a draw that depends on material, or returns null for any other result.
 * "Insufficient material" means both sides cannot mate. The time-out draw is the side on the
 * move running out of time while the other side cannot mate. The clocks are not read: the API
 * keeps counting the time of the side on the move after the game has ended.
 */
export function explainMaterialDraw(source: MaterialSource): MaterialReport | null {
  let cause: MaterialDrawCause
  if (source.ending === MATERIAL_DRAW) {
    cause = { kind: 'material' }
  } else if (source.ending === TIME_OUT_DRAW) {
    cause = { kind: 'timeOut', sideId: source.sideOnMove }
  } else {
    return null
  }
  const sideMaterial = (sideId: SideId): SideMaterial => {
    const pieces = piecesLeft(source.cells, sideId)
    return { sideId, pieces, canCheckmate: canCheckmate(pieces) }
  }
  return { cause, sides: [sideMaterial(WHITE), sideMaterial(BLACK)] }
}
