import { describe, expect, it, vi, beforeEach } from 'vitest'
import { io } from 'socket.io-client'
import { useGameSocket } from '@/composables/useGameSocket'
import { SOCKET_EVENTS } from '@/api/socket-events'
import { notify } from '@/services/dialogs'
import { runComposable } from '../helpers/run-composable'

vi.mock('socket.io-client', () => ({ io: vi.fn() }))
vi.mock('@/config/env', () => ({ env: { apiBaseUrl: 'http://api.test', appTitle: 'Chess' } }))
vi.mock('@/services/dialogs', () => ({ notify: vi.fn(), askText: vi.fn() }))

function fakeSocket() {
  const listeners = new Map<string, (...args: unknown[]) => void>()
  const socket = {
    on: vi.fn((event: string, listener: (...args: unknown[]) => void) => {
      listeners.set(event, listener)
    }),
    disconnect: vi.fn(),
  }
  return { socket, listeners }
}

beforeEach(() => vi.clearAllMocks())

describe('useGameSocket', () => {
  it('connects as the side of the game', () => {
    const { socket } = fakeSocket()
    vi.mocked(io).mockReturnValue(socket as never)
    const { unmount } = runComposable(() => useGameSocket(7, 1, {}))
    expect(io).toHaveBeenCalledWith('http://api.test', { query: { jogador: '7-1' } })
    unmount()
  })

  it('calls the handler of each game event', () => {
    const { socket, listeners } = fakeSocket()
    vi.mocked(io).mockReturnValue(socket as never)
    const moveMade = vi.fn()
    const drawAnswered = vi.fn()
    const { unmount } = runComposable(() => useGameSocket(7, 0, { moveMade, drawAnswered }))
    listeners.get(SOCKET_EVENTS.moveMade)?.({})
    listeners.get(SOCKET_EVENTS.drawAnswered)?.()
    expect(moveMade).toHaveBeenCalledTimes(1)
    expect(drawAnswered).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('passes the payload of an event to its handler', () => {
    const { socket, listeners } = fakeSocket()
    vi.mocked(io).mockReturnValue(socket as never)
    const gameFinished = vi.fn()
    const { unmount } = runComposable(() => useGameSocket(7, 0, { gameFinished }))
    const payload = { jogoFinalizacao: 'Vitória: Preto', ladoIdDesistente: 0 }
    listeners.get(SOCKET_EVENTS.gameFinished)?.(payload)
    expect(gameFinished).toHaveBeenCalledWith(payload)
    unmount()
  })

  it('tells the player about server errors', () => {
    const { socket, listeners } = fakeSocket()
    vi.mocked(io).mockReturnValue(socket as never)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { unmount } = runComposable(() => useGameSocket(7, 0, {}))
    listeners.get(SOCKET_EVENTS.serverError)?.('bad')
    expect(notify).toHaveBeenCalledWith('Connection error with the server.')
    expect(consoleError).toHaveBeenCalledWith('bad')
    consoleError.mockRestore()
    unmount()
  })

  it('disconnects when the component is unmounted', () => {
    const { socket } = fakeSocket()
    vi.mocked(io).mockReturnValue(socket as never)
    const { unmount } = runComposable(() => useGameSocket(7, 0, {}))
    unmount()
    expect(socket.disconnect).toHaveBeenCalledTimes(1)
  })
})
