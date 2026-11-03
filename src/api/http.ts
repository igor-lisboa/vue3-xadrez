import axios from 'axios'
import { env } from '@/config/env'
import { ApiConfigurationError, UnexpectedResponseError } from './api-errors'

/** Shared HTTP client for the API. */
export const http = axios.create({ baseURL: env.apiBaseUrl })

// Without an address, requests would go to the site itself and come back as the app's HTML page.
http.interceptors.request.use((config) => {
  if (!env.apiBaseUrl) {
    throw new ApiConfigurationError()
  }
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
