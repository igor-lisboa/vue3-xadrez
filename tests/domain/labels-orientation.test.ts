import { describe, expect, it } from 'vitest'
import { gameTypeLabel, moveLabel } from '@/domain/labels'
import { orientForSide } from '@/domain/orientation'
import { gameTypes } from '../helpers/fixtures'

describe('labels', () => {
  it('names a game type by its players', () => {
    expect(gameTypeLabel(gameTypes[0]!)).toBe('Human X Human')
    expect(gameTypeLabel(gameTypes[1]!)).toBe('AI X AI')
  })

  it('translates move names and leaves nothing for a normal move', () => {
    expect(moveLabel('Roque Maior')).toBe('Long castling')
    expect(moveLabel('L')).toBe('Knight move')
    expect(moveLabel(null)).toBe('')
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
