import type { ProposalKind, SideId } from '../types/enums'
import type { ApiEnvelope } from '../types/envelope'
import type { AnswerRequest } from '../types/game'
import { http } from '../http'
import { sideHeaders } from './side-headers'

/** Offers a draw or a reset to the opponent. Returns the server message. */
export async function proposeToOpponent(
  gameId: number,
  sideId: SideId,
  kind: ProposalKind,
): Promise<string> {
  const { data } = await http.put<ApiEnvelope<unknown>>(
    `/jogos/${gameId}/${kind}/propoe`,
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
