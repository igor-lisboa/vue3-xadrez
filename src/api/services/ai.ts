import type { ApiEnvelope } from '../types/envelope'
import { http } from '../http'

/** Asks the server to run the AI player. */
export async function triggerAi(): Promise<void> {
  await http.get<ApiEnvelope<null>>('/ia')
}
