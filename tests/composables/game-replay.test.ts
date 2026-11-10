import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import { listPieceTypes, listSquares } from '@/api/services/catalogue'
import { getGameHistory } from '@/api/services/games'
import type { SideId } from '@/api/types/enums'
import { useGameReplay } from '@/composables/useGameReplay'
import { notify } from '@/services/dialogs'
import { pieceTypes, squares } from '../helpers/fixtures'
import { boardAfter, makeHistory, played } from '../helpers/history'
import { runComposable } from '../helpers/run-composable'

vi.mock('@/api/services/catalogue', () => ({ listSquares: vi.fn(), listPieceTypes: vi.fn() }))
vi.mock('@/api/services/games', () => ({ getGameHistory: vi.fn() }))
vi.mock('@/services/dialogs', () => ({ notify: vi.fn(), askText: vi.fn() }))

/** 1. e4 e5 2. Nf3: three moves, so the replay has four positions. */
const history = () =>
  makeHistory(
    [played(0, 'E2', 'E4'), played(1, 'E7', 'E5'), played(2, 'G1', 'F3')],
    boardAfter({ E2: null, E4: 'Peão-0', E7: null, E5: 'Peão-1', G1: null, F3: 'Cavalo-0' }),
  )

async function open(sideId: SideId = 0) {
  const opened = runComposable(() => useGameReplay(7, sideId))
  await flushPromises()
  return opened
}

const pieceOn = (
  houses: { house: string; piece: { name: string } | null }[],
  name: string,
): string | undefined => houses.find((house) => house.house === name)?.piece?.name

function press(key: string, target: EventTarget = window, modifiers: KeyboardEventInit = {}) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...modifiers })
  target.dispatchEvent(event)
  return event
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(listSquares).mockResolvedValue(squares)
  vi.mocked(listPieceTypes).mockResolvedValue(pieceTypes)
  vi.mocked(getGameHistory).mockResolvedValue(history())
})

