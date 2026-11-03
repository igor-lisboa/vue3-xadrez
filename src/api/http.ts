import axios from 'axios'
import { env } from '@/config/env'
import { locale } from '@/services/locale'
import { ApiConfigurationError, UnexpectedResponseError } from './api-errors'

/** Shared HTTP client for the API. */
export const http = axios.create({ baseURL: env.apiBaseUrl })

// Without an address, requests would go to the site itself and come back as the app's HTML page.
http.interceptors.request.use((config) => {
  if (!env.apiBaseUrl) {
    throw new ApiConfigurationError()
  }
  // The API answers its messages in the language the player chose. The language tags
  // (en, pt-BR, pt, fr, it, de) are the standard form of Accept-Language.
  config.headers.set('Accept-Language', locale.value)
  return config
})

// Every successful answer of the API is the envelope { message, data, success }.
http.interceptors.response.use((response) => {
  const body: unknown = response.data
  if (typeof body !== 'object' || body === null || !('success' in body)) {
    throw new UnexpectedResponseError()
  }
  return response
})
