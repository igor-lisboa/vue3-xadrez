import { computed, ref, watch, type Ref } from 'vue'
import type { PieceType, Square } from '@/api/types/catalogue'
import type { SideId } from '@/api/types/enums'
import type { GameSummary } from '@/api/types/game-summary'
import { listPossibleMoves, makeMove } from '@/api/services/moves'
import { createBoardHouses } from '@/domain/board'
import { orientForSide } from '@/domain/orientation'
import { clearHighlights, markOrigin, markPossibleMoves } from '@/domain/highlights'
import type { BoardHouse } from '@/domain/types'
import { useRequest } from './useRequest'

interface ChessBoardOptions {
  gameId: number
  sideId: SideId
  summary: Ref<GameSummary | null>
  squares: Ref<Square[]>
  pieces: Ref<PieceType[]>
  /** Runs after a move is attempted, to reload the game. */
  onMoveAttempted: () => Promise<unknown>
}

/**
 * Board of the game and the selection logic: the first click selects a piece and shows
 * its legal moves, the second click on a highlighted square plays the move.
 */
export function useChessBoard(options: ChessBoardOptions) {
  const { gameId, sideId, summary, squares, pieces, onMoveAttempted } = options
  const request = useRequest()
  const houses = ref<BoardHouse[]>([])

  const orientedSquares = computed(() => orientForSide(squares.value, sideId))

  function rebuild(): void {
    const current = summary.value
    if (!current || squares.value.length === 0) {
      houses.value = []
      return
    }
    const cells = orientForSide(current.tabuleiro.flat(), sideId)
    const checkedSide = current.chequeLadoAtual ? current.ladoIdAtual : null
    houses.value = createBoardHouses(cells, orientedSquares.value, pieces.value, checkedSide)
  }

  watch([summary, squares, pieces], rebuild, { immediate: true })

  async function selectHouse(index: number): Promise<void> {
    const square = orientedSquares.value[index]
    if (!square) {
      return
    }
    const originIndex = houses.value.findIndex((house) => house.movementOrigin)
    const destination = houses.value.find(
      (house) => house.house === square.casa && house.possibleMovement,
    )

    if (originIndex !== -1 && destination) {
      const origin = houses.value[originIndex]
      if (origin) {
        await request.perform(() => makeMove(gameId, sideId, origin.house, destination.house))
      }
      await onMoveAttempted()
      return
    }

    houses.value = clearHighlights(houses.value)
    const moves = await request.perform(() => listPossibleMoves(gameId, sideId, square.casa))
    if (!moves) {
      return
    }
    houses.value = markPossibleMoves(markOrigin(houses.value, index), moves)
  }

  return { houses, selectHouse, loading: request.pending }
}
