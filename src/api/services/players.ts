import type { SideId } from '../types/enums'
import type { ApiEnvelope } from '../types/envelope'
import type { JoinPlayerRequest } from '../types/game'
import { http } from '../http'

/** Seats a player (human or AI) on a side. Returns the server message. */
export async function joinGame(gameId: number, body: JoinPlayerRequest): Promise<string> {
  const { data } = await http.post<ApiEnvelope<unknown>>(`/jogos/${gameId}/jogadores`, body)
  return data.message
}

/** Resigns a side. The game ends with "Desistência". Returns the server message. */
export async function leaveGame(gameId: number, sideId: SideId): Promise<string> {
  const { data } = await http.delete<ApiEnvelope<unknown>>(`/jogos/${gameId}/jogadores/${sideId}`)
  return data.message
}
