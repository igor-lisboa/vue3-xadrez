// Event names used by the API's socket.io server. They are not described in the OpenAPI file.
export const SOCKET_EVENTS = {
  opponentJoined: 'adversarioEntrou',
  // Sent to the side now on turn, with empateReivindicavel; the game is reloaded to read it.
  moveMade: 'jogadaRealizada',
  drawProposed: 'empateProposto',
  // No payload. Also sent to the proposer when the opponent moved instead of answering.
  drawAnswered: 'empatePropostoResposta',
  resetProposed: 'resetProposto',
  resetAnswered: 'resetPropostoResposta',
  // Payload { jogoFinalizacao, ladoIdVencedor }; the game is reloaded to read them.
  gameFinished: 'jogoFinalizado',
  serverError: 'uncaughtException',
} as const

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS]
