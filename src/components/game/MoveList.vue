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
    <table class="table table-dark table-sm align-middle mb-0">
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
              :class="move.index + 1 === step ? 'btn-light active' : 'btn-outline-light'"
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
</style>
