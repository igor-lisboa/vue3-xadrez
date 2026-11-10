import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { listPieceTypes, listSquares } from '@/api/services/catalogue'
import { getGameHistory, getGameSummary } from '@/api/services/games'
import { proposeToOpponent } from '@/api/services/proposals'
import { setLocale } from '@/services/locale'
import EndGameView from '@/views/EndGameView.vue'
import { makeSummary, pieceTypes, squares } from '../helpers/fixtures'
import { boardAfter, makeHistory, played } from '../helpers/history'

const { push } = vi.hoisted(() => ({ push: vi.fn(async () => undefined) }))

vi.mock('vue-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-router')>()),
  useRouter: () => ({ push }),
  useRoute: () => ({ name: 'endGame', params: {} }),
}))
vi.mock('@/api/services/catalogue', () => ({ listSquares: vi.fn(), listPieceTypes: vi.fn() }))
vi.mock('@/api/services/games', () => ({ getGameHistory: vi.fn(), getGameSummary: vi.fn() }))
vi.mock('@/api/services/proposals', () => ({ proposeToOpponent: vi.fn() }))
vi.mock('@/services/dialogs', () => ({ notify: vi.fn(), askText: vi.fn() }))
vi.mock('socket.io-client', () => ({ io: () => ({ on: vi.fn(), disconnect: vi.fn() }) }))

/** Fool’s mate: Black wins after four moves. */
const foolsMate = () =>
  makeHistory(
    [played(0, 'F2', 'F3'), played(1, 'E7', 'E5'), played(2, 'G2', 'G4'), played(3, 'D8', 'H4')],
    boardAfter({
      F2: null,
      F3: 'Peão-0',
      G2: null,
      G4: 'Peão-0',
      E7: null,
      E5: 'Peão-1',
      D8: null,
      H4: 'Rainha-1',
    }),
  )

async function open(sideId: 0 | 1 = 0) {
  const wrapper = mount(EndGameView, { props: { gameId: 7, sideId } })
  await flushPromises()
  await flushPromises()
  return wrapper
}

const moveButtons = (wrapper: Awaited<ReturnType<typeof open>>) =>
  wrapper.findAll('.move-list button').map((button) => button.text())

beforeEach(() => {
  vi.clearAllMocks()
  setLocale('en')
  vi.mocked(listSquares).mockResolvedValue(squares)
  vi.mocked(listPieceTypes).mockResolvedValue(pieceTypes)
  vi.mocked(getGameSummary).mockResolvedValue(makeSummary({ finalizado: 'Vitória: Preto' }))
  vi.mocked(getGameHistory).mockResolvedValue(foolsMate())
})

describe('EndGameView review', () => {
  it('shows the result, the final board and every move of the game', async () => {
    const wrapper = await open()
    expect(getGameHistory).toHaveBeenCalledWith(7)
    expect(wrapper.find('h1').text()).toBe('Black wins')
    expect(wrapper.text()).toContain('Game review')
    expect(wrapper.findAll('.board-house')).toHaveLength(64)
    expect(moveButtons(wrapper)).toEqual([
      'Pawn F2 → F3',
      'Pawn E7 → E5',
      'Pawn G2 → G4',
      'Queen D8 → H4',
    ])
    expect(wrapper.text()).toContain('Move 4 of 4')
  })

  it('opens on the final position, with the last move marked on the board', async () => {
    const wrapper = await open()
    const houses = wrapper.findAll('.board-house')
    const byName = (name: string) =>
      houses.find((house) => house.attributes('title')?.startsWith(name))
    expect(byName('D8')?.classes()).toContain('house-origin')
    expect(byName('H4')?.classes()).toContain('house-move')
    expect(byName('H4')?.find('use').attributes('href')).toBe('#bq')
    expect(wrapper.find('.move-list button.active').text()).toBe('Queen D8 → H4')
  })

  it('goes back one move with the button and shows the earlier position', async () => {
    const wrapper = await open()
    await wrapper.find('button[aria-label="Previous move"]').trigger('click')
    expect(wrapper.text()).toContain('Move 3 of 4')
    const houses = wrapper.findAll('.board-house')
    const queenSquare = houses.find((house) => house.attributes('title')?.startsWith('H4'))
    expect(queenSquare?.find('use').exists()).toBe(false)
    expect(wrapper.find('.move-list button.active').text()).toBe('Pawn G2 → G4')
  })

  it('jumps to the position of a move chosen in the list, and back to the start', async () => {
    const wrapper = await open()
    await wrapper.findAll('.move-list button')[1]!.trigger('click')
    expect(wrapper.text()).toContain('Move 2 of 4')
    await wrapper.find('button[aria-label="Starting position"]').trigger('click')
    expect(wrapper.text()).toContain('Starting position')
    expect(wrapper.find('.move-list button.active').exists()).toBe(false)
    expect(wrapper.find('button[aria-label="Previous move"]').attributes('disabled')).toBeDefined()
  })

  it('turns the board for the Black player', async () => {
    const white = await open(0)
    const black = await open(1)
    expect(white.find('.board-house').attributes('title')).toBe('A8')
    expect(black.find('.board-house').attributes('title')).toBe('H1')
  })

  it('does not let the player play on the review board', async () => {
    const wrapper = await open()
    expect(wrapper.find('.chess-board').classes()).toContain('spectator-only')
    expect(wrapper.find('.chess-board').classes()).not.toContain('active-side-border')
  })

  it('says so when no move was played', async () => {
    vi.mocked(getGameHistory).mockResolvedValue(makeHistory([], boardAfter({})))
    const wrapper = await open()
    expect(wrapper.text()).toContain('No moves were played in this game.')
    expect(wrapper.find('.move-list').exists()).toBe(false)
  })

  it('shows only the final board, with a note, when the moves cannot be replayed', async () => {
    vi.mocked(getGameHistory).mockResolvedValue(
      makeHistory([played(0, 'E3', 'E4')], boardAfter({ E2: null, E4: 'Peão-0' })),
    )
    const wrapper = await open()
    expect(wrapper.text()).toContain('cannot be replayed')
    expect(wrapper.findAll('.board-house')).toHaveLength(64)
    expect(wrapper.find('.move-list').exists()).toBe(false)
    expect(wrapper.find('button[aria-label="Next move"]').exists()).toBe(false)
  })

  it('shows the same note when the game could not be loaded', async () => {
    vi.mocked(getGameHistory).mockRejectedValue(new Error('boom'))
    const wrapper = await open()
    expect(wrapper.text()).toContain('cannot be replayed')
    expect(wrapper.find('h1').text()).toBe('Black wins')
  })

  it('shows the review in the language in use', async () => {
    setLocale('pt-BR')
    const wrapper = await open()
    expect(wrapper.text()).toContain('Revisão da partida')
    expect(wrapper.text()).toContain('Jogada 4 de 4')
    expect(moveButtons(wrapper)[3]).toBe('Rainha D8 → H4')
    expect(wrapper.find('button[aria-label="Jogada anterior"]').exists()).toBe(true)
  })

  it('keeps the actions below the review', async () => {
    vi.mocked(proposeToOpponent).mockResolvedValue('Offered reset')
    const wrapper = await open()
    const buttons = wrapper.findAll('.end-game-actions button').map((button) => button.text())
    expect(buttons).toEqual(['New game?', 'Propose reset'])
    await wrapper.findAll('.end-game-actions button')[0]!.trigger('click')
    expect(push).toHaveBeenCalledWith({ name: 'home' })
  })
})
