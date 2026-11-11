import { describe, expect, it } from 'vitest'
import { clearHighlights, markOrigin, markPossibleMoves } from '@/domain/highlights'
import { createBoardHouses } from '@/domain/board'
import type { MoveName, SquareName } from '@/api/types/enums'
import type { PossibleMove } from '@/api/types/move'
import { pieceTypes, squares } from '../helpers/fixtures'

const houses = () => createBoardHouses(['Rei-0', null, null], squares, pieceTypes, null)

function move(destination: SquareName, captura: boolean, nome: MoveName): PossibleMove {
  return {
    casaOrigem: squares[0]!,
    casaDestino: { casa: destination, linha: 0, coluna: 1 },
    nome,
    peca: 'Rei',
    captura,
    capturavel: false,
  }
}

describe('highlights', () => {
  it('marks the origin square', () => {
    expect(markOrigin(houses(), 0)[0]?.movementOrigin).toBe(true)
  })

  it('marks destinations with capture and move name', () => {
    const marked = markPossibleMoves(houses(), [move('B8', true, 'Roque Menor')])
    expect(marked[1]).toMatchObject({
      possibleMovement: true,
      captures: true,
      movementName: 'Roque Menor',
    })
    expect(marked[2]?.possibleMovement).toBe(false)
  })

  it('keeps the last move when two share a destination', () => {
    const marked = markPossibleMoves(houses(), [move('B8', true, null), move('B8', false, 'L')])
    expect(marked[1]).toMatchObject({ captures: false, movementName: 'L' })
  })

  it('marks no destination when the piece has no legal move (stalemate, checkmate or pinned)', () => {
    const board = houses()
    expect(markPossibleMoves(board, [])).toEqual(board)
  })

  it('clears every highlight', () => {
    const marked = markOrigin(markPossibleMoves(houses(), [move('B8', true, 'L')]), 0)
    const cleared = clearHighlights(marked)
    expect(
      cleared.every((house) => !house.movementOrigin && !house.possibleMovement && !house.captures),
    ).toBe(true)
    expect(cleared[1]?.movementName).toBeNull()
  })
})
