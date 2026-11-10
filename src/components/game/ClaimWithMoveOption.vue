<script setup lang="ts">
import { useId } from 'vue'

defineProps<{ labels: { label: string; warning: string } }>()

/** True when the next move is sent as a draw claim. */
const model = defineModel<boolean>({ required: true })

const inputId = useId()
</script>

<template>
  <div class="claim-with-move form-check form-switch mx-auto mt-3 text-start">
    <input :id="inputId" v-model="model" class="form-check-input" type="checkbox" role="switch" />
    <label class="form-check-label" :for="inputId">{{ labels.label }}</label>
    <p class="form-text text-warning mb-0">{{ labels.warning }}</p>
  </div>
</template>

<style scoped>
.claim-with-move {
  width: min(100%, 420px);
}
</style>
