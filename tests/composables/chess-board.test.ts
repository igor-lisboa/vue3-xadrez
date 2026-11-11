import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { listPossibleMoves, makeMove } from '@/api/services/moves'
import type { PossibleMove } from '@/api/types/move'
import type { SimplifiedCell } from '@/api/types/enums'
import { useChessBoard } from '@/composables/useChessBoard'
import { notify } from '@/services/dialogs'
import { makeSummary, pieceTypes, squares, emptyRows } from '../helpers/fixtures'
import { runComposable } from '../helpers/run-composable'

vi.mock('@/api/services/moves', () => ({
  listPossibleMoves: vi.fn(),
  makeMove: vi.fn(),
  promotePawn: vi.fn(),
}))
vi.mock('@/services/dialogs', () => ({ notify: vi.fn(), askText: vi.fn() }))

/** A move from E2 (index 52 in the white view) to E4 (index 36). */
const toE4: PossibleMove = {
  casaOrigem: { casa: 'E2', linha: 6, coluna: 4 },
  casaDestino: { casa: 'E4', linha: 4, coluna: 4 },
  nome: 'Primeiro Movimento Peão',
  peca: 'Rei',
  captura: false,
  capturavel: false,
}

const indexOf = (name: string) => squares.findIndex((square) => square.casa === name)

function setup(rows = emptyRows()) {
  const summary = ref(makeSummary({ tabuleiro: rows }))
  const squaresRef = ref(squares)
  const piecesRef = ref(pieceTypes)
  const onMoveAttempted = vi.fn(async () => undefined)
  const { result, unmount } = runComposable(() =>
    useChessBoard({
      gameId: 7,
      sideId: 0,
      summary,
      squares: squaresRef,
      pieces: piecesRef,
      onMoveAttempted,
    }),
  )
  return { summary, squaresRef, piecesRef, onMoveAttempted, result, unmount }
}

beforeEach(() => vi.clearAllMocks())

describe('useChessBoard', () => {
  it('builds the squares from the summary', () => {
    const rows: (SimplifiedCell | null)[][] = emptyRows()
    rows[7]![4] = 'Rei-0'
    const { result, unmount } = setup(rows)
    expect(result.houses.value).toHaveLength(64)
    expect(result.houses.value[60]?.piece?.name).toBe('Rei')
    unmount()
  })

  it('is empty until the squares and the summary are loaded', async () => {
    const { result, summary, squaresRef, unmount } = setup()
    squaresRef.value = []
    summary.value = makeSummary()
    await nextTick()
    expect(result.houses.value).toEqual([])
    unmount()
  })

  it('shows the legal moves of a selected piece', async () => {
    vi.mocked(listPossibleMoves).mockResolvedValue([toE4])
    const { result, unmount } = setup()
    await result.selectHouse(indexOf('E2'))
    expect(listPossibleMoves).toHaveBeenCalledWith(7, 0, 'E2')
    expect(result.houses.value[indexOf('E2')]?.movementOrigin).toBe(true)
    expect(result.houses.value[indexOf('E4')]).toMatchObject({
      possibleMovement: true,
      captures: false,
    })
    unmount()
  })

  it('selects a piece with no legal move without highlighting any destination', async () => {
    vi.mocked(listPossibleMoves).mockResolvedValue([])
    const { result, unmount } = setup()
    await result.selectHouse(indexOf('E2'))
    expect(result.houses.value[indexOf('E2')]?.movementOrigin).toBe(true)
    expect(result.houses.value.some((house) => house.possibleMovement)).toBe(false)
    unmount()
  })

  it('plays the move when a highlighted square is clicked', async () => {
    vi.mocked(listPossibleMoves).mockResolvedValue([toE4])
    vi.mocked(makeMove).mockResolvedValue(undefined)
    const { result, onMoveAttempted, unmount } = setup()
    await result.selectHouse(indexOf('E2'))
    await result.selectHouse(indexOf('E4'))
    expect(makeMove).toHaveBeenCalledWith(7, 0, 'E2', 'E4')
    expect(onMoveAttempted).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('sends the move through the caller when it gives its own way to play', async () => {
    vi.mocked(listPossibleMoves).mockResolvedValue([toE4])
    const playMove = vi.fn(async () => undefined)
    const summary = ref(makeSummary())
    const onMoveAttempted = vi.fn(async () => undefined)
    const { result, unmount } = runComposable(() =>
      useChessBoard({
        gameId: 7,
        sideId: 0,
        summary,
        squares: ref(squares),
        pieces: ref(pieceTypes),
        onMoveAttempted,
        playMove,
      }),
    )
    await result.selectHouse(indexOf('E2'))
    await result.selectHouse(indexOf('E4'))
    expect(playMove).toHaveBeenCalledWith('E2', 'E4')
    expect(makeMove).not.toHaveBeenCalled()
    expect(onMoveAttempted).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('still reloads the game when the move is refused', async () => {
    vi.mocked(listPossibleMoves).mockResolvedValue([toE4])
    vi.mocked(makeMove).mockRejectedValue(new Error('illegal'))
    const { result, onMoveAttempted, unmount } = setup()
    await result.selectHouse(indexOf('E2'))
    await result.selectHouse(indexOf('E4'))
    expect(notify).toHaveBeenCalled()
    expect(onMoveAttempted).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('selects another piece when the clicked square is not a destination', async () => {
    vi.mocked(listPossibleMoves).mockResolvedValueOnce([toE4]).mockResolvedValueOnce([])
    const { result, unmount } = setup()
    await result.selectHouse(indexOf('E2'))
    await result.selectHouse(indexOf('A1'))
    expect(listPossibleMoves).toHaveBeenLastCalledWith(7, 0, 'A1')
    expect(result.houses.value[indexOf('E2')]?.movementOrigin).toBe(false)
    expect(result.houses.value[indexOf('A1')]?.movementOrigin).toBe(true)
    unmount()
  })

  it('does not select anything when the moves cannot be loaded', async () => {
    vi.mocked(listPossibleMoves).mockRejectedValue(new Error('down'))
    const { result, unmount } = setup()
    await result.selectHouse(indexOf('E2'))
    expect(result.houses.value.some((house) => house.movementOrigin)).toBe(false)
    unmount()
  })

  it('ignores clicks on an index that is not on the board', async () => {
    const { result, unmount } = setup()
    await result.selectHouse(99)
    expect(listPossibleMoves).not.toHaveBeenCalled()
    unmount()
  })
})
