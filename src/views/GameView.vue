<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { listPieceTypes, listSquares } from '@/api/services/catalogue'
import { leaveGame } from '@/api/services/players'
import { triggerAi } from '@/api/services/ai'
import type { PieceType, Square } from '@/api/types/catalogue'
import type { SideId } from '@/api/types/enums'
import ChessBoard from '@/components/game/ChessBoard.vue'
import ClaimWithMoveOption from '@/components/game/ClaimWithMoveOption.vue'
import ClockPanel from '@/components/game/ClockPanel.vue'
import DrawOfferPanel from '@/components/game/DrawOfferPanel.vue'
import GameActions from '@/components/game/GameActions.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useChessBoard } from '@/composables/useChessBoard'
import { useDrawActions } from '@/composables/useDrawActions'
import { useGameSocket } from '@/composables/useGameSocket'
import { useGameState } from '@/composables/useGameState'
import { useOpponentLastMove } from '@/composables/useOpponentLastMove'
import { useLocale } from '@/composables/useLocale'
import { useLoader, useRequest } from '@/composables/useRequest'
import { useTurnClock } from '@/composables/useTurnClock'
import { timeLimitOf } from '@/domain/clock'
import { AI_VS_AI_GAME_LABEL, NO_TIME_LIMIT } from '@/domain/constants'
import { translateGameType } from '@/domain/labels'
import { describeMove } from '@/domain/move-text'
import { notify } from '@/services/dialogs'

const props = defineProps<{ gameId: number; sideId: SideId }>()

const { messages } = useLocale()
const router = useRouter()
const { summary, refresh } = useGameState(props.gameId, props.sideId)
const { move: opponentMove, refresh: refreshOpponentMove } = useOpponentLastMove(
  props.gameId,
  props.sideId,
)
const { data: squares } = useLoader<Square[]>(listSquares, [])
const { data: pieces } = useLoader<PieceType[]>(listPieceTypes, [])
const draw = useDrawActions({ gameId: props.gameId, sideId: props.sideId, summary, refresh })
const { houses, selectHouse, movesReady } = useChessBoard({
  gameId: props.gameId,
  sideId: props.sideId,
  summary,
  squares,
  pieces,
  onMoveAttempted: refreshAfterMove,
  playMove: draw.playMove,
})
const { whiteMs, blackMs, applyClocks } = useTurnClock(summary, () => void refresh())
const actions = useRequest()
const busy = computed(() => actions.pending.value || draw.pending.value)
const spectatorOnly = computed(() => summary.value?.tipoJogo === AI_VS_AI_GAME_LABEL)
/** The API sends the game type in Portuguese; the header shows it in the language in use. */
const gameTypeName = computed(() =>
  translateGameType(summary.value?.tipoJogo ?? '', messages.value.labels.playerTypes),
)
const opponentMoveText = computed(() => {
  const move = opponentMove.value
  return move
    ? messages.value.game.opponentLastMove(
        describeMove(move, messages.value.labels.pieces, messages.value.labels.moves),
      )
    : null
})
const opponentMoveOnBoard = computed(() =>
  summary.value?.ladoIdAtual === props.sideId ? opponentMove.value : null,
)

async function refreshAfterMove(): Promise<void> {
  await Promise.all([refresh(), refreshOpponentMove()])
}

useGameSocket(props.gameId, props.sideId, {
  opponentJoined: () => {
    notify(messages.value.game.opponentJoined)
    return refresh()
  },
  // The event carries the clocks as they are now: show them at once, then reload the rest.
  moveMade: (payload) => {
    applyClocks(payload)
    return refreshAfterMove()
  },
  drawProposed: refresh,
  drawAnswered: refresh,
  resetProposed: refresh,
  resetAnswered: refresh,
  gameFinished: (payload) => {
    applyClocks(payload)
    return refresh()
  },
})

async function resign(): Promise<void> {
  const message = await actions.perform(() => leaveGame(props.gameId, props.sideId))
  if (message === undefined) {
    await refresh()
    return
  }
  notify(message)
  await router.push({ name: 'home' })
}

