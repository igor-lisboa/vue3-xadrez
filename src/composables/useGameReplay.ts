import { computed, onMounted, onUnmounted, ref } from 'vue'
import { listPieceTypes, listSquares } from '@/api/services/catalogue'
import { getGameHistory } from '@/api/services/games'
import type { PieceType, Square } from '@/api/types/catalogue'
import type { SideId } from '@/api/types/enums'
import { createBoardHouses } from '@/domain/board'
import { markPlayedMove } from '@/domain/highlights'
import { orientForSide } from '@/domain/orientation'
import { buildReplay, type GameReplay } from '@/domain/replay'
import { useLoader } from './useRequest'

/** Keys that step through the replay, with the step they ask for. */
const KEY_STEPS = {
  ArrowLeft: 'previous',
  ArrowRight: 'next',
  Home: 'first',
  End: 'last',
} as const

/** Keys typed into a form control belong to that control (a language list, for example). */
function isFormControl(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  )
}

/**
 * Review of a finished game: loads its moves and lets the player step through the positions,
 * with the buttons, the move list or the keyboard (left and right arrows, Home and End).
 * It opens on the final position, so the player first sees how the game ended.
 */
export function useGameReplay(gameId: number, sideId: SideId) {
  const { data: squares } = useLoader<Square[]>(listSquares, [])
  const { data: pieces } = useLoader<PieceType[]>(listPieceTypes, [])
  const { data: replay, loading } = useLoader<GameReplay | null>(
    async () => buildReplay(await getGameHistory(gameId)),
    null,
  )

  /** The step the player chose; null follows the last position until the player moves. */
  const chosenStep = ref<number | null>(null)
  const total = computed(() => replay.value?.moves.length ?? 0)
  const step = computed(() => Math.min(Math.max(chosenStep.value ?? total.value, 0), total.value))
  /** The move that led to the position on the board, or null at the starting position. */
  const currentMove = computed(() => replay.value?.moves[step.value - 1] ?? null)

  const houses = computed(() => {
    const cells = replay.value?.positions[step.value]
    if (!cells || squares.value.length === 0) {
      return []
    }
    const board = createBoardHouses(
      orientForSide(cells, sideId),
      orientForSide(squares.value, sideId),
      pieces.value,
      null,
    )
    return currentMove.value ? markPlayedMove(board, currentMove.value) : board
  })

  const canGoBack = computed(() => step.value > 0)
  const canGoForward = computed(() => step.value < total.value)

  function goTo(target: number): void {
    chosenStep.value = Math.min(Math.max(target, 0), total.value)
  }

  const steps = {
    first: () => goTo(0),
    previous: () => goTo(step.value - 1),
    next: () => goTo(step.value + 1),
    last: () => goTo(total.value),
  }

  function onKeydown(event: KeyboardEvent): void {
    const action = KEY_STEPS[event.key as keyof typeof KEY_STEPS]
    if (!action || isFormControl(event.target) || event.altKey || event.ctrlKey || event.metaKey) {
      return
    }
    event.preventDefault()
    steps[action]()
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onUnmounted(() => window.removeEventListener('keydown', onKeydown))

  return {
    replay,
    loading,
    houses,
    step,
    total,
    currentMove,
    canGoBack,
    canGoForward,
    goTo,
    ...steps,
  }
}
