import { describe, expect, it } from 'vitest'
import {
  gameTypeLabel,
  translateEnding,
  translateEndingHeading,
  translateGameType,
} from '@/domain/labels'
import { orientForSide } from '@/domain/orientation'
import { en } from '@/i18n/messages/en'
import { ptBR } from '@/i18n/messages/pt-br'
import { gameTypes } from '../helpers/fixtures'

describe('translateGameType', () => {
  it('translates the player types the API sends in Portuguese', () => {
    expect(translateGameType('Humano X I.A.', en.labels.playerTypes)).toBe('Human X AI')
    expect(translateGameType('I.A. X I.A.', en.labels.playerTypes)).toBe('AI X AI')
    expect(translateGameType('Humano X Humano', { 0: 'Humano', 1: 'IA' })).toBe('Humano X Humano')
  })

  it('keeps names it does not know as the API sent them', () => {
    expect(translateGameType('Robô X Humano', en.labels.playerTypes)).toBe('Robô X Human')
  })
})

describe('translateEnding', () => {
  it('gives the text of a known ending in the language in use', () => {
    expect(translateEnding(en.labels.endings, 'Empate: Tempo esgotado sem material')).toBe(
      'Draw: time out and the other side cannot checkmate',
    )
  })

  it('keeps an ending it does not know as the API sent it', () => {
    expect(translateEnding(en.labels.endings, 'Empate: Algo novo')).toBe('Empate: Algo novo')
  })
})

describe('labels', () => {
  it('names a game type by its players, in the labels given', () => {
    expect(gameTypeLabel(gameTypes[0]!, en.labels.playerTypes)).toBe('Human X Human')
    expect(gameTypeLabel(gameTypes[1]!, en.labels.playerTypes)).toBe('AI X AI')
    expect(gameTypeLabel(gameTypes[1]!, { 0: 'Humano', 1: 'IA' })).toBe('IA X IA')
  })
})

describe('orientForSide', () => {
  it('keeps the order for white and reverses it for black', () => {
    expect(orientForSide([1, 2, 3], 0)).toEqual([1, 2, 3])
    expect(orientForSide([1, 2, 3], 1)).toEqual([3, 2, 1])
  })

  it('does not change the original array', () => {
    const items = [1, 2]
    orientForSide(items, 1)
    expect(items).toEqual([1, 2])
  })
})

describe('translateEndingHeading', () => {
  const texts = en.labels

  it('says why a side won, because checkmate and time out share the same ending', () => {
    expect(
      translateEndingHeading(texts, {
        ending: 'Vitória: Preto',
        reason: 'xequeMate',
        winner: 1,
        resigner: null,
      }),
    ).toBe('Black wins by checkmate')
    expect(
      translateEndingHeading(texts, {
        ending: 'Vitória: Preto',
        reason: 'tempoEsgotado',
        winner: 1,
        resigner: null,
      }),
    ).toBe('Black wins: White ran out of time')
  })

  it('names the side that resigned, as the API sends it, when the other side won', () => {
    expect(
      translateEndingHeading(texts, {
        ending: 'Desistência: Um jogador deixou a partida',
        reason: 'desistencia',
        winner: 1,
        resigner: 0,
      }),
    ).toBe('Black wins: White resigned')
  })

  it('names the side that resigned in a draw, and the side that could not mate', () => {
    expect(
      translateEndingHeading(texts, {
        ending: 'Empate: Insuficiência material',
        reason: 'desistencia',
        winner: null,
        resigner: 1,
      }),
    ).toBe('Draw: Black resigned, but White had no material to checkmate')
  })

  it('does not name a resigner the API did not send, even when a side won', () => {
    expect(
      translateEndingHeading(texts, {
        ending: 'Desistência: Um jogador deixou a partida',
        reason: 'desistencia',
        winner: 0,
        resigner: null,
      }),
    ).toBe('Resignation: a player left the game')
  })

  it('shows the ending label when there is no winner reason to add', () => {
    expect(
      translateEndingHeading(texts, {
        ending: 'Empate: Comum acordo',
        reason: null,
        winner: null,
        resigner: null,
      }),
    ).toBe('Draw: by agreement')
    expect(
      translateEndingHeading(texts, {
        ending: 'Vitória: Branco',
        reason: null,
        winner: 0,
        resigner: null,
      }),
    ).toBe('White wins')
  })

  it('shows the ending label for a reason the frontend does not know', () => {
    expect(
      translateEndingHeading(texts, {
        ending: 'Vitória: Branco',
        reason: 'motivoNovo',
        winner: 0,
        resigner: null,
      }),
    ).toBe('White wins')
  })

  it('builds the Portuguese heading with the names of the sides', () => {
    expect(
      translateEndingHeading(ptBR.labels, {
        ending: 'Vitória: Preto',
        reason: 'xequeMate',
        winner: 1,
        resigner: null,
      }),
    ).toBe('Vitória das Pretas por xeque-mate')
    expect(
      translateEndingHeading(ptBR.labels, {
        ending: 'Desistência: Um jogador deixou a partida',
        reason: 'desistencia',
        winner: null,
        resigner: 0,
      }),
    ).toBe('Empate: as Brancas desistiram, mas as Pretas não tinham material para dar xeque-mate')
  })
})
