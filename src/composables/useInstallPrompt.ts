import { computed, onMounted, onUnmounted, ref } from 'vue'
import { isIosDevice, isStandaloneDisplay } from '@/domain/install'

/** The event Chrome and Edge fire when the app can be installed. It is not in the TypeScript DOM types. */
interface InstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/** Whether the app is already running from the home screen. Browsers without matchMedia count as not installed. */
function runsAsInstalledApp(): boolean {
  const displayModeStandalone =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  return isStandaloneDisplay(displayModeStandalone, iosStandalone)
}

/**
 * Lets the app offer its own "Install app" button. Browsers that support it fire an event that
 * is kept until the player taps the button; iPhones get a hint instead, as Safari has no prompt.
 */
export function useInstallPrompt() {
  const deferred = ref<InstallPromptEvent | null>(null)
  const installed = ref(false)
  const iosDevice = ref(false)

  function onBeforeInstall(event: Event): void {
    event.preventDefault()
    deferred.value = event as InstallPromptEvent
  }

  function onInstalled(): void {
    deferred.value = null
    installed.value = true
  }

  onMounted(() => {
    iosDevice.value = isIosDevice(navigator.userAgent, navigator.maxTouchPoints)
    installed.value = runsAsInstalledApp()
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', onBeforeInstall)
    window.removeEventListener('appinstalled', onInstalled)
  })

  const canInstall = computed(() => !installed.value && deferred.value !== null)
  const showIosHint = computed(() => !installed.value && iosDevice.value)

  /** Opens the browser's install dialog. The prompt can be shown only once per event. */
  async function install(): Promise<void> {
    const event = deferred.value
    if (event === null) {
      return
    }
    deferred.value = null
    await event.prompt()
    const { outcome } = await event.userChoice
    if (outcome === 'accepted') {
      installed.value = true
    }
  }

  return { canInstall, showIosHint, install }
}
