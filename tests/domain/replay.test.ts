import { describe, expect, it } from 'vitest'
import { buildReplay, startingPosition } from '@/domain/replay'
import { boardAfter, cellAt, makeHistory, piece, played } from '../helpers/history'

describe('startingPosition', () => {
  const cells = startingPosition()

  it('has 64 squares and 32 pieces', () => {
    expect(cells).toHaveLength(64)
    expect(cells.filter((cell) => cell !== null)).toHaveLength(32)
  })

  it('puts the kings and queens on their files, with White at the bottom', () => {
    expect(cellAt(cells, 'E1')).toBe('Rei-0')
    expect(cellAt(cells, 'D1')).toBe('Rainha-0')
    expect(cellAt(cells, 'E8')).toBe('Rei-1')
    expect(cellAt(cells, 'D8')).toBe('Rainha-1')
    expect(cellAt(cells, 'A1')).toBe('Torre-0')
    expect(cellAt(cells, 'G8')).toBe('Cavalo-1')
  })

  it('has a pawn of each side on the second and seventh ranks', () => {
    expect(['A2', 'H2'].map((name) => cellAt(cells, name as 'A2' | 'H2'))).toEqual([
      'Peão-0',
      'Peão-0',
    ])
    expect(['A7', 'H7'].map((name) => cellAt(cells, name as 'A7' | 'H7'))).toEqual([
      'Peão-1',
      'Peão-1',
    ])
  })
})

