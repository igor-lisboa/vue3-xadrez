import { describe, expect, it } from 'vitest'
import { LOCALES } from '@/i18n/locales'
import { MESSAGES } from '@/i18n/messages'

type Node = Record<string, unknown>

/** Describes every leaf of a message tree as "path: kind", so two languages can be compared. */
function shape(node: Node, prefix = ''): string[] {
  return Object.entries(node).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'function') {
      return [`${path}: function(${value.length})`]
    }
    if (typeof value === 'string') {
      return [`${path}: string`]
    }
    return shape(value as Node, path)
  })
}

/** Every text of a message tree, skipping the functions. */
function texts(node: Node): string[] {
  return Object.values(node).flatMap((value) => {
    if (typeof value === 'string') {
      return [value]
    }
    if (typeof value === 'object' && value !== null) {
      return texts(value as Node)
    }
    return []
  })
}

describe('message files', () => {
  const reference = shape(MESSAGES.en as unknown as Node)

  it.each(LOCALES)('%s has the same keys as English, with the same kinds of values', (locale) => {
    expect(shape(MESSAGES[locale] as unknown as Node)).toEqual(reference)
  })

  it.each(LOCALES)('%s has no empty text', (locale) => {
    const found = texts(MESSAGES[locale] as unknown as Node)
    expect(found.length).toBeGreaterThan(0)
    expect(found.filter((text) => text.trim() === '')).toEqual([])
  })

  it.each(LOCALES)('%s builds the title of a game with its id', (locale) => {
    expect(MESSAGES[locale].selectSide.title(7)).toContain('7')
  })

  it('builds the English title of a game', () => {
    expect(MESSAGES.en.selectSide.title(7)).toBe('Choose an available side to play game 7')
  })
})
