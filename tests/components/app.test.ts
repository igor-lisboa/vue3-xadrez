import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '@/App.vue'
import { boardHouseClasses } from '@/components/game/board-house-classes'
import { createBoardHouses } from '@/domain/board'
import { pieceTypes, squares } from '../helpers/fixtures'

describe('App', () => {
  it('renders the app shell around the routed page', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          'router-link': { template: '<a><slot /></a>' },
          'router-view': { template: '<main>page</main>' },
        },
      },
    })
    expect(wrapper.find('main').text()).toBe('page')
    expect(wrapper.find('footer').exists()).toBe(true)
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
