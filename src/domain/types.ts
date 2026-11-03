import type { PieceName, SideId, SquareName, MoveName } from '@/api/types/enums'

export type BoardColor = 'white' | 'black'

export interface BoardPiece {
  name: PieceName
  sideId: SideId
}

/** One square of the board as the view needs it. */
export interface BoardHouse {
  house: SquareName
  color: BoardColor
  piece: BoardPiece | null
  /** The king of the side on turn, when that side is in check. */
  inCheck: boolean
  /** The piece on this square was selected to move. */
  movementOrigin: boolean
  /** The selected piece can move here. */
  possibleMovement: boolean
  /** The move to this square captures a piece. */
  captures: boolean
  movementName: MoveName
}
