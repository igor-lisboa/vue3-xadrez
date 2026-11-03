import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getGameSummary } from '@/api/services/games'
import { notify } from '@/services/dialogs'
import { useGameState } from '@/composables/useGameState'
import { makeSummary } from '../helpers/fixtures'
import { runComposable } from '../helpers/run-composable'

const { push, routeState } = vi.hoisted(() => ({
  push: vi.fn(async () => undefined),
  routeState: { name: 'game' as string, params: {} as Record<string, unknown> },
}))

vi.mock('vue-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-router')>()),
  useRouter: () => ({ push }),
  useRoute: () => routeState,
}))
vi.mock('@/api/services/games', () => ({ getGameSummary: vi.fn() }))
vi.mock('@/services/dialogs', () => ({ notify: vi.fn(), askText: vi.fn() }))

beforeEach(() => {
  vi.clearAllMocks()
  routeState.name = 'game'
  routeState.params = { type: undefined }
})

describe('useGameState', () => {
  it('loads the summary and stays on the game screen', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(makeSummary())
    const { result, unmount } = runComposable(() => useGameState(7, 0))
    await result.refresh()
    expect(result.summary.value?.id).toBe(7)
    expect(push).not.toHaveBeenCalled()
    unmount()
  })

  it('moves the player to the screen the game requires', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(makeSummary({ finalizado: 'Vitória: Branco' }))
    const { result, unmount } = runComposable(() => useGameState(7, 0))
    await result.refresh()
    expect(push).toHaveBeenCalledWith({ name: 'endGame', params: { id: 7, sideId: 0 } })
    unmount()
  })

  it('does not navigate again when the route already shows the screen', async () => {
    routeState.name = 'endGame'
    vi.mocked(getGameSummary).mockResolvedValue(makeSummary({ finalizado: 'Empate: Comum acordo' }))
    const { result, unmount } = runComposable(() => useGameState(7, 0))
    await result.refresh()
    expect(push).not.toHaveBeenCalled()
    unmount()
  })

  it('sends the player home when the game cannot be loaded', async () => {
    vi.mocked(getGameSummary).mockRejectedValue(new Error('gone'))
    const { result, unmount } = runComposable(() => useGameState(7, 0))
    await expect(result.refresh()).resolves.toBeNull()
    expect(notify).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith({ name: 'home' })
    unmount()
  })
})
