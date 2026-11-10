import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import {
  listGameTypes,
  listPieceTypes,
  listPromotionPieces,
  listSquares,
} from '@/api/services/catalogue'
import {
  createGame,
  getGameHistory,
  getGameSummary,
  listSidesWithoutPlayer,
} from '@/api/services/games'
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
import { makeHistory } from '../helpers/history'
import { startingPosition } from '@/domain/replay'

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
  getGameHistory: vi.fn(),
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
  vi.mocked(getGameHistory).mockResolvedValue(makeHistory([], startingPosition()))
})

describe('EndGameView', () => {
  it('shows the English result of the game', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(makeSummary({ finalizado: 'Vitória: Branco' }))
    const wrapper = mount(EndGameView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    expect(wrapper.find('h1').text()).toBe('White wins')
  })

  it('goes home for a new game', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(makeSummary({ finalizado: 'Empate: Rei afogado' }))
    const wrapper = mount(EndGameView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    await wrapper.findAll('.end-game-actions button')[0]!.trigger('click')
    expect(push).toHaveBeenCalledWith({ name: 'home' })
  })

  it('proposes a reset and returns to the game', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(makeSummary({ finalizado: 'Empate: Rei afogado' }))
    vi.mocked(proposeToOpponent).mockResolvedValue('Offered reset')
    const wrapper = mount(EndGameView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    await wrapper.findAll('.end-game-actions button')[1]!.trigger('click')
    await settle()
    expect(proposeToOpponent).toHaveBeenCalledWith(7, 0, 'reset')
    expect(push).toHaveBeenCalledWith({ name: 'game', params: { id: 7, sideId: 0 } })
  })
})

describe('AnswerProposalView', () => {
  const pending = (ladoId: 0 | 1) =>
    makeSummary({ acoesSolicitadas: [{ acao: 'responderPropostaEmpate', ladoId }] })

  it('lets the receiving side answer the draw offer', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(pending(0))
    vi.mocked(answerProposal).mockResolvedValue('Accepted')
    const wrapper = mount(AnswerProposalView, {
      props: { gameId: 7, sideId: 0, proposalType: 'tie' },
    })
    await settle()
    expect(wrapper.find('h1').text()).toBe('You received a draw proposal')
    const respond = wrapper.find('button')
    expect(respond.attributes('disabled')).toBeDefined()
    await wrapper.findAll('input')[0]!.setValue(true)
    await respond.trigger('click')
    await settle()
    expect(answerProposal).toHaveBeenCalledWith(7, 0, 'empate', true)
    expect(push).toHaveBeenCalledWith({ name: 'game', params: { id: 7, sideId: 0 } })
  })

  it('makes the other side wait', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(pending(1))
    const wrapper = mount(AnswerProposalView, {
      props: { gameId: 7, sideId: 0, proposalType: 'tie' },
    })
    await settle()
    expect(wrapper.find('h1').text()).toBe('Waiting for the answer to the draw proposal...')
  })

  it('answers a reset offer with a refusal', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(
      makeSummary({ acoesSolicitadas: [{ acao: 'responderPropostaReset', ladoId: 1 }] }),
    )
    vi.mocked(answerProposal).mockResolvedValue('Refused')
    const wrapper = mount(AnswerProposalView, {
      props: { gameId: 7, sideId: 1, proposalType: 'reset' },
    })
    await settle()
    await wrapper.findAll('input')[1]!.setValue(true)
    await wrapper.find('button').trigger('click')
    await settle()
    expect(answerProposal).toHaveBeenCalledWith(7, 1, 'reset', false)
  })
})
