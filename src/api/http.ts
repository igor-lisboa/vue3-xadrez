import axios from 'axios'
import { env } from '@/config/env'

/** Shared HTTP client for the Xadrez API. */
export const http = axios.create({ baseURL: env.apiBaseUrl })
