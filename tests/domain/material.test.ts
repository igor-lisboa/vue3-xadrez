import { describe, expect, it } from 'vitest'
import type { EndingLabel, SimplifiedCell } from '@/api/types/enums'
import { explainMaterialDraw, piecesLeft } from '@/domain/material'

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

describe('explainMaterialDraw', () => {
  const kingsAndKnight: SimplifiedCell[] = ['Rei-0', 'Rei-1', 'Cavalo-1']
  const kingsAndRook: SimplifiedCell[] = ['Rei-0', 'Torre-0', 'Rei-1']

  it('explains nothing for another result', () => {
    expect(
      explainMaterialDraw({
        ending: 'Vitória: Branco',
        reason: null,
        cells: kingsAndKnight,
        sideOnMove: 0,
      }),
    ).toBeNull()
    expect(explainMaterialDraw({ ending: null, reason: null, cells: [], sideOnMove: 0 })).toBeNull()
  })

  it('blames the material when neither side can checkmate', () => {
    expect(
      explainMaterialDraw({
        ending: MATERIAL_DRAW,
        reason: null,
        cells: kingsAndKnight,
        sideOnMove: 1,
      }),
    ).toEqual({
      cause: { kind: 'material' },
      sides: [
        { sideId: 0, pieces: ['Rei'] },
        { sideId: 1, pieces: ['Rei', 'Cavalo'] },
      ],
    })
  })

  it('explains nothing for a resignation draw: the side that resigned may still have pieces', () => {
    expect(
      explainMaterialDraw({
        ending: MATERIAL_DRAW,
        reason: 'desistencia',
        cells: kingsAndKnight,
        sideOnMove: 0,
      }),
    ).toBeNull()
  })

  it('names the side that ran out of time in a time-out draw', () => {
    const report = explainMaterialDraw({
      ending: TIME_OUT_DRAW,
      reason: null,
      cells: kingsAndRook,
      sideOnMove: 1,
    })
    expect(report?.cause).toEqual({ kind: 'timeOut', sideId: 1 })
    expect(report?.sides.map((side) => side.pieces)).toEqual([['Rei', 'Torre'], ['Rei']])
  })

  it('never judges the material itself: king and two knights is listed as it is', () => {
    // The API decides which pieces can mate; the report only lists the pieces of its ending.
    const report = explainMaterialDraw({
      ending: TIME_OUT_DRAW,
      reason: null,
      cells: ['Rei-0', 'Cavalo-0', 'Cavalo-0', 'Rei-1'],
      sideOnMove: 1,
    })
    expect(report).toEqual({
      cause: { kind: 'timeOut', sideId: 1 },
      sides: [
        { sideId: 0, pieces: ['Rei', 'Cavalo', 'Cavalo'] },
        { sideId: 1, pieces: ['Rei'] },
      ],
    })
  })

  it.each<EndingLabel>([
    'Empate: Regra das 5 posições',
    'Empate: Regra 75 movimentos',
    'Empate: Posição morta',
  ])('explains nothing for the automatic draw %s', (ending) => {
    expect(
      explainMaterialDraw({ ending, reason: null, cells: kingsAndKnight, sideOnMove: 0 }),
    ).toBeNull()
  })
})
