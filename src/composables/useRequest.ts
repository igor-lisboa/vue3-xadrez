import { ref, type Ref } from 'vue'
import { getErrorMessage } from '@/api/errors'
import { notify } from '@/services/dialogs'

export interface RequestHandle {
  pending: Ref<boolean>
  /**
   * Runs a request. A failure is shown to the player and resolves to undefined,
   * so callers only handle the success path.
   */
  perform: <T>(task: () => Promise<T>) => Promise<T | undefined>
}

export function useRequest(): RequestHandle {
  const pending = ref(false)

  async function perform<T>(task: () => Promise<T>): Promise<T | undefined> {
    pending.value = true
    try {
      return await task()
    } catch (error) {
      notify(getErrorMessage(error))
      return undefined
    } finally {
      pending.value = false
    }
  }

  return { pending, perform }
}

export interface LoaderOptions {
  /** Called when loading fails, after the error has been shown. */
  onError?: () => void
}

/** Loads data when the component is created and keeps the last good value on failure. */
export function useLoader<T>(load: () => Promise<T>, initial: T, options: LoaderOptions = {}) {
  const request = useRequest()
  const data = ref(initial) as Ref<T>
  const loaded = ref(false)

  async function reload(): Promise<void> {
    const result = await request.perform(load)
    if (result === undefined) {
      options.onError?.()
      return
    }
    data.value = result
    loaded.value = true
  }

  void reload()

  return { data, loaded, loading: request.pending, reload }
}
