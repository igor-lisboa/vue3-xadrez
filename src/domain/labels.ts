// English labels for the values the API sends in Portuguese.
import type { GameType } from '@/api/types/catalogue'
import type {
  EndingLabel,
  MoveName,
  PieceName,
  PlayerTypeId,
  ProposalKind,
  SideId,
} from '@/api/types/enums'

export const SIDE_LABELS: Record<SideId, string> = {
  0: 'White',
  1: 'Black',
}

export const PLAYER_TYPE_LABELS: Record<PlayerTypeId, string> = {
  0: 'Human',
  1: 'AI',
}

export const PIECE_LABELS: Record<PieceName, string> = {
  Rei: 'King',
  Rainha: 'Queen',
  Torre: 'Rook',
  Bispo: 'Bishop',
  Cavalo: 'Knight',
  Peão: 'Pawn',
}

export const ENDING_LABELS: Record<EndingLabel, string> = {
  'Vitória: Branco': 'White wins',
  'Vitória: Preto': 'Black wins',
  'Empate: Regra 50 movimentos': 'Draw: 50-move rule',
  'Empate: Insuficiência material': 'Draw: insufficient material',
  'Empate: Rei afogado': 'Draw: stalemate',
  'Empate: Comum acordo': 'Draw: by agreement',
  'Empate: Regra das 3 posições': 'Draw: threefold repetition',
  'Desistência: Um jogador deixou a partida': 'Resignation: a player left the game',
  'Tempo esgotado: o tempo de um jogador acabou': 'Time out: a player ran out of time',
}

export const MOVE_LABELS: Record<NonNullable<MoveName>, string> = {
  'Roque Menor': 'Short castling',
  'Roque Maior': 'Long castling',
  'Primeiro Movimento Peão': 'Pawn double step',
  'Promoção do Peão': 'Pawn promotion',
  'En Passant': 'En passant',
  L: 'Knight move',
}

/** Lower-case names used inside sentences. */
export const PROPOSAL_LABELS: Record<ProposalKind, string> = {
  empate: 'draw',
  reset: 'reset',
}

export function moveLabel(name: MoveName): string {
  return name === null ? '' : MOVE_LABELS[name]
}

/** Game type as shown on the home page, for example "Human X AI". */
export function gameTypeLabel(gameType: GameType): string {
  return gameType.integranteLadoTipo.map((player) => PLAYER_TYPE_LABELS[player.id]).join(' X ')
}
