import { describe, expect, it } from 'vitest'
import { formatClock } from '@/domain/clock'

describe('formatClock', () => {
  it.each([
    [0, '00:00:00'],
    [999, '00:00:00'],
    [5 * 60_000, '00:05:00'],
    [3_723_000, '01:02:03'],
    [25 * 3_600_000, '01:00:00'],
    [-500, '00:00:00'],
  ])('formats %i ms as %s', (milliseconds, expected) => {
    expect(formatClock(milliseconds)).toBe(expected)
  })
})
