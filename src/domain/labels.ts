import type { GameType } from '@/api/types/catalogue'
import type { PlayerTypeId } from '@/api/types/enums'

/**
 * Game type as shown on the home page, for example "Human X AI".
 * The player type names come from the language in use, so the caller passes them in.
 */
export function gameTypeLabel(
  gameType: GameType,
  playerTypeLabels: Record<PlayerTypeId, string>,
): string {
  return gameType.integranteLadoTipo.map((player) => playerTypeLabels[player.id]).join(' X ')
}
