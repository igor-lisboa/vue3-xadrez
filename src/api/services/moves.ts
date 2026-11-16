import type { SideId, SquareName } from '../types/enums'
import type { ApiEnvelope } from '../types/envelope'
import type { PossibleMove } from '../types/move'
import { http } from '../http'
import { sideHeaders } from './side-headers'

/** All legal moves available to the requesting side. */
export async function listSidePossibleMoves(
  gameId: number,
  sideId: SideId,
): Promise<PossibleMove[]> {
  const { data } = await http.get<ApiEnvelope<PossibleMove[]>>(
    `/jogos/${gameId}/possiveis-jogadas`,
    sideHeaders(sideId),
  )
  return data.data
}

export async function makeMove(
  gameId: number,
  sideId: SideId,
  origin: SquareName,
  destination: SquareName,
): Promise<void> {
  await http.post(`/jogos/${gameId}/pecas/${origin}/move/${destination}`, {}, sideHeaders(sideId))
}

/** Promotes the pawn of the side to the piece with the given id. Returns the server message. */
export async function promotePawn(
  gameId: number,
  sideId: SideId,
  pieceId: number,
): Promise<string> {
  const { data } = await http.post<ApiEnvelope<unknown>>(
    `/jogos/${gameId}/promove-peao/${pieceId}`,
    {},
    sideHeaders(sideId),
  )
  return data.message
}
