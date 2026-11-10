<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { proposeToOpponent } from '@/api/services/proposals'
import type { SideId } from '@/api/types/enums'
import ActionButton from '@/components/common/ActionButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import MaterialSummary from '@/components/game/MaterialSummary.vue'
import { useGameSocket } from '@/composables/useGameSocket'
import { useGameState } from '@/composables/useGameState'
import { useLocale } from '@/composables/useLocale'
import { useRequest } from '@/composables/useRequest'
import { explainInsufficientMaterial } from '@/domain/material'
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
const material = computed(() =>
  summary.value
    ? explainInsufficientMaterial({
        ending: summary.value.finalizado,
        cells: summary.value.tabuleiro.flat(),
        sideOnMove: summary.value.ladoIdAtual,
        timeLimitMs: summary.value.tempoDeTurnoEmMilisegundos,
      })
    : null,
)

async function goToGame(): Promise<void> {
  await router.push({ name: 'game', params: { id: props.gameId, sideId: props.sideId } })
}

function goHome(): void {
  void router.push({ name: 'home' })
}

function openReview(): void {
  void router.push({
    name: 'gameReview',
    params: { id: props.gameId },
    query: { side: props.sideId },
  })
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
    <MaterialSummary
      v-if="material"
      class="mt-3"
      :report="material"
      :labels="{
        ...messages.material,
        sides: messages.labels.sides,
        pieces: messages.labels.pieces,
      }"
    />
    <div class="btn-group" role="group">
      <ActionButton class="mt-3" @click="goHome">{{ messages.common.newGame }}</ActionButton>
      <ActionButton class="mt-3" variant="dark" @click="proposeReset">
        {{ messages.endGame.proposeReset }}
      </ActionButton>
    </div>
    <div>
      <ActionButton class="mt-3 review-game" @click="openReview">
        {{ messages.endGame.reviewGame }}
      </ActionButton>
    </div>
  </template>
</template>
