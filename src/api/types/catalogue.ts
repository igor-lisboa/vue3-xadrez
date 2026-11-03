import type { GameTypeId, PieceName, PlayerTypeId, PlayerTypeName, SquareName } from './enums'

export interface Square {
  casa: SquareName
  linha: number
  coluna: number
}

export interface PlayerType {
  id: PlayerTypeId
  nome: PlayerTypeName
}

export interface GameType {
  id: GameTypeId
  /** Player type of each side, Branco first. */
  integranteLadoTipo: [PlayerType, PlayerType]
}

/** Only the fields the frontend reads; the API's Unicode symbols are not used. */
export interface PieceType {
  id: number
  nome: PieceName
  classe: string
}
