<script setup lang="ts">
import pieceSprite from '@/assets/pieces/standard.svg?raw'

/**
 * Defines the piece drawings once for the whole app (it is mounted in `App.vue`), so the board
 * and any other list of pieces share them. `ChessPiece` points at them by id.
 * The sprite is a static file from this app, so injecting it as HTML is safe.
 */
</script>

<template>
  <div class="piece-sprite" aria-hidden="true" v-html="pieceSprite" />
</template>

<style scoped>
/* Kept in the page, but at zero size, so the sprite never shows or moves the layout. */
.piece-sprite {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}
</style>
