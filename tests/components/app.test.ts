import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '@/App.vue'
import { boardHouseClasses } from '@/components/game/board-house-classes'
import { createBoardHouses } from '@/domain/board'
import { setLocale } from '@/services/locale'
import { pieceTypes, squares } from '../helpers/fixtures'

const stubs = {
  'router-link': { template: '<a><slot /></a>' },
  'router-view': { template: '<main>page</main>' },
}

afterEach(() => setLocale('en'))

describe('App', () => {
  it('renders the app shell around the routed page', () => {
    const wrapper = mount(App, { global: { stubs } })
    expect(wrapper.find('main').text()).toBe('page')
    expect(wrapper.find('footer').exists()).toBe(true)
  })

  it('defines the piece pictures once for every screen', () => {
    const wrapper = mount(App, { global: { stubs } })
    expect(wrapper.findAll('.piece-sprite')).toHaveLength(1)
    expect(wrapper.find('.piece-sprite').html()).toContain('id="wk"')
  })

  it('offers the six languages and changes the texts when one is chosen', async () => {
    const wrapper = mount(App, { global: { stubs } })
    const select = wrapper.find('select')
    expect(select.findAll('option')).toHaveLength(6)
    expect(wrapper.find('footer').text()).toContain('Developed by')

    await select.setValue('pt-BR')
    expect(wrapper.find('footer').text()).toContain('Desenvolvido por')
    expect(select.attributes('aria-label')).toBe('Idioma')
  })
})

describe('boardHouseClasses', () => {
  it('adds the state classes of a square', () => {
    const [house] = createBoardHouses(['Rei-0'], squares, pieceTypes, 0)
    const classes = boardHouseClasses({
      ...house!,
      movementOrigin: true,
      possibleMovement: true,
      captures: true,
    })
    expect(classes).toEqual(
      expect.arrayContaining([
        'board-house',
        'house-white',
        'house-check',
        'house-origin',
        'house-move',
        'house-capture',
      ]),
    )
  })

  it('keeps only the base classes for an idle square', () => {
    const [house] = createBoardHouses([null], squares, pieceTypes, null)
    expect(boardHouseClasses(house!)).toEqual(['board-house', 'house-white'])
  })
})
