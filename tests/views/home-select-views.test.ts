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

describe('HomeView', () => {
  it('lists the game types with their player labels', async () => {
    const wrapper = mount(HomeView)
    await settle()
    expect(wrapper.text()).toContain('Human X Human')
    expect(wrapper.text()).toContain('AI X AI')
  })

  it('creates a human game with the chosen turn time and asks for a side', async () => {
    vi.mocked(createGame).mockResolvedValue({ id: 9 })
    const wrapper = mount(HomeView)
    await settle()
    await wrapper.findAll('input[type="radio"]')[1]!.setValue(true)
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Human X Human')!
      .trigger('click')
    await settle()
    expect(createGame).toHaveBeenCalledWith({ tipoJogo: 0, tempoDeTurnoEmMilisegundos: 300000 })
    expect(push).toHaveBeenCalledWith({ name: 'selectSide', params: { id: 9 } })
  })

  it('opens the AI vs AI game directly', async () => {
    vi.mocked(createGame).mockResolvedValue({ id: 3 })
    const wrapper = mount(HomeView)
    await settle()
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'AI X AI')!
      .trigger('click')
    await settle()
    expect(push).toHaveBeenCalledWith({ name: 'game', params: { id: 3, sideId: 0 } })
  })

  it('does not navigate when the game cannot be created', async () => {
    vi.mocked(createGame).mockRejectedValue(new Error('down'))
    const wrapper = mount(HomeView)
    await settle()
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Human X Human')!
      .trigger('click')
    await settle()
    expect(notify).toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })

  it('enters a room typed by the player', async () => {
    vi.mocked(askText).mockReturnValue(' 12 ')
    const wrapper = mount(HomeView)
    await settle()
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Enter a room')!
      .trigger('click')
    expect(push).toHaveBeenCalledWith({ name: 'selectSide', params: { id: '12' } })
  })

  it('does nothing when the room prompt is cancelled or empty', async () => {
    vi.mocked(askText).mockReturnValueOnce(null).mockReturnValueOnce('   ')
    const wrapper = mount(HomeView)
    await settle()
    const enter = wrapper.findAll('button').find((button) => button.text() === 'Enter a room')!
    await enter.trigger('click')
    await enter.trigger('click')
    expect(push).not.toHaveBeenCalled()
  })
})

describe('SelectSideView', () => {
  it('offers the free sides and joins the chosen one as a human', async () => {
    vi.mocked(listSidesWithoutPlayer).mockResolvedValue([{ id: 1, lado: 'Preto' }])
    vi.mocked(joinGame).mockResolvedValue('Joined')
    const wrapper = mount(SelectSideView, { props: { gameId: 4, preselectedSide: null } })
    await settle()
    expect(wrapper.text()).toContain('Black')
    await wrapper.findAll('input')[0]!.setValue(true)
    await wrapper.find('button').trigger('click')
    await settle()
    expect(joinGame).toHaveBeenCalledWith(4, { ladoId: 1, tipoId: 0 })
    expect(notify).toHaveBeenCalledWith('Joined')
    expect(push).toHaveBeenCalledWith({ name: 'game', params: { id: 4, sideId: 1 } })
  })

  it('keeps the side preselected from the link', async () => {
    vi.mocked(listSidesWithoutPlayer).mockResolvedValue([{ id: 0, lado: 'Branco' }])
    const wrapper = mount(SelectSideView, { props: { gameId: 4, preselectedSide: 0 } })
    await settle()
    expect((wrapper.find('input').element as HTMLInputElement).checked).toBe(true)
  })

  it('reloads the sides when joining fails', async () => {
    vi.mocked(listSidesWithoutPlayer).mockResolvedValue([{ id: 0, lado: 'Branco' }])
    vi.mocked(joinGame).mockRejectedValue(new Error('taken'))
    const wrapper = mount(SelectSideView, { props: { gameId: 4, preselectedSide: 0 } })
    await settle()
    await wrapper.find('button').trigger('click')
    await settle()
    expect(listSidesWithoutPlayer).toHaveBeenCalledTimes(2)
    expect(push).not.toHaveBeenCalled()
  })

  it('says so and offers a new game when no side is free', async () => {
    vi.mocked(listSidesWithoutPlayer).mockResolvedValue([])
    const wrapper = mount(SelectSideView, { props: { gameId: 4, preselectedSide: null } })
    await settle()
    expect(wrapper.text()).toContain('This game has no available sides')
    await wrapper.find('button').trigger('click')
    expect(push).toHaveBeenCalledWith({ name: 'home' })
  })

  it('goes home when the sides cannot be loaded', async () => {
    vi.mocked(listSidesWithoutPlayer).mockRejectedValue(new Error('gone'))
    mount(SelectSideView, { props: { gameId: 4, preselectedSide: null } })
    await settle()
    expect(push).toHaveBeenCalledWith({ name: 'home' })
  })
})
