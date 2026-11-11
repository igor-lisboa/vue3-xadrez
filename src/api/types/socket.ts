import type { EndingLabel, FinishReason, PieceName, SideId } from './enums'
import type { GameClocks } from './game-summary'

/**
 * Payload of `jogadaRealizada`. Only the fields the frontend reads are typed; the move record is
 * not read, because the game is reloaded after a move.
 */
export interface MoveMadePayload extends GameClocks {
  chequeLadoAtual: boolean
  /** Piece the pawn was promoted to, on the event after a promotion choice; null otherwise. */
  promocaoPara: PieceName | null
  empateReivindicavel: boolean
}

/** Payload of `jogoFinalizado`: the ending, its reason, the winner and the resigning side. */
export interface GameFinishedPayload extends GameClocks {
  jogoFinalizacao: EndingLabel
  motivoFinalizacao: FinishReason | null
  ladoIdVencedor: SideId | null
  ladoIdDesistente: SideId | null
}

/** The payloads the frontend reads, by the semantic event names of SOCKET_EVENTS. */
export interface SocketPayloads {
  moveMade: MoveMadePayload
  gameFinished: GameFinishedPayload
}
