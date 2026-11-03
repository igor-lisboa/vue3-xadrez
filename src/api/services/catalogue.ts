import type { ApiEnvelope } from '../types/envelope'
import type { GameType, PieceType, Square } from '../types/catalogue'
import { http } from '../http'

export async function listSquares(): Promise<Square[]> {
  const { data } = await http.get<ApiEnvelope<Square[]>>('/tabela-equivalencia')
  return data.data
}

export async function listGameTypes(): Promise<GameType[]> {
  const { data } = await http.get<ApiEnvelope<GameType[]>>('/tipos-de-jogo')
  return data.data
}

export async function listPieceTypes(): Promise<PieceType[]> {
  const { data } = await http.get<ApiEnvelope<PieceType[]>>('/tipos-de-peca')
  return data.data
}

/** Pieces a pawn can be promoted to. */
export async function listPromotionPieces(): Promise<PieceType[]> {
  const { data } = await http.get<ApiEnvelope<PieceType[]>>('/tipos-de-peca/promocao-peao')
  return data.data
}
