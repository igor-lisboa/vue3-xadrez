import type {
  EndingLabel,
  MoveName,
  PieceName,
  PlayerTypeId,
  ProposalKind,
  SideId,
} from '@/api/types/enums'
import type { ShiftTimeKey } from '@/domain/constants'

/**
 * Every text the frontend shows, for one language. Each language file must provide all of it,
 * so a missing translation fails the type check. Keys follow the screens they belong to.
 */
export interface Messages {
  common: {
    loading: string
    newGame: string
    clickOption: string
    languageSelect: string
  }
  footer: {
    developedBy: string
    usingApi: string
  }
  install: {
    button: string
    iosHint: string
  }
  home: {
    title: string
    lead: string
    or: string
    enterRoom: string
    roomPrompt: string
    shiftTimes: Record<ShiftTimeKey, string>
  }
  selectSide: {
    title: (gameId: number) => string
    join: string
    noSides: string
  }
  promotePawn: {
    title: string
    select: string
  }
  answer: {
    received: Record<ProposalKind, string>
    waiting: Record<ProposalKind, string>
    lead: string
    accept: string
    decline: string
    respond: string
  }
  endGame: {
    proposeReset: string
    /** Review of the finished game: the board and the list of moves. */
    review: {
      title: string
      moveList: string
      first: string
      previous: string
      next: string
      last: string
      position: (step: number, total: number) => string
      startPosition: string
      noMoves: string
      unavailable: string
    }
  }
  game: {
    resign: string
    offerDraw: string
    opponentJoined: string
    connectionError: string
  }
  /** Translations of the values the API sends in Portuguese. */
  labels: {
    sides: Record<SideId, string>
    playerTypes: Record<PlayerTypeId, string>
    pieces: Record<PieceName, string>
    endings: Record<EndingLabel, string>
    moves: Record<NonNullable<MoveName>, string>
  }
  errors: {
    unexpected: string
    noConnection: string
    notConfigured: string
    notJson: string
  }
}
