import type { Locale } from '../locales'
import { de } from './de'
import { en } from './en'
import { fr } from './fr'
import { it } from './it'
import { pt } from './pt'
import { ptBR } from './pt-br'
import type { Messages } from './types'

export const MESSAGES: Record<Locale, Messages> = {
  en,
  'pt-BR': ptBR,
  pt,
  fr,
  it,
  de,
}
