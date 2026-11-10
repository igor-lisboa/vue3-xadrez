import type { MoveName, PieceName, SideId, SimplifiedCell, SquareName } from '@/api/types/enums'
import type { Square } from '@/api/types/catalogue'
import type { GameHistorySource, PlayedMove, PlayedPiece } from '@/api/types/game-history'
import { BLACK, WHITE } from './constants'

/** The 64 squares in the order the API lists them: A8 first, H1 last. */
export type Cells = (SimplifiedCell | null)[]

/** A move of the game, with the piece that made it (the API does not name it). */
export interface HistoryMove {
  /** Position in the game, counting from 0. */
  index: number
  /** Number of the move pair, as in a chess score: White's and Black's moves share a number. */
  number: number
  sideId: SideId
  piece: PieceName
  from: SquareName
  to: SquareName
  captured: PieceName | null
  moveName: MoveName
  /** The piece a pawn became, for a promotion. */
  promotedTo: PieceName | null
}

export interface GameReplay {
  moves: HistoryMove[]
  /** `positions[n]` is the board after `n` moves, so `positions[0]` is the starting position. */
  positions: Cells[]
  /**
   * False when the moves do not lead to the board the game ended on (for example a game that
   * started from a custom board). Then `moves` is empty and `positions` holds only the final board.
   */
  complete: boolean
}

const BOARD_SIZE = 8
const BACK_RANK: PieceName[] = [
  'Torre',
  'Cavalo',
  'Bispo',
  'Rainha',
  'Rei',
  'Bispo',
  'Cavalo',
  'Torre',
]

function cellOf(name: PieceName, sideId: SideId): SimplifiedCell {
  return `${name}-${sideId}`
}

/** Piece name of a board cell, for example `Rei` for `Rei-0`. */
export function pieceNameOf(cell: SimplifiedCell): PieceName {
  return cell.split('-')[0] as PieceName
}

/** Side of a board cell, for example 1 for `Rei-1`. */
export function sideOf(cell: SimplifiedCell): SideId {
  return cell.endsWith(`-${BLACK}`) ? BLACK : WHITE
}

function indexOf(square: Pick<Square, 'linha' | 'coluna'>): number {
  return square.linha * BOARD_SIZE + square.coluna
}

/** The standard opening position: Black on the first two rows, White on the last two. */
export function startingPosition(): Cells {
  const pawns = (sideId: SideId): Cells => Array(BOARD_SIZE).fill(cellOf('Peão', sideId))
  return [
    ...BACK_RANK.map((name) => cellOf(name, BLACK)),
    ...pawns(BLACK),
    ...Array<null>(BOARD_SIZE * 4).fill(null),
    ...pawns(WHITE),
    ...BACK_RANK.map((name) => cellOf(name, WHITE)),
  ]
}

function flatten(rows: GameHistorySource['tabuleiro']['casas']): Cells {
  return rows.flat().map((piece) => (piece ? cellOf(piece.tipo, piece.ladoId) : null))
}

interface PlayedEntry {
  move: PlayedMove
  sideId: SideId
}

/** Both sides' moves in the order they were played (the turn count grows with every move). */
function collectMoves(source: GameHistorySource): PlayedEntry[] {
  const entries: PlayedEntry[] = [
    ...source.ladoBranco.jogadasRealizadas.map((move) => ({ move, sideId: WHITE })),
    ...source.ladoPreto.jogadasRealizadas.map((move) => ({ move, sideId: BLACK })),
  ]
  return entries.sort(
    (a, b) => a.move.identificador - b.move.identificador || a.move.momento - b.move.momento,
  )
}

/**
 * The piece a pawn was promoted to. The API does not record the choice in the move, but the
 * new piece keeps the pawn's moves, so it is the piece that lists the promotion among its moves.
 * It is either still on the board or was captured later.
 */
function findPromotedPiece(move: PlayedMove, pool: readonly PlayedPiece[]): PieceName | null {
  const promoted = pool.find(
    (piece) =>
      piece.tipo !== 'Peão' &&
      piece.jogadasRealizadas.some(
        (played) =>
          played.nomeJogada === 'Promoção do Peão' &&
          played.identificador === move.identificador &&
          played.momento === move.momento,
      ),
  )
  return promoted?.tipo ?? null
}

/** Plays one move on `cells` (changing them). Returns null when the move does not fit the board. */
function playMove(
  cells: Cells,
  { move, sideId }: PlayedEntry,
  index: number,
  pool: readonly PlayedPiece[],
): HistoryMove | null {
  const from = indexOf(move.casaOrigem)
  const to = indexOf(move.casaDestino)
  const mover = cells[from]
  if (!mover || sideOf(mover) !== sideId) {
    return null
  }

  const enPassant = move.nomeJogada === 'En Passant'
  // The pawn taken en passant is beside the capturing pawn, not on the square it lands on.
  const capturedIndex = enPassant
    ? indexOf({ linha: move.casaOrigem.linha, coluna: move.casaDestino.coluna })
    : to
  const target = cells[capturedIndex]
  const captured = move.pecaCapturada?.tipo ?? null
  if ((target ? pieceNameOf(target) : null) !== captured) {
    return null
  }

  cells[capturedIndex] = null
  cells[from] = null
  cells[to] = mover

  for (const rookMove of move.movimentosEspeciaisExecutados) {
    const rook = cells[indexOf(rookMove.casaOrigem)]
    if (!rook) {
      return null
    }
    cells[indexOf(rookMove.casaOrigem)] = null
    cells[indexOf(rookMove.casaDestino)] = rook
  }

  let promotedTo: PieceName | null = null
  if (move.nomeJogada === 'Promoção do Peão') {
    promotedTo = findPromotedPiece(move, pool)
    if (!promotedTo) {
      return null
    }
    cells[to] = cellOf(promotedTo, sideId)
  }

  return {
    index,
    number: Math.floor(index / 2) + 1,
    sideId,
    piece: pieceNameOf(mover),
    from: move.casaOrigem.casa,
    to: move.casaDestino.casa,
    captured,
    moveName: move.nomeJogada,
    promotedTo,
  }
}

function sameCells(a: Cells, b: Cells): boolean {
  return a.length === b.length && a.every((cell, index) => cell === b[index])
}

/**
 * Rebuilds every position of a game from the moves the API lists, starting from the standard
 * position. The API keeps no snapshots of earlier positions, so this is the only way to step
 * through the game. The result is trusted only when it ends on the board the API reports.
 */
export function buildReplay(source: GameHistorySource): GameReplay {
  const finalPosition = flatten(source.tabuleiro.casas)
  const entries = collectMoves(source)
  const pool = [
    ...source.tabuleiro.casas.flat().filter((piece): piece is PlayedPiece => piece !== null),
    ...entries.flatMap(({ move }) => (move.pecaCapturada ? [move.pecaCapturada] : [])),
  ]

  const cells = startingPosition()
  const positions: Cells[] = [[...cells]]
  const moves: HistoryMove[] = []
  for (const entry of entries) {
    const played = playMove(cells, entry, moves.length, pool)
    if (!played) {
      return { moves: [], positions: [finalPosition], complete: false }
    }
    moves.push(played)
    positions.push([...cells])
  }

  if (!sameCells(cells, finalPosition)) {
    return { moves: [], positions: [finalPosition], complete: false }
  }
  return { moves, positions, complete: true }
}
