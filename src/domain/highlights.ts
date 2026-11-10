import type { PossibleMove } from '@/api/types/move'
import type { HistoryMove } from './replay'
import type { BoardHouse } from './types'

/** Removes the origin and destination marks from every square. */
export function clearHighlights(houses: readonly BoardHouse[]): BoardHouse[] {
  return houses.map((house) => ({
    ...house,
    movementOrigin: false,
    possibleMovement: false,
    captures: false,
    movementName: null,
  }))
}

export function markOrigin(houses: readonly BoardHouse[], index: number): BoardHouse[] {
  return houses.map((house, position) =>
    position === index ? { ...house, movementOrigin: true } : house,
  )
}

/**
 * Shows a move that was already played, with the colours of a move being chosen: the square it
 * left in yellow and the square it reached in green, or red when it captured a piece.
 */
export function markPlayedMove(
  houses: readonly BoardHouse[],
  move: Pick<HistoryMove, 'from' | 'to' | 'captured' | 'moveName'>,
): BoardHouse[] {
  return houses.map((house) => {
    if (house.house === move.from) {
      return { ...house, movementOrigin: true }
    }
    if (house.house === move.to) {
      return {
        ...house,
        possibleMovement: true,
        captures: move.captured !== null,
        movementName: move.moveName,
      }
    }
    return house
  })
}

/** Marks the destinations of the legal moves. When two moves share a destination, the last one wins. */
export function markPossibleMoves(
  houses: readonly BoardHouse[],
  moves: readonly PossibleMove[],
): BoardHouse[] {
  const movesByDestination = new Map(moves.map((move) => [move.casaDestino.casa, move]))
  return houses.map((house) => {
    const move = movesByDestination.get(house.house)
    if (!move) {
      return house
    }
    return {
      ...house,
      possibleMovement: true,
      captures: move.captura,
      movementName: move.nome,
    }
  })
}
