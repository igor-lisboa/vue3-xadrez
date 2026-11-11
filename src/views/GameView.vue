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
import { useLocale } from '@/composables/useLocale'
import { useLoader, useRequest } from '@/composables/useRequest'
import { useTurnClock } from '@/composables/useTurnClock'
import { timeLimitOf } from '@/domain/clock'
import { AI_VS_AI_GAME_LABEL, NO_TIME_LIMIT } from '@/domain/constants'
import { translateGameType } from '@/domain/labels'
import { notify } from '@/services/dialogs'

const props = defineProps<{ gameId: number; sideId: SideId }>()

const { messages } = useLocale()
const router = useRouter()
const { summary, refresh } = useGameState(props.gameId, props.sideId)
const { data: squares } = useLoader<Square[]>(listSquares, [])
const { data: pieces } = useLoader<PieceType[]>(listPieceTypes, [])
const draw = useDrawActions({ gameId: props.gameId, sideId: props.sideId, summary, refresh })
const { houses, selectHouse } = useChessBoard({
  gameId: props.gameId,
  sideId: props.sideId,
  summary,
  squares,
  pieces,
  onMoveAttempted: refresh,
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

useGameSocket(props.gameId, props.sideId, {
  opponentJoined: () => {
    notify(messages.value.game.opponentJoined)
    return refresh()
  },
  // The event carries the clocks as they are now: show them at once, then reload the rest.
  moveMade: (payload) => {
    applyClocks(payload)
    return refresh()
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
  // The API runs the AI player when asked. A failure here does not block the game.
  await triggerAi().catch((error: unknown) => console.warn('AI trigger failed', error))
})
</script>

<template>
  <LoadingSpinner v-if="!summary || busy" :label="messages.common.loading" />
  <template v-else>
    <div class="alert alert-light" role="alert">{{ summary.id }} | {{ gameTypeName }}</div>

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
      :highlight-turn="summary.ladoIdAtual === sideId"
      :spectator-only="spectatorOnly"
      :move-labels="messages.labels.moves"
      @select="selectHouse"
    />

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
