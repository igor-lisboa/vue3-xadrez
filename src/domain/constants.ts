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

export interface ShiftTimeOption {
  value: number
  label: string
}

export const SHIFT_TIME_OPTIONS: ShiftTimeOption[] = [
  { value: NO_TIME_LIMIT, label: 'No time limit' },
  { value: 5 * 60_000, label: '5 minutes' },
  { value: 10 * 60_000, label: '10 minutes' },
  { value: 15 * 60_000, label: '15 minutes' },
  { value: 60 * 60_000, label: '1 hour' },
]
