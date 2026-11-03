import type { PieceType, Square } from '@/api/types/catalogue'
import type { PieceName, SideId, SimplifiedCell } from '@/api/types/enums'
import { WHITE } from './constants'
import type { BoardHouse, BoardPiece } from './types'

const BOARD_SIZE = 8

/** Reads a "Rei-0" style cell. Returns null when the piece is not in the catalogue. */
export function parsePiece(cell: SimplifiedCell, pieces: readonly PieceType[]): BoardPiece | null {
  const [name, side] = cell.split('-') as [PieceName, string]
  const piece = pieces.find((item) => item.nome === name)
  if (!piece) {
    return null
  }
  const sideId: SideId = side === '0' ? WHITE : 1
  return { name, sideId }
}

/** Light squares are where row and column have the same parity. */
export function squareColor(index: number): BoardHouse['color'] {
  const row = Math.floor(index / BOARD_SIZE)
  const column = index % BOARD_SIZE
  return (row + column) % 2 === 0 ? 'white' : 'black'
}

/**
 * Builds the board squares from the cells and squares, both already oriented for the player.
 * `checkedSideId` is the side on turn when it is in check, otherwise null.
 */
export function createBoardHouses(
  cells: readonly (SimplifiedCell | null)[],
  squares: readonly Square[],
  pieces: readonly PieceType[],
  checkedSideId: SideId | null,
): BoardHouse[] {
  return cells.map((cell, index) => {
    const piece = cell === null ? null : parsePiece(cell, pieces)
    return {
      house: squares[index]?.casa ?? 'A1',
      color: squareColor(index),
      piece,
      inCheck: piece?.name === 'Rei' && piece.sideId === checkedSideId,
      movementOrigin: false,
      possibleMovement: false,
      captures: false,
      movementName: null,
    }
  })
}
