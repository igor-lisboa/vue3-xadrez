import { describe, expect, it } from 'vitest'
import { getErrorMessage } from '@/api/errors'
import { en } from '@/i18n/messages/en'

function axiosLike(response?: { data: unknown }): unknown {
  return Object.assign(new Error('request failed'), { isAxiosError: true, response })
}

const texts = { ...en.errors, unexpected: 'Fallback', noConnection: 'Offline' }

describe('getErrorMessage', () => {
  it('reads the message of the envelope and shows it as received', () => {
    expect(getErrorMessage(axiosLike({ data: { message: 'Illegal move' } }), texts)).toBe(
      'Illegal move',
    )
  })

  it('reports a missing connection with the text of the language in use', () => {
    expect(getErrorMessage(axiosLike(), texts)).toBe('Offline')
  })

  it('falls back when the body has no message', () => {
    expect(getErrorMessage(axiosLike({ data: null }), texts)).toBe('Fallback')
  })

  it('falls back for errors that are not from the HTTP client', () => {
    expect(getErrorMessage(new Error('boom'), texts)).toBe('Fallback')
  })
})
