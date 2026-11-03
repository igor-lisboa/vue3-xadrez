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
import { useRequest } from '@/composables/useRequest'
import { ANSWER_ACTION } from '@/domain/game-screen'
import { PROPOSAL_LABELS } from '@/domain/labels'
import { notify } from '@/services/dialogs'

const props = defineProps<{
  gameId: number
  sideId: SideId
  proposalType: 'tie' | 'reset'
}>()

const router = useRouter()
const kind: ProposalKind = props.proposalType === 'tie' ? 'empate' : 'reset'
const label = PROPOSAL_LABELS[kind]
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

const options: ChoiceOption<boolean>[] = [
  { value: true, label: 'Accept' },
  { value: false, label: 'Decline' },
]

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
  <LoadingSpinner v-if="!summary || busy" />
  <template v-else-if="isAnswerer">
    <h1>You received a {{ label }} proposal</h1>
    <p class="lead">Click the answer you want</p>

    <div class="mt-3">
      <ChoiceGroup v-model="answer" :options="options" />
    </div>

    <ActionButton class="mt-3" :disabled="answer === null" @click="respond">Respond</ActionButton>
  </template>
  <template v-else>
    <h1>Waiting for the answer to the {{ label }} proposal...</h1>
  </template>
</template>
