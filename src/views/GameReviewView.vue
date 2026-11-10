<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { SideId } from '@/api/types/enums'
import ActionButton from '@/components/common/ActionButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ChessBoard from '@/components/game/ChessBoard.vue'
import MaterialSummary from '@/components/game/MaterialSummary.vue'
import MoveList from '@/components/game/MoveList.vue'
import ReplayControls from '@/components/game/ReplayControls.vue'
import { useGameReplay } from '@/composables/useGameReplay'
import { useLocale } from '@/composables/useLocale'
import { translateEnding } from '@/domain/labels'
import { pairMoves } from '@/domain/move-text'

const props = defineProps<{ gameId: number; sideId: SideId }>()

const { messages } = useLocale()
const router = useRouter()

function goHome(): void {
  void router.push({ name: 'home' })
}

// A room that does not exist has nothing to review.
const replay = useGameReplay(props.gameId, props.sideId, { onError: goHome })
const review = computed(() => messages.value.review)
const resultText = computed(() =>
  replay.ending.value
    ? translateEnding(messages.value.labels.endings, replay.ending.value)
    : review.value.inProgress,
)
const canStep = computed(() => replay.replay.value?.complete === true)
const movePairs = computed(() => pairMoves(replay.replay.value?.moves ?? []))
const positionText = computed(() =>
  replay.step.value === 0
    ? review.value.startPosition
    : review.value.position(replay.step.value, replay.total.value),
)
</script>

<template>
  <LoadingSpinner v-if="replay.loading.value" :label="messages.common.loading" />
  <template v-else-if="replay.replay.value">
    <h1>{{ review.title }}</h1>
    <p class="lead">{{ review.room(gameId) }} · {{ resultText }}</p>
    <MaterialSummary
      v-if="replay.material.value"
      class="mb-3"
      :report="replay.material.value"
      :labels="{
        ...messages.material,
        sides: messages.labels.sides,
        pieces: messages.labels.pieces,
      }"
    />
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
    <div>
      <ActionButton class="mt-3" @click="goHome">{{ messages.common.newGame }}</ActionButton>
    </div>
  </template>
</template>

<style scoped>
.review-note {
  max-width: 656px;
}
</style>
