import axios from 'axios'
import { ApiConfigurationError, UnexpectedResponseError } from './api-errors'

/** Texts shown when the API gives no message of its own, in the language in use. */
interface ErrorTexts {
  unexpected: string
  noConnection: string
  notConfigured: string
  notJson: string
}

/**
 * Message to show for a failed request.
 * Refused rules and server errors carry their message in the response envelope, and that
 * message is shown as received. The fallback texts are translated by the caller.
 */
export function getErrorMessage(error: unknown, texts: ErrorTexts): string {
  if (error instanceof ApiConfigurationError) {
    return texts.notConfigured
  }
  if (error instanceof UnexpectedResponseError) {
    return texts.notJson
  }
  if (!axios.isAxiosError<{ message?: string }>(error)) {
    return texts.unexpected
  }
  if (!error.response) {
    return texts.noConnection
  }
  return error.response.data?.message ?? texts.unexpected
}
