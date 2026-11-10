import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import SelectSideView from '@/views/SelectSideView.vue'
import GameView from '@/views/GameView.vue'
import PromotePawnView from '@/views/PromotePawnView.vue'
import EndGameView from '@/views/EndGameView.vue'
import AnswerProposalView from '@/views/AnswerProposalView.vue'
import GameReviewView from '@/views/GameReviewView.vue'
import type { SideId } from '@/api/types/enums'
import { WHITE } from '@/domain/constants'
import { parseSideId } from './params'
import { requireGameAndSide, requireGameId } from './guards'

/** Views of a game receive its id and their side. The guards have already checked both. */
function sideRouteProps(route: { params: Record<string, unknown> }) {
  return {
    gameId: Number(route.params.id),
    sideId: Number(route.params.sideId) as SideId,
  }
}

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView },
  {
    path: '/game/:id',
    name: 'selectSide',
    component: SelectSideView,
    beforeEnter: (to) => requireGameId(to.params),
    props: (route) => ({
      gameId: Number(route.params.id),
      preselectedSide: parseSideId(route.query.side),
    }),
  },
  {
    path: '/game/:id/side/:sideId',
    name: 'game',
    component: GameView,
    beforeEnter: (to) => requireGameAndSide(to.params),
    props: sideRouteProps,
  },
  {
    path: '/game/:id/side/:sideId/promote-pawn',
    name: 'promotePawn',
    component: PromotePawnView,
    beforeEnter: (to) => requireGameAndSide(to.params),
    props: sideRouteProps,
  },
  {
    path: '/game/:id/side/:sideId/end-game',
    name: 'endGame',
    component: EndGameView,
    beforeEnter: (to) => requireGameAndSide(to.params),
    props: sideRouteProps,
  },
  {
    // Only a reset offer has its own screen: a draw offer is answered on the Game screen.
    path: '/game/:id/side/:sideId/answer-proposal/reset',
    name: 'answerProposal',
    component: AnswerProposalView,
    beforeEnter: (to) => requireGameAndSide(to.params),
    props: sideRouteProps,
  },
  {
    // Open to anyone: the side only turns the board, so a missing or wrong one shows White's view.
    path: '/game/:id/review',
    name: 'gameReview',
    component: GameReviewView,
    beforeEnter: (to) => requireGameId(to.params),
    props: (route) => ({
      gameId: Number(route.params.id),
      sideId: parseSideId(route.query.side) ?? WHITE,
    }),
  },
  { path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
