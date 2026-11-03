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
.piece {
  display: block;
  width: 66px;
  height: 66px;
  margin: 6px auto;
}
</style>
