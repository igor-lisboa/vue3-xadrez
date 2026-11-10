import type { SideId } from '@/api/types/enums'
import type { GameSummary } from '@/api/types/game-summary'
import { hasPendingAction } from './game-screen'

/** The open draw offer as one side sees it. */
export type DrawOfferState = 'received' | 'sent' | null

/** The draw button of the Game screen: claim a draw, offer one, or none. */
export type DrawAction = 'claim' | 'offer' | null

function isRunning(summary: GameSummary): boolean {
  return summary.finalizado === null
}

/**
 * Whether this side received a draw offer, made one, or neither. An open offer never blocks
 * moves: a move by the side that received it declines it.
 */
export function drawOfferState(summary: GameSummary, sideId: SideId): DrawOfferState {
  if (hasPendingAction(summary, 'responderPropostaEmpate', sideId)) {
    return 'received'
  }
  return summary.empatePropostoPeloLadoId === sideId ? 'sent' : null
}

/**
 * The draw button to show. "Claim" follows the API's `empateReivindicavel`, which only the side
 * on turn can use; the frontend never checks repetitions or move counts itself. "Offer" is
 * shown while no offer is open, to either side, on turn or not.
 */
export function drawAction(summary: GameSummary, sideId: SideId): DrawAction {
  if (!isRunning(summary)) {
    return null
  }
  if (summary.empateReivindicavel && summary.ladoIdAtual === sideId) {
    return 'claim'
  }
  return summary.empatePropostoPeloLadoId === null ? 'offer' : null
}

/**
 * Whether this side may claim a draw for the position its next move would make. Only the side
 * on turn can; `empateReivindicavel` does not cover this claim, so the API alone decides it.
 */
export function canClaimWithMove(summary: GameSummary, sideId: SideId): boolean {
  return isRunning(summary) && summary.ladoIdAtual === sideId
}
