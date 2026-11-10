import { computed, ref, watch, type Ref } from 'vue'
import { makeMove } from '@/api/services/moves'
import { answerProposal, proposeDraw } from '@/api/services/proposals'
import type { SideId, SquareName } from '@/api/types/enums'
import type { GameSummary } from '@/api/types/game-summary'
import { canClaimWithMove, drawAction, drawOfferState } from '@/domain/draw'
import { notify } from '@/services/dialogs'
import { currentMessages } from '@/services/locale'
import { useRequest } from './useRequest'

interface DrawActionsOptions {
  gameId: number
  sideId: SideId
  summary: Ref<GameSummary | null>
  /** Reloads the game after a draw action. */
  refresh: () => Promise<unknown>
}

/**
 * Draw offers and claims on the Game screen. An offer never blocks the board: the side that
 * received it may answer it here or just move, which declines it. The API decides whether a
 * claim is valid; the frontend only shows what `empateReivindicavel` allows.
 */
export function useDrawActions(options: DrawActionsOptions) {
  const { gameId, sideId, summary, refresh } = options
  const request = useRequest()
  /** The player chose to claim a draw with the next move instead of just playing it. */
  const claimWithNextMove = ref(false)

  const offer = computed(() => (summary.value ? drawOfferState(summary.value, sideId) : null))
  const action = computed(() => (summary.value ? drawAction(summary.value, sideId) : null))
  const moveClaimAllowed = computed(
    () => summary.value !== null && canClaimWithMove(summary.value, sideId),
  )

  // The option belongs to one turn: it is cleared when the turn passes or the game ends.
  watch(moveClaimAllowed, (allowed) => {
    if (!allowed) {
      claimWithNextMove.value = false
    }
  })

  /** Claims a draw when the position allows it, otherwise offers one (the API decides). */
  async function requestDraw(): Promise<void> {
    const outcome = await request.perform(() => proposeDraw(gameId, sideId))
    if (outcome) {
      notify(outcome.message)
    }
    await refresh()
  }

  async function answerOffer(accepted: boolean): Promise<void> {
    const message = await request.perform(() => answerProposal(gameId, sideId, 'empate', accepted))
    if (message !== undefined) {
      notify(message)
    }
    await refresh()
  }

  /**
   * Plays a move from the board. With the claim option on, the move is sent as a draw claim
   * instead: a valid claim ends the game without the move, otherwise the move is played and a
   * draw offer is left. Errors are thrown to the caller, which shows them.
   */
  async function playMove(origin: SquareName, destination: SquareName): Promise<void> {
    if (!claimWithNextMove.value) {
      await makeMove(gameId, sideId, origin, destination)
      return
    }
    claimWithNextMove.value = false
    const outcome = await proposeDraw(gameId, sideId, { origem: origin, destino: destination })
    notify(
      outcome.claimed
        ? outcome.message
        : `${outcome.message}\n${currentMessages().game.claimNotValid}`,
    )
  }

  return {
    offer,
    action,
    moveClaimAllowed,
    claimWithNextMove,
    requestDraw,
    answerOffer,
    playMove,
    pending: request.pending,
  }
}
