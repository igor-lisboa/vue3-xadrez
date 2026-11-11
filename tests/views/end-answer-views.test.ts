import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import {
  listGameTypes,
  listPieceTypes,
  listPromotionPieces,
  listSquares,
} from '@/api/services/catalogue'
import { getGameSummary } from '@/api/services/games'
import { answerProposal, proposeReset } from '@/api/services/proposals'
import { triggerAi } from '@/api/services/ai'
import { notify } from '@/services/dialogs'
import EndGameView from '@/views/EndGameView.vue'
import AnswerProposalView from '@/views/AnswerProposalView.vue'
import type { SimplifiedCell } from '@/api/types/enums'
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
vi.mock('@/api/services/proposals', () => ({
  proposeDraw: vi.fn(),
  proposeReset: vi.fn(),
  answerProposal: vi.fn(),
}))
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

/** A board with only the given cells, A8 first; the other squares are empty. */
function boardWith(cells: Record<number, SimplifiedCell>): (SimplifiedCell | null)[][] {
  return Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 8 }, (_, column) => cells[row * 8 + column] ?? null),
  )
}

describe('EndGameView', () => {
  it('shows the English result of the game and only the actions, without the review', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(makeSummary({ finalizado: 'Vitória: Branco' }))
    const wrapper = mount(EndGameView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    expect(wrapper.find('h1').text()).toBe('White wins')
    expect(
      wrapper
        .find('.btn-group')
        .findAll('button')
        .map((button) => button.text()),
    ).toEqual(['New game?', 'Propose reset'])
    expect(wrapper.find('.review-game').text()).toBe('Review game')
    expect(wrapper.find('.chess-board').exists()).toBe(false)
    expect(wrapper.find('.material-summary').exists()).toBe(false)
  })

  it('names the winner the API gives, also after a resignation', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(
      makeSummary({ finalizado: 'Desistência: Um jogador deixou a partida', ladoIdVencedor: 1 }),
    )
    const wrapper = mount(EndGameView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    expect(wrapper.find('h1').text()).toBe('Resignation: a player left the game')
    expect(wrapper.find('.winner').text()).toBe('Winner: Black')
  })

  it('says why the side won, for a checkmate and for a time out alike', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(
      makeSummary({
        finalizado: 'Vitória: Preto',
        motivoFinalizacao: 'tempoEsgotado',
        ladoIdVencedor: 1,
      }),
    )
    const wrapper = mount(EndGameView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    expect(wrapper.find('h1').text()).toBe('Black wins: White ran out of time')
    expect(wrapper.find('.winner').text()).toBe('Winner: Black')
  })

  it('names the side that resigned, from ladoIdDesistente, in a resignation win', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(
      makeSummary({
        finalizado: 'Desistência: Um jogador deixou a partida',
        motivoFinalizacao: 'desistencia',
        ladoIdVencedor: 1,
        ladoIdDesistente: 0,
      }),
    )
    const wrapper = mount(EndGameView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    expect(wrapper.find('h1').text()).toBe('Black wins: White resigned')
  })

  it('shows a resignation that ends as a draw, naming the side that resigned', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(
      makeSummary({
        finalizado: 'Empate: Insuficiência material',
        motivoFinalizacao: 'desistencia',
        ladoIdVencedor: null,
        ladoIdDesistente: 0,
      }),
    )
    const wrapper = mount(EndGameView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    expect(wrapper.find('h1').text()).toBe(
      'Draw: White resigned, but Black had no material to checkmate',
    )
    expect(wrapper.find('.winner').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Neither side has enough pieces')
  })

  it('falls back to the ending label when the reason is missing', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(
      makeSummary({ finalizado: 'Vitória: Branco', motivoFinalizacao: null, ladoIdVencedor: 0 }),
    )
    const wrapper = mount(EndGameView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    expect(wrapper.find('h1').text()).toBe('White wins')
  })

  it('reads the winner from ladoIdVencedor, not from the ending label', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(
      makeSummary({ finalizado: 'Vitória: Branco', ladoIdVencedor: 1 }),
    )
    const wrapper = mount(EndGameView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    expect(wrapper.find('.winner').text()).toBe('Winner: Black')
  })

  it.each([
    ['Empate: Regra das 5 posições', 'Draw: fivefold repetition'],
    ['Empate: Regra 75 movimentos', 'Draw: 75-move rule'],
    ['Empate: Posição morta', 'Draw: dead position'],
  ] as const)('names the automatic draw %s and shows no winner', async (ending, text) => {
    vi.mocked(getGameSummary).mockResolvedValue(makeSummary({ finalizado: ending }))
    const wrapper = mount(EndGameView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    expect(wrapper.find('h1').text()).toBe(text)
    expect(wrapper.find('.winner').exists()).toBe(false)
    expect(wrapper.find('.material-summary').exists()).toBe(false)
  })

  it('goes home for a new game', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(makeSummary({ finalizado: 'Empate: Rei afogado' }))
    const wrapper = mount(EndGameView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    await wrapper.find('.btn-group').findAll('button')[0]!.trigger('click')
    expect(push).toHaveBeenCalledWith({ name: 'home' })
  })

  it('opens the review of the game, turned to the player', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(makeSummary({ finalizado: 'Vitória: Preto' }))
    const wrapper = mount(EndGameView, { props: { gameId: 7, sideId: 1 } })
    await settle()
    await wrapper.find('.review-game').trigger('click')
    expect(push).toHaveBeenCalledWith({
      name: 'gameReview',
      params: { id: 7 },
      query: { side: 1 },
    })
  })

  it('explains an insufficient-material draw with the pieces left', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(
      makeSummary({
        finalizado: 'Empate: Insuficiência material',
        tabuleiro: boardWith({ 4: 'Rei-1', 5: 'Cavalo-1', 60: 'Rei-0' }),
      }),
    )
    const wrapper = mount(EndGameView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    const summary = wrapper.find('.material-summary')
    expect(summary.find('.lead').text()).toBe('Neither side has enough pieces left to checkmate.')
    const sides = summary.findAll('li')
    expect(sides.map((side) => side.find('strong').text())).toEqual(['White', 'Black'])
    expect(sides[1]!.find('[role="img"]').attributes('aria-label')).toBe('King, Knight')
    expect(sides[1]!.findAll('use').map((use) => use.attributes('href'))).toEqual(['#bk', '#bn'])
    expect(summary.find('.badge').exists()).toBe(false)
  })

  it('says which side ran out of time in a time-out draw', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(
      makeSummary({
        finalizado: 'Empate: Tempo esgotado sem material',
        ladoIdAtual: 1,
        tabuleiro: boardWith({ 4: 'Rei-1', 60: 'Rei-0', 56: 'Torre-0' }),
      }),
    )
    const wrapper = mount(EndGameView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    const summary = wrapper.find('.material-summary')
    expect(summary.find('.lead').text()).toBe('Black ran out of time.')
    expect(
      summary.findAll('[role="img"]').map((pieces) => pieces.attributes('aria-label')),
    ).toEqual(['King, Rook', 'King'])
  })

  it('names the time-out draw in the heading', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(
      makeSummary({ finalizado: 'Empate: Tempo esgotado sem material' }),
    )
    const wrapper = mount(EndGameView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    expect(wrapper.find('h1').text()).toBe('Draw: time out and the other side cannot checkmate')
  })

  it('shows the ending as the API sent it when the frontend does not know it', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(
      makeSummary({ finalizado: 'Empate: Algo novo' as never }),
    )
    const wrapper = mount(EndGameView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    expect(wrapper.find('h1').text()).toBe('Empate: Algo novo')
  })

  it('proposes a reset and returns to the game', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(makeSummary({ finalizado: 'Empate: Rei afogado' }))
    vi.mocked(proposeReset).mockResolvedValue('Offered reset')
    const wrapper = mount(EndGameView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    await wrapper.find('.btn-group').findAll('button')[1]!.trigger('click')
    await settle()
    expect(proposeReset).toHaveBeenCalledWith(7, 0)
    expect(push).toHaveBeenCalledWith({ name: 'game', params: { id: 7, sideId: 0 } })
  })
})

describe('AnswerProposalView', () => {
  const pending = (ladoId: 0 | 1) =>
    makeSummary({ acoesSolicitadas: [{ acao: 'responderPropostaReset', ladoId }] })

  it('lets the receiving side accept the reset offer', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(pending(0))
    vi.mocked(answerProposal).mockResolvedValue('Accepted')
    const wrapper = mount(AnswerProposalView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    expect(wrapper.find('h1').text()).toBe('You received a reset proposal')
    const respond = wrapper.find('button')
    expect(respond.attributes('disabled')).toBeDefined()
    await wrapper.findAll('input')[0]!.setValue(true)
    await respond.trigger('click')
    await settle()
    expect(answerProposal).toHaveBeenCalledWith(7, 0, 'reset', true)
    expect(notify).toHaveBeenCalledWith('Accepted')
    expect(push).toHaveBeenCalledWith({ name: 'game', params: { id: 7, sideId: 0 } })
  })

  it('makes the other side wait', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(pending(1))
    const wrapper = mount(AnswerProposalView, { props: { gameId: 7, sideId: 0 } })
    await settle()
    expect(wrapper.find('h1').text()).toBe('Waiting for the answer to the reset proposal...')
  })

  it('answers a reset offer with a refusal', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(pending(1))
    vi.mocked(answerProposal).mockResolvedValue('Refused')
    const wrapper = mount(AnswerProposalView, { props: { gameId: 7, sideId: 1 } })
    await settle()
    await wrapper.findAll('input')[1]!.setValue(true)
    await wrapper.find('button').trigger('click')
    await settle()
    expect(answerProposal).toHaveBeenCalledWith(7, 1, 'reset', false)
  })
})
