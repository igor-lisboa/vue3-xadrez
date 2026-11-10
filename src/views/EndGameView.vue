<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { proposeToOpponent } from '@/api/services/proposals'
import type { SideId } from '@/api/types/enums'
import ActionButton from '@/components/common/ActionButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ChessBoard from '@/components/game/ChessBoard.vue'
import MoveList from '@/components/game/MoveList.vue'
import ReplayControls from '@/components/game/ReplayControls.vue'
import { useGameReplay } from '@/composables/useGameReplay'
import { useGameSocket } from '@/composables/useGameSocket'
import { useGameState } from '@/composables/useGameState'
import { useLocale } from '@/composables/useLocale'
import { useRequest } from '@/composables/useRequest'
import { pairMoves } from '@/domain/move-text'
import { notify } from '@/services/dialogs'

const props = defineProps<{ gameId: number; sideId: SideId }>()

const { messages } = useLocale()
const router = useRouter()
const { summary, refresh } = useGameState(props.gameId, props.sideId)
const proposal = useRequest()
const busy = computed(() => proposal.pending.value)
const endingText = computed(() =>
  summary.value?.finalizado ? messages.value.labels.endings[summary.value.finalizado] : '',
)

const replay = useGameReplay(props.gameId, props.sideId)
const review = computed(() => messages.value.endGame.review)
const canStep = computed(() => replay.replay.value?.complete === true)
const movePairs = computed(() => pairMoves(replay.replay.value?.moves ?? []))
const positionText = computed(() =>
  replay.step.value === 0
    ? review.value.startPosition
    : review.value.position(replay.step.value, replay.total.value),
)

async function goToGame(): Promise<void> {
  await router.push({ name: 'game', params: { id: props.gameId, sideId: props.sideId } })
}

function goHome(): void {
  void router.push({ name: 'home' })
}

// A new proposal or an answer means the game goes on, so the player returns to the game.
useGameSocket(props.gameId, props.sideId, {
  drawProposed: goToGame,
  drawAnswered: goToGame,
  resetProposed: goToGame,
  resetAnswered: goToGame,
})

async function proposeReset(): Promise<void> {
  const message = await proposal.perform(() =>
    proposeToOpponent(props.gameId, props.sideId, 'reset'),
  )
  if (message !== undefined) {
    notify(message)
  }
  await goToGame()
}

onMounted(() => void refresh())
</script>

<template>
  <LoadingSpinner v-if="busy" :label="messages.common.loading" />
  <template v-else>
    <h1>{{ endingText }}</h1>

    <section class="mt-3" :aria-label="review.title">
      <h2 class="h4">{{ review.title }}</h2>
      <LoadingSpinner v-if="replay.loading.value" :label="messages.common.loading" />
      <template v-else>
        <p v-if="!canStep" class="alert alert-light mx-auto review-note">
          {{ review.unavailable }}
        </p>
        <ChessBoard
          :houses="replay.houses.value"
          :highlight-turn="false"
          spectator-only
          :move-labels="messages.labels.moves"
        />
        <template v-if="canStep">
          <ReplayControls
            :can-go-back="replay.canGoBack.value"
            :can-go-forward="replay.canGoForward.value"
            :labels="{ ...review, position: positionText }"
            @first="replay.first"
            @previous="replay.previous"
            @next="replay.next"
            @last="replay.last"
          />
          <p v-if="replay.total.value === 0" class="mt-3">{{ review.noMoves }}</p>
          <MoveList
            v-else
            :pairs="movePairs"
            :step="replay.step.value"
            :labels="{
              title: review.moveList,
              sides: messages.labels.sides,
              pieces: messages.labels.pieces,
              moves: messages.labels.moves,
            }"
            @select="replay.goTo"
          />
        </template>
      </template>
    </section>

    <div class="btn-group end-game-actions" role="group">
      <ActionButton class="mt-3" @click="goHome">{{ messages.common.newGame }}</ActionButton>
      <ActionButton class="mt-3" variant="dark" @click="proposeReset">
        {{ messages.endGame.proposeReset }}
      </ActionButton>
    </div>
  </template>
</template>

<style scoped>
.review-note {
  max-width: 656px;
}
</style>
