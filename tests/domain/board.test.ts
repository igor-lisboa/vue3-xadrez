import { describe, expect, it } from 'vitest'
import { createBoardHouses, parsePiece, squareColor } from '@/domain/board'
import type { SimplifiedCell } from '@/api/types/enums'
import { pieceTypes, squares } from '../helpers/fixtures'

describe('parsePiece', () => {
  it('reads the name and side of a white piece', () => {
    expect(parsePiece('Rei-0', pieceTypes)).toEqual({ name: 'Rei', sideId: 0 })
  })

  it('reads the name and side of a black piece', () => {
    expect(parsePiece('Torre-1', pieceTypes)).toEqual({ name: 'Torre', sideId: 1 })
  })

  it('returns null for a piece that is not in the catalogue', () => {
    expect(parsePiece('Dama-0' as SimplifiedCell, pieceTypes)).toBeNull()
  })
})

describe('squareColor', () => {
  it('alternates colors along rows and columns', () => {
    expect(squareColor(0)).toBe('white')
    expect(squareColor(1)).toBe('black')
    expect(squareColor(8)).toBe('black')
    expect(squareColor(9)).toBe('white')
  })
})

describe('createBoardHouses', () => {
  it('maps cells to squares, pieces and colors', () => {
    const houses = createBoardHouses(['Rei-0', null], squares, pieceTypes, null)
    expect(houses[0]).toMatchObject({
      house: 'A8',
      color: 'white',
      piece: { name: 'Rei', sideId: 0 },
      inCheck: false,
    })
    expect(houses[1]).toMatchObject({ house: 'B8', color: 'black', piece: null })
  })

  it('marks the king of the side in check', () => {
    const houses = createBoardHouses(['Rei-0', 'Rei-1'], squares, pieceTypes, 0)
    expect(houses[0]?.inCheck).toBe(true)
    expect(houses[1]?.inCheck).toBe(false)
  })

  it('falls back to A1 when there is no square for a cell', () => {
    const houses = createBoardHouses([null], [], pieceTypes, null)
    expect(houses[0]?.house).toBe('A1')
  })
})
