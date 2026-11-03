<script setup lang="ts">
import ActionButton from '@/components/common/ActionButton.vue'

defineProps<{ labels: { resign: string; offerDraw: string } }>()

const emit = defineEmits<{ resign: []; proposeDraw: [] }>()
</script>

<template>
  <div class="game-actions mt-3">
    <ActionButton class="w-100" @click="emit('resign')">{{ labels.resign }}</ActionButton>
    <ActionButton class="w-100" variant="danger" @click="emit('proposeDraw')">
      {{ labels.offerDraw }}
    </ActionButton>
  </div>
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
