import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { makeMove } from '@/api/services/moves'
import { answerProposal, proposeDraw } from '@/api/services/proposals'
import type { GameSummary } from '@/api/types/game-summary'
import { useDrawActions } from '@/composables/useDrawActions'
import { en } from '@/i18n/messages/en'
import { notify } from '@/services/dialogs'
import { setLocale } from '@/services/locale'
import { makeSummary } from '../helpers/fixtures'
import { runComposable } from '../helpers/run-composable'

vi.mock('@/api/services/moves', () => ({ makeMove: vi.fn() }))
vi.mock('@/api/services/proposals', () => ({ proposeDraw: vi.fn(), answerProposal: vi.fn() }))
vi.mock('@/services/dialogs', () => ({ notify: vi.fn(), askText: vi.fn() }))

function setup(initial: GameSummary | null = makeSummary()) {
  const summary = ref<GameSummary | null>(initial)
  const refresh = vi.fn(async () => undefined)
  const { result, unmount } = runComposable(() =>
    useDrawActions({ gameId: 7, sideId: 0, summary, refresh }),
  )
  return { summary, refresh, result, unmount }
}

beforeEach(() => {
  vi.clearAllMocks()
  setLocale('en')
})

describe('useDrawActions', () => {
  it('shows nothing before the game is loaded', () => {
    const { result, unmount } = setup(null)
    expect(result.offer.value).toBeNull()
    expect(result.action.value).toBeNull()
    expect(result.moveClaimAllowed.value).toBe(false)
    unmount()
  })

  it('follows the summary: a claim button when the API allows it on this side’s turn', async () => {
    const { result, summary, unmount } = setup()
    expect(result.action.value).toBe('offer')
    summary.value = makeSummary({ empateReivindicavel: true })
    expect(result.action.value).toBe('claim')
    summary.value = makeSummary({ empateReivindicavel: true, finalizado: 'Empate: Comum acordo' })
    expect(result.action.value).toBeNull()
    unmount()
  })

  it('claims or offers a draw with no move, shows the server message and reloads', async () => {
    vi.mocked(proposeDraw).mockResolvedValue({
      message: 'Empate reivindicado com sucesso!',
      claimed: true,
    })
    const { result, refresh, unmount } = setup(makeSummary({ empateReivindicavel: true }))
    await result.requestDraw()
    expect(proposeDraw).toHaveBeenCalledWith(7, 0)
    expect(notify).toHaveBeenCalledWith('Empate reivindicado com sucesso!')
    expect(refresh).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('still reloads when the draw request fails', async () => {
    vi.mocked(proposeDraw).mockRejectedValue(new Error('refused'))
    const { result, refresh, unmount } = setup()
    await result.requestDraw()
    expect(notify).toHaveBeenCalledTimes(1)
    expect(refresh).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('answers a received draw offer and reloads', async () => {
    vi.mocked(answerProposal).mockResolvedValue('Declined')
    const { result, refresh, unmount } = setup(
      makeSummary({ acoesSolicitadas: [{ acao: 'responderPropostaEmpate', ladoId: 0 }] }),
    )
    expect(result.offer.value).toBe('received')
    await result.answerOffer(false)
    expect(answerProposal).toHaveBeenCalledWith(7, 0, 'empate', false)
    expect(notify).toHaveBeenCalledWith('Declined')
    expect(refresh).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('reloads without a message when the answer fails', async () => {
    vi.mocked(answerProposal).mockRejectedValue(new Error('gone'))
    const { result, refresh, unmount } = setup()
    await result.answerOffer(true)
    expect(notify).toHaveBeenCalledTimes(1)
    expect(refresh).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('plays a move normally while the claim option is off', async () => {
    const { result, unmount } = setup()
    await result.playMove('E2', 'E4')
    expect(makeMove).toHaveBeenCalledWith(7, 0, 'E2', 'E4')
    expect(proposeDraw).not.toHaveBeenCalled()
    unmount()
  })

  it('sends the move as a draw claim when the option is on, then turns the option off', async () => {
    vi.mocked(proposeDraw).mockResolvedValue({ message: 'Claimed', claimed: true })
    const { result, unmount } = setup()
    result.claimWithNextMove.value = true
    await result.playMove('E1', 'E2')
    expect(proposeDraw).toHaveBeenCalledWith(7, 0, { origem: 'E1', destino: 'E2' })
    expect(makeMove).not.toHaveBeenCalled()
    expect(notify).toHaveBeenCalledWith('Claimed')
    expect(result.claimWithNextMove.value).toBe(false)
    unmount()
  })

  it('explains that the move was played when the claim was not valid', async () => {
    vi.mocked(proposeDraw).mockResolvedValue({ message: 'Proposta enviada', claimed: false })
    const { result, unmount } = setup()
    result.claimWithNextMove.value = true
    await result.playMove('E1', 'E2')
    expect(notify).toHaveBeenCalledWith(`Proposta enviada\n${en.game.claimNotValid}`)
    unmount()
  })

  it('throws a failed claim to the board, which shows it', async () => {
    vi.mocked(proposeDraw).mockRejectedValue(new Error('refused'))
    const { result, unmount } = setup()
    result.claimWithNextMove.value = true
    await expect(result.playMove('E1', 'E2')).rejects.toThrow('refused')
    unmount()
  })

  it('turns the claim option off when the turn passes', async () => {
    const { result, summary, unmount } = setup()
    result.claimWithNextMove.value = true
    expect(result.moveClaimAllowed.value).toBe(true)
    summary.value = makeSummary({ ladoIdAtual: 1 })
    await nextTick()
    expect(result.moveClaimAllowed.value).toBe(false)
    expect(result.claimWithNextMove.value).toBe(false)
    unmount()
  })
})
