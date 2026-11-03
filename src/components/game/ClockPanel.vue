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
    <ul class="list-group w-25 m-auto">
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
