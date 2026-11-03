<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { listGameTypes } from '@/api/services/catalogue'
import { createGame } from '@/api/services/games'
import type { GameType } from '@/api/types/catalogue'
import type { GameTypeId } from '@/api/types/enums'
import ActionButton from '@/components/common/ActionButton.vue'
import ChoiceGroup from '@/components/common/ChoiceGroup.vue'
import type { ChoiceOption } from '@/components/common/choice'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useLocale } from '@/composables/useLocale'
import { useLoader, useRequest } from '@/composables/useRequest'
import { AI_VS_AI_GAME_TYPE, NO_TIME_LIMIT, SHIFT_TIME_OPTIONS } from '@/domain/constants'
import { gameTypeLabel } from '@/domain/labels'
import { askText } from '@/services/dialogs'

const { messages } = useLocale()
const router = useRouter()
const shiftTime = ref<number>(NO_TIME_LIMIT)
const shiftTimeOptions = computed<ChoiceOption<number>[]>(() =>
  SHIFT_TIME_OPTIONS.map((option) => ({
    value: option.value,
    label: messages.value.home.shiftTimes[option.key],
  })),
)
const { data: gameTypes, loading: loadingTypes } = useLoader<GameType[]>(listGameTypes, [])
const creation = useRequest()
const busy = computed(() => loadingTypes.value || creation.pending.value)

async function createGameWithType(type: GameTypeId): Promise<void> {
  const created = await creation.perform(() =>
    createGame({ tipoJogo: type, tempoDeTurnoEmMilisegundos: shiftTime.value }),
  )
  if (!created) {
    return
  }
  if (type === AI_VS_AI_GAME_TYPE) {
    await router.push({ name: 'game', params: { id: created.id, sideId: 0 } })
    return
  }
  await router.push({ name: 'selectSide', params: { id: created.id } })
}

function enterRoom(): void {
  const roomId = askText(messages.value.home.roomPrompt)?.trim()
  if (roomId) {
    void router.push({ name: 'selectSide', params: { id: roomId } })
  }
}
</script>

<template>
  <LoadingSpinner v-if="busy" :label="messages.common.loading" />
  <template v-else>
    <h1>{{ messages.home.title }}</h1>
    <p class="lead">{{ messages.home.lead }}</p>

    <div class="mt-3">
      <ChoiceGroup v-model="shiftTime" :options="shiftTimeOptions" />
    </div>

    <div class="d-flex">
      <div class="m-auto w-100 row">
        <div v-for="type in gameTypes" :key="type.id" class="col-md-4 mt-3">
          <ActionButton class="w-100" @click="createGameWithType(type.id)">
            {{ gameTypeLabel(type, messages.labels.playerTypes) }}
          </ActionButton>
        </div>
      </div>
    </div>

    <hr />
    <h2>{{ messages.home.or }}</h2>
    <ActionButton class="mt-3" @click="enterRoom">{{ messages.home.enterRoom }}</ActionButton>
  </template>
</template>
