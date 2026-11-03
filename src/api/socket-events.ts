// Event names used by the API's socket.io server. They are not described in the OpenAPI file.
export const SOCKET_EVENTS = {
  opponentJoined: 'adversarioEntrou',
  moveMade: 'jogadaRealizada',
  drawProposed: 'empateProposto',
  drawAnswered: 'empatePropostoResposta',
  resetProposed: 'resetProposto',
  resetAnswered: 'resetPropostoResposta',
  gameFinished: 'jogoFinalizado',
  serverError: 'uncaughtException',
} as const

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS]
