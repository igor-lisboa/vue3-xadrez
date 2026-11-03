export const env = {
  appTitle: import.meta.env.VITE_APP_TITLE || 'Chess',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  /** The service worker is registered only in the production build, where its cache cannot hide development changes. */
  isProduction: import.meta.env.PROD,
} as const
