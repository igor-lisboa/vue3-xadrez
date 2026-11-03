<script setup lang="ts">
import type { PieceName, SideId } from '@/api/types/enums'
import { pieceSpriteId } from '@/domain/pieces'

const props = defineProps<{
  name: PieceName
  sideId: SideId
}>()
</script>

<template>
  <svg class="piece" viewBox="0 0 40 40" aria-hidden="true">
    <use :href="`#${pieceSpriteId(props.name, props.sideId)}`" />
  </svg>
</template>

<style scoped>
/* Centred in the square, leaving a margin of about 9 % on each side. */
.piece {
  position: absolute;
  top: 9%;
  left: 9%;
  width: 82%;
  height: 82%;
}
</style>
