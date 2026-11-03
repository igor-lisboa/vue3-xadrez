import { describe, expect, it } from 'vitest'
import { getErrorMessage } from '@/api/errors'

function axiosLike(response?: { data: unknown }): unknown {
  return Object.assign(new Error('request failed'), { isAxiosError: true, response })
}

describe('getErrorMessage', () => {
  it('reads the message of the envelope', () => {
    expect(getErrorMessage(axiosLike({ data: { message: 'Illegal move' } }))).toBe('Illegal move')
  })

  it('reports a missing connection', () => {
    expect(getErrorMessage(axiosLike())).toBe('Could not reach the server. Please try again later.')
  })

  it('falls back when the body has no message', () => {
    expect(getErrorMessage(axiosLike({ data: null }))).toBe('Unexpected error. Please try again.')
  })

  it('falls back for errors that are not from the HTTP client', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('Unexpected error. Please try again.')
  })
})
