import { describe, expect, it } from 'vitest'
import { gameTypeLabel } from '@/domain/labels'
import { orientForSide } from '@/domain/orientation'
import { en } from '@/i18n/messages/en'
import { gameTypes } from '../helpers/fixtures'

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
