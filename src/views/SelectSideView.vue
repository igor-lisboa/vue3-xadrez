<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { listSidesWithoutPlayer } from '@/api/services/games'
import { joinGame } from '@/api/services/players'
import type { SideSlot } from '@/api/types/game'
import type { SideId } from '@/api/types/enums'
import ActionButton from '@/components/common/ActionButton.vue'
import ChoiceGroup from '@/components/common/ChoiceGroup.vue'
import type { ChoiceOption } from '@/components/common/choice'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useLoader, useRequest } from '@/composables/useRequest'
import { HUMAN_PLAYER } from '@/domain/constants'
import { SIDE_LABELS } from '@/domain/labels'
import { notify } from '@/services/dialogs'

const props = defineProps<{ gameId: number; preselectedSide: SideId | null }>()

const router = useRouter()
const selectedSide = ref<SideId | null>(props.preselectedSide)
const {
  data: emptySides,
  loading: loadingSides,
  reload,
} = useLoader<SideSlot[]>(() => listSidesWithoutPlayer(props.gameId), [], {
  onError: () => void router.push({ name: 'home' }),
})
const joining = useRequest()
const busy = computed(() => loadingSides.value || joining.pending.value)

const options = computed<ChoiceOption<SideId>[]>(() =>
  emptySides.value.map((side) => ({ value: side.id, label: SIDE_LABELS[side.id] })),
)

async function joinSelectedSide(): Promise<void> {
  const side = selectedSide.value
  if (side === null) {
    return
  }
  const message = await joining.perform(() =>
    joinGame(props.gameId, { ladoId: side, tipoId: HUMAN_PLAYER }),
  )
  if (message === undefined) {
    await reload()
    return
  }
  notify(message)
  await router.push({ name: 'game', params: { id: props.gameId, sideId: side } })
}

function goHome(): void {
  void router.push({ name: 'home' })
}
</script>

<template>
  <LoadingSpinner v-if="busy" />
  <template v-else>
    <template v-if="emptySides.length > 0">
      <h1>Choose an available side to play game {{ gameId }}</h1>
      <p class="lead">Click the option you want</p>

      <div class="mt-3">
        <ChoiceGroup v-model="selectedSide" :options="options" />
      </div>

      <ActionButton class="mt-3" :disabled="selectedSide === null" @click="joinSelectedSide">
        Join game
      </ActionButton>
    </template>
    <template v-else>
      <h1>This game has no available sides</h1>
      <ActionButton class="mt-3" @click="goHome">New game?</ActionButton>
    </template>
  </template>
</template>
