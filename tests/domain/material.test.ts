import { describe, expect, it } from 'vitest'
import type { PieceName, SimplifiedCell } from '@/api/types/enums'
import { canCheckmate, explainMaterialDraw, piecesLeft } from '@/domain/material'

const MATERIAL_DRAW = 'Empate: Insuficiência material'
const TIME_OUT_DRAW = 'Empate: Tempo esgotado sem material'

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
  // Only a bare king, king and bishop, king and knight, and king and two knights cannot mate.
  it.each<[PieceName[], boolean]>([
    [['Rei'], false],
    [['Rei', 'Bispo'], false],
    [['Rei', 'Cavalo'], false],
    [['Rei', 'Rainha'], true],
    [['Rei', 'Torre'], true],
    [['Rei', 'Peão'], true],
    [['Rei', 'Cavalo', 'Cavalo'], false],
    [['Rei', 'Torre', 'Torre'], true],
    [['Rei', 'Rainha', 'Cavalo'], true],
    [['Rei', 'Torre', 'Bispo'], true],
    [['Rei', 'Peão', 'Peão'], true],
    [['Rei', 'Bispo', 'Bispo'], true],
    [['Rei', 'Bispo', 'Cavalo'], true],
    [['Rei', 'Cavalo', 'Cavalo', 'Cavalo'], true],
  ])('%j can checkmate: %s', (pieces, expected) => {
    expect(canCheckmate(pieces)).toBe(expected)
  })
})

describe('explainMaterialDraw', () => {
  const kingsAndKnight: SimplifiedCell[] = ['Rei-0', 'Rei-1', 'Cavalo-1']
  const kingsAndRook: SimplifiedCell[] = ['Rei-0', 'Torre-0', 'Rei-1']

  it('explains nothing for another result', () => {
    expect(
      explainMaterialDraw({ ending: 'Vitória: Branco', cells: kingsAndKnight, sideOnMove: 0 }),
    ).toBeNull()
    expect(explainMaterialDraw({ ending: null, cells: [], sideOnMove: 0 })).toBeNull()
  })

  it('blames the material when neither side can checkmate', () => {
    expect(
      explainMaterialDraw({ ending: MATERIAL_DRAW, cells: kingsAndKnight, sideOnMove: 1 }),
    ).toEqual({
      cause: { kind: 'material' },
      sides: [
        { sideId: 0, pieces: ['Rei'], canCheckmate: false },
        { sideId: 1, pieces: ['Rei', 'Cavalo'], canCheckmate: false },
      ],
    })
  })

  it('names the side that ran out of time in a time-out draw', () => {
    const report = explainMaterialDraw({
      ending: TIME_OUT_DRAW,
      cells: kingsAndRook,
      sideOnMove: 1,
    })
    expect(report?.cause).toEqual({ kind: 'timeOut', sideId: 1 })
    expect(report?.sides.map((side) => side.canCheckmate)).toEqual([true, false])
  })

  it('reports the pieces of the time-out draw even when the side that ran out cannot mate', () => {
    const report = explainMaterialDraw({
      ending: TIME_OUT_DRAW,
      cells: ['Rei-0', 'Bispo-0', 'Rei-1'],
      sideOnMove: 0,
    })
    expect(report?.cause).toEqual({ kind: 'timeOut', sideId: 0 })
    expect(report?.sides.map((side) => side.canCheckmate)).toEqual([false, false])
  })
})
