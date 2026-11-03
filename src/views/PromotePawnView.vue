<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { listPromotionPieces } from '@/api/services/catalogue'
import { promotePawn } from '@/api/services/moves'
import type { PieceType } from '@/api/types/catalogue'
import type { SideId } from '@/api/types/enums'
import ActionButton from '@/components/common/ActionButton.vue'
import ChoiceGroup from '@/components/common/ChoiceGroup.vue'
import type { ChoiceOption } from '@/components/common/choice'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useGameState } from '@/composables/useGameState'
import { useLoader, useRequest } from '@/composables/useRequest'
import { PIECE_LABELS } from '@/domain/labels'
import { notify } from '@/services/dialogs'

const props = defineProps<{ gameId: number; sideId: SideId }>()

const router = useRouter()
const { refresh } = useGameState(props.gameId, props.sideId)
const { data: pieces, loading: loadingPieces } = useLoader<PieceType[]>(listPromotionPieces, [])
const selectedPiece = ref<number | null>(null)
const promotion = useRequest()
const busy = computed(() => loadingPieces.value || promotion.pending.value)

const options = computed<ChoiceOption<number>[]>(() =>
  pieces.value.map((piece) => ({ value: piece.id, label: PIECE_LABELS[piece.nome] })),
)

async function promote(): Promise<void> {
  const pieceId = selectedPiece.value
  if (pieceId === null) {
    return
  }
  const message = await promotion.perform(() => promotePawn(props.gameId, props.sideId, pieceId))
  if (message !== undefined) {
    notify(message)
  }
  await router.push({ name: 'game', params: { id: props.gameId, sideId: props.sideId } })
}

onMounted(() => void refresh())
</script>

<template>
  <LoadingSpinner v-if="busy" />
  <template v-else>
    <h1>Choose a piece to promote your pawn</h1>
    <p class="lead">Click the option you want</p>

    <div class="mt-3">
      <ChoiceGroup v-model="selectedPiece" :options="options" />
    </div>

    <ActionButton class="mt-3" :disabled="selectedPiece === null" @click="promote">
      Select piece
    </ActionButton>
  </template>
</template>
