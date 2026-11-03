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
      whiteMs.value = current.ladoBrancoTempoMilisegundosRestante ?? 0
      blackMs.value = current.ladoPretoTempoMilisegundosRestante ?? 0
    },
    { immediate: true },
  )

  function isCounting(current: GameSummary): boolean {
    return (
      current.tempoDeTurnoEmMilisegundos !== NO_TIME_LIMIT && current.ladosIdDeslogados.length === 0
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
