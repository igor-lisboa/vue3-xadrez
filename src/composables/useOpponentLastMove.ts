import { ref } from 'vue'
import { getGameHistory } from '@/api/services/games'
import type { SideId } from '@/api/types/enums'
import { buildReplay, type HistoryMove } from '@/domain/replay'
import { useRequest } from './useRequest'

/** Loads the latest move made by the other side, using the same history as Game review. */
export function useOpponentLastMove(gameId: number, sideId: SideId) {
  const request = useRequest()
  const move = ref<HistoryMove | null>(null)

  async function refresh(): Promise<void> {
    const history = await request.perform(() => getGameHistory(gameId))
    if (history === undefined) return

    const replay = buildReplay(history)
    move.value = replay.complete
      ? [...replay.moves].reverse().find((played) => played.sideId !== sideId) ?? null
      : null
  }

  return { move, refresh }
}
