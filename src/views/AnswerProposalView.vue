<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { answerProposal } from '@/api/services/proposals'
import type { ProposalKind, SideId } from '@/api/types/enums'
import ActionButton from '@/components/common/ActionButton.vue'
import ChoiceGroup from '@/components/common/ChoiceGroup.vue'
import type { ChoiceOption } from '@/components/common/choice'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useGameSocket } from '@/composables/useGameSocket'
import { useGameState } from '@/composables/useGameState'
import { useLocale } from '@/composables/useLocale'
import { useRequest } from '@/composables/useRequest'
import { ANSWER_ACTION } from '@/domain/game-screen'
import { notify } from '@/services/dialogs'

const props = defineProps<{
  gameId: number
  sideId: SideId
  proposalType: 'tie' | 'reset'
}>()

const { messages } = useLocale()
const router = useRouter()
const kind: ProposalKind = props.proposalType === 'tie' ? 'empate' : 'reset'
const { summary, refresh } = useGameState(props.gameId, props.sideId)
const answer = ref<boolean | null>(null)
const response = useRequest()
const busy = computed(() => response.pending.value)

/** Only the side that received the proposal can answer it. The other side waits. */
const isAnswerer = computed(
  () =>
    summary.value?.acoesSolicitadas.some(
      (requested) => requested.acao === ANSWER_ACTION[kind] && requested.ladoId === props.sideId,
    ) ?? false,
)

const options = computed<ChoiceOption<boolean>[]>(() => [
  { value: true, label: messages.value.answer.accept },
  { value: false, label: messages.value.answer.decline },
])

useGameSocket(props.gameId, props.sideId, {
  drawAnswered: refresh,
  resetAnswered: refresh,
})

async function respond(): Promise<void> {
  const accepted = answer.value
  if (accepted === null) {
    return
  }
  const message = await response.perform(() =>
    answerProposal(props.gameId, props.sideId, kind, accepted),
  )
  if (message !== undefined) {
    notify(message)
  }
  await router.push({ name: 'game', params: { id: props.gameId, sideId: props.sideId } })
}

onMounted(() => void refresh())
</script>

<template>
  <LoadingSpinner v-if="!summary || busy" :label="messages.common.loading" />
  <template v-else-if="isAnswerer">
    <h1>{{ messages.answer.received[kind] }}</h1>
    <p class="lead">{{ messages.answer.lead }}</p>

    <div class="mt-3">
      <ChoiceGroup v-model="answer" :options="options" />
    </div>

    <ActionButton class="mt-3" :disabled="answer === null" @click="respond">
      {{ messages.answer.respond }}
    </ActionButton>
  </template>
  <template v-else>
    <h1>{{ messages.answer.waiting[kind] }}</h1>
  </template>
</template>
