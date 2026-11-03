<script setup lang="ts">
import { formatClock } from '@/domain/clock'

defineProps<{ whiteMs: number; blackMs: number }>()
</script>

<template>
  <div class="mt-3">
    <ul class="list-group w-25 m-auto">
      <li class="list-group-item d-flex justify-content-between align-items-center">
        White
        <span class="badge bg-primary rounded-pill">{{ formatClock(whiteMs) }}</span>
      </li>
      <li class="list-group-item d-flex justify-content-between align-items-center">
        Black
        <span class="badge bg-primary rounded-pill">{{ formatClock(blackMs) }}</span>
      </li>
    </ul>
  </div>
</template>
