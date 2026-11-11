import { onUnmounted } from 'vue'
import { io, type Socket } from 'socket.io-client'
import { env } from '@/config/env'
import { SOCKET_EVENTS } from '@/api/socket-events'
import type { SideId } from '@/api/types/enums'
import type { SocketPayloads } from '@/api/types/socket'
import { notify } from '@/services/dialogs'
import { currentMessages } from '@/services/locale'

type SemanticEvent = Exclude<keyof typeof SOCKET_EVENTS, 'serverError'>

/** The argument a handler receives: the payload the frontend reads, or nothing for events without one. */
type HandlerArgument<K extends SemanticEvent> = K extends keyof SocketPayloads
  ? SocketPayloads[K]
  : undefined

/** Handlers keyed by what happened in the game (the wire event names are in SOCKET_EVENTS). */
export type SocketHandlers = {
  [K in SemanticEvent]?: (payload: HandlerArgument<K>) => unknown
}

/** Listens to the game events of the API. The connection closes when the component is unmounted. */
export function useGameSocket(gameId: number, sideId: SideId, handlers: SocketHandlers) {
  const socket: Socket = io(env.apiBaseUrl, {
    query: { jogador: `${gameId}-${sideId}` },
  })

  for (const key of Object.keys(handlers) as SemanticEvent[]) {
    const handler = handlers[key] as ((payload: unknown) => unknown) | undefined
    if (handler) {
      socket.on(SOCKET_EVENTS[key], (payload: unknown) => {
        void handler(payload)
      })
    }
  }

  socket.on(SOCKET_EVENTS.serverError, (error: unknown) => {
    notify(currentMessages().game.connectionError)
    console.error(error)
  })

  onUnmounted(() => socket.disconnect())

  return socket
}
