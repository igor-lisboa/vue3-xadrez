import { describe, expect, it } from 'vitest'
import type { RouteRecordRaw } from 'vue-router'
import { routes } from '@/router'
import { parseGameId, parseSideId } from '@/router/params'
import { requireGameAndSide, requireGameId, requireProposalType } from '@/router/guards'
import { isOnScreen, screenLocation } from '@/router/screen-location'

type RouteWithProps = RouteRecordRaw & { props: (to: unknown) => unknown }

const findRoute = (name: string) =>
  routes.find((item) => 'name' in item && item.name === name) as RouteWithProps

describe('route params', () => {
  it('accepts only digits for game ids', () => {
    expect(parseGameId('12')).toBe(12)
    expect(parseGameId('-1')).toBeNull()
    expect(parseGameId('abc')).toBeNull()
    expect(parseGameId(undefined)).toBeNull()
  })

  it('accepts only 0 and 1 for sides', () => {
    expect(parseSideId('0')).toBe(0)
    expect(parseSideId('1')).toBe(1)
    expect(parseSideId('2')).toBeNull()
    expect(parseSideId(3)).toBeNull()
  })
})

describe('guards', () => {
  it('lets valid params through and sends invalid ones home', () => {
    expect(requireGameId({ id: '3' })).toBe(true)
    expect(requireGameId({ id: 'x' })).toEqual({ name: 'home' })
    expect(requireGameAndSide({ id: '3', sideId: '0' })).toBe(true)
    expect(requireGameAndSide({ id: '3', sideId: '9' })).toEqual({ name: 'home' })
    expect(requireGameAndSide({ id: 'x', sideId: '0' })).toEqual({ name: 'home' })
  })

  it('checks the proposal type too', () => {
    expect(requireProposalType({ id: '3', sideId: '0', type: 'tie' })).toBe(true)
    expect(requireProposalType({ id: '3', sideId: '0', type: 'draw' })).toEqual({ name: 'home' })
    expect(requireProposalType({ id: 'x', sideId: '0', type: 'reset' })).toEqual({ name: 'home' })
  })
})

describe('route props and guards', () => {
  it('give the select side view its game and the preselected side', () => {
    expect(findRoute('selectSide').props({ params: { id: '5' }, query: { side: '1' } })).toEqual({
      gameId: 5,
      preselectedSide: 1,
    })
  })

  it('give the game views numeric game and side ids', () => {
    expect(findRoute('game').props({ params: { id: '5', sideId: '0' } })).toEqual({
      gameId: 5,
      sideId: 0,
    })
    expect(findRoute('promotePawn').props({ params: { id: '5', sideId: '1' } })).toEqual({
      gameId: 5,
      sideId: 1,
    })
    expect(findRoute('endGame').props({ params: { id: '5', sideId: '1' } })).toEqual({
      gameId: 5,
      sideId: 1,
    })
  })

  it('give the answer view the proposal type', () => {
    expect(
      findRoute('answerProposal').props({ params: { id: '5', sideId: '1', type: 'reset' } }),
    ).toEqual({
      gameId: 5,
      sideId: 1,
      proposalType: 'reset',
    })
  })

  it('give the review its game and turn the board to White unless the link asks for Black', () => {
    const review = findRoute('gameReview')
    expect(review.props({ params: { id: '5' }, query: { side: '1' } })).toEqual({
      gameId: 5,
      sideId: 1,
    })
    expect(review.props({ params: { id: '5' }, query: {} })).toEqual({ gameId: 5, sideId: 0 })
    expect(review.props({ params: { id: '5' }, query: { side: '9' } })).toEqual({
      gameId: 5,
      sideId: 0,
    })
  })

  it('run the guards of each route', () => {
    const guard = (name: string, params: Record<string, unknown>) =>
      (
        findRoute(name) as unknown as { beforeEnter: (to: { params: unknown }) => unknown }
      ).beforeEnter({ params })
    expect(guard('selectSide', { id: 'x' })).toEqual({ name: 'home' })
    expect(guard('game', { id: '1', sideId: '0' })).toBe(true)
    expect(guard('promotePawn', { id: '1', sideId: '5' })).toEqual({ name: 'home' })
    expect(guard('endGame', { id: '1', sideId: '1' })).toBe(true)
    expect(guard('answerProposal', { id: '1', sideId: '1', type: 'tie' })).toBe(true)
    expect(guard('gameReview', { id: '1' })).toBe(true)
    expect(guard('gameReview', { id: 'x' })).toEqual({ name: 'home' })
  })

  it('send unknown paths home', () => {
    expect(routes.at(-1)).toMatchObject({ redirect: { name: 'home' } })
  })
})

describe('screen location', () => {
  it('builds the location of each game screen', () => {
    expect(screenLocation({ name: 'game' }, 2, 1)).toEqual({
      name: 'game',
      params: { id: 2, sideId: 1 },
    })
    expect(screenLocation({ name: 'endGame' }, 2, 1)).toEqual({
      name: 'endGame',
      params: { id: 2, sideId: 1 },
    })
    expect(screenLocation({ name: 'promotePawn' }, 2, 1)).toEqual({
      name: 'promotePawn',
      params: { id: 2, sideId: 1 },
    })
    expect(screenLocation({ name: 'selectSide', preselectedSide: 0 }, 2, 1)).toEqual({
      name: 'selectSide',
      params: { id: 2 },
      query: { side: 0 },
    })
    expect(screenLocation({ name: 'answerProposal', kind: 'empate' }, 2, 1)).toEqual({
      name: 'answerProposal',
      params: { id: 2, sideId: 1, type: 'tie' },
    })
  })

  it('knows whether the route already shows the screen', () => {
    const current = { name: 'answerProposal', params: { type: 'tie' } } as never
    expect(isOnScreen(current, { name: 'answerProposal', kind: 'empate' })).toBe(true)
    expect(isOnScreen(current, { name: 'answerProposal', kind: 'reset' })).toBe(false)
    expect(isOnScreen({ name: 'game', params: {} } as never, { name: 'game' })).toBe(true)
    expect(isOnScreen({ name: 'game', params: {} } as never, { name: 'endGame' })).toBe(false)
  })
})
