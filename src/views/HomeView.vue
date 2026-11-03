<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { listGameTypes } from '@/api/services/catalogue'
import { createGame } from '@/api/services/games'
import type { GameType } from '@/api/types/catalogue'
import type { GameTypeId } from '@/api/types/enums'
import ActionButton from '@/components/common/ActionButton.vue'
import ChoiceGroup from '@/components/common/ChoiceGroup.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useLoader, useRequest } from '@/composables/useRequest'
import { AI_VS_AI_GAME_TYPE, NO_TIME_LIMIT, SHIFT_TIME_OPTIONS } from '@/domain/constants'
import { gameTypeLabel } from '@/domain/labels'
import { askText } from '@/services/dialogs'

const router = useRouter()
const shiftTime = ref<number>(NO_TIME_LIMIT)
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
  const roomId = askText('Which room do you want to enter?')?.trim()
  if (roomId) {
    void router.push({ name: 'selectSide', params: { id: roomId } })
  }
}
</script>

<template>
  <LoadingSpinner v-if="busy" />
  <template v-else>
    <h1>Hello</h1>
    <p class="lead">Click the option you want for the player types and the turn time.</p>

    <div class="mt-3">
      <ChoiceGroup v-model="shiftTime" :options="SHIFT_TIME_OPTIONS" />
    </div>

    <div class="d-flex">
      <div class="m-auto w-100 row">
        <div v-for="type in gameTypes" :key="type.id" class="col-md-4 mt-3">
          <ActionButton class="w-100" @click="createGameWithType(type.id)">
            {{ gameTypeLabel(type) }}
          </ActionButton>
        </div>
      </div>
    </div>

    <hr />
    <h2>OR</h2>
    <ActionButton class="mt-3" @click="enterRoom">Enter a room</ActionButton>
  </template>
</template>
