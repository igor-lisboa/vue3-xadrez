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

/** Player type ids by the names the API uses in GameSummary.tipoJogo. */
const PLAYER_TYPE_ID_BY_API_NAME = new Map<string, PlayerTypeId>([
  ['Humano', 0],
  ['I.A.', 1],
])

/**
 * Translates the game type text of a game summary, for example "Humano X I.A." to "Human X AI".
 * Names the frontend does not know are kept as the API sent them.
 */
export function translateGameType(
  tipoJogo: string,
  playerTypeLabels: Record<PlayerTypeId, string>,
): string {
  return tipoJogo
    .split(' X ')
    .map((apiName) => {
      const id = PLAYER_TYPE_ID_BY_API_NAME.get(apiName)
      return id === undefined ? apiName : playerTypeLabels[id]
    })
    .join(' X ')
}

/**
 * Text of a game ending. An ending the frontend has no text for is shown as the API sent it,
 * so a new ending on the server never leaves the heading empty.
 */
export function translateEnding(endings: Partial<Record<string, string>>, ending: string): string {
  return endings[ending] ?? ending
}
