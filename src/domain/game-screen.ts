import type { ProposalKind, RequestedActionName, SideId } from '@/api/types/enums'
import type { GameSummary } from '@/api/types/game-summary'

/** Action a side must answer for each kind of proposal. */
export const ANSWER_ACTION: Record<ProposalKind, RequestedActionName> = {
  empate: 'responderPropostaEmpate',
  reset: 'responderPropostaReset',
}

/** Screen a player should be on, given the state of the game. */
export type GameScreen =
  | { name: 'game' }
  | { name: 'endGame' }
  | { name: 'promotePawn' }
  | { name: 'answerProposal'; kind: ProposalKind }
  | { name: 'selectSide'; preselectedSide: SideId }

function hasPendingAction(
  summary: GameSummary,
  action: GameSummary['acoesSolicitadas'][number]['acao'],
) {
  return summary.acoesSolicitadas.some((requested) => requested.acao === action)
}

/**
 * Decides the screen of a player. The first matching rule wins, in this order:
 * draw answer, reset answer, pawn promotion, side left without a player, finished game.
 */
export function resolveGameScreen(summary: GameSummary, sideId: SideId): GameScreen {
  if (hasPendingAction(summary, 'responderPropostaEmpate')) {
    return { name: 'answerProposal', kind: 'empate' }
  }
  if (hasPendingAction(summary, 'responderPropostaReset')) {
    return { name: 'answerProposal', kind: 'reset' }
  }
  const promotionPending = summary.acoesSolicitadas.some(
    (requested) => requested.acao === 'promocaoPeao' && requested.ladoId === sideId,
  )
  if (promotionPending) {
    return { name: 'promotePawn' }
  }
  if (summary.ladosIdDeslogados.includes(sideId)) {
    return { name: 'selectSide', preselectedSide: sideId }
  }
  if (summary.finalizado !== null) {
    return { name: 'endGame' }
  }
  return { name: 'game' }
}
