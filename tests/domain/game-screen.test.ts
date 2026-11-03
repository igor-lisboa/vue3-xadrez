import { describe, expect, it } from 'vitest'
import { resolveGameScreen } from '@/domain/game-screen'
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

  it('shows the draw answer, which wins over every other rule', () => {
    const summary = makeSummary({
      finalizado: 'Empate: Comum acordo',
      acoesSolicitadas: [
        { acao: 'responderPropostaEmpate', ladoId: 1 },
        { acao: 'responderPropostaReset', ladoId: 0 },
        { acao: 'promocaoPeao', ladoId: 0 },
      ],
    })
    expect(resolveGameScreen(summary, 0)).toEqual({ name: 'answerProposal', kind: 'empate' })
  })

  it('shows the reset answer over promotion and the finished screen', () => {
    const summary = makeSummary({
      finalizado: 'Vitória: Preto',
      acoesSolicitadas: [
        { acao: 'responderPropostaReset', ladoId: 0 },
        { acao: 'promocaoPeao', ladoId: 0 },
      ],
    })
    expect(resolveGameScreen(summary, 0)).toEqual({ name: 'answerProposal', kind: 'reset' })
  })
})
