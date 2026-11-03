import { useRoute, useRouter, type RouteLocationNormalizedLoaded } from 'vue-router'
import { ref } from 'vue'
import { getGameSummary } from '@/api/services/games'
import type { GameSummary } from '@/api/types/game-summary'
import type { SideId } from '@/api/types/enums'
import { resolveGameScreen, type GameScreen } from '@/domain/game-screen'
import { screenLocation, isOnScreen } from '@/router/screen-location'
import { useRequest } from './useRequest'

/**
 * State of one game as seen by one side. Every refresh also moves the player
 * to the screen the game currently requires (for example, the promotion screen).
 */
export function useGameState(gameId: number, sideId: SideId) {
  const router = useRouter()
  const route: RouteLocationNormalizedLoaded = useRoute()
  const request = useRequest()
  const summary = ref<GameSummary | null>(null)

  async function followScreen(current: GameSummary): Promise<void> {
    const screen: GameScreen = resolveGameScreen(current, sideId)
    if (isOnScreen(route, screen)) {
      return
    }
    await router.push(screenLocation(screen, gameId, sideId))
  }

  async function refresh(): Promise<GameSummary | null> {
    const current = await request.perform(() => getGameSummary(gameId))
    if (!current) {
      await router.push({ name: 'home' })
      return null
    }
    summary.value = current
    await followScreen(current)
    return current
  }

  return { summary, refresh, loading: request.pending }
}
