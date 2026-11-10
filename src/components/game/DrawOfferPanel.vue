<script setup lang="ts">
import ActionButton from '@/components/common/ActionButton.vue'

defineProps<{
  /** "received": this side may accept or decline; "sent": this side waits for the answer. */
  state: 'received' | 'sent'
  labels: { received: string; sent: string; moveDeclines: string; accept: string; decline: string }
}>()

const emit = defineEmits<{ answer: [accepted: boolean] }>()
</script>

<template>
  <section class="draw-offer alert alert-light mx-auto" role="status">
    <template v-if="state === 'received'">
      <p class="fw-bold mb-1">{{ labels.received }}</p>
      <p class="small mb-2">{{ labels.moveDeclines }}</p>
      <div class="d-flex justify-content-center gap-2">
        <ActionButton @click="emit('answer', true)">{{ labels.accept }}</ActionButton>
        <ActionButton variant="dark" @click="emit('answer', false)">
          {{ labels.decline }}
        </ActionButton>
      </div>
    </template>
    <p v-else class="mb-0">{{ labels.sent }}</p>
  </section>
</template>

<style scoped>
.draw-offer {
  max-width: 656px;
}
</style>
