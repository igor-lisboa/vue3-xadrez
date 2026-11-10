// Wire values of the Chess API. Names are kept in Portuguese because the API sends them that way.

/** 0 is Branco (white), 1 is Preto (black). */
export type SideId = 0 | 1

/** 0 is Humano (human), 1 is I.A. (computer). */
export type PlayerTypeId = 0 | 1

/** 0 Human vs Human, 1 Human vs AI, 2 AI vs AI. */
export type GameTypeId = 0 | 1 | 2

export type SideName = 'Branco' | 'Preto'

export type PlayerTypeName = 'Humano' | 'I.A.'

export type PieceName = 'Rei' | 'Rainha' | 'Torre' | 'Bispo' | 'Cavalo' | 'Peão'

export type SquareFile = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'

export type SquareRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

/** Square name such as "E2". */
export type SquareName = `${SquareFile}${SquareRank}`

/** A board cell in the "super simplified" summary, for example "Rei-0". */
export type SimplifiedCell = `${PieceName}-${SideId}`

/** Path segment of a draw or reset offer. */
export type ProposalKind = 'empate' | 'reset'

/** Actions a side must answer before the game goes on. */
export type RequestedActionName =
  'responderPropostaEmpate' | 'responderPropostaReset' | 'promocaoPeao'

export type MoveName =
  | 'Roque Menor'
  | 'Roque Maior'
  | 'Primeiro Movimento Peão'
  | 'Promoção do Peão'
  | 'En Passant'
  | 'L'
  | null

export type EndingLabel =
  | 'Vitória: Branco'
  | 'Vitória: Preto'
  | 'Empate: Regra 50 movimentos'
  | 'Empate: Insuficiência material'
  | 'Empate: Rei afogado'
  | 'Empate: Comum acordo'
  | 'Empate: Regra das 3 posições'
  | 'Empate: Tempo esgotado sem material'
  | 'Desistência: Um jogador deixou a partida'
