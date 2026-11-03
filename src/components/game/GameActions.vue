<script setup lang="ts">
import ActionButton from '@/components/common/ActionButton.vue'

defineProps<{ labels: { resign: string; offerDraw: string } }>()

const emit = defineEmits<{ resign: []; proposeDraw: [] }>()
</script>

<template>
  <div class="btn-group" role="group">
    <ActionButton class="mt-3" @click="emit('resign')">{{ labels.resign }}</ActionButton>
    <ActionButton class="mt-3" variant="danger" @click="emit('proposeDraw')">
      {{ labels.offerDraw }}
    </ActionButton>
  </div>
</template>
