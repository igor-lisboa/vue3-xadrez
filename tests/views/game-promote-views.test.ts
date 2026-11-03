import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import {
  listGameTypes,
  listPieceTypes,
  listPromotionPieces,
  listSquares,
} from '@/api/services/catalogue'
import { createGame, getGameSummary, listSidesWithoutPlayer } from '@/api/services/games'
import { joinGame, leaveGame } from '@/api/services/players'
import { promotePawn } from '@/api/services/moves'
import { answerProposal, proposeToOpponent } from '@/api/services/proposals'
import { triggerAi } from '@/api/services/ai'
import { askText, notify } from '@/services/dialogs'
import HomeView from '@/views/HomeView.vue'
import SelectSideView from '@/views/SelectSideView.vue'
import GameView from '@/views/GameView.vue'
import PromotePawnView from '@/views/PromotePawnView.vue'
import EndGameView from '@/views/EndGameView.vue'
import AnswerProposalView from '@/views/AnswerProposalView.vue'
import { makeSummary, gameTypes, pieceTypes, squares } from '../helpers/fixtures'

const { push, routeState } = vi.hoisted(() => ({
  push: vi.fn(async () => undefined),
  routeState: { name: 'game' as string, params: {} as Record<string, unknown> },
}))

vi.mock('vue-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-router')>()),
  useRouter: () => ({ push }),
  useRoute: () => routeState,
}))
vi.mock('@/api/services/catalogue', () => ({
  listGameTypes: vi.fn(),
  listPieceTypes: vi.fn(),
  listPromotionPieces: vi.fn(),
  listSquares: vi.fn(),
}))
vi.mock('@/api/services/games', () => ({
  createGame: vi.fn(),
  getGameSummary: vi.fn(),
  listSidesWithoutPlayer: vi.fn(),
}))
vi.mock('@/api/services/players', () => ({ joinGame: vi.fn(), leaveGame: vi.fn() }))
vi.mock('@/api/services/moves', () => ({
  listPossibleMoves: vi.fn(),
  makeMove: vi.fn(),
  promotePawn: vi.fn(),
}))
vi.mock('@/api/services/proposals', () => ({ proposeToOpponent: vi.fn(), answerProposal: vi.fn() }))
vi.mock('@/api/services/ai', () => ({ triggerAi: vi.fn() }))
vi.mock('@/services/dialogs', () => ({ notify: vi.fn(), askText: vi.fn() }))
vi.mock('socket.io-client', () => ({
  io: () => ({ on: vi.fn(), disconnect: vi.fn() }),
}))

/** Loading is async, so the view settles before assertions. */
async function settle() {
  await flushPromises()
  await flushPromises()
}

beforeEach(() => {
  vi.clearAllMocks()
  routeState.name = 'game'
  routeState.params = {}
  vi.mocked(listGameTypes).mockResolvedValue(gameTypes)
  vi.mocked(listSquares).mockResolvedValue(squares)
  vi.mocked(listPieceTypes).mockResolvedValue(pieceTypes)
  vi.mocked(listPromotionPieces).mockResolvedValue(pieceTypes.slice(1, 5))
  vi.mocked(getGameSummary).mockResolvedValue(makeSummary())
  vi.mocked(triggerAi).mockResolvedValue(undefined)
})

describe('GameView', () => {
  const props = { gameId: 7, sideId: 0 as const }

  it('shows the game summary and the board', async () => {
    const wrapper = mount(GameView, { props })
    await settle()
    expect(wrapper.find('.alert').text()).toContain('Humano X Humano')
    expect(wrapper.findAll('.board-house')).toHaveLength(64)
    expect(triggerAi).toHaveBeenCalled()
  })

  it('shows the clocks only for games with a time limit', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(makeSummary({ tempoDeTurnoEmMilisegundos: 300000 }))
    const wrapper = mount(GameView, { props })
    await settle()
    expect(wrapper.findAll('.badge')).toHaveLength(2)
  })

  it('resigns, shows the server message and goes home', async () => {
    vi.mocked(leaveGame).mockResolvedValue('You resigned')
    const wrapper = mount(GameView, { props })
    await settle()
    await wrapper.findAll('button')[0]!.trigger('click')
    await settle()
    expect(leaveGame).toHaveBeenCalledWith(7, 0)
    expect(notify).toHaveBeenCalledWith('You resigned')
    expect(push).toHaveBeenCalledWith({ name: 'home' })
  })

  it('offers a draw and reloads the game', async () => {
    vi.mocked(proposeToOpponent).mockResolvedValue('Offered')
    const wrapper = mount(GameView, { props })
    await settle()
    await wrapper.findAll('button')[1]!.trigger('click')
    await settle()
    expect(proposeToOpponent).toHaveBeenCalledWith(7, 0, 'empate')
    expect(notify).toHaveBeenCalledWith('Offered')
    expect(getGameSummary).toHaveBeenCalledTimes(2)
  })

  it('does not stop when the AI trigger fails', async () => {
    vi.mocked(triggerAi).mockRejectedValue(new Error('down'))
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const wrapper = mount(GameView, { props })
    await settle()
    expect(wrapper.findAll('.board-house')).toHaveLength(64)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})

describe('PromotePawnView', () => {
  it('offers the promotion pieces and promotes with the chosen one', async () => {
    vi.mocked(promotePawn).mockResolvedValue('Promoted')
    const wrapper = mount(PromotePawnView, { props: { gameId: 7, sideId: 1 } })
    await settle()
    expect(wrapper.findAll('label').map((label) => label.text())).toEqual([
      'Queen',
      'Rook',
      'Bishop',
      'Knight',
    ])
    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
    await wrapper.findAll('input')[0]!.setValue(true)
    await button.trigger('click')
    await settle()
    expect(promotePawn).toHaveBeenCalledWith(7, 1, 1)
    expect(push).toHaveBeenCalledWith({ name: 'game', params: { id: 7, sideId: 1 } })
  })
})
