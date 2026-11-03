<script setup lang="ts">
/** Languages are named in their own language, so the names are not translated here. */
defineProps<{
  options: { value: string; label: string }[]
  /** Read by screen readers, in the language in use. */
  label: string
}>()

const model = defineModel<string>({ required: true })
</script>

<template>
  <select
    v-model="model"
    class="form-select form-select-sm w-auto bg-dark text-white border-light"
    :aria-label="label"
  >
    <option v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>
