import { onUnmounted } from 'vue'
import { io, type Socket } from 'socket.io-client'
import { env } from '@/config/env'
import { SOCKET_EVENTS } from '@/api/socket-events'
import type { SideId } from '@/api/types/enums'
import { notify } from '@/services/dialogs'
import { currentMessages } from '@/services/locale'

/** Handlers keyed by what happened in the game (the wire event names are in SOCKET_EVENTS). */
export type SocketHandlers = Partial<
  Record<Exclude<keyof typeof SOCKET_EVENTS, 'serverError'>, () => unknown>
>

/** Listens to the game events of the API. The connection closes when the component is unmounted. */
export function useGameSocket(gameId: number, sideId: SideId, handlers: SocketHandlers) {
  const socket: Socket = io(env.apiBaseUrl, {
    query: { jogador: `${gameId}-${sideId}` },
  })

  for (const key of Object.keys(handlers) as (keyof SocketHandlers)[]) {
    const handler = handlers[key]
    if (handler) {
      socket.on(SOCKET_EVENTS[key], () => {
        void handler()
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
