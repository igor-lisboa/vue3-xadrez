import { describe, expect, it } from 'vitest'
import type { PieceName, SimplifiedCell } from '@/api/types/enums'
import { canCheckmate, explainInsufficientMaterial, piecesLeft } from '@/domain/material'

const DRAW = 'Empate: Insuficiência material'

describe('piecesLeft', () => {
  it('lists the pieces of one side, the king first and the pawns last', () => {
    const cells: (SimplifiedCell | null)[] = [
      'Peão-0',
      null,
      'Cavalo-0',
      'Rei-1',
      'Rei-0',
      'Rainha-0',
    ]
    expect(piecesLeft(cells, 0)).toEqual(['Rei', 'Rainha', 'Cavalo', 'Peão'])
    expect(piecesLeft(cells, 1)).toEqual(['Rei'])
  })
})

describe('canCheckmate', () => {
  it.each<[PieceName[], boolean]>([
    [['Rei'], false],
    [['Rei', 'Bispo'], false],
    [['Rei', 'Cavalo'], false],
    [['Rei', 'Rainha'], true],
    [['Rei', 'Torre'], true],
    [['Rei', 'Peão'], true],
    [['Rei', 'Cavalo', 'Cavalo'], false],
    // The API's rule as it is: three pieces count only as two bishops or a bishop and a knight.
    [['Rei', 'Torre', 'Torre'], false],
    [['Rei', 'Bispo', 'Bispo'], true],
    [['Rei', 'Bispo', 'Cavalo'], true],
    [['Rei', 'Cavalo', 'Cavalo', 'Cavalo'], true],
  ])('%j can checkmate: %s', (pieces, expected) => {
    expect(canCheckmate(pieces)).toBe(expected)
  })
})

describe('explainInsufficientMaterial', () => {
  const kingsAndKnight: SimplifiedCell[] = ['Rei-0', 'Rei-1', 'Cavalo-1']
  const kingsAndRook: SimplifiedCell[] = ['Rei-0', 'Torre-0', 'Rei-1']

  it('explains nothing for another result', () => {
    expect(
      explainInsufficientMaterial({
        ending: 'Vitória: Branco',
        cells: kingsAndKnight,
        sideOnMove: 0,
        timeLimitMs: 300_000,
      }),
    ).toBeNull()
    expect(
      explainInsufficientMaterial({ ending: null, cells: [], sideOnMove: 0, timeLimitMs: -1 }),
    ).toBeNull()
  })

  it('blames the material when neither side can checkmate', () => {
    expect(
      explainInsufficientMaterial({
        ending: DRAW,
        cells: kingsAndKnight,
        sideOnMove: 1,
        timeLimitMs: 300_000,
      }),
    ).toEqual({
      cause: { kind: 'material' },
      sides: [
        { sideId: 0, pieces: ['Rei'], canCheckmate: false },
        { sideId: 1, pieces: ['Rei', 'Cavalo'], canCheckmate: false },
      ],
    })
  })

  it('blames the clock of the side on the move when a side could still checkmate', () => {
    const report = explainInsufficientMaterial({
      ending: DRAW,
      cells: kingsAndRook,
      sideOnMove: 1,
      timeLimitMs: 300_000,
    })
    expect(report?.cause).toEqual({ kind: 'timeOut', sideId: 1 })
    expect(report?.sides.map((side) => side.canCheckmate)).toEqual([true, false])
  })

  it('never blames the clock of a game without one', () => {
    const report = explainInsufficientMaterial({
      ending: DRAW,
      cells: kingsAndRook,
      sideOnMove: 1,
      timeLimitMs: -1,
    })
    expect(report?.cause).toEqual({ kind: 'material' })
  })
})
