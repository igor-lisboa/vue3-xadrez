import type { ApiEnvelope } from '../types/envelope'
import type { CreatedGame, CreateGameRequest, SideSlot } from '../types/game'
import type { GameHistorySource } from '../types/game-history'
import type { GameSummary } from '../types/game-summary'
import { http } from '../http'

export async function createGame(body: CreateGameRequest): Promise<CreatedGame> {
  const { data } = await http.post<ApiEnvelope<CreatedGame>>('/jogos', body)
  return data.data
}

export async function getGameSummary(gameId: number): Promise<GameSummary> {
  const { data } = await http.get<ApiEnvelope<GameSummary>>(`/jogos/${gameId}/simples`, {
    params: { tabuleiroSuperSimplificado: true },
  })
  return data.data
}

/** Full state of a game, with the moves of both sides. Used to review a finished game. */
export async function getGameHistory(gameId: number): Promise<GameHistorySource> {
  const { data } = await http.get<ApiEnvelope<GameHistorySource>>(`/jogos/${gameId}`)
  return data.data
}

/** Sides of a game that have no player yet. */
export async function listSidesWithoutPlayer(gameId: number): Promise<SideSlot[]> {
  const { data } = await http.get<ApiEnvelope<SideSlot[]>>(`/jogos/${gameId}/lado-sem-jogador`)
  return data.data
}
