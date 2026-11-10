import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ClaimWithMoveOption from '@/components/game/ClaimWithMoveOption.vue'
import DrawOfferPanel from '@/components/game/DrawOfferPanel.vue'
import GameActions from '@/components/game/GameActions.vue'
import { en } from '@/i18n/messages/en'

describe('GameActions', () => {
  const labels = {
    resign: 'Abandonner',
    offerDraw: 'Proposer la nulle',
    claimDraw: 'Réclamer la nulle',
    claimDrawHint: 'Nulle réclamable',
  }

  it('shows the offer button and emits resign and proposeDraw', async () => {
    const wrapper = mount(GameActions, { props: { drawAction: 'offer', labels } })
    const buttons = wrapper.findAll('button')
    expect(buttons.map((button) => button.text())).toEqual(['Abandonner', 'Proposer la nulle'])
    expect(wrapper.find('.claim-draw-hint').exists()).toBe(false)
    await buttons[0]!.trigger('click')
    await buttons[1]!.trigger('click')
    expect(wrapper.emitted('resign')).toHaveLength(1)
    expect(wrapper.emitted('proposeDraw')).toHaveLength(1)
  })

  it('shows the claim button and its hint instead of the offer', async () => {
    const wrapper = mount(GameActions, { props: { drawAction: 'claim', labels } })
    const claim = wrapper.find('button.claim-draw')
    expect(claim.text()).toBe('Réclamer la nulle')
    expect(wrapper.text()).not.toContain('Proposer la nulle')
    expect(wrapper.find('.claim-draw-hint').text()).toBe('Nulle réclamable')
    await claim.trigger('click')
    expect(wrapper.emitted('proposeDraw')).toHaveLength(1)
  })

  it('shows only Resign when no draw action is available', () => {
    const wrapper = mount(GameActions, { props: { drawAction: null, labels } })
    expect(wrapper.findAll('button').map((button) => button.text())).toEqual(['Abandonner'])
  })
})

describe('DrawOfferPanel', () => {
  const labels = {
    received: en.answer.received.empate,
    sent: en.answer.waiting.empate,
    moveDeclines: en.game.moveDeclinesDraw,
    accept: en.answer.accept,
    decline: en.answer.decline,
  }

  it('lets the side that received the offer accept or decline it', async () => {
    const wrapper = mount(DrawOfferPanel, { props: { state: 'received', labels } })
    expect(wrapper.text()).toContain('You received a draw proposal')
    expect(wrapper.text()).toContain(en.game.moveDeclinesDraw)
    const [accept, decline] = wrapper.findAll('button')
    await accept!.trigger('click')
    await decline!.trigger('click')
    expect(wrapper.emitted('answer')).toEqual([[true], [false]])
  })

  it('tells the side that made the offer that it waits, with no buttons', () => {
    const wrapper = mount(DrawOfferPanel, { props: { state: 'sent', labels } })
    expect(wrapper.text()).toBe(en.answer.waiting.empate)
    expect(wrapper.find('button').exists()).toBe(false)
  })
})

describe('ClaimWithMoveOption', () => {
  const labels = { label: en.game.claimWithMove, warning: en.game.claimWithMoveWarning }

  it('is a switch with its label and the warning that the move may be played', async () => {
    const wrapper = mount(ClaimWithMoveOption, {
      props: { modelValue: false, labels, 'onUpdate:modelValue': () => undefined },
    })
    const input = wrapper.find('input[role="switch"]')
    expect(wrapper.find('label').attributes('for')).toBe(input.attributes('id'))
    expect(wrapper.find('label').text()).toBe(en.game.claimWithMove)
    expect(wrapper.find('.text-warning').text()).toBe(en.game.claimWithMoveWarning)
    await input.setValue(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })
})
