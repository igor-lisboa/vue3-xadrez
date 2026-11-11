<script setup lang="ts">
defineProps<{
  canGoBack: boolean
  canGoForward: boolean
  labels: { first: string; previous: string; next: string; last: string; position: string }
}>()

const emit = defineEmits<{ first: []; previous: []; next: []; last: [] }>()
</script>

<template>
  <div class="replay-controls mx-auto mt-3">
    <div class="btn-group w-100" role="group">
      <button
        type="button"
        class="btn btn-outline-light btn-lg"
        :disabled="!canGoBack"
        :aria-label="labels.first"
        :title="labels.first"
        @click="emit('first')"
      >
        «
      </button>
      <button
        type="button"
        class="btn btn-outline-light btn-lg"
        :disabled="!canGoBack"
        :aria-label="labels.previous"
        :title="labels.previous"
        @click="emit('previous')"
      >
        ‹
      </button>
      <button
        type="button"
        class="btn btn-outline-light btn-lg"
        :disabled="!canGoForward"
        :aria-label="labels.next"
        :title="labels.next"
        @click="emit('next')"
      >
        ›
      </button>
      <button
        type="button"
        class="btn btn-outline-light btn-lg"
        :disabled="!canGoForward"
        :aria-label="labels.last"
        :title="labels.last"
        @click="emit('last')"
      >
        »
      </button>
    </div>
    <p class="position mt-2 mb-0" aria-live="polite">{{ labels.position }}</p>
  </div>
</template>

<style scoped>
.replay-controls {
  max-width: 656px;
}

/* The position is a quiet caption under the buttons, so the buttons stay the focus. */
.position {
  color: #adb5bd;
  font-variant-numeric: tabular-nums;
}
</style>
