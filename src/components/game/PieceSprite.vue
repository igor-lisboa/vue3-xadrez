<script setup lang="ts">
import pieceSprite from '@/assets/pieces/standard.svg?raw'

/**
 * Defines the piece drawings once per board. `ChessPiece` points at them by id.
 * The sprite is a static file from this app, so injecting it as HTML is safe.
 */
</script>

<template>
  <div class="piece-sprite" aria-hidden="true" v-html="pieceSprite" />
</template>

<style scoped>
/* Kept in the layout, but at zero size, so the sprite never shows or moves the squares. */
.piece-sprite {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}
</style>
