import axios from 'axios'

const UNEXPECTED_ERROR = 'Unexpected error. Please try again.'
const NO_CONNECTION = 'Could not reach the server. Please try again later.'

/**
 * Message to show for a failed request.
 * Refused rules and server errors carry their message in the response envelope.
 */
export function getErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<{ message?: string }>(error)) {
    return UNEXPECTED_ERROR
  }
  if (!error.response) {
    return NO_CONNECTION
  }
  return error.response.data?.message ?? UNEXPECTED_ERROR
}
