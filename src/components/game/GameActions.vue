<script setup lang="ts">
import ActionButton from '@/components/common/ActionButton.vue'

const emit = defineEmits<{ resign: []; proposeDraw: [] }>()
</script>

<template>
  <div class="btn-group" role="group">
    <ActionButton class="mt-3" @click="emit('resign')">Resign</ActionButton>
    <ActionButton class="mt-3" variant="danger" @click="emit('proposeDraw')">
      Offer draw
    </ActionButton>
  </div>
</template>