onMounted(async () => {
  await refresh()
  void refreshOpponentMove()
  // The API runs the AI player when asked. A failure here does not block the game.
  await triggerAi().catch((error: unknown) => console.warn('AI trigger failed', error))
})
</script>

<template>
  <LoadingSpinner v-if="!summary || busy" :label="messages.common.loading" />
  <template v-else>
    <div class="game-status-bar mx-auto">
      <span class="game-summary">{{ summary.id }} | {{ gameTypeName }}</span>
      <span
        class="turn-status"
        :class="{ 'turn-status-hidden': summary.ladoIdAtual !== sideId || !movesReady }"
        :aria-hidden="summary.ladoIdAtual !== sideId || !movesReady"
        role="status"
      >
        {{ messages.game.yourTurn }}
      </span>
    </div>

    <DrawOfferPanel
      v-if="draw.offer.value"
      :state="draw.offer.value"
      :labels="{
        received: messages.answer.received.empate,
        sent: messages.answer.waiting.empate,
        moveDeclines: messages.game.moveDeclinesDraw,
        accept: messages.answer.accept,
        decline: messages.answer.decline,
      }"
      @answer="draw.answerOffer"
    />

    <ChessBoard
      :houses="houses"
      :highlight-turn="summary.ladoIdAtual === sideId && movesReady"
      :spectator-only="spectatorOnly"
      :move-labels="messages.labels.moves"
      :last-move="opponentMoveOnBoard"
      @select="selectHouse"
    />

    <p v-if="opponentMoveText" class="opponent-last-move mx-auto" role="status">
      <span class="move-route" aria-hidden="true">
        <span class="route-square route-origin"></span>
        <span class="route-arrow">→</span>
        <span
          class="route-square"
          :class="opponentMove?.captured ? 'route-capture' : 'route-destination'"
        ></span>
      </span>
      <span>{{ opponentMoveText }}</span>
    </p>

    <ClockPanel
      v-if="timeLimitOf(summary) !== NO_TIME_LIMIT"
      :white-ms="whiteMs"
      :black-ms="blackMs"
      :labels="messages.labels.sides"
    />

    <GameActions
      :draw-action="draw.action.value"
      :labels="messages.game"
      @resign="resign"
      @propose-draw="draw.requestDraw"
    />

    <ClaimWithMoveOption
      v-if="draw.moveClaimAllowed.value && !spectatorOnly"
      v-model="draw.claimWithNextMove.value"
      :labels="{ label: messages.game.claimWithMove, warning: messages.game.claimWithMoveWarning }"
    />
  </template>
</template>

<style scoped>
.game-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  max-width: 656px;
  margin-bottom: 0.75rem;
  padding: 0.55rem 0.75rem;
  border: 1px solid #495057;
  border-radius: 0.5rem;
  background: rgb(255 255 255 / 0.05);
}

.game-summary {
  color: #dee2e6;
}

.turn-status {
  flex: 0 0 auto;
  padding: 0.25rem 0.65rem;
  border: 1px solid #75b798;
  border-radius: 999px;
  background: #0f5132;
  color: #d1e7dd;
  font-weight: 600;
}

/* Keep the same space while turns change or legal moves are loading. */
.turn-status-hidden {
  visibility: hidden;
}

.opponent-last-move {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  max-width: 656px;
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
  padding: 0.55rem 0.75rem;
  border: 1px solid #495057;
  border-radius: 0.5rem;
  background: rgb(255 255 255 / 0.05);
  color: #dee2e6;
}

.move-route {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  flex: 0 0 auto;
}

.route-square {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 0.15rem;
}

.route-origin {
  background: #ffc107;
}

.route-destination {
  background: #0dcaf0;
}

.route-capture {
  background: #dc3545;
}

.route-arrow {
  color: #adb5bd;
}

@media (max-width: 420px) {
  .game-status-bar,
  .opponent-last-move {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