describe('useGameReplay', () => {
  it('loads the game of the id and opens on the final position', async () => {
    const { result, unmount } = await open()
    expect(getGameHistory).toHaveBeenCalledWith(7)
    expect(result.total.value).toBe(3)
    expect(result.step.value).toBe(3)
    expect(result.currentMove.value).toMatchObject({ piece: 'Cavalo', from: 'G1', to: 'F3' })
    expect(pieceOn(result.houses.value, 'F3')).toBe('Cavalo')
    unmount()
  })

  it('gives the result of the game, or null while it is being played', async () => {
    const { result, unmount } = await open()
    expect(result.ending.value).toBeNull()
    expect(result.material.value).toBeNull()
    unmount()

    vi.mocked(getGameHistory).mockResolvedValue(
      makeHistory([], boardAfter({}), {}, { finalizado: { tipo: 'Vitória: Branco' } }),
    )
    const finished = await open()
    expect(finished.result.ending.value).toBe('Vitória: Branco')
    finished.unmount()
  })

  it('explains an insufficient-material draw from the final position and the side on move', async () => {
    const kingsAndQueen = boardAfter({}).fill(null)
    kingsAndQueen[4] = 'Rei-1'
    kingsAndQueen[59] = 'Rainha-0'
    kingsAndQueen[60] = 'Rei-0'
    vi.mocked(getGameHistory).mockResolvedValue(
      makeHistory(
        [],
        kingsAndQueen,
        {},
        {
          finalizado: { tipo: 'Empate: Insuficiência material' },
          ladoIdAtual: 1,
          tempoDeTurnoEmMilisegundos: 600_000,
        },
      ),
    )
    const { result, unmount } = await open()
    expect(result.material.value?.cause).toEqual({ kind: 'timeOut', sideId: 1 })
    expect(result.material.value?.sides[0].pieces).toEqual(['Rei', 'Rainha'])
    unmount()
  })

  it('calls back when the game cannot be loaded', async () => {
    vi.mocked(getGameHistory).mockRejectedValue(new Error('boom'))
    const onError = vi.fn()
    const opened = runComposable(() => useGameReplay(7, 0, { onError }))
    await flushPromises()
    expect(onError).toHaveBeenCalled()
    expect(opened.result.replay.value).toBeNull()
    opened.unmount()
  })

  it('steps back and forward and shows the position of each step', async () => {
    const { result, unmount } = await open()
    result.previous()
    expect(result.step.value).toBe(2)
    expect(pieceOn(result.houses.value, 'F3')).toBeUndefined()
    expect(pieceOn(result.houses.value, 'G1')).toBe('Cavalo')
    result.first()
    expect(result.step.value).toBe(0)
    expect(result.currentMove.value).toBeNull()
    expect(pieceOn(result.houses.value, 'E2')).toBe('Peão')
    result.next()
    expect(pieceOn(result.houses.value, 'E4')).toBe('Peão')
    result.last()
    expect(result.step.value).toBe(3)
    unmount()
  })

  it('does not go past the first or the last position', async () => {
    const { result, unmount } = await open()
    expect([result.canGoBack.value, result.canGoForward.value]).toEqual([true, false])
    result.next()
    expect(result.step.value).toBe(3)
    result.goTo(-5)
    expect(result.step.value).toBe(0)
    expect([result.canGoBack.value, result.canGoForward.value]).toEqual([false, true])
    result.previous()
    expect(result.step.value).toBe(0)
    result.goTo(99)
    expect(result.step.value).toBe(3)
    unmount()
  })

  it('marks the move of the step on the board, and nothing at the start', async () => {
    const { result, unmount } = await open()
    const marked = () =>
      result.houses.value
        .filter((house) => house.movementOrigin || house.possibleMovement)
        .map((house) => house.house)
    // Listed in board order, rank 3 before rank 1.
    expect(marked()).toEqual(['F3', 'G1'])
    result.first()
    expect(marked()).toEqual([])
    unmount()
  })

  it('shows the board from the side of the player', async () => {
    const white = await open(0)
    const black = await open(1)
    expect(white.result.houses.value[0]?.house).toBe('A8')
    expect(black.result.houses.value[0]?.house).toBe('H1')
    expect(black.result.houses.value[63]?.house).toBe('A8')
    expect(pieceOn(black.result.houses.value, 'E5')).toBe('Peão')
    white.unmount()
    black.unmount()
  })

  it('steps with the arrow keys, Home and End', async () => {
    const { result, unmount } = await open()
    expect(press('ArrowLeft').defaultPrevented).toBe(true)
    expect(result.step.value).toBe(2)
    press('ArrowRight')
    expect(result.step.value).toBe(3)
    press('Home')
    expect(result.step.value).toBe(0)
    press('End')
    expect(result.step.value).toBe(3)
    unmount()
  })

  it('leaves the keys to a form control and ignores other keys and shortcuts', async () => {
    const { result, unmount } = await open()
    const select = document.createElement('select')
    document.body.append(select)
    expect(press('ArrowLeft', select).defaultPrevented).toBe(false)
    expect(result.step.value).toBe(3)
    expect(press('a').defaultPrevented).toBe(false)
    press('ArrowLeft', window, { ctrlKey: true })
    expect(result.step.value).toBe(3)
    select.remove()
    unmount()
  })

  it('stops listening to the keyboard when the screen is left', async () => {
    const { result, unmount } = await open()
    unmount()
    press('ArrowLeft')
    await nextTick()
    expect(result.step.value).toBe(3)
  })

  it('shows the error and has no replay when the game cannot be loaded', async () => {
    vi.mocked(getGameHistory).mockRejectedValue(new Error('boom'))
    const { result, unmount } = await open()
    expect(notify).toHaveBeenCalled()
    expect(result.replay.value).toBeNull()
    expect(result.total.value).toBe(0)
    expect(result.houses.value).toEqual([])
    unmount()
  })

  it('keeps only the final position for a game that cannot be replayed', async () => {
    vi.mocked(getGameHistory).mockResolvedValue(
      makeHistory([played(0, 'E3', 'E4')], boardAfter({ E2: null, E4: 'Peão-0' })),
    )
    const { result, unmount } = await open()
    expect(result.replay.value?.complete).toBe(false)
    expect(result.total.value).toBe(0)
    expect(pieceOn(result.houses.value, 'E4')).toBe('Peão')
    unmount()
  })
})
