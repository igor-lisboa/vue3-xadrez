/** The app has no API address to call (VITE_API_BASE_URL is empty). */
export class ApiConfigurationError extends Error {
  constructor() {
    super('The API address is not configured. Set VITE_API_BASE_URL and deploy again.')
    this.name = 'ApiConfigurationError'
  }
}

/** The API answered, but not with the JSON envelope (for example an HTML page). */
export class UnexpectedResponseError extends Error {
  constructor() {
    super('The API did not answer with JSON. Check that VITE_API_BASE_URL points to the API.')
    this.name = 'UnexpectedResponseError'
  }
}
