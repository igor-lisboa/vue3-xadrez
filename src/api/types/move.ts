import type { MoveName, PieceName } from './enums'
import type { Square } from './catalogue'

/** A legal move of a piece (item of GET /jogos/{id}/pecas/{casa}/possiveis-jogadas). */
export interface PossibleMove {
  casaOrigem: Square
  casaDestino: Square
  nome: MoveName
  peca: PieceName
  captura: boolean
  capturavel: boolean
}
