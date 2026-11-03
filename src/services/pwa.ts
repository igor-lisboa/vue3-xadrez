/**
 * Registers the service worker that lets the app open offline and be installed.
 * Does nothing when `enabled` is false (development) or the browser has no service workers.
 */
export function registerServiceWorker(enabled: boolean): void {
  if (!enabled || !('serviceWorker' in navigator)) {
    return
  }
  navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
    // The app works without the service worker; it only loses offline opening and install.
    console.warn('Service worker registration failed', error)
  })
}
