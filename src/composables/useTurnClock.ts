import { onUnmounted, ref, watch, type Ref } from 'vue'
import type { GameSummary } from '@/api/types/game-summary'
import { CLOCK_TICK_MS, NO_TIME_LIMIT, WHITE } from '@/domain/constants'

/**
 * Countdown of both sides. The side on turn counts down in the browser between
 * server updates. `onExpired` runs once when that side reaches zero, so the game can be reloaded.
 */
export function useTurnClock(summary: Ref<GameSummary | null>, onExpired: () => void) {
  const whiteMs = ref(0)
  const blackMs = ref(0)

  watch(
    summary,
    (current) => {
      if (!current) {
        return
      }
      // The API stops both clocks when the game ends and shows 0 for a side that ran out.
      whiteMs.value = Math.max(0, current.ladoBrancoTempoMilisegundosRestante ?? 0)
      blackMs.value = Math.max(0, current.ladoPretoTempoMilisegundosRestante ?? 0)
    },
    { immediate: true },
  )

  /** A finished game keeps the times the server sent, so nothing counts down after the end. */
  function isCounting(current: GameSummary): boolean {
    return (
      current.tempoDeTurnoEmMilisegundos !== NO_TIME_LIMIT &&
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

  return { whiteMs, blackMs }
}
