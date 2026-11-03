import type { BoardHouse } from '@/domain/types'

/** CSS classes of one square, from its state. */
export function boardHouseClasses(house: BoardHouse): string[] {
  return [
    'board-house',
    `house-${house.color}`,
    house.inCheck && 'house-check',
    house.movementOrigin && 'house-origin',
    house.possibleMovement && 'house-move',
    house.captures && 'house-capture',
  ].filter((className): className is string => Boolean(className))
}
