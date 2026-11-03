import { afterEach, describe, expect, it, vi } from 'vitest'
import { useInstallPrompt } from '@/composables/useInstallPrompt'
import { runComposable } from '../helpers/run-composable'

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<unknown> }

/** A beforeinstallprompt event as Chrome fires it, with the choice the player will make. */
function installEvent(outcome: 'accepted' | 'dismissed'): InstallEvent {
  const event = new Event('beforeinstallprompt', { cancelable: true }) as InstallEvent
  event.prompt = vi.fn(() => Promise.resolve())
  event.userChoice = Promise.resolve({ outcome })
  return event
}

function setUserAgent(value: string): void {
  Object.defineProperty(navigator, 'userAgent', { value, configurable: true })
}

afterEach(() => {
  delete (navigator as { userAgent?: string }).userAgent
  delete (navigator as { standalone?: boolean }).standalone
  delete (window as { matchMedia?: unknown }).matchMedia
})

describe('useInstallPrompt', () => {
  it('offers nothing until the browser says the app can be installed', () => {
    const { result, unmount } = runComposable(useInstallPrompt)
    expect(result.canInstall.value).toBe(false)
    expect(result.showIosHint.value).toBe(false)
    unmount()
  })

  it('offers the install button when the browser fires its prompt, and calls it on install', async () => {
    const { result, unmount } = runComposable(useInstallPrompt)
    const event = installEvent('accepted')
    window.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(result.canInstall.value).toBe(true)

    await result.install()
    expect(event.prompt).toHaveBeenCalledOnce()
    expect(result.canInstall.value).toBe(false)
    unmount()
  })

  it('hides the button again when the player dismisses the install dialog', async () => {
    const { result, unmount } = runComposable(useInstallPrompt)
    window.dispatchEvent(installEvent('dismissed'))
    await result.install()
    expect(result.canInstall.value).toBe(false)
    unmount()
  })

  it('hides the button once the app is installed', () => {
    const { result, unmount } = runComposable(useInstallPrompt)
    window.dispatchEvent(installEvent('accepted'))
    window.dispatchEvent(new Event('appinstalled'))
    expect(result.canInstall.value).toBe(false)
    unmount()
  })

  it('does nothing when install is called without a prompt', async () => {
    const { result, unmount } = runComposable(useInstallPrompt)
    await expect(result.install()).resolves.toBeUndefined()
    unmount()
  })

  it('shows the iPhone hint on iOS Safari', () => {
    setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')
    const { result, unmount } = runComposable(useInstallPrompt)
    expect(result.showIosHint.value).toBe(true)
    unmount()
  })

  it('hides the iPhone hint once the app runs from the home screen', () => {
    setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')
    ;(navigator as { standalone?: boolean }).standalone = true
    const { result, unmount } = runComposable(useInstallPrompt)
    expect(result.showIosHint.value).toBe(false)
    unmount()
  })

  it('treats an app opened in standalone display mode as installed', () => {
    window.matchMedia = vi.fn(() => ({ matches: true })) as unknown as typeof window.matchMedia
    const { result, unmount } = runComposable(useInstallPrompt)
    window.dispatchEvent(installEvent('accepted'))
    expect(result.canInstall.value).toBe(false)
    unmount()
  })

  it('stops listening to the browser when it is unmounted', () => {
    const { result, unmount } = runComposable(useInstallPrompt)
    unmount()
    window.dispatchEvent(installEvent('accepted'))
    expect(result.canInstall.value).toBe(false)
  })
})
