import { ref } from 'vue'
import { chooseLocale, LOCALE_STORAGE_KEY, type Locale } from '@/i18n/locales'
import { MESSAGES } from '@/i18n/messages'
import type { Messages } from '@/i18n/messages/types'

// Storage can be blocked (private windows, disabled site data). Then the choice lasts only until reload.
function readStoredLocale(): string | null {
  try {
    return window.localStorage.getItem(LOCALE_STORAGE_KEY)
  } catch {
    return null
  }
}

function writeStoredLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // Keep the language for this page only; there is nothing else to do without storage.
  }
}

const initialLocale = chooseLocale(readStoredLocale(), navigator.languages)

/** Language in use. Components read it through `useLocale`. */
export const locale = ref<Locale>(initialLocale)

// Screen readers and hyphenation depend on the document language.
document.documentElement.lang = initialLocale

export function setLocale(next: Locale): void {
  locale.value = next
  document.documentElement.lang = next
  writeStoredLocale(next)
}

/** Texts of the language in use, for code that runs outside a component (such as dialogs). */
export function currentMessages(): Messages {
  return MESSAGES[locale.value]
}
