<script setup lang="ts">
import type { MoveName } from '@/api/types/enums'
import type { BoardHouse } from '@/domain/types'
import ChessPiece from './ChessPiece.vue'
import PieceSprite from './PieceSprite.vue'
import { boardHouseClasses } from './board-house-classes'

const props = defineProps<{
  houses: BoardHouse[]
  /** Outlines the board when the player's side is on turn. */
  highlightTurn: boolean
  /** Spectators of an AI vs AI game cannot click the board. */
  spectatorOnly: boolean
  /** Names of the special moves in the language in use, shown in the square tooltip. */
  moveLabels: Record<NonNullable<MoveName>, string>
}>()

const emit = defineEmits<{ select: [index: number] }>()

function houseTitle(house: BoardHouse): string {
  return house.movementName === null
    ? house.house
    : `${house.house} | ${props.moveLabels[house.movementName]}`
}
</script>

<template>
  <div
    class="chess-board"
    :class="{ 'active-side-border': props.highlightTurn, 'spectator-only': props.spectatorOnly }"
  >
    <PieceSprite />
    <div
      v-for="(house, index) in houses"
      :key="index"
      :class="boardHouseClasses(house)"
      :title="houseTitle(house)"
      @click="emit('select', index)"
    >
      <ChessPiece v-if="house.piece" :name="house.piece.name" :side-id="house.piece.sideId" />
    </div>
  </div>
</template>

<style scoped>
/* The board fills its column up to 656 px, so it fits phone screens without scrolling sideways. */
.chess-board {
  box-sizing: border-box;
  width: 100%;
  max-width: 656px;
  margin: auto;
  border: 8px solid rebeccapurple;
  border-radius: 15px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  /* A long press on the board must not select its text. */
  user-select: none;
  -webkit-user-select: none;
}

.active-side-border {
  border: 8px solid greenyellow;
}

.board-house:hover {
  background-color: lightblue;
}

.board-house:active {
  background-color: blueviolet;
}

.spectator-only {
  pointer-events: none;
}

.board-house {
  position: relative;
  /* Squares are square at any width; the piece picture is placed inside them. */
  aspect-ratio: 1;
  transition: background-color 0.5s ease;
  cursor: pointer;
  /* Taps act at once instead of waiting for a double-tap zoom. */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  border: 0.5px solid black;
}

.house-black {
  background-color: #999;
}

.house-white {
  background-color: #fff;
}

.house-origin {
  background-color: yellow;
}

.house-move {
  background-color: green;
}

.house-capture {
  background-color: red;
}

.house-check {
  background-color: darkred;
}
</style>
