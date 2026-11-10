import { describe, expect, it } from 'vitest'
import { markPlayedMove } from '@/domain/highlights'
import { createBoardHouses } from '@/domain/board'
import { describeMove, pairMoves } from '@/domain/move-text'
import type { HistoryMove } from '@/domain/replay'
import { en } from '@/i18n/messages/en'
import { pt } from '@/i18n/messages/pt'
import { pieceTypes, squares } from '../helpers/fixtures'

function move(overrides: Partial<HistoryMove> = {}): HistoryMove {
  return {
    index: 0,
    number: 1,
    sideId: 0,
    piece: 'Peão',
    from: 'E2',
    to: 'E4',
    captured: null,
    moveName: null,
    promotedTo: null,
    ...overrides,
  }
}

const describeInEnglish = (value: HistoryMove) =>
  describeMove(value, en.labels.pieces, en.labels.moves)

describe('describeMove', () => {
  it('shows the piece and the two squares', () => {
    expect(describeInEnglish(move())).toBe('Pawn E2 → E4')
  })

  it('uses a cross for a capture', () => {
    expect(
      describeInEnglish(move({ piece: 'Cavalo', from: 'G1', to: 'F3', captured: 'Peão' })),
    ).toBe('Knight G1 × F3')
  })

  it('adds the chosen piece of a promotion', () => {
    expect(describeInEnglish(move({ from: 'E7', to: 'E8', promotedTo: 'Rainha' }))).toBe(
      'Pawn E7 → E8 = Queen',
    )
  })

  it('names castling and en passant, but not plain special moves', () => {
    expect(describeInEnglish(move({ piece: 'Rei', to: 'G1', moveName: 'Roque Menor' }))).toBe(
      'King E2 → G1 (Short castling)',
    )
    expect(describeInEnglish(move({ captured: 'Peão', moveName: 'En Passant' }))).toBe(
      'Pawn E2 × E4 (En passant)',
    )
    expect(describeInEnglish(move({ moveName: 'Primeiro Movimento Peão' }))).toBe('Pawn E2 → E4')
    expect(describeInEnglish(move({ piece: 'Cavalo', moveName: 'L' }))).toBe('Knight E2 → E4')
  })

  it('uses the names of the language it is given', () => {
    expect(describeMove(move({ piece: 'Rainha' }), pt.labels.pieces, pt.labels.moves)).toBe(
      `${pt.labels.pieces.Rainha} E2 → E4`,
    )
  })
})

describe('pairMoves', () => {
  it('puts White’s move and Black’s answer on one row', () => {
    const moves = [
      move({ index: 0, number: 1, sideId: 0 }),
      move({ index: 1, number: 1, sideId: 1 }),
      move({ index: 2, number: 2, sideId: 0 }),
    ]
    const pairs = pairMoves(moves)
    expect(pairs.map((pair) => [pair.number, pair.white?.index, pair.black?.index])).toEqual([
      [1, 0, 1],
      [2, 2, undefined],
    ])
  })

  it('has no rows for no moves', () => {
    expect(pairMoves([])).toEqual([])
  })
})

describe('markPlayedMove', () => {
  const houses = () =>
    createBoardHouses(
      squares.map(() => null),
      squares,
      pieceTypes,
      null,
    )
  const find = (marked: ReturnType<typeof houses>, name: string) =>
    marked.find((house) => house.house === name)

  it('marks the square the piece left and the square it reached', () => {
    const marked = markPlayedMove(houses(), move({ moveName: 'Primeiro Movimento Peão' }))
    expect(find(marked, 'E2')).toMatchObject({ movementOrigin: true, possibleMovement: false })
    expect(find(marked, 'E4')).toMatchObject({
      possibleMovement: true,
      captures: false,
      movementName: 'Primeiro Movimento Peão',
    })
    expect(marked.filter((house) => house.movementOrigin || house.possibleMovement)).toHaveLength(2)
  })

  it('shows a capture in the capture colour', () => {
    const marked = markPlayedMove(houses(), move({ captured: 'Peão' }))
    expect(find(marked, 'E4')?.captures).toBe(true)
  })
})
