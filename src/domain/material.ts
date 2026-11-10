import type { EndingLabel, PieceName, SideId, SimplifiedCell } from '@/api/types/enums'
import { BLACK, NO_TIME_LIMIT, WHITE } from './constants'
import { pieceNameOf, sideOf } from './replay'

/** The only result the material details explain. */
const INSUFFICIENT_MATERIAL_ENDING: EndingLabel = 'Empate: Insuficiência material'

/** Order of the pieces in a side's list: the king first, the pawns last. */
const PIECE_ORDER: readonly PieceName[] = ['Rei', 'Rainha', 'Torre', 'Bispo', 'Cavalo', 'Peão']

interface SideMaterial {
  sideId: SideId
  pieces: PieceName[]
  canCheckmate: boolean
}

/** Why the API called an insufficient-material draw. */
type InsufficientMaterialCause = { kind: 'material' } | { kind: 'timeOut'; sideId: SideId }

export interface MaterialReport {
  cause: InsufficientMaterialCause
  /** White first, then Black. */
  sides: [SideMaterial, SideMaterial]
}

/** The facts of the game the report is built from. */
interface MaterialSource {
  ending: EndingLabel | null
  /** The final board, in any order. */
  cells: readonly (SimplifiedCell | null)[]
  sideOnMove: SideId
  timeLimitMs: number
}

/** The pieces a side has on the board, the king first. */
export function piecesLeft(cells: readonly (SimplifiedCell | null)[], sideId: SideId): PieceName[] {
  return cells
    .filter((cell): cell is SimplifiedCell => cell !== null && sideOf(cell) === sideId)
    .map(pieceNameOf)
    .sort((a, b) => PIECE_ORDER.indexOf(a) - PIECE_ORDER.indexOf(b))
}

/**
 * Whether these pieces can still give checkmate. Repeats the API's rule as it is, including
 * its gaps (three pieces count only as two bishops or a bishop and a knight)
 * (`hasMinimumMaterial` in the backend's `src/domain/rules/material.ts`) so the screen can
 * explain a result; it never decides one.
 */
export function canCheckmate(pieces: readonly PieceName[]): boolean {
  const count = (name: PieceName) => pieces.filter((piece) => piece === name).length
  if (pieces.length < 2) {
    return false
  }
  if (pieces.length === 2) {
    return pieces.some((piece) => piece === 'Rainha' || piece === 'Torre' || piece === 'Peão')
  }
  if (pieces.length === 3) {
    const bishops = count('Bispo')
    return bishops === 2 || (bishops > 0 && count('Cavalo') > 0)
  }
  return true
}

/**
 * Explains an insufficient-material draw, or returns null for any other result.
 * The API also gives this result when the side on the move runs out of time, so when one side
 * could still checkmate, the draw came from the clock. The clocks themselves are not read: the
 * API keeps counting the time of the side on the move after the game has ended.
 */
export function explainInsufficientMaterial(source: MaterialSource): MaterialReport | null {
  if (source.ending !== INSUFFICIENT_MATERIAL_ENDING) {
    return null
  }
  const sideMaterial = (sideId: SideId): SideMaterial => {
    const pieces = piecesLeft(source.cells, sideId)
    return { sideId, pieces, canCheckmate: canCheckmate(pieces) }
  }
  const sides: [SideMaterial, SideMaterial] = [sideMaterial(WHITE), sideMaterial(BLACK)]
  const anySideCanCheckmate = sides.some((side) => side.canCheckmate)
  const cause: InsufficientMaterialCause =
    anySideCanCheckmate && source.timeLimitMs !== NO_TIME_LIMIT
      ? { kind: 'timeOut', sideId: source.sideOnMove }
      : { kind: 'material' }
  return { cause, sides }
}
