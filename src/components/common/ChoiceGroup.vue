<script setup lang="ts" generic="T extends string | number | boolean">
import { useId } from 'vue'
import type { ChoiceOption } from './choice'

defineProps<{ options: ChoiceOption<T>[] }>()

/** The selected value. `null` means nothing is selected yet. */
const model = defineModel<T | null>({ required: true })

const groupId = useId()
</script>

<template>
  <div class="btn-group choice-group" role="group">
    <template v-for="(option, index) in options" :key="String(option.value)">
      <input
        :id="`${groupId}-${index}`"
        v-model="model"
        type="radio"
        class="btn-check"
        :name="groupId"
        :value="option.value"
      />
      <label class="btn btn-outline-primary" :for="`${groupId}-${index}`">
        {{ option.label }}
      </label>
    </template>
  </div>
</template>

<style scoped>
/* Options sit side by side on wider screens and wrap when they do not fit. */
.choice-group {
  flex-wrap: wrap;
  justify-content: center;
}

/* On phones the joined buttons wrap their labels onto ragged rows, so each option gets its own full-width line. */
@media (max-width: 575.98px) {
  .choice-group {
    flex-direction: column;
    flex-wrap: nowrap;
    gap: 0.5rem;
    width: 100%;
  }

  /* Bootstrap joins grouped buttons (squared inner corners, overlapping borders); the stacked options must not. */
  .choice-group > .btn {
    width: 100%;
    margin: 0 !important;
    border-radius: var(--bs-btn-border-radius) !important;
  }
}
</style>
