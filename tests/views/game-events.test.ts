import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { listPieceTypes, listSquares } from '@/api/services/catalogue'
import { getGameSummary } from '@/api/services/games'
import { leaveGame } from '@/api/services/players'
import { SOCKET_EVENTS } from '@/api/socket-events'
import { notify } from '@/services/dialogs'
import GameView from '@/views/GameView.vue'
import { makeSummary, pieceTypes, squares } from '../helpers/fixtures'

const { push, handlers } = vi.hoisted(() => ({
  push: vi.fn(async () => undefined),
  handlers: new Map<string, (...args: unknown[]) => void>(),
}))

vi.mock('vue-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-router')>()),
  useRouter: () => ({ push }),
  useRoute: () => ({ name: 'game', params: {} }),
}))
vi.mock('@/api/services/catalogue', () => ({
  listGameTypes: vi.fn(),
  listPieceTypes: vi.fn(),
  listPromotionPieces: vi.fn(),
  listSquares: vi.fn(),
}))
vi.mock('@/api/services/games', () => ({ getGameSummary: vi.fn() }))
vi.mock('@/api/services/players', () => ({ joinGame: vi.fn(), leaveGame: vi.fn() }))
vi.mock('@/api/services/moves', () => ({ listPossibleMoves: vi.fn(), makeMove: vi.fn() }))
vi.mock('@/api/services/proposals', () => ({ proposeToOpponent: vi.fn(), answerProposal: vi.fn() }))
vi.mock('@/api/services/ai', () => ({ triggerAi: vi.fn(async () => undefined) }))
vi.mock('@/services/dialogs', () => ({ notify: vi.fn(), askText: vi.fn() }))
vi.mock('socket.io-client', () => ({
  io: () => ({
    on: (event: string, listener: (...args: unknown[]) => void) => handlers.set(event, listener),
    disconnect: vi.fn(),
  }),
}))

const settle = async () => {
  await flushPromises()
  await flushPromises()
}

beforeEach(() => {
  vi.clearAllMocks()
  handlers.clear()
  vi.mocked(listSquares).mockResolvedValue(squares)
  vi.mocked(listPieceTypes).mockResolvedValue(pieceTypes)
  vi.mocked(getGameSummary).mockResolvedValue(makeSummary())
})

describe('GameView socket events', () => {
  it('reloads the game when a move is made', async () => {
    mount(GameView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    handlers.get(SOCKET_EVENTS.moveMade)?.()
    await settle()
    expect(getGameSummary).toHaveBeenCalledTimes(2)
  })

  it('tells the player when the opponent joins, then reloads', async () => {
    mount(GameView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    handlers.get(SOCKET_EVENTS.opponentJoined)?.()
    await settle()
    expect(notify).toHaveBeenCalledWith('The opponent joined the game!')
    expect(getGameSummary).toHaveBeenCalledTimes(2)
  })

  it('reloads on the draw, reset and end events', async () => {
    mount(GameView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    for (const event of [
      SOCKET_EVENTS.drawProposed,
      SOCKET_EVENTS.drawAnswered,
      SOCKET_EVENTS.resetProposed,
      SOCKET_EVENTS.resetAnswered,
      SOCKET_EVENTS.gameFinished,
    ]) {
      handlers.get(event)?.()
    }
    await settle()
    expect(getGameSummary).toHaveBeenCalledTimes(6)
  })
})

describe('GameView resign failure', () => {
  it('reloads the game and stays when the resignation is refused', async () => {
    vi.mocked(leaveGame).mockRejectedValue(new Error('refused'))
    const wrapper = mount(GameView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    await wrapper.findAll('button')[0]!.trigger('click')
    await settle()
    expect(getGameSummary).toHaveBeenCalledTimes(2)
    expect(push).not.toHaveBeenCalledWith({ name: 'home' })
  })
})
