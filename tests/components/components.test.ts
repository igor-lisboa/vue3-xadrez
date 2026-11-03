import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ActionButton from '@/components/common/ActionButton.vue'
import ChoiceGroup from '@/components/common/ChoiceGroup.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ChessBoard from '@/components/game/ChessBoard.vue'
import ChessPiece from '@/components/game/ChessPiece.vue'
import ClockPanel from '@/components/game/ClockPanel.vue'
import GameActions from '@/components/game/GameActions.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import LanguageSelect from '@/components/layout/LanguageSelect.vue'
import { createBoardHouses } from '@/domain/board'
import { en } from '@/i18n/messages/en'
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
  it('shows an accessible spinner with the label it is given', () => {
    const wrapper = mount(LoadingSpinner, { props: { label: 'Carregando...' } })
    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.text()).toContain('Carregando...')
  })
})

describe('LanguageSelect', () => {
  const options = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
  ]

  it('lists the languages by their own names and labels the control', () => {
    const wrapper = mount(LanguageSelect, {
      props: {
        options,
        label: 'Language',
        modelValue: 'en',
        'onUpdate:modelValue': () => undefined,
      },
    })
    expect(wrapper.findAll('option').map((option) => option.text())).toEqual([
      'English',
      'Français',
    ])
    expect(wrapper.attributes('aria-label')).toBe('Language')
    expect((wrapper.element as HTMLSelectElement).value).toBe('en')
  })

  it('emits the code of the language chosen', async () => {
    const wrapper = mount(LanguageSelect, {
      props: {
        options,
        label: 'Language',
        modelValue: 'en',
        'onUpdate:modelValue': () => undefined,
      },
    })
    await wrapper.find('select').setValue('fr')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['fr'])
  })
})

describe('ChessPiece', () => {
  it('uses the same picture box for white and black pieces', () => {
    const white = mount(ChessPiece, { props: { name: 'Peão', sideId: 0 } })
    const black = mount(ChessPiece, { props: { name: 'Peão', sideId: 1 } })
    expect(white.attributes('viewBox')).toBe(black.attributes('viewBox'))
    expect(white.find('use').attributes('href')).toBe('#wp')
    expect(black.find('use').attributes('href')).toBe('#bp')
  })
})

describe('ChessBoard', () => {
  const houses = () => {
    const built = createBoardHouses(['Rei-0', null], squares, pieceTypes, null)
    built[1] = { ...built[1]!, possibleMovement: true, captures: true, movementName: 'L' }
    return built
  }

  it('draws the piece pictures from the sprite and the highlight classes', () => {
    const wrapper = mount(ChessBoard, {
      props: {
        houses: houses(),
        highlightTurn: false,
        spectatorOnly: false,
        moveLabels: en.labels.moves,
      },
    })
    expect(wrapper.find('.piece-sprite').html()).toContain('id="wk"')
    const cells = wrapper.findAll('.board-house')
    expect(cells[0]?.find('use').attributes('href')).toBe('#wk')
    expect(cells[1]?.find('use').exists()).toBe(false)
    expect(cells[0]?.classes()).toEqual(expect.arrayContaining(['house-white']))
    expect(cells[1]?.classes()).toEqual(expect.arrayContaining(['house-move', 'house-capture']))
    expect(cells[1]?.attributes('title')).toBe('B8 | Knight move')
    expect(cells[0]?.attributes('title')).toBe('A8')
  })

  it('names special moves in the language it is given', () => {
    const wrapper = mount(ChessBoard, {
      props: {
        houses: houses(),
        highlightTurn: false,
        spectatorOnly: false,
        moveLabels: { ...en.labels.moves, L: 'Movimento do cavalo' },
      },
    })
    expect(wrapper.findAll('.board-house')[1]?.attributes('title')).toBe('B8 | Movimento do cavalo')
  })

  it('emits the index of the clicked square', async () => {
    const wrapper = mount(ChessBoard, {
      props: {
        houses: houses(),
        highlightTurn: false,
        spectatorOnly: false,
        moveLabels: en.labels.moves,
      },
    })
    await wrapper.findAll('.board-house')[1]!.trigger('click')
    expect(wrapper.emitted('select')).toEqual([[1]])
  })

  it('outlines the board on turn and disables clicks for spectators', () => {
    const wrapper = mount(ChessBoard, {
      props: {
        houses: houses(),
        highlightTurn: true,
        spectatorOnly: true,
        moveLabels: en.labels.moves,
      },
    })
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['active-side-border', 'spectator-only']),
    )
  })
})

describe('ClockPanel', () => {
  it('shows both clocks formatted, under the side names it is given', () => {
    const wrapper = mount(ClockPanel, {
      props: { whiteMs: 300000, blackMs: 3723000, labels: en.labels.sides },
    })
    expect(wrapper.findAll('.badge').map((badge) => badge.text())).toEqual(['00:05:00', '01:02:03'])
    expect(wrapper.text()).toContain('White')
    expect(wrapper.text()).toContain('Black')
  })
})

describe('GameActions', () => {
  it('shows the labels it is given and emits resign and proposeDraw', async () => {
    const wrapper = mount(GameActions, {
      props: { labels: { resign: 'Abandonner', offerDraw: 'Proposer la nulle' } },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons.map((button) => button.text())).toEqual(['Abandonner', 'Proposer la nulle'])
    await buttons[0]!.trigger('click')
    await buttons[1]!.trigger('click')
    expect(wrapper.emitted('resign')).toHaveLength(1)
    expect(wrapper.emitted('proposeDraw')).toHaveLength(1)
  })
})

describe('AppFooter', () => {
  it('credits the author and the API repository in the words it is given', () => {
    const wrapper = mount(AppFooter, {
      props: { developedBy: en.footer.developedBy, usingApi: en.footer.usingApi },
    })
    expect(wrapper.text()).toContain('Developed by')
    expect(wrapper.text()).toContain('Igor Lisbôa')
    expect(wrapper.text()).toContain('using the API')
    expect(wrapper.text()).toContain('tcc00339-gpms-xadrez-backend')
  })
})
