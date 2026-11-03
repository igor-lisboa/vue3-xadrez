<script setup lang="ts">
import type { SideId } from '@/api/types/enums'
import { formatClock } from '@/domain/clock'

defineProps<{
  whiteMs: number
  blackMs: number
  /** Side names in the language in use. */
  labels: Record<SideId, string>
}>()
</script>

<template>
  <div class="mt-3">
    <ul class="list-group clock-list m-auto">
      <li class="list-group-item d-flex justify-content-between align-items-center">
        {{ labels[0] }}
        <span class="badge bg-primary rounded-pill">{{ formatClock(whiteMs) }}</span>
      </li>
      <li class="list-group-item d-flex justify-content-between align-items-center">
        {{ labels[1] }}
        <span class="badge bg-primary rounded-pill">{{ formatClock(blackMs) }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.clock-list {
  width: 25%;
}

/* Bootstrap's sm breakpoint: below it the clocks use the full width of the phone screen. */
@media (max-width: 575.98px) {
  .clock-list {
    width: 100%;
  }
}
</style>
