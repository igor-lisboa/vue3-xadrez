import type { RouteLocationNormalizedLoaded, RouteLocationRaw } from 'vue-router'
import type { SideId } from '@/api/types/enums'
import type { GameScreen } from '@/domain/game-screen'

/** Location of a screen of the game, for the given side. */
export function screenLocation(
  screen: GameScreen,
  gameId: number,
  sideId: SideId,
): RouteLocationRaw {
  if (screen.name === 'selectSide') {
    return { name: 'selectSide', params: { id: gameId }, query: { side: screen.preselectedSide } }
  }
  return { name: screen.name, params: { id: gameId, sideId } }
}

/** True when the current route already shows the screen. */
export function isOnScreen(route: RouteLocationNormalizedLoaded, screen: GameScreen): boolean {
  return route.name === screen.name
}
