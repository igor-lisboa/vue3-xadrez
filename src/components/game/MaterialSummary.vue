<script setup lang="ts">
import { computed } from 'vue'
import type { PieceName, SideId } from '@/api/types/enums'
import type { MaterialReport } from '@/domain/material'
import ChessPiece from './ChessPiece.vue'

interface MaterialSummaryLabels {
  title: string
  noMaterial: string
  timeOut: Record<SideId, string>
  canCheckmate: string
  cannotCheckmate: string
  sides: Record<SideId, string>
  pieces: Record<PieceName, string>
}

const props = defineProps<{ report: MaterialReport; labels: MaterialSummaryLabels }>()

const causeText = computed(() =>
  props.report.cause.kind === 'timeOut'
    ? props.labels.timeOut[props.report.cause.sideId]
    : props.labels.noMaterial,
)

function pieceNames(pieces: readonly PieceName[]): string {
  return pieces.map((piece) => props.labels.pieces[piece]).join(', ')
}
</script>

<template>
  <section class="material-summary mx-auto" :aria-label="labels.title">
    <p class="lead">{{ causeText }}</p>
    <ul class="list-group">
      <li
        v-for="side in report.sides"
        :key="side.sideId"
        class="list-group-item list-group-item-dark d-flex flex-wrap align-items-center gap-2"
      >
        <strong>{{ labels.sides[side.sideId] }}</strong>
        <span class="badge rounded-pill" :class="side.canCheckmate ? 'bg-success' : 'bg-secondary'">
          {{ side.canCheckmate ? labels.canCheckmate : labels.cannotCheckmate }}
        </span>
        <span class="pieces ms-auto" role="img" :aria-label="pieceNames(side.pieces)">
          <span
            v-for="(piece, index) in side.pieces"
            :key="index"
            class="piece-slot"
            :title="labels.pieces[piece]"
          >
            <ChessPiece :name="piece" :side-id="side.sideId" />
          </span>
        </span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.material-summary {
  max-width: 656px;
}

/* ChessPiece fills its parent, so each picture gets a square box of its own. */
.piece-slot {
  position: relative;
  display: inline-block;
  width: 2rem;
  height: 2rem;
}
</style>
