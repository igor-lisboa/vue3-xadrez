import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { listPieceTypes, listSquares } from '@/api/services/catalogue'
import { getGameHistory } from '@/api/services/games'
import type { SideId } from '@/api/types/enums'
import { notify } from '@/services/dialogs'
import { setLocale } from '@/services/locale'
import GameReviewView from '@/views/GameReviewView.vue'
import { pieceTypes, squares } from '../helpers/fixtures'
import { boardAfter, makeHistory, played } from '../helpers/history'
import { startingPosition } from '@/domain/replay'

const { push } = vi.hoisted(() => ({ push: vi.fn(async () => undefined) }))

vi.mock('vue-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-router')>()),
  useRouter: () => ({ push }),
  useRoute: () => ({ name: 'gameReview', params: {} }),
}))
vi.mock('@/api/services/catalogue', () => ({ listSquares: vi.fn(), listPieceTypes: vi.fn() }))
vi.mock('@/api/services/games', () => ({ getGameHistory: vi.fn() }))
vi.mock('@/services/dialogs', () => ({ notify: vi.fn(), askText: vi.fn() }))

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
    {},
    { finalizado: { tipo: 'Vitória: Preto' }, ladoIdVencedor: 1 },
  )

/** Only the two kings and a white bishop are left. */
function kingsAndBishop(): ReturnType<typeof startingPosition> {
  const cells = startingPosition().map(() => null) as ReturnType<typeof startingPosition>
  cells[4] = 'Rei-1'
  cells[60] = 'Rei-0'
  cells[61] = 'Bispo-0'
  return cells
}

async function open(sideId: SideId = 0) {
  const wrapper = mount(GameReviewView, { props: { gameId: 7, sideId } })
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
  vi.mocked(getGameHistory).mockResolvedValue(foolsMate())
})

describe('GameReviewView', () => {
  it('shows the room, the result, the final board and every move of the game', async () => {
    const wrapper = await open()
    expect(getGameHistory).toHaveBeenCalledWith(7)
    expect(wrapper.find('h1').text()).toBe('Game review')
    expect(wrapper.find('.lead').text()).toBe('Room 7 · Black wins · Winner: Black')
    expect(wrapper.findAll('.board-house')).toHaveLength(64)
    expect(moveButtons(wrapper)).toEqual([
      'Pawn F2 → F3',
      'Pawn E7 → E5',
      'Pawn G2 → G4',
      'Queen D8 → H4',
    ])
    expect(wrapper.text()).toContain('Move 4 of 4')
    expect(wrapper.find('.material-summary').exists()).toBe(false)
  })

  it('names the winner of a resignation from ladoIdVencedor', async () => {
    vi.mocked(getGameHistory).mockResolvedValue(
      makeHistory(
        [],
        startingPosition(),
        {},
        {
          finalizado: { tipo: 'Desistência: Um jogador deixou a partida' },
          ladoIdVencedor: 0,
        },
      ),
    )
    const wrapper = await open()
    expect(wrapper.find('.lead').text()).toBe(
      'Room 7 · Resignation: a player left the game · Winner: White',
    )
  })

  it('names a dead-position draw without a winner', async () => {
    vi.mocked(getGameHistory).mockResolvedValue(
      makeHistory([], startingPosition(), {}, { finalizado: { tipo: 'Empate: Posição morta' } }),
    )
    const wrapper = await open()
    expect(wrapper.find('.lead').text()).toBe('Room 7 · Draw: dead position')
  })

  it('says when the game is still in progress', async () => {
    vi.mocked(getGameHistory).mockResolvedValue(makeHistory([], startingPosition()))
    const wrapper = await open()
    expect(wrapper.find('.lead').text()).toBe('Room 7 · Game in progress')
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

  it('turns the board for Black', async () => {
    const white = await open(0)
    const black = await open(1)
    expect(white.find('.board-house').attributes('title')).toBe('A8')
    expect(black.find('.board-house').attributes('title')).toBe('H1')
  })

  it('does not let the viewer play on the board', async () => {
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

  it('explains an insufficient-material draw from the final board', async () => {
    vi.mocked(getGameHistory).mockResolvedValue(
      makeHistory(
        [],
        kingsAndBishop(),
        {},
        { finalizado: { tipo: 'Empate: Insuficiência material' } },
      ),
    )
    const wrapper = await open()
    expect(wrapper.find('.material-summary').text()).toContain(
      'Neither side has enough pieces left to checkmate.',
    )
    expect(wrapper.find('.material-summary [role="img"]').attributes('aria-label')).toBe(
      'King, Bishop',
    )
  })

  it('shows the error and goes home when the game cannot be loaded', async () => {
    vi.mocked(getGameHistory).mockRejectedValue(new Error('boom'))
    const wrapper = await open()
    expect(notify).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith({ name: 'home' })
    expect(wrapper.find('.chess-board').exists()).toBe(false)
  })

  it('goes home for a new game', async () => {
    const wrapper = await open()
    const button = wrapper.findAll('button').find((item) => item.text() === 'New game?')!
    await button.trigger('click')
    expect(push).toHaveBeenCalledWith({ name: 'home' })
  })

  it('shows the review in the language in use', async () => {
    setLocale('pt-BR')
    const wrapper = await open()
    expect(wrapper.find('h1').text()).toBe('Revisão da partida')
    expect(wrapper.find('.lead').text()).toBe('Sala 7 · Vitória das pretas · Vencedor: pretas')
    expect(wrapper.text()).toContain('Jogada 4 de 4')
    expect(moveButtons(wrapper)[3]).toBe('Rainha D8 → H4')
    expect(wrapper.find('button[aria-label="Jogada anterior"]').exists()).toBe(true)
  })
})
