<script setup lang="ts">
/** The text is read by screen readers, so the view passes it in the language in use. */
defineProps<{ label: string }>()
</script>

<template>
  <div class="spinner-border text-light" role="status">
    <span class="visually-hidden">{{ label }}</span>
  </div>
</template>
