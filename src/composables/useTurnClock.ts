import { onUnmounted, ref, watch, type Ref } from 'vue'
import type { GameClocks, GameSummary } from '@/api/types/game-summary'
import { CLOCK_TICK_MS, NO_TIME_LIMIT, WHITE } from '@/domain/constants'
import { remainingMs, timeLimitOf } from '@/domain/clock'

/** The time each side has left, as the server sends it in the game and in its events. */
export type ClocksLeft = Pick<
  GameClocks,
  'ladoBrancoTempoMilisegundosRestante' | 'ladoPretoTempoMilisegundosRestante'
>

/**
 * Countdown of both sides. The side on turn counts down in the browser between
 * server updates. `onExpired` runs once when that side reaches zero, so the game can be reloaded.
 * `applyClocks` shows the clocks of an event as soon as it arrives, before the game is reloaded.
 */
export function useTurnClock(summary: Ref<GameSummary | null>, onExpired: () => void) {
  const whiteMs = ref(0)
  const blackMs = ref(0)

  function applyClocks(clocks: ClocksLeft): void {
    // The API stops both clocks when the game ends and shows 0 for a side that ran out.
    whiteMs.value = remainingMs(clocks.ladoBrancoTempoMilisegundosRestante)
    blackMs.value = remainingMs(clocks.ladoPretoTempoMilisegundosRestante)
  }

  watch(
    summary,
    (current) => {
      if (current) {
        applyClocks(current)
      }
    },
    { immediate: true },
  )

  /** A finished game keeps the times the server sent, so nothing counts down after the end. */
  function isCounting(current: GameSummary): boolean {
    return (
      timeLimitOf(current) !== NO_TIME_LIMIT &&
      current.ladosIdDeslogados.length === 0 &&
      current.finalizado === null
    )
  }

  function tick(): void {
    const current = summary.value
    if (!current || !isCounting(current)) {
      return
    }
    const remaining = current.ladoIdAtual === WHITE ? whiteMs : blackMs
    if (remaining.value <= 0) {
      return
    }
    remaining.value = Math.max(0, remaining.value - CLOCK_TICK_MS)
    if (remaining.value === 0) {
      onExpired()
    }
  }

  const timer = setInterval(tick, CLOCK_TICK_MS)
  onUnmounted(() => clearInterval(timer))

  return { whiteMs, blackMs, applyClocks }
}
