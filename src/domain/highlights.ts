import type { PossibleMove } from '@/api/types/move'
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
