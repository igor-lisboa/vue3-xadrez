import { describe, expect, it, vi } from 'vitest'
import { notify } from '@/services/dialogs'
import { useLoader, useRequest } from '@/composables/useRequest'

vi.mock('@/services/dialogs', () => ({ notify: vi.fn(), askText: vi.fn() }))

describe('useRequest', () => {
  it('returns the result and clears the pending flag', async () => {
    const request = useRequest()
    const result = await request.perform(async () => 'done')
    expect(result).toBe('done')
    expect(request.pending.value).toBe(false)
  })

  it('is pending while the task runs', async () => {
    const request = useRequest()
    const running = request.perform(() => new Promise((resolve) => setTimeout(() => resolve(1), 0)))
    expect(request.pending.value).toBe(true)
    await running
    expect(request.pending.value).toBe(false)
  })

  it('shows the error and resolves to undefined on failure', async () => {
    const request = useRequest()
    const result = await request.perform(async () => {
      throw new Error('boom')
    })
    expect(result).toBeUndefined()
    expect(notify).toHaveBeenCalledWith('Unexpected error. Please try again.')
    expect(request.pending.value).toBe(false)
  })
})

describe('useLoader', () => {
  it('loads the data when created', async () => {
    const loader = useLoader(async () => [1, 2], [] as number[])
    await vi.waitFor(() => expect(loader.loaded.value).toBe(true))
    expect(loader.data.value).toEqual([1, 2])
  })

  it('keeps the previous data and calls onError when loading fails', async () => {
    const onError = vi.fn()
    const load = vi.fn<() => Promise<string[]>>().mockRejectedValueOnce(new Error('down'))
    const loader = useLoader(load, ['kept'], { onError })
    await vi.waitFor(() => expect(onError).toHaveBeenCalled())
    expect(loader.data.value).toEqual(['kept'])
    expect(loader.loaded.value).toBe(false)
  })

  it('reloads on demand', async () => {
    const load = vi.fn().mockResolvedValueOnce('first').mockResolvedValueOnce('second')
    const loader = useLoader(load, 'none')
    await vi.waitFor(() => expect(loader.loaded.value).toBe(true))
    await loader.reload()
    expect(loader.data.value).toBe('second')
    expect(loader.loading.value).toBe(false)
  })
})
