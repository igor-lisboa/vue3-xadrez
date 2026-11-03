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
/* Options wrap onto a second line when the screen is too narrow for them all. */
.choice-group {
  flex-wrap: wrap;
  justify-content: center;
}
</style>
