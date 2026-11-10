import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { listPieceTypes, listSquares } from '@/api/services/catalogue'
import { getGameSummary } from '@/api/services/games'
import { listPossibleMoves, makeMove } from '@/api/services/moves'
import { answerProposal, proposeDraw } from '@/api/services/proposals'
import { SOCKET_EVENTS } from '@/api/socket-events'
import type { PossibleMove } from '@/api/types/move'
import { en } from '@/i18n/messages/en'
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
vi.mock('@/api/services/catalogue', () => ({ listPieceTypes: vi.fn(), listSquares: vi.fn() }))
vi.mock('@/api/services/games', () => ({ getGameSummary: vi.fn() }))
vi.mock('@/api/services/players', () => ({ leaveGame: vi.fn() }))
vi.mock('@/api/services/moves', () => ({ listPossibleMoves: vi.fn(), makeMove: vi.fn() }))
vi.mock('@/api/services/proposals', () => ({ proposeDraw: vi.fn(), answerProposal: vi.fn() }))
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

const toE4: PossibleMove = {
  casaOrigem: { casa: 'E2', linha: 6, coluna: 4 },
  casaDestino: { casa: 'E4', linha: 4, coluna: 4 },
  nome: null,
  peca: 'Peão',
  captura: false,
  capturavel: false,
}

/** White offered a draw; Black (side 1) is on turn and must answer or move. */
const offeredToBlack = makeSummary({
  ladoIdAtual: 1,
  empatePropostoPeloLadoId: 0,
  acoesSolicitadas: [{ acao: 'responderPropostaEmpate', ladoId: 1 }],
})

const squareIndex = (name: string) => squares.findIndex((square) => square.casa === name)

async function open(sideId: 0 | 1) {
  const wrapper = mount(GameView, { props: { gameId: 7, sideId } })
  await settle()
  return wrapper
}

/** Clicks two squares of a White-side board: the piece, then its destination. */
async function playE2E4(wrapper: Awaited<ReturnType<typeof open>>) {
  const houses = wrapper.findAll('.board-house')
  await houses[squareIndex('E2')]!.trigger('click')
  await settle()
  await wrapper.findAll('.board-house')[squareIndex('E4')]!.trigger('click')
  await settle()
}

beforeEach(() => {
  vi.clearAllMocks()
  handlers.clear()
  vi.mocked(listSquares).mockResolvedValue(squares)
  vi.mocked(listPieceTypes).mockResolvedValue(pieceTypes)
  vi.mocked(getGameSummary).mockResolvedValue(makeSummary())
  vi.mocked(listPossibleMoves).mockResolvedValue([toE4])
  vi.mocked(makeMove).mockResolvedValue(undefined)
})

describe('GameView draw offers', () => {
  it('keeps the receiver on the board, with the offer to accept or decline', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(offeredToBlack)
    const wrapper = await open(1)
    expect(push).not.toHaveBeenCalled()
    expect(wrapper.find('.chess-board').exists()).toBe(true)
    const panel = wrapper.find('.draw-offer')
    expect(panel.text()).toContain(en.answer.received.empate)
    expect(panel.text()).toContain(en.game.moveDeclinesDraw)
    // The offer is open, so the only draw action is the answer: no second offer button.
    expect(wrapper.find('.game-actions').text()).not.toContain(en.game.offerDraw)
  })

  it('sends the answer and reloads', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(offeredToBlack)
    vi.mocked(answerProposal).mockResolvedValue('Empate aceito')
    const wrapper = await open(1)
    await wrapper.find('.draw-offer').findAll('button')[0]!.trigger('click')
    await settle()
    expect(answerProposal).toHaveBeenCalledWith(7, 1, 'empate', true)
    expect(notify).toHaveBeenCalledWith('Empate aceito')
    expect(getGameSummary).toHaveBeenCalledTimes(2)
  })

  it('lets the receiver move instead, which closes the offer', async () => {
    const whiteReceives = makeSummary({
      empatePropostoPeloLadoId: 1,
      acoesSolicitadas: [{ acao: 'responderPropostaEmpate', ladoId: 0 }],
    })
    vi.mocked(getGameSummary)
      .mockResolvedValueOnce(whiteReceives)
      .mockResolvedValue(makeSummary({ ladoIdAtual: 1 }))
    const wrapper = await open(0)
    expect(wrapper.find('.draw-offer').exists()).toBe(true)
    await playE2E4(wrapper)
    expect(makeMove).toHaveBeenCalledWith(7, 0, 'E2', 'E4')
    expect(wrapper.find('.draw-offer').exists()).toBe(false)
  })

  it('tells the proposer it waits, and clears that when the offer is declined', async () => {
    vi.mocked(getGameSummary)
      .mockResolvedValueOnce(offeredToBlack)
      .mockResolvedValue(makeSummary({ ladoIdAtual: 0 }))
    const wrapper = await open(0)
    expect(wrapper.find('.draw-offer').text()).toBe(en.answer.waiting.empate)
    handlers.get(SOCKET_EVENTS.drawAnswered)?.()
    await settle()
    expect(wrapper.find('.draw-offer').exists()).toBe(false)
  })
})

