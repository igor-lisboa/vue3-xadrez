import axios from 'axios'
import { ApiConfigurationError, UnexpectedResponseError } from './api-errors'

const UNEXPECTED_ERROR = 'Unexpected error. Please try again.'
const NO_CONNECTION = 'Could not reach the server. Please try again later.'

/**
 * Message to show for a failed request.
 * Refused rules and server errors carry their message in the response envelope.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiConfigurationError || error instanceof UnexpectedResponseError) {
    return error.message
  }
  if (!axios.isAxiosError<{ message?: string }>(error)) {
    return UNEXPECTED_ERROR
  }
  if (!error.response) {
    return NO_CONNECTION
  }
  return error.response.data?.message ?? UNEXPECTED_ERROR
}
