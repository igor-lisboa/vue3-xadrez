import type { RequestedActionName, SideId } from '@/api/types/enums'
import type { GameSummary } from '@/api/types/game-summary'

/** Screen a player should be on, given the state of the game. */
export type GameScreen =
  | { name: 'game' }
  | { name: 'endGame' }
  | { name: 'promotePawn' }
  | { name: 'answerProposal' }
  | { name: 'selectSide'; preselectedSide: SideId }

/** True when the action waits for an answer of the given side, or of any side without one. */
export function hasPendingAction(
  summary: GameSummary,
  action: RequestedActionName,
  sideId?: SideId,
): boolean {
  return summary.acoesSolicitadas.some(
    (requested) =>
      requested.acao === action && (sideId === undefined || requested.ladoId === sideId),
  )
}

/**
 * Decides the screen of a player. The first matching rule wins, in this order:
 * reset answer, pawn promotion, side left without a player, finished game.
 * A draw offer is not a rule: it never stops play, so it is answered on the Game screen.
 */
export function resolveGameScreen(summary: GameSummary, sideId: SideId): GameScreen {
  if (hasPendingAction(summary, 'responderPropostaReset')) {
    return { name: 'answerProposal' }
  }
  if (hasPendingAction(summary, 'promocaoPeao', sideId)) {
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
