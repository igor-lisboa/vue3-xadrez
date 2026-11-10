<script setup lang="ts">
defineProps<{
  canGoBack: boolean
  canGoForward: boolean
  labels: { first: string; previous: string; next: string; last: string; position: string }
}>()

const emit = defineEmits<{ first: []; previous: []; next: []; last: [] }>()
</script>

<template>
  <div class="replay-controls mt-3">
    <div class="btn-group" role="group">
      <button
        type="button"
        class="btn btn-outline-light"
        :disabled="!canGoBack"
        :aria-label="labels.first"
        :title="labels.first"
        @click="emit('first')"
      >
        «
      </button>
      <button
        type="button"
        class="btn btn-outline-light"
        :disabled="!canGoBack"
        :aria-label="labels.previous"
        :title="labels.previous"
        @click="emit('previous')"
      >
        ‹
      </button>
      <button
        type="button"
        class="btn btn-outline-light"
        :disabled="!canGoForward"
        :aria-label="labels.next"
        :title="labels.next"
        @click="emit('next')"
      >
        ›
      </button>
      <button
        type="button"
        class="btn btn-outline-light"
        :disabled="!canGoForward"
        :aria-label="labels.last"
        :title="labels.last"
        @click="emit('last')"
      >
        »
      </button>
    </div>
    <p class="mt-2 mb-0" aria-live="polite">{{ labels.position }}</p>
  </div>
</template>
