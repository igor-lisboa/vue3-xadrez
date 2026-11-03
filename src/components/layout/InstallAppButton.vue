<script setup lang="ts">
defineProps<{
  /** The browser can open its install dialog. */
  canInstall: boolean
  /** The device is an iPhone or iPad, where the install step is done by hand. */
  showIosHint: boolean
  labels: { button: string; iosHint: string }
}>()

const emit = defineEmits<{ install: [] }>()
</script>

<template>
  <div class="mt-3">
    <button
      v-if="canInstall"
      type="button"
      class="btn btn-outline-light btn-sm"
      @click="emit('install')"
    >
      {{ labels.button }}
    </button>
    <p v-else-if="showIosHint" class="small text-white-50 mb-0">{{ labels.iosHint }}</p>
  </div>
</template>
