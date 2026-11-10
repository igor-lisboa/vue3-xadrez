<script setup lang="ts">
import ActionButton from '@/components/common/ActionButton.vue'
import type { DrawAction } from '@/domain/draw'

defineProps<{
  /** The draw button to show: claim a draw, offer one, or none. */
  drawAction: DrawAction
  labels: { resign: string; offerDraw: string; claimDraw: string; claimDrawHint: string }
}>()

const emit = defineEmits<{ resign: []; proposeDraw: [] }>()
</script>

<template>
  <div class="game-actions mt-3">
    <ActionButton class="w-100" @click="emit('resign')">{{ labels.resign }}</ActionButton>
    <ActionButton
      v-if="drawAction"
      class="w-100"
      :class="{ 'claim-draw': drawAction === 'claim' }"
      variant="danger"
      @click="emit('proposeDraw')"
    >
      {{ drawAction === 'claim' ? labels.claimDraw : labels.offerDraw }}
    </ActionButton>
  </div>
  <p v-if="drawAction === 'claim'" class="claim-draw-hint small mt-2 mb-0">
    {{ labels.claimDrawHint }}
  </p>
</template>

<style scoped>
/* Side by side on larger screens; stacked, full width, on phones. */
.game-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  width: min(100%, 420px);
  margin: auto;
}

@media (max-width: 575.98px) {
  .game-actions {
    grid-template-columns: 1fr;
  }
}
</style>