describe('buildReplay', () => {
  it('replays a game with no moves as the starting position', () => {
    const replay = buildReplay(makeHistory([], startingPosition()))
    expect(replay).toEqual({ moves: [], positions: [startingPosition()], complete: true })
  })

  it('replays the fool’s mate, naming the piece of each move', () => {
    const history = makeHistory(
      [played(0, 'F2', 'F3'), played(1, 'E7', 'E5'), played(2, 'G2', 'G4'), played(3, 'D8', 'H4')],
      boardAfter({
        F2: null,
        F3: 'Peão-0',
        G2: null,
        G4: 'Peão-0',
        E7: null,
        E5: 'Peão-1',
        D8: null,
        H4: 'Rainha-1',
      }),
    )
    const replay = buildReplay(history)

    expect(replay.complete).toBe(true)
    expect(
      replay.moves.map(({ piece, from, to, sideId, number }) => [number, sideId, piece, from, to]),
    ).toEqual([
      [1, 0, 'Peão', 'F2', 'F3'],
      [1, 1, 'Peão', 'E7', 'E5'],
      [2, 0, 'Peão', 'G2', 'G4'],
      [2, 1, 'Rainha', 'D8', 'H4'],
    ])
    expect(replay.positions).toHaveLength(5)
    expect(replay.positions[0]).toEqual(startingPosition())
    expect(cellAt(replay.positions[2]!, 'E5')).toBe('Peão-1')
    expect(cellAt(replay.positions[2]!, 'E7')).toBeNull()
    expect(cellAt(replay.positions[3]!, 'G4')).toBe('Peão-0')
    expect(cellAt(replay.positions[3]!, 'H4')).toBeNull()
    expect(cellAt(replay.positions[4]!, 'H4')).toBe('Rainha-1')
  })

  it('orders the moves by the API’s turn count, not by the side that lists them', () => {
    const white = [played(2, 'G2', 'G4'), played(0, 'F2', 'F3')]
    const black = [played(3, 'D8', 'H4'), played(1, 'E7', 'E5')]
    const history = makeHistory(
      [],
      boardAfter({
        F2: null,
        F3: 'Peão-0',
        G2: null,
        G4: 'Peão-0',
        E7: null,
        E5: 'Peão-1',
        D8: null,
        H4: 'Rainha-1',
      }),
    )
    history.ladoBranco.jogadasRealizadas = white
    history.ladoPreto.jogadasRealizadas = black
    expect(buildReplay(history).moves.map((move) => move.to)).toEqual(['F3', 'E5', 'G4', 'H4'])
  })

  it('removes the captured piece and records what was captured', () => {
    const history = makeHistory(
      [
        played(0, 'E2', 'E4'),
        played(1, 'D7', 'D5'),
        played(2, 'E4', 'D5', { captured: piece('Peão', 1) }),
      ],
      boardAfter({ E2: null, D7: null, D5: 'Peão-0' }),
    )
    const replay = buildReplay(history)
    expect(replay.complete).toBe(true)
    expect(replay.moves[2]).toMatchObject({ captured: 'Peão', piece: 'Peão', to: 'D5' })
    expect(cellAt(replay.positions[3]!, 'D5')).toBe('Peão-0')
    expect(cellAt(replay.positions[3]!, 'E4')).toBeNull()
  })

  it('moves the rook when a king castles', () => {
    const history = makeHistory(
      [
        played(0, 'E2', 'E4'),
        played(1, 'E7', 'E5'),
        played(2, 'G1', 'F3'),
        played(3, 'B8', 'C6'),
        played(4, 'F1', 'C4'),
        played(5, 'F8', 'C5'),
        played(6, 'E1', 'G1', { name: 'Roque Menor', rook: ['H1', 'F1'] }),
      ],
      boardAfter({
        E2: null,
        E4: 'Peão-0',
        E7: null,
        E5: 'Peão-1',
        G1: 'Rei-0',
        E1: null,
        F1: 'Torre-0',
        H1: null,
        F3: 'Cavalo-0',
        B8: null,
        C6: 'Cavalo-1',
        C4: 'Bispo-0',
        F8: null,
        C5: 'Bispo-1',
      }),
    )
    const replay = buildReplay(history)
    expect(replay.complete).toBe(true)
    expect(replay.moves[6]).toMatchObject({ piece: 'Rei', moveName: 'Roque Menor' })
    const before = replay.positions[6]!
    const after = replay.positions[7]!
    expect([cellAt(before, 'H1'), cellAt(before, 'F1')]).toEqual(['Torre-0', null])
    expect([cellAt(after, 'H1'), cellAt(after, 'F1')]).toEqual([null, 'Torre-0'])
    expect([cellAt(after, 'E1'), cellAt(after, 'G1')]).toEqual([null, 'Rei-0'])
  })

  it('takes the pawn beside the capturing pawn in an en passant capture', () => {
    const history = makeHistory(
      [
        played(0, 'E2', 'E4'),
        played(1, 'A7', 'A6'),
        played(2, 'E4', 'E5'),
        played(3, 'D7', 'D5'),
        played(4, 'E5', 'D6', { name: 'En Passant', captured: piece('Peão', 1) }),
      ],
      boardAfter({ E2: null, A7: null, A6: 'Peão-1', D7: null, D6: 'Peão-0' }),
    )
    const replay = buildReplay(history)
    expect(replay.complete).toBe(true)
    expect(cellAt(replay.positions[4]!, 'D5')).toBe('Peão-1')
    expect(cellAt(replay.positions[5]!, 'D5')).toBeNull()
    expect(cellAt(replay.positions[5]!, 'D6')).toBe('Peão-0')
  })

  describe('promotion', () => {
    const promotion = (): ReturnType<typeof played> =>
      played(8, 'H7', 'G8', {
        name: 'Promoção do Peão',
        captured: piece('Torre', 1, [played(7, 'H8', 'G8')]),
      })
    const lead = [
      played(0, 'H2', 'H4'),
      played(1, 'G7', 'G5'),
      played(2, 'H4', 'G5', { captured: piece('Peão', 1) }),
      played(3, 'H7', 'H6'),
      played(4, 'G5', 'H6', { captured: piece('Peão', 1) }),
      played(5, 'G8', 'F6'),
      played(6, 'H6', 'H7'),
      played(7, 'H8', 'G8'),
    ]

    it('finds the new piece on the board, since it keeps the pawn’s moves', () => {
      const history = makeHistory(
        [...lead, promotion()],
        boardAfter({ H2: null, G7: null, H7: null, H8: null, F6: 'Cavalo-1', G8: 'Rainha-0' }),
        { G8: piece('Rainha', 0, [promotion()]) },
      )
      const replay = buildReplay(history)
      expect(replay.complete).toBe(true)
      expect(replay.moves[8]).toMatchObject({
        piece: 'Peão',
        promotedTo: 'Rainha',
        captured: 'Torre',
      })
      expect(cellAt(replay.positions[8]!, 'G8')).toBe('Torre-1')
      expect(cellAt(replay.positions[9]!, 'G8')).toBe('Rainha-0')
    })

    it('finds the new piece among the captured pieces when it was taken later', () => {
      const queen = piece('Rainha', 0, [promotion()])
      const history = makeHistory(
        [...lead, promotion(), played(9, 'F6', 'G8', { captured: queen })],
        boardAfter({ H2: null, G7: null, H7: null, H8: null, G8: 'Cavalo-1' }),
      )
      const replay = buildReplay(history)
      expect(replay.complete).toBe(true)
      expect(replay.moves[8]?.promotedTo).toBe('Rainha')
      expect(replay.moves[9]).toMatchObject({ piece: 'Cavalo', captured: 'Rainha' })
      expect(cellAt(replay.positions[10]!, 'G8')).toBe('Cavalo-1')
    })

    it('gives up when the new piece cannot be found', () => {
      const history = makeHistory(
        [...lead, promotion()],
        boardAfter({ H2: null, G7: null, H7: null, H8: null, F6: 'Cavalo-1', G8: 'Rainha-0' }),
      )
      expect(buildReplay(history).complete).toBe(false)
    })
  })

  describe('a game that cannot be replayed', () => {
    const finalOnly = boardAfter({ E2: null, E4: 'Peão-0' })

    it('keeps only the final position when a move starts from an empty square', () => {
      const replay = buildReplay(makeHistory([played(0, 'E3', 'E4')], finalOnly))
      expect(replay).toEqual({ moves: [], positions: [finalOnly], complete: false })
    })

    it('keeps only the final position when a side moves the other side’s piece', () => {
      const history = makeHistory([played(0, 'E7', 'E5')], boardAfter({ E7: null, E5: 'Peão-1' }))
      expect(buildReplay(history).complete).toBe(false)
    })

    it('keeps only the final position when the capture does not match the board', () => {
      const history = makeHistory(
        [played(0, 'E2', 'E4', { captured: piece('Cavalo', 1) })],
        finalOnly,
      )
      expect(buildReplay(history).complete).toBe(false)
    })

    it('keeps only the final position when the moves end elsewhere than the reported board', () => {
      const history = makeHistory([played(0, 'E2', 'E3')], finalOnly)
      const replay = buildReplay(history)
      expect(replay.complete).toBe(false)
      expect(replay.positions).toEqual([finalOnly])
    })

    it('fails on a castling whose rook is missing', () => {
      const history = makeHistory(
        [played(0, 'E2', 'E4', { name: 'Roque Menor', rook: ['F5', 'F6'] })],
        finalOnly,
      )
      expect(buildReplay(history).complete).toBe(false)
    })
  })
})
