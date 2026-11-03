import { describe, expect, it } from 'vitest'
import { chooseLocale, isLocale, LOCALE_OPTIONS, matchLocale } from '@/i18n/locales'

describe('matchLocale', () => {
  it('keeps Brazilian and European Portuguese apart', () => {
    expect(matchLocale('pt-BR')).toBe('pt-BR')
    expect(matchLocale('pt-br')).toBe('pt-BR')
    expect(matchLocale('pt-PT')).toBe('pt')
    expect(matchLocale('pt')).toBe('pt')
  })

  it('uses the language of other regional variants', () => {
    expect(matchLocale('fr-CA')).toBe('fr')
    expect(matchLocale('de-AT')).toBe('de')
    expect(matchLocale('it')).toBe('it')
    expect(matchLocale('en-US')).toBe('en')
  })

  it('returns null for a language the app does not have', () => {
    expect(matchLocale('ja-JP')).toBeNull()
  })
})

describe('chooseLocale', () => {
  it('uses the stored choice when it is still supported', () => {
    expect(chooseLocale('fr', ['en-US'])).toBe('fr')
  })

  it('ignores a stored value that is not a supported language', () => {
    expect(chooseLocale('klingon', ['it-IT'])).toBe('it')
  })

  it('takes the first browser language that the app supports', () => {
    expect(chooseLocale(null, ['ja-JP', 'de-DE', 'fr-FR'])).toBe('de')
  })

  it('falls back to English', () => {
    expect(chooseLocale(null, ['ja-JP'])).toBe('en')
    expect(chooseLocale(null, [])).toBe('en')
  })
})

describe('isLocale', () => {
  it('accepts only the supported codes', () => {
    expect(isLocale('pt-BR')).toBe(true)
    expect(isLocale('pt-br')).toBe(false)
    expect(isLocale(3)).toBe(false)
  })
})

describe('LOCALE_OPTIONS', () => {
  it('lists the six languages, each named in its own language', () => {
    expect(LOCALE_OPTIONS.map((option) => option.label)).toEqual([
      'English',
      'Português (Brasil)',
      'Português (Portugal)',
      'Français',
      'Italiano',
      'Deutsch',
    ])
  })
})
