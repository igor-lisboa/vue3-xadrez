import { describe, expect, it, vi } from 'vitest'
import type { AxiosAdapter } from 'axios'
import { http } from '@/api/http'
import { ApiConfigurationError, UnexpectedResponseError } from '@/api/api-errors'
import { getErrorMessage } from '@/api/errors'
import { en } from '@/i18n/messages/en'
import { setLocale } from '@/services/locale'

const { env } = vi.hoisted(() => ({
  env: { apiBaseUrl: 'http://api.test', appTitle: 'Chess' },
}))

vi.mock('@/config/env', () => ({ env }))

/** Answers the request with the given body, without touching the network. */
const answerWith =
  (data: unknown): AxiosAdapter =>
  async (config) => ({ data, status: 200, statusText: 'OK', headers: {}, config })

describe('http client', () => {
  it('returns the envelope of a JSON answer', async () => {
    const response = await http.get('/tipos-de-jogo', {
      adapter: answerWith({ message: 'ok', data: [], success: true }),
    })
    expect(response.data).toEqual({ message: 'ok', data: [], success: true })
  })

  it('tells the API the language the player chose', async () => {
    let sent: unknown
    const adapter: AxiosAdapter = async (config) => {
      sent = config.headers.get('Accept-Language')
      return answerWith({ message: 'ok', data: [], success: true })(config)
    }
    setLocale('pt-BR')
    try {
      await http.get('/tipos-de-jogo', { adapter })
    } finally {
      setLocale('en')
    }
    expect(sent).toBe('pt-BR')
  })

  it('refuses an answer that is not the JSON envelope', async () => {
    const request = http.get('/tipos-de-jogo', { adapter: answerWith('<!DOCTYPE html>') })
    await expect(request).rejects.toBeInstanceOf(UnexpectedResponseError)
  })

  it('refuses to call the API when no address is configured', async () => {
    env.apiBaseUrl = ''
    try {
      await expect(http.get('/tipos-de-jogo')).rejects.toBeInstanceOf(ApiConfigurationError)
    } finally {
      env.apiBaseUrl = 'http://api.test'
    }
  })

  it('shows the configuration and response problems to the player', () => {
    expect(getErrorMessage(new ApiConfigurationError(), en.errors)).toBe(en.errors.notConfigured)
    expect(getErrorMessage(new UnexpectedResponseError(), en.errors)).toBe(en.errors.notJson)
  })
})
