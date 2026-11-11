import type { GameType } from '@/api/types/catalogue'
import type { PlayerTypeId, SideId } from '@/api/types/enums'

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

/** The names a win heading is built from: the winner, and the side that lost. */
export interface WinNames {
  winner: string
  loser: string
}

/** The names a resignation draw is built from: the side that resigned, and the other side. */
export interface ResignationNames {
  resigner: string
  other: string
}

/** The texts the ending heading is built from; the message file's `labels` section has them. */
export interface EndingTexts {
  sides: Record<SideId, string>
  endings: Partial<Record<string, string>>
  finishReasons: Partial<Record<string, (names: WinNames) => string>>
  resignationDraw: (names: ResignationNames) => string
}

/** What the game says about its ending. `resigner` is the side the API names, never inferred. */
export interface EndingFacts {
  ending: string
  reason: string | null
  winner: SideId | null
  resigner: SideId | null
}

function otherSide(side: SideId): SideId {
  return side === 0 ? 1 : 0
}

/**
 * Heading of a finished game. A win shows its reason ("Black wins by checkmate"), because the API
 * uses the same ending label for a checkmate and for a time out. A resignation names the side that
 * resigned, as the API sends it in `resigner`. A resignation without that side is not named at all:
 * the ending label is shown. Any other case, or a reason the frontend does not know, shows the label.
 */
export function translateEndingHeading(texts: EndingTexts, game: EndingFacts): string {
  const { sides } = texts
  if (game.reason === 'desistencia') {
    if (game.resigner === null) {
      return translateEnding(texts.endings, game.ending)
    }
    if (game.winner === null) {
      return texts.resignationDraw({
        resigner: sides[game.resigner],
        other: sides[otherSide(game.resigner)],
      })
    }
    const phrase = texts.finishReasons.desistencia
    if (phrase) {
      return phrase({ winner: sides[game.winner], loser: sides[game.resigner] })
    }
  } else if (game.winner !== null && game.reason !== null) {
    const phrase = texts.finishReasons[game.reason]
    if (phrase) {
      return phrase({ winner: sides[game.winner], loser: sides[otherSide(game.winner)] })
    }
  }
  return translateEnding(texts.endings, game.ending)
}
