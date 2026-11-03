import type { RouteLocationNormalizedLoaded, RouteLocationRaw } from 'vue-router'
import type { ProposalKind, SideId } from '@/api/types/enums'
import type { GameScreen } from '@/domain/game-screen'

/** Route param used in the answer-proposal URL for each proposal kind. */
export const PROPOSAL_ROUTE_TYPE: Record<ProposalKind, 'tie' | 'reset'> = {
  empate: 'tie',
  reset: 'reset',
}

/** Location of a screen of the game, for the given side. */
export function screenLocation(
  screen: GameScreen,
  gameId: number,
  sideId: SideId,
): RouteLocationRaw {
  switch (screen.name) {
    case 'selectSide':
      return {
        name: 'selectSide',
        params: { id: gameId },
        query: { side: screen.preselectedSide },
      }
    case 'answerProposal':
      return {
        name: 'answerProposal',
        params: { id: gameId, sideId, type: PROPOSAL_ROUTE_TYPE[screen.kind] },
      }
    case 'game':
    case 'endGame':
    case 'promotePawn':
      return { name: screen.name, params: { id: gameId, sideId } }
  }
}

/** True when the current route already shows the screen. */
export function isOnScreen(route: RouteLocationNormalizedLoaded, screen: GameScreen): boolean {
  if (route.name !== screen.name) {
    return false
  }
  if (screen.name === 'answerProposal') {
    return route.params.type === PROPOSAL_ROUTE_TYPE[screen.kind]
  }
  return true
}
