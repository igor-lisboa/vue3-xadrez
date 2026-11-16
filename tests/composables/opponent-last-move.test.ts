import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getGameHistory } from '@/api/services/games'
import { useOpponentLastMove } from '@/composables/useOpponentLastMove'
import { runComposable } from '../helpers/run-composable'
import { boardAfter, makeHistory, played } from '../helpers/history'

vi.mock('@/api/services/games', () => ({ getGameHistory: vi.fn() }))
vi.mock('@/services/dialogs', () => ({ notify: vi.fn(), askText: vi.fn() }))

beforeEach(() => vi.clearAllMocks())

describe('useOpponentLastMove', () => {
  it('returns the latest opponent move in the same form used by review', async () => {
    vi.mocked(getGameHistory).mockResolvedValue(
      makeHistory(
        [played(0, 'E2', 'E4'), played(1, 'E7', 'E5')],
        boardAfter({ E2: null, E4: 'Peão-0', E7: null, E5: 'Peão-1' }),
      ),
    )
    const { result, unmount } = runComposable(() => useOpponentLastMove(7, 0))

    await result.refresh()

    expect(result.move.value).toMatchObject({ sideId: 1, piece: 'Peão', from: 'E7', to: 'E5' })
    expect(getGameHistory).toHaveBeenCalledWith(7)
    unmount()
  })

  it('shows no opponent move when the history contains only this player’s moves', async () => {
    vi.mocked(getGameHistory).mockResolvedValue(
      makeHistory([played(0, 'E2', 'E4')], boardAfter({ E2: null, E4: 'Peão-0' })),
    )
    const { result, unmount } = runComposable(() => useOpponentLastMove(7, 0))

    await result.refresh()

    expect(result.move.value).toBeNull()
    unmount()
  })

  it('does not guess a move when the history cannot be replayed from the starting board', async () => {
    vi.mocked(getGameHistory).mockResolvedValue(
      makeHistory([], boardAfter({ E4: 'Peão-0' })),
    )
    const { result, unmount } = runComposable(() => useOpponentLastMove(7, 0))

    await result.refresh()

    expect(result.move.value).toBeNull()
    unmount()
  })
})
