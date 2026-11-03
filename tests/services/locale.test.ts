import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const STORAGE_KEY = 'chess.locale'

/** The language is read when the module loads, so each test loads it again. */
async function loadLocaleService() {
  vi.resetModules()
  return import('@/services/locale')
}

function setBrowserLanguages(languages: string[]): void {
  Object.defineProperty(window.navigator, 'languages', { value: languages, configurable: true })
}

beforeEach(() => {
  window.localStorage.clear()
  setBrowserLanguages(['en-US', 'en'])
  document.documentElement.lang = ''
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('locale service', () => {
  it('starts with the language the player stored', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'de')
    const service = await loadLocaleService()
    expect(service.locale.value).toBe('de')
    expect(document.documentElement.lang).toBe('de')
  })

  it('starts with the browser language when nothing is stored', async () => {
    setBrowserLanguages(['pt-PT', 'en'])
    const service = await loadLocaleService()
    expect(service.locale.value).toBe('pt')
  })

  it('starts in English when the browser language is not supported', async () => {
    setBrowserLanguages(['ja-JP'])
    const service = await loadLocaleService()
    expect(service.locale.value).toBe('en')
  })

  it('switches the texts, the page language and the stored choice together', async () => {
    const service = await loadLocaleService()
    service.setLocale('it')
    expect(service.locale.value).toBe('it')
    expect(document.documentElement.lang).toBe('it')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('it')
    expect(service.currentMessages().common.loading).toBe('Caricamento...')
  })

  it('keeps working when the browser storage is blocked', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked')
    })
    const service = await loadLocaleService()
    expect(service.locale.value).toBe('en')
    expect(() => service.setLocale('fr')).not.toThrow()
    expect(service.locale.value).toBe('fr')
    expect(service.currentMessages().common.loading).toBe('Chargement...')
  })
})
