import { afterEach, describe, expect, it, vi } from 'vitest'
import { registerServiceWorker } from '@/services/pwa'

afterEach(() => {
  delete (navigator as { serviceWorker?: unknown }).serviceWorker
  vi.restoreAllMocks()
})

function stubServiceWorker(register: () => Promise<unknown>) {
  const mock = vi.fn(register)
  Object.defineProperty(navigator, 'serviceWorker', {
    value: { register: mock },
    configurable: true,
  })
  return mock
}

describe('registerServiceWorker', () => {
  it('does nothing outside the production build', () => {
    const register = stubServiceWorker(() => Promise.resolve())
    registerServiceWorker(false)
    expect(register).not.toHaveBeenCalled()
  })

  it('registers the service worker at the root of the app', () => {
    const register = stubServiceWorker(() => Promise.resolve())
    registerServiceWorker(true)
    expect(register).toHaveBeenCalledWith('/sw.js')
  })

  it('warns and keeps the app working when registration fails', async () => {
    stubServiceWorker(() => Promise.reject(new Error('blocked')))
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    registerServiceWorker(true)
    await vi.waitFor(() => expect(warn).toHaveBeenCalled())
  })

  it('does nothing when the browser has no service workers', () => {
    expect(() => registerServiceWorker(true)).not.toThrow()
  })
})
