import type { ProposalKind, SideId } from '../types/enums'
import type { ApiEnvelope } from '../types/envelope'
import type { AnswerRequest, DrawProposalResult, IntendedMove } from '../types/game'
import { http } from '../http'
import { sideHeaders } from './side-headers'

/** Server message of a draw offer or claim, and whether a claim ended the game. */
export interface DrawProposalOutcome {
  message: string
  claimed: boolean
}

/**
 * Offers a draw, or claims one when the position allows it (the server decides which).
 * With `intendedMove`, the claim is for the position that move would make: a valid claim ends
 * the game without playing it; otherwise the move is played and a draw offer is left.
 */
export async function proposeDraw(
  gameId: number,
  sideId: SideId,
  intendedMove?: IntendedMove,
): Promise<DrawProposalOutcome> {
  const { data } = await http.put<ApiEnvelope<DrawProposalResult>>(
    `/jogos/${gameId}/empate/propoe`,
    intendedMove,
    sideHeaders(sideId),
  )
  return { message: data.message, claimed: data.data.reivindicado }
}

/** Offers a reset to the opponent. Returns the server message. */
export async function proposeReset(gameId: number, sideId: SideId): Promise<string> {
  const { data } = await http.put<ApiEnvelope<unknown>>(
    `/jogos/${gameId}/reset/propoe`,
    {},
    sideHeaders(sideId),
  )
  return data.message
}

/** Accepts or refuses a draw or reset offer. Returns the server message. */
export async function answerProposal(
  gameId: number,
  sideId: SideId,
  kind: ProposalKind,
  accepted: boolean,
): Promise<string> {
  const body: AnswerRequest = { resposta: accepted }
  const { data } = await http.post<ApiEnvelope<unknown>>(
    `/jogos/${gameId}/${kind}/responde`,
    body,
    sideHeaders(sideId),
  )
  return data.message
}
