import { computed } from 'vue'
import { LOCALE_OPTIONS } from '@/i18n/locales'
import { MESSAGES } from '@/i18n/messages'
import { locale, setLocale } from '@/services/locale'

/** The language in use, its texts, and the options of the language selector. */
export function useLocale() {
  const messages = computed(() => MESSAGES[locale.value])
  return { locale, messages, setLocale, options: LOCALE_OPTIONS }
}
