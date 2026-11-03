import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ActionButton from '@/components/common/ActionButton.vue'
import ChoiceGroup from '@/components/common/ChoiceGroup.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ChessBoard from '@/components/game/ChessBoard.vue'
import ClockPanel from '@/components/game/ClockPanel.vue'
import GameActions from '@/components/game/GameActions.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { createBoardHouses } from '@/domain/board'
import { pieceTypes, squares } from '../helpers/fixtures'

describe('ActionButton', () => {
  it('uses the light style by default and the given variant otherwise', () => {
    const light = mount(ActionButton, { slots: { default: 'Go' } })
    expect(light.classes()).toEqual(
      expect.arrayContaining(['btn', 'btn-lg', 'btn-light', 'border-white']),
    )
    expect(light.text()).toBe('Go')
    const dark = mount(ActionButton, { props: { variant: 'dark' } })
    expect(dark.classes()).toContain('btn-dark')
    const danger = mount(ActionButton, { props: { variant: 'danger' } })
    expect(danger.classes()).toContain('btn-danger')
  })

  it('passes attributes such as disabled to the button', () => {
    const wrapper = mount(ActionButton, { attrs: { disabled: true } })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })
})

describe('ChoiceGroup', () => {
  const options = [
    { value: 0, label: 'Zero' },
    { value: 1, label: 'One' },
  ]

  it('renders one radio button per option', () => {
    const wrapper = mount(ChoiceGroup, {
      props: { options, modelValue: null, 'onUpdate:modelValue': () => undefined },
    })
    expect(wrapper.findAll('input[type="radio"]')).toHaveLength(2)
    expect(wrapper.findAll('label').map((label) => label.text())).toEqual(['Zero', 'One'])
  })

  it('emits the value of the chosen option', async () => {
    const wrapper = mount(ChoiceGroup, {
      props: { options, modelValue: null, 'onUpdate:modelValue': () => undefined },
    })
    await wrapper.findAll('input')[1]!.setValue(true)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1])
  })
})

describe('LoadingSpinner', () => {
  it('shows an accessible spinner', () => {
    const wrapper = mount(LoadingSpinner)
    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.text()).toContain('Loading...')
  })
})

describe('ChessBoard', () => {
  const houses = () => {
    const built = createBoardHouses(['Rei-0', null], squares, pieceTypes, null)
    built[1] = { ...built[1]!, possibleMovement: true, captures: true, movementName: 'L' }
    return built
  }

  it('draws the piece symbols and the highlight classes', () => {
    const wrapper = mount(ChessBoard, {
      props: { houses: houses(), highlightTurn: false, spectatorOnly: false },
    })
    const cells = wrapper.findAll('.board-house')
    expect(cells[0]?.text()).toBe('W-King')
    expect(cells[0]?.classes()).toEqual(expect.arrayContaining(['house-white']))
    expect(cells[1]?.classes()).toEqual(expect.arrayContaining(['house-move', 'house-capture']))
    expect(cells[1]?.attributes('title')).toBe('B8 | Knight move')
    expect(cells[0]?.attributes('title')).toBe('A8')
  })

  it('emits the index of the clicked square', async () => {
    const wrapper = mount(ChessBoard, {
      props: { houses: houses(), highlightTurn: false, spectatorOnly: false },
    })
    await wrapper.findAll('.board-house')[1]!.trigger('click')
    expect(wrapper.emitted('select')).toEqual([[1]])
  })

  it('outlines the board on turn and disables clicks for spectators', () => {
    const wrapper = mount(ChessBoard, {
      props: { houses: houses(), highlightTurn: true, spectatorOnly: true },
    })
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['active-side-border', 'spectator-only']),
    )
  })
})

describe('ClockPanel', () => {
  it('shows both clocks formatted', () => {
    const wrapper = mount(ClockPanel, { props: { whiteMs: 300000, blackMs: 3723000 } })
    expect(wrapper.findAll('.badge').map((badge) => badge.text())).toEqual(['00:05:00', '01:02:03'])
  })
})

describe('GameActions', () => {
  it('emits resign and proposeDraw', async () => {
    const wrapper = mount(GameActions)
    const buttons = wrapper.findAll('button')
    await buttons[0]!.trigger('click')
    await buttons[1]!.trigger('click')
    expect(wrapper.emitted('resign')).toHaveLength(1)
    expect(wrapper.emitted('proposeDraw')).toHaveLength(1)
  })
})

describe('AppFooter', () => {
  it('credits the author and the API repository', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.text()).toContain('Igor Lisbôa')
    expect(wrapper.text()).toContain('tcc00339-gpms-xadrez-backend')
  })
})
