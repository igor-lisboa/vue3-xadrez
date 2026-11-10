import { describe, expect, it } from 'vitest'
import { hasPendingAction, resolveGameScreen } from '@/domain/game-screen'
import { makeSummary } from '../helpers/fixtures'

describe('resolveGameScreen', () => {
  it('shows the game when nothing is pending', () => {
    expect(resolveGameScreen(makeSummary(), 0)).toEqual({ name: 'game' })
  })

  it('shows the endGame screen of a finished game', () => {
    const summary = makeSummary({ finalizado: 'Vitória: Branco' })
    expect(resolveGameScreen(summary, 1)).toEqual({ name: 'endGame' })
  })

  it('sends a side that has no player to selectSide', () => {
    const summary = makeSummary({ ladosIdDeslogados: [1] })
    expect(resolveGameScreen(summary, 1)).toEqual({ name: 'selectSide', preselectedSide: 1 })
  })

  it('sends the side with a pending promotion to promotePawn, only for that side', () => {
    const summary = makeSummary({ acoesSolicitadas: [{ acao: 'promocaoPeao', ladoId: 0 }] })
    expect(resolveGameScreen(summary, 0)).toEqual({ name: 'promotePawn' })
    expect(resolveGameScreen(summary, 1)).toEqual({ name: 'game' })
  })

  it('keeps both sides on the game while a draw offer is open', () => {
    const summary = makeSummary({
      empatePropostoPeloLadoId: 0,
      acoesSolicitadas: [{ acao: 'responderPropostaEmpate', ladoId: 1 }],
    })
    expect(resolveGameScreen(summary, 0)).toEqual({ name: 'game' })
    expect(resolveGameScreen(summary, 1)).toEqual({ name: 'game' })
  })

  it('lets a pending promotion win over an open draw offer', () => {
    const summary = makeSummary({
      acoesSolicitadas: [
        { acao: 'responderPropostaEmpate', ladoId: 0 },
        { acao: 'promocaoPeao', ladoId: 0 },
      ],
    })
    expect(resolveGameScreen(summary, 0)).toEqual({ name: 'promotePawn' })
  })

  it('shows the reset answer over promotion and the finished screen', () => {
    const summary = makeSummary({
      finalizado: 'Vitória: Preto',
      acoesSolicitadas: [
        { acao: 'responderPropostaReset', ladoId: 0 },
        { acao: 'promocaoPeao', ladoId: 0 },
      ],
    })
    expect(resolveGameScreen(summary, 0)).toEqual({ name: 'answerProposal' })
  })
})

describe('hasPendingAction', () => {
  const summary = makeSummary({
    acoesSolicitadas: [{ acao: 'responderPropostaEmpate', ladoId: 1 }],
  })

  it('finds an action for any side when no side is given', () => {
    expect(hasPendingAction(summary, 'responderPropostaEmpate')).toBe(true)
    expect(hasPendingAction(summary, 'promocaoPeao')).toBe(false)
  })

  it('finds an action only for the given side', () => {
    expect(hasPendingAction(summary, 'responderPropostaEmpate', 1)).toBe(true)
    expect(hasPendingAction(summary, 'responderPropostaEmpate', 0)).toBe(false)
  })
})
