import type { GameTypeId, PlayerTypeId, SideId } from '@/api/types/enums'

export const WHITE: SideId = 0
export const BLACK: SideId = 1

/** Value of the turn time limit when the game has no clock. */
export const NO_TIME_LIMIT = -1

/** How often the clock of the side on turn is updated in the browser. */
export const CLOCK_TICK_MS = 1000

export const AI_VS_AI_GAME_TYPE: GameTypeId = 2

/** Player type used when a human joins a side. */
export const HUMAN_PLAYER: PlayerTypeId = 0

/** Player types string the API sends for an AI vs AI game (see GameSummary.tipoJogo). */
export const AI_VS_AI_GAME_LABEL = 'I.A. X I.A.'

/** Names the turn time options; the texts for each language are in the message files. */
export type ShiftTimeKey = 'five' | 'ten' | 'fifteen'

export interface ShiftTimeOption {
  value: number
  key: ShiftTimeKey
}

/**
 * Turn time selected when Home opens. Games without a time limit are not offered,
 * so every game the frontend creates has clocks.
 */
export const DEFAULT_SHIFT_TIME_MS = 5 * 60_000

export const SHIFT_TIME_OPTIONS: ShiftTimeOption[] = [
  { value: DEFAULT_SHIFT_TIME_MS, key: 'five' },
  { value: 10 * 60_000, key: 'ten' },
  { value: 15 * 60_000, key: 'fifteen' },
]
