import { afterEach, describe, expect, it, vi } from 'vitest'
import { askText, notify } from '@/services/dialogs'

afterEach(() => vi.restoreAllMocks())

describe('dialogs', () => {
  it('shows a message with the browser alert', () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => undefined)
    notify('Hello')
    expect(alert).toHaveBeenCalledWith('Hello')
  })

  it('returns the text typed in the browser prompt', () => {
    vi.spyOn(window, 'prompt').mockReturnValue('room 2')
    expect(askText('Room?')).toBe('room 2')
  })

  it('returns null when the prompt is cancelled', () => {
    vi.spyOn(window, 'prompt').mockReturnValue(null)
    expect(askText('Room?')).toBeNull()
  })
})
