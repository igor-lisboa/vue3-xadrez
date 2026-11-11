import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
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
vi.mock('@/api/services/proposals', () => ({
  proposeDraw: vi.fn(),
  proposeReset: vi.fn(),
  answerProposal: vi.fn(),
}))
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

/** The clocks the API sends with an event: 1:01 for White and 0:52 for Black, both left. */
const clocks = {
  ladoBrancoTempoMilisegundosRestante: 61000,
  ladoBrancoTempoMilisegundosGasto: 239000,
  ladoPretoTempoMilisegundosRestante: 52000,
  ladoPretoTempoMilisegundosGasto: 248000,
}

const endPayload = {
  ...clocks,
  jogoFinalizacao: 'Vitória: Preto',
  motivoFinalizacao: 'desistencia',
  ladoIdVencedor: 1,
  ladoIdDesistente: 0,
}

describe('GameView socket events', () => {
  it('reloads the game when a move is made', async () => {
    mount(GameView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    handlers.get(SOCKET_EVENTS.moveMade)?.({ ...clocks, chequeLadoAtual: false })
    await settle()
    expect(getGameSummary).toHaveBeenCalledTimes(2)
  })

  it('shows the clocks of a move at once, before the game is reloaded', async () => {
    vi.mocked(getGameSummary)
      .mockResolvedValueOnce(makeSummary({ tempoTotalPorLadoEmMilisegundos: 300000 }))
      .mockReturnValue(new Promise(() => undefined))
    const wrapper = mount(GameView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    handlers.get(SOCKET_EVENTS.moveMade)?.({ ...clocks, chequeLadoAtual: false })
    await nextTick()
    expect(wrapper.findAll('.clock-list .badge').map((badge) => badge.text())).toEqual([
      '00:01:01',
      '00:00:52',
    ])
  })

  it('shows the clocks of the end of the game when it is announced', async () => {
    vi.mocked(getGameSummary)
      .mockResolvedValueOnce(makeSummary({ tempoTotalPorLadoEmMilisegundos: 300000 }))
      .mockReturnValue(new Promise(() => undefined))
    const wrapper = mount(GameView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    handlers.get(SOCKET_EVENTS.gameFinished)?.(endPayload)
    await nextTick()
    expect(wrapper.findAll('.clock-list .badge').map((badge) => badge.text())).toEqual([
      '00:01:01',
      '00:00:52',
    ])
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
    ]) {
      handlers.get(event)?.()
    }
    handlers.get(SOCKET_EVENTS.gameFinished)?.(endPayload)
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
