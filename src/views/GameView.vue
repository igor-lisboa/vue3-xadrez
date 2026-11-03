<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { listPieceTypes, listSquares } from '@/api/services/catalogue'
import { leaveGame } from '@/api/services/players'
import { proposeToOpponent } from '@/api/services/proposals'
import { triggerAi } from '@/api/services/ai'
import type { PieceType, Square } from '@/api/types/catalogue'
import type { SideId } from '@/api/types/enums'
import ChessBoard from '@/components/game/ChessBoard.vue'
import ClockPanel from '@/components/game/ClockPanel.vue'
import GameActions from '@/components/game/GameActions.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useChessBoard } from '@/composables/useChessBoard'
import { useGameSocket } from '@/composables/useGameSocket'
import { useGameState } from '@/composables/useGameState'
import { useLocale } from '@/composables/useLocale'
import { useLoader, useRequest } from '@/composables/useRequest'
import { useTurnClock } from '@/composables/useTurnClock'
import { AI_VS_AI_GAME_LABEL, NO_TIME_LIMIT } from '@/domain/constants'
import { translateGameType } from '@/domain/labels'
import { notify } from '@/services/dialogs'

const props = defineProps<{ gameId: number; sideId: SideId }>()

const { messages } = useLocale()
const router = useRouter()
const { summary, refresh } = useGameState(props.gameId, props.sideId)
const { data: squares } = useLoader<Square[]>(listSquares, [])
const { data: pieces } = useLoader<PieceType[]>(listPieceTypes, [])
const { houses, selectHouse } = useChessBoard({
  gameId: props.gameId,
  sideId: props.sideId,
  summary,
  squares,
  pieces,
  onMoveAttempted: refresh,
})
const { whiteMs, blackMs } = useTurnClock(summary, () => void refresh())
const actions = useRequest()
const busy = computed(() => actions.pending.value)
/** The API sends the game type in Portuguese; the header shows it in the language in use. */
const gameTypeName = computed(() =>
  translateGameType(summary.value?.tipoJogo ?? '', messages.value.labels.playerTypes),
)

useGameSocket(props.gameId, props.sideId, {
  opponentJoined: () => {
    notify(messages.value.game.opponentJoined)
    return refresh()
  },
  moveMade: refresh,
  drawProposed: refresh,
  drawAnswered: refresh,
  resetProposed: refresh,
  resetAnswered: refresh,
  gameFinished: refresh,
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

async function proposeDraw(): Promise<void> {
  const message = await actions.perform(() =>
    proposeToOpponent(props.gameId, props.sideId, 'empate'),
  )
  if (message !== undefined) {
    notify(message)
  }
  await refresh()
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

    <ChessBoard
      :houses="houses"
      :highlight-turn="summary.ladoIdAtual === sideId"
      :spectator-only="summary.tipoJogo === AI_VS_AI_GAME_LABEL"
      :move-labels="messages.labels.moves"
      @select="selectHouse"
    />

    <ClockPanel
      v-if="summary.tempoDeTurnoEmMilisegundos !== NO_TIME_LIMIT"
      :white-ms="whiteMs"
      :black-ms="blackMs"
      :labels="messages.labels.sides"
    />

    <GameActions
      :labels="{ resign: messages.game.resign, offerDraw: messages.game.offerDraw }"
      @resign="resign"
      @propose-draw="proposeDraw"
    />
  </template>
</template>
