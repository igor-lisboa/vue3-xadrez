import type { SideId } from '../types/enums'

/** Player actions identify the acting side with the `lado` header. */
export function sideHeaders(sideId: SideId) {
  return { headers: { lado: sideId } }
}
