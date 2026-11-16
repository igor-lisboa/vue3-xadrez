import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { listSidePossibleMoves, makeMove } from '@/api/services/moves'
import type { PossibleMove } from '@/api/types/move'
import type { SimplifiedCell } from '@/api/types/enums'
import { useChessBoard } from '@/composables/useChessBoard'
import { notify } from '@/services/dialogs'
import { makeSummary, pieceTypes, squares, emptyRows } from '../helpers/fixtures'
import { runComposable } from '../helpers/run-composable'

vi.mock('@/api/services/moves', () => ({
  listSidePossibleMoves: vi.fn(),
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

function setup(rows = emptyRows(), initialSummary = makeSummary({ tabuleiro: rows })) {
  const summary = ref(initialSummary)
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

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(listSidePossibleMoves).mockResolvedValue([])
})

const settle = async () => {
  await flushPromises()
  await flushPromises()
}

describe('useChessBoard', () => {
  it('loads moves only when this side is active and the game is running', async () => {
    const waiting = makeSummary({ ladoIdAtual: 1 })
    const { result, summary, unmount } = setup(emptyRows(), waiting)
    await settle()
    expect(listSidePossibleMoves).not.toHaveBeenCalled()
    expect(result.movesReady.value).toBe(false)

    summary.value = makeSummary()
    await settle()
    expect(listSidePossibleMoves).toHaveBeenCalledTimes(1)
    expect(result.movesReady.value).toBe(true)

    summary.value = makeSummary({ finalizado: 'Empate: Rei afogado' })
    await settle()
    expect(result.movesReady.value).toBe(false)
    expect(listSidePossibleMoves).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('does not enable selection while the legal move request is pending', async () => {
    let resolveMoves!: (moves: PossibleMove[]) => void
    vi.mocked(listSidePossibleMoves).mockReturnValue(
      new Promise((resolve) => {
        resolveMoves = resolve
      }),
    )
    const { result, unmount } = setup()
    await nextTick()

    expect(result.movesReady.value).toBe(false)
    await result.selectHouse(indexOf('E2'))
    expect(result.houses.value[indexOf('E2')]?.movementOrigin).toBe(false)

    resolveMoves([toE4])
    await settle()
    expect(result.movesReady.value).toBe(true)
    unmount()
  })

  it('ignores a successful response from a turn that has already passed', async () => {
    let resolveMoves!: (moves: PossibleMove[]) => void
    vi.mocked(listSidePossibleMoves).mockReturnValue(
      new Promise((resolve) => {
        resolveMoves = resolve
      }),
    )
    const { result, summary, unmount } = setup()
    await nextTick()
    summary.value = makeSummary({ ladoIdAtual: 1 })
    await nextTick()

    resolveMoves([toE4])
    await settle()
    expect(result.movesReady.value).toBe(false)
    unmount()
  })

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

  it('shows the cached legal moves of a selected piece', async () => {
    vi.mocked(listSidePossibleMoves).mockResolvedValue([toE4])
    const { result, unmount } = setup()
    await settle()
    await result.selectHouse(indexOf('E2'))
    expect(listSidePossibleMoves).toHaveBeenCalledWith(7, 0)
    expect(result.houses.value[indexOf('E2')]?.movementOrigin).toBe(true)
    expect(result.houses.value[indexOf('E4')]).toMatchObject({
      possibleMovement: true,
      captures: false,
    })
    unmount()
  })

  it('selects a piece with no legal move without highlighting any destination', async () => {
    vi.mocked(listSidePossibleMoves).mockResolvedValue([])
    const { result, unmount } = setup()
    await settle()
    await result.selectHouse(indexOf('E2'))
    expect(result.houses.value[indexOf('E2')]?.movementOrigin).toBe(true)
    expect(result.houses.value.some((house) => house.possibleMovement)).toBe(false)
    unmount()
  })

  it('plays the move when a highlighted square is clicked', async () => {
    vi.mocked(listSidePossibleMoves).mockResolvedValue([toE4])
    vi.mocked(makeMove).mockResolvedValue(undefined)
    const { result, onMoveAttempted, unmount } = setup()
    await settle()
    await result.selectHouse(indexOf('E2'))
    await result.selectHouse(indexOf('E4'))
    expect(makeMove).toHaveBeenCalledWith(7, 0, 'E2', 'E4')
    expect(onMoveAttempted).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('sends the move through the caller when it gives its own way to play', async () => {
    vi.mocked(listSidePossibleMoves).mockResolvedValue([toE4])
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
    await settle()
    await result.selectHouse(indexOf('E2'))
    await result.selectHouse(indexOf('E4'))
    expect(playMove).toHaveBeenCalledWith('E2', 'E4')
    expect(makeMove).not.toHaveBeenCalled()
    expect(onMoveAttempted).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('still reloads the game when the move is refused', async () => {
    vi.mocked(listSidePossibleMoves).mockResolvedValue([toE4])
    vi.mocked(makeMove).mockRejectedValue(new Error('illegal'))
    const { result, onMoveAttempted, unmount } = setup()
    await settle()
    await result.selectHouse(indexOf('E2'))
    await result.selectHouse(indexOf('E4'))
    expect(notify).toHaveBeenCalled()
    expect(onMoveAttempted).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('selects another piece when the clicked square is not a destination', async () => {
    vi.mocked(listSidePossibleMoves).mockResolvedValue([toE4])
    const { result, unmount } = setup()
    await settle()
    await result.selectHouse(indexOf('E2'))
    await result.selectHouse(indexOf('A1'))
    expect(listSidePossibleMoves).toHaveBeenCalledTimes(1)
    expect(result.houses.value[indexOf('E2')]?.movementOrigin).toBe(false)
    expect(result.houses.value[indexOf('A1')]?.movementOrigin).toBe(true)
    unmount()
  })

  it('does not select anything when the moves cannot be loaded', async () => {
    vi.mocked(listSidePossibleMoves).mockRejectedValue(new Error('down'))
    const { result, unmount } = setup()
    await settle()
    expect(notify).toHaveBeenCalled()
    expect(result.movesReady.value).toBe(false)
    await result.selectHouse(indexOf('E2'))
    expect(result.houses.value.some((house) => house.movementOrigin)).toBe(false)
    unmount()
  })

  it('ignores clicks on an index that is not on the board', async () => {
    const { result, unmount } = setup()
    await result.selectHouse(99)
    expect(listSidePossibleMoves).toHaveBeenCalledTimes(1)
    unmount()
  })
})
