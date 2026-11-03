import type { SideId } from '@/api/types/enums'
import { BLACK } from './constants'

/** The board is shown from the side of the player: black sees it reversed. */
export function orientForSide<T>(items: readonly T[], sideId: SideId): T[] {
  return sideId === BLACK ? [...items].reverse() : [...items]
}
