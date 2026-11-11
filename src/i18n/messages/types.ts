import type {
  EndingLabel,
  FinishReason,
  MoveName,
  PieceName,
  PlayerTypeId,
  ProposalKind,
  SideId,
} from '@/api/types/enums'
import type { ShiftTimeKey } from '@/domain/constants'
import type { ResignationNames, WinNames } from '@/domain/labels'

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
    reviewGame: string
    reviewPrompt: string
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
    reviewGame: string
  }
  /** Details of an insufficient-material draw: why it happened and the pieces left. */
  material: {
    title: string
    noMaterial: string
    timeOut: Record<SideId, string>
  }
  /** Game review screen: the board and the list of moves of a game. */
  review: {
    title: string
    room: (gameId: number) => string
    inProgress: string
    moveList: string
    first: string
    previous: string
    next: string
    last: string
    position: (step: number, total: number) => string
    startPosition: string
    noMoves: string
    unavailable: string
    /** Time a side used in the game, for example "Time used (White): 00:12:04". */
    timeUsed: (side: string, time: string) => string
  }
  game: {
    resign: string
    offerDraw: string
    /** Shown instead of offerDraw when the API says the side on turn may claim a draw. */
    claimDraw: string
    claimDrawHint: string
    /** Option to claim a draw for the position the next move would make. */
    claimWithMove: string
    claimWithMoveWarning: string
    /** Shown after a claim with a move that was not valid: the move was played. */
    claimNotValid: string
    /** Under a received draw offer: a move declines it. */
    moveDeclinesDraw: string
    opponentJoined: string
    connectionError: string
  }
  /** Translations of the values the API sends in Portuguese. */
  labels: {
    sides: Record<SideId, string>
    /** The winner the API names in ladoIdVencedor. */
    winners: Record<SideId, string>
    playerTypes: Record<PlayerTypeId, string>
    pieces: Record<PieceName, string>
    endings: Record<EndingLabel, string>
    /** Heading of a win, by the reason the API gives (the same ending is used for a checkmate and a time out). */
    finishReasons: Record<FinishReason, (names: WinNames) => string>
    /** Heading of a draw by resignation: the side left could not checkmate. */
    resignationDraw: (names: ResignationNames) => string
    moves: Record<NonNullable<MoveName>, string>
  }
  errors: {
    unexpected: string
    noConnection: string
    notConfigured: string
    notJson: string
  }
}
