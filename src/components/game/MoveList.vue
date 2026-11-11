<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import type { MoveName, PieceName, SideId } from '@/api/types/enums'
import { describeMove, type MovePair } from '@/domain/move-text'
import type { HistoryMove } from '@/domain/replay'

const props = defineProps<{
  pairs: MovePair[]
  /** Number of moves shown on the board; 0 is the starting position. */
  step: number
  labels: {
    title: string
    sides: Record<SideId, string>
    pieces: Record<PieceName, string>
    moves: Record<NonNullable<MoveName>, string>
  }
}>()

const emit = defineEmits<{ select: [step: number] }>()

const container = ref<HTMLElement | null>(null)

function text(move: HistoryMove): string {
  return describeMove(move, props.labels.pieces, props.labels.moves)
}

/** Keeps the move on the board visible in a long list. */
watch(
  () => props.step,
  async () => {
    await nextTick()
    container.value?.querySelector('.active')?.scrollIntoView?.({ block: 'nearest' })
  },
)
</script>

<template>
  <div ref="container" class="move-list mt-3 mx-auto" :aria-label="labels.title" role="region">
    <table class="table table-dark table-sm align-middle mb-0 move-table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">{{ labels.sides[0] }}</th>
          <th scope="col">{{ labels.sides[1] }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="pair in pairs" :key="pair.number">
          <th scope="row">{{ pair.number }}</th>
          <td v-for="move in [pair.white, pair.black]" :key="move?.index ?? `empty-${pair.number}`">
            <button
              v-if="move"
              type="button"
              class="btn btn-sm w-100 text-start"
              :class="move.index + 1 === step ? 'btn-light active' : 'move-button'"
              :aria-current="move.index + 1 === step ? 'step' : undefined"
              @click="emit('select', move.index + 1)"
            >
              {{ text(move) }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* A long game scrolls inside the list instead of pushing the buttons far down the page. */
.move-list {
  max-height: 18rem;
  overflow-y: auto;
  width: min(100%, 656px);
}

/* Rows are divided by a hairline instead of boxed. Each move is a soft chip; the move on the
   board is the filled one, so it stands out from the rest. */
.move-table {
  --bs-table-bg: transparent;
  --bs-table-border-color: rgb(255 255 255 / 0.08);
}

.move-table thead th {
  color: #adb5bd;
  font-weight: 500;
}

.move-table th[scope='row'] {
  width: 2.5rem;
  color: #adb5bd;
  font-weight: 400;
}

.move-button {
  background-color: #2b3035;
  border-color: #2b3035;
  color: #e9ecef;
}

.move-button:hover {
  background-color: #3d4348;
  border-color: #3d4348;
  color: #fff;
}
</style>
