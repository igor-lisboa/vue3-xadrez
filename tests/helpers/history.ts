import type { MoveName, PieceName, SideId, SimplifiedCell, SquareName } from '@/api/types/enums'
import type { GameHistorySource, PlayedMove, PlayedPiece } from '@/api/types/game-history'
import { startingPosition, type Cells } from '@/domain/replay'
import { squares } from './fixtures'

export function square(name: SquareName) {
  const found = squares.find((item) => item.casa === name)
  if (!found) {
    throw new Error(`unknown square ${name}`)
  }
  return found
}

export function piece(
  tipo: PieceName,
  ladoId: SideId,
  jogadasRealizadas: PlayedMove[] = [],
): PlayedPiece {
  return { tipo, ladoId, jogadasRealizadas }
}

interface MoveOptions {
  captured?: PlayedPiece
  name?: MoveName
  /** The rook of a castling, as the API lists it inside the king's move. */
  rook?: [SquareName, SquareName]
}

/**
 * A move as the API lists it. `index` is the position in the game: the API's turn count
 * is one ahead of it (the first move is made when one turn exists), and the time grows with it.
 */
export function played(
  index: number,
  from: SquareName,
  to: SquareName,
  options: MoveOptions = {},
): PlayedMove {
  const name = options.name ?? null
  return {
    identificador: index + 1,
    casaOrigem: square(from),
    casaDestino: square(to),
    pecaCapturada: options.captured ?? null,
    nomeJogada: name,
    movimentosEspeciaisExecutados: options.rook
      ? [played(index, options.rook[0], options.rook[1], { name })]
      : [],
    momento: 1_000 + index,
  }
}

/** The cell on a square of a position. */
export function cellAt(cells: Cells, name: SquareName): SimplifiedCell | null {
  return cells[squares.findIndex((item) => item.casa === name)] ?? null
}

/** Board cells with the given squares changed; the rest is the starting position. */
export function boardAfter(changes: Partial<Record<SquareName, SimplifiedCell | null>>): Cells {
  const cells = startingPosition()
  for (const [name, cell] of Object.entries(changes) as [SquareName, SimplifiedCell | null][]) {
    cells[squares.findIndex((item) => item.casa === name)] = cell
  }
  return cells
}

/** Game fields besides the moves and the board; by default a game in progress, White on the move. */
type GameFields = Pick<
  GameHistorySource,
  | 'ladoIdAtual'
  | 'finalizado'
  | 'motivoFinalizacao'
  | 'ladoIdVencedor'
  | 'ladoIdDesistente'
  | 'ladoBrancoTempoMilisegundosGasto'
  | 'ladoPretoTempoMilisegundosGasto'
>

/**
 * A full game as the API sends it. Moves at even positions belong to White, odd to Black.
 * `survivors` are the pieces on the board that carry their own move history (promoted pieces).
 */
export function makeHistory(
  moves: PlayedMove[],
  finalCells: Cells,
  survivors: Partial<Record<SquareName, PlayedPiece>> = {},
  game: Partial<GameFields> = {},
): GameHistorySource {
  const rows: (PlayedPiece | null)[][] = Array.from({ length: 8 }, () => [])
  finalCells.forEach((cell, index) => {
    const name = squares[index]!.casa
    const [tipo, side] = cell ? (cell.split('-') as [PieceName, string]) : [null, null]
    rows[Math.floor(index / 8)]!.push(
      survivors[name] ?? (tipo ? piece(tipo, side === '0' ? 0 : 1) : null),
    )
  })
  return {
    id: 7,
    ladoBranco: { jogadasRealizadas: moves.filter((_, index) => index % 2 === 0) },
    ladoPreto: { jogadasRealizadas: moves.filter((_, index) => index % 2 === 1) },
    tabuleiro: { casas: rows },
    ladoIdAtual: 0,
    finalizado: null,
    motivoFinalizacao: null,
    ladoIdVencedor: null,
    ladoIdDesistente: null,
    ladoBrancoTempoMilisegundosRestante: null,
    ladoBrancoTempoMilisegundosGasto: 0,
    ladoPretoTempoMilisegundosRestante: null,
    ladoPretoTempoMilisegundosGasto: 0,
    ...game,
  }
}
