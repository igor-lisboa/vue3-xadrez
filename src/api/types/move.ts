import type { MoveName, PieceName } from './enums'
import type { Square } from './catalogue'

/** Fields read from a legal move returned by GET /jogos/{id}/possiveis-jogadas. */
export interface PossibleMove {
  casaOrigem: Square
  casaDestino: Square
  nome: MoveName | null
  peca: PieceName
  captura: boolean
  capturavel: boolean
}