describe('GameView draw claims', () => {
  it('shows Claim draw on the player’s turn when the API says the claim would succeed', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(makeSummary({ empateReivindicavel: true }))
    vi.mocked(proposeDraw).mockResolvedValue({
      message: 'Empate reivindicado com sucesso!',
      claimed: true,
    })
    const wrapper = await open(0)
    const claim = wrapper.find('.claim-draw')
    expect(claim.text()).toBe(en.game.claimDraw)
    expect(wrapper.text()).toContain(en.game.claimDrawHint)
    await claim.trigger('click')
    await settle()
    expect(proposeDraw).toHaveBeenCalledWith(7, 0)
    expect(notify).toHaveBeenCalledWith('Empate reivindicado com sucesso!')
  })

  it('keeps only Offer draw for the side not on turn', async () => {
    vi.mocked(getGameSummary).mockResolvedValue(makeSummary({ empateReivindicavel: true }))
    const wrapper = await open(1)
    expect(wrapper.find('.claim-draw').exists()).toBe(false)
    expect(wrapper.find('.game-actions').text()).toContain(en.game.offerDraw)
  })

  it('refreshes the claim after the opponent moves', async () => {
    vi.mocked(getGameSummary)
      .mockResolvedValueOnce(makeSummary({ ladoIdAtual: 1 }))
      .mockResolvedValue(makeSummary({ ladoIdAtual: 0, empateReivindicavel: true }))
    const wrapper = await open(0)
    expect(wrapper.find('.claim-draw').exists()).toBe(false)
    handlers.get(SOCKET_EVENTS.moveMade)?.()
    await settle()
    expect(wrapper.find('.claim-draw').exists()).toBe(true)
  })

  it('claims with the next move when the player turns the option on', async () => {
    vi.mocked(proposeDraw).mockResolvedValue({ message: 'Proposta enviada', claimed: false })
    const wrapper = await open(0)
    expect(wrapper.text()).toContain(en.game.claimWithMoveWarning)
    await wrapper.find('.claim-with-move input').setValue(true)
    await playE2E4(wrapper)
    expect(proposeDraw).toHaveBeenCalledWith(7, 0, { origem: 'E2', destino: 'E4' })
    expect(makeMove).not.toHaveBeenCalled()
    expect(notify).toHaveBeenCalledWith(`Proposta enviada\n${en.game.claimNotValid}`)
  })

  it('offers no claim with a move off turn or in an AI X AI game', async () => {
    const offTurn = await open(1)
    expect(offTurn.find('.claim-with-move').exists()).toBe(false)
    vi.mocked(getGameSummary).mockResolvedValue(makeSummary({ tipoJogo: 'I.A. X I.A.' }))
    const spectator = await open(0)
    expect(spectator.find('.claim-with-move').exists()).toBe(false)
  })
})
