import type { SideId } from '@/api/types/enums'

/** Route params and query values arrive as strings, or as undefined when absent. */
function asText(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

/** Game ids are non-negative integers. */
export function parseGameId(value: unknown): number | null {
  const text = asText(value)
  return text !== undefined && /^\d+$/.test(text) ? Number(text) : null
}

export function parseSideId(value: unknown): SideId | null {
  const text = asText(value)
  if (text === '0') {
    return 0
  }
  if (text === '1') {
    return 1
  }
  return null
}
