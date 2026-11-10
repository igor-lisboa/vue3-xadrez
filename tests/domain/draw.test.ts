import { describe, expect, it } from 'vitest'
import { canClaimWithMove, drawAction, drawOfferState } from '@/domain/draw'
import { makeSummary } from '../helpers/fixtures'

describe('drawOfferState', () => {
  const offeredByWhite = makeSummary({
    empatePropostoPeloLadoId: 0,
    acoesSolicitadas: [{ acao: 'responderPropostaEmpate', ladoId: 1 }],
  })

  it('tells the side that received the offer that it may answer', () => {
    expect(drawOfferState(offeredByWhite, 1)).toBe('received')
  })

  it('tells the side that made the offer that it waits', () => {
    expect(drawOfferState(offeredByWhite, 0)).toBe('sent')
  })

  it('shows nothing once the offer is declined by a move', () => {
    // The API clears both fields when the side that received the offer moves instead.
    expect(drawOfferState(makeSummary(), 0)).toBeNull()
    expect(drawOfferState(makeSummary(), 1)).toBeNull()
  })
})

describe('drawAction', () => {
  it('offers a draw to either side, on turn or not, while no offer is open', () => {
    const summary = makeSummary({ ladoIdAtual: 0 })
    expect(drawAction(summary, 0)).toBe('offer')
    expect(drawAction(summary, 1)).toBe('offer')
  })

  it('lets the side on turn claim when the API says the claim would succeed', () => {
    const summary = makeSummary({ ladoIdAtual: 1, empateReivindicavel: true })
    expect(drawAction(summary, 1)).toBe('claim')
    expect(drawAction(summary, 0)).toBe('offer')
  })

  it('still lets the side on turn claim while an offer is open', () => {
    const summary = makeSummary({
      ladoIdAtual: 1,
      empateReivindicavel: true,
      empatePropostoPeloLadoId: 0,
    })
    expect(drawAction(summary, 1)).toBe('claim')
  })

  it('shows no offer button while an offer is open, since it is answered instead', () => {
    const summary = makeSummary({ empatePropostoPeloLadoId: 0 })
    expect(drawAction(summary, 0)).toBeNull()
    expect(drawAction(summary, 1)).toBeNull()
  })

  it('shows nothing once the game has ended', () => {
    const summary = makeSummary({ finalizado: 'Empate: Regra das 3 posições' })
    expect(drawAction(summary, 0)).toBeNull()
    expect(drawAction({ ...summary, empateReivindicavel: true }, 0)).toBeNull()
  })
})

describe('canClaimWithMove', () => {
  it('lets only the side on turn claim with its next move', () => {
    const summary = makeSummary({ ladoIdAtual: 0 })
    expect(canClaimWithMove(summary, 0)).toBe(true)
    expect(canClaimWithMove(summary, 1)).toBe(false)
  })

  it('does not depend on empateReivindicavel, which does not cover this claim', () => {
    expect(canClaimWithMove(makeSummary({ empateReivindicavel: false }), 0)).toBe(true)
  })

  it('is closed once the game has ended', () => {
    expect(canClaimWithMove(makeSummary({ finalizado: 'Empate: Posição morta' }), 0)).toBe(false)
  })
})
