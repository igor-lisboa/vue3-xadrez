import type { RouteLocationRaw } from 'vue-router'
import { parseGameId, parseSideId } from './params'
import { PROPOSAL_ROUTE_TYPE } from './screen-location'

type RouteParams = Record<string, unknown>

const HOME: RouteLocationRaw = { name: 'home' }

/** Sends an invalid game id back home. */
export function requireGameId(params: RouteParams): RouteLocationRaw | true {
  return parseGameId(params.id) === null ? HOME : true
}

/** Sends an invalid game id or side back home. */
export function requireGameAndSide(params: RouteParams): RouteLocationRaw | true {
  return requireGameId(params) === true && parseSideId(params.sideId) !== null ? true : HOME
}

/** Sends an invalid game, side or proposal type back home. */
export function requireProposalType(params: RouteParams): RouteLocationRaw | true {
  const validTypes: unknown[] = Object.values(PROPOSAL_ROUTE_TYPE)
  return requireGameAndSide(params) === true && validTypes.includes(params.type) ? true : HOME
}
