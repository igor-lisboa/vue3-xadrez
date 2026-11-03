// Supported languages. The codes are BCP 47 tags, so they match what browsers report.
export const LOCALES = ['en', 'pt-BR', 'pt', 'fr', 'it', 'de'] as const

export type Locale = (typeof LOCALES)[number]

const DEFAULT_LOCALE: Locale = 'en'

/** Key of the localStorage entry that keeps the language the player chose. */
export const LOCALE_STORAGE_KEY = 'chess.locale'

/** Each language is named in its own language, so a player can find theirs. */
const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  'pt-BR': 'Português (Brasil)',
  pt: 'Português (Portugal)',
  fr: 'Français',
  it: 'Italiano',
  de: 'Deutsch',
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

/**
 * Closest supported language to a browser language tag, or null when there is none.
 * Brazilian Portuguese is kept apart from European Portuguese; other variants such as
 * "fr-CA" or "de-AT" use the language they belong to.
 */
export function matchLocale(language: string): Locale | null {
  const tag = language.toLowerCase()
  if (tag === 'pt-br') {
    return 'pt-BR'
  }
  if (tag === 'pt' || tag.startsWith('pt-')) {
    return 'pt'
  }
  const base = tag.split('-')[0]
  return LOCALES.find((locale) => locale.toLowerCase() === base) ?? null
}

/**
 * Language to start with: the one stored by the player if it is still supported,
 * otherwise the first browser language that matches, otherwise English.
 */
export function chooseLocale(stored: string | null, browserLanguages: readonly string[]): Locale {
  if (isLocale(stored)) {
    return stored
  }
  for (const language of browserLanguages) {
    const match = matchLocale(language)
    if (match) {
      return match
    }
  }
  return DEFAULT_LOCALE
}

export const LOCALE_OPTIONS = LOCALES.map((locale) => ({
  value: locale,
  label: LOCALE_NAMES[locale],
}))
