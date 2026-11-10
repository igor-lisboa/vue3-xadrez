import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useTurnClock } from '@/composables/useTurnClock'
import type { GameSummary } from '@/api/types/game-summary'
import { makeSummary } from '../helpers/fixtures'
import { runComposable } from '../helpers/run-composable'

function setup(initial: GameSummary | null, onExpired = vi.fn()) {
  const summary = ref<GameSummary | null>(initial)
  const { result, unmount } = runComposable(() => useTurnClock(summary, onExpired))
  return { summary, result, unmount, onExpired }
}

describe('useTurnClock', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('starts from the times of the server', () => {
    const { result, unmount } = setup(
      makeSummary({
        ladoBrancoTempoMilisegundosRestante: 5000,
        ladoPretoTempoMilisegundosRestante: 7000,
      }),
    )
    expect(result.whiteMs.value).toBe(5000)
    expect(result.blackMs.value).toBe(7000)
    unmount()
  })

  it('counts down the side on turn every second', () => {
    const { result, unmount } = setup(
      makeSummary({
        ladoIdAtual: 0,
        tempoDeTurnoEmMilisegundos: 60000,
        ladoBrancoTempoMilisegundosRestante: 5000,
        ladoPretoTempoMilisegundosRestante: 7000,
      }),
    )
    vi.advanceTimersByTime(2000)
    expect(result.whiteMs.value).toBe(3000)
    expect(result.blackMs.value).toBe(7000)
    unmount()
  })

  it('counts the black side when it is on turn', () => {
    const { result, unmount } = setup(
      makeSummary({
        ladoIdAtual: 1,
        tempoDeTurnoEmMilisegundos: 60000,
        ladoBrancoTempoMilisegundosRestante: 5000,
        ladoPretoTempoMilisegundosRestante: 7000,
      }),
    )
    vi.advanceTimersByTime(1000)
    expect(result.whiteMs.value).toBe(5000)
    expect(result.blackMs.value).toBe(6000)
    unmount()
  })

  it('calls onExpired once when the clock reaches zero and stops at zero', () => {
    const onExpired = vi.fn()
    const { unmount, result } = setup(
      makeSummary({ tempoDeTurnoEmMilisegundos: 60000, ladoBrancoTempoMilisegundosRestante: 1000 }),
      onExpired,
    )
    vi.advanceTimersByTime(5000)
    expect(result.whiteMs.value).toBe(0)
    expect(onExpired).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('does not count after the game has ended', () => {
    const { result, unmount } = setup(
      makeSummary({
        ladoIdAtual: 0,
        tempoDeTurnoEmMilisegundos: 60000,
        ladoBrancoTempoMilisegundosRestante: 5000,
        finalizado: 'Vitória: Preto',
      }),
    )
    vi.advanceTimersByTime(3000)
    expect(result.whiteMs.value).toBe(5000)
    unmount()
  })

  it('shows zero, never a negative time, for a side the server reports below zero', () => {
    const { result, unmount } = setup(
      makeSummary({ tempoDeTurnoEmMilisegundos: 60000, ladoBrancoTempoMilisegundosRestante: -250 }),
    )
    expect(result.whiteMs.value).toBe(0)
    unmount()
  })

  it('does not count when the game has no time limit', () => {
    const { result, unmount } = setup(
      makeSummary({ tempoDeTurnoEmMilisegundos: -1, ladoBrancoTempoMilisegundosRestante: 5000 }),
    )
    vi.advanceTimersByTime(3000)
    expect(result.whiteMs.value).toBe(5000)
    unmount()
  })

  it('does not count when a side has no player', () => {
    const { result, unmount } = setup(
      makeSummary({
        tempoDeTurnoEmMilisegundos: 60000,
        ladosIdDeslogados: [1],
        ladoBrancoTempoMilisegundosRestante: 5000,
      }),
    )
    vi.advanceTimersByTime(3000)
    expect(result.whiteMs.value).toBe(5000)
    unmount()
  })

  it('does nothing before the summary is loaded, and follows later updates', async () => {
    const { summary, result, unmount } = setup(null)
    vi.advanceTimersByTime(2000)
    expect(result.whiteMs.value).toBe(0)
    summary.value = makeSummary({
      tempoDeTurnoEmMilisegundos: 60000,
      ladoBrancoTempoMilisegundosRestante: 4000,
      ladoPretoTempoMilisegundosRestante: null,
    })
    await nextTick()
    expect(result.whiteMs.value).toBe(4000)
    expect(result.blackMs.value).toBe(0)
    unmount()
  })

  it('stops ticking when the component is unmounted', () => {
    const { result, unmount } = setup(
      makeSummary({ tempoDeTurnoEmMilisegundos: 60000, ladoBrancoTempoMilisegundosRestante: 5000 }),
    )
    unmount()
    vi.advanceTimersByTime(3000)
    expect(result.whiteMs.value).toBe(5000)
  })
})
