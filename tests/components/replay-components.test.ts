import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import MoveList from '@/components/game/MoveList.vue'
import ReplayControls from '@/components/game/ReplayControls.vue'
import { pairMoves } from '@/domain/move-text'
import type { HistoryMove } from '@/domain/replay'
import { en } from '@/i18n/messages/en'

const labels = {
  first: 'First',
  previous: 'Previous',
  next: 'Next',
  last: 'Last',
  position: 'Move 2 of 4',
}

describe('ReplayControls', () => {
  const mountControls = (canGoBack: boolean, canGoForward: boolean) =>
    mount(ReplayControls, { props: { canGoBack, canGoForward, labels } })

  it('names the four buttons for assistive technology and shows the position', () => {
    const wrapper = mountControls(true, true)
    expect(wrapper.findAll('button').map((button) => button.attributes('aria-label'))).toEqual([
      'First',
      'Previous',
      'Next',
      'Last',
    ])
    expect(wrapper.text()).toContain('Move 2 of 4')
  })

  it('emits the step each button asks for', async () => {
    const wrapper = mountControls(true, true)
    for (const button of wrapper.findAll('button')) {
      await button.trigger('click')
    }
    expect(Object.keys(wrapper.emitted())).toEqual(
      expect.arrayContaining(['first', 'previous', 'next', 'last']),
    )
  })

  it('disables going back at the start and going forward at the end', () => {
    const atStart = mountControls(false, true).findAll('button')
    expect(atStart.map((button) => button.attributes('disabled') !== undefined)).toEqual([
      true,
      true,
      false,
      false,
    ])
    const atEnd = mountControls(true, false).findAll('button')
    expect(atEnd.map((button) => button.attributes('disabled') !== undefined)).toEqual([
      false,
      false,
      true,
      true,
    ])
  })
})

describe('MoveList', () => {
  const moves: HistoryMove[] = [
    {
      index: 0,
      number: 1,
      sideId: 0,
      piece: 'Peão',
      from: 'E2',
      to: 'E4',
      captured: null,
      moveName: null,
      promotedTo: null,
    },
    {
      index: 1,
      number: 1,
      sideId: 1,
      piece: 'Peão',
      from: 'E7',
      to: 'E5',
      captured: null,
      moveName: null,
      promotedTo: null,
    },
    {
      index: 2,
      number: 2,
      sideId: 0,
      piece: 'Cavalo',
      from: 'G1',
      to: 'F3',
      captured: null,
      moveName: null,
      promotedTo: null,
    },
  ]
  const mountList = (step: number) =>
    mount(MoveList, {
      props: {
        pairs: pairMoves(moves),
        step,
        labels: {
          title: 'Moves of the game',
          sides: en.labels.sides,
          pieces: en.labels.pieces,
          moves: en.labels.moves,
        },
      },
    })

  it('shows one row per pair, under the side names', () => {
    const wrapper = mountList(3)
    expect(wrapper.findAll('thead th').map((cell) => cell.text())).toEqual(['#', 'White', 'Black'])
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(2)
    expect(rows[0]?.findAll('button').map((button) => button.text())).toEqual([
      'Pawn E2 → E4',
      'Pawn E7 → E5',
    ])
    expect(rows[1]?.findAll('button').map((button) => button.text())).toEqual(['Knight G1 → F3'])
  })

  it('marks the move that is on the board', () => {
    const wrapper = mountList(2)
    const current = wrapper.findAll('button').filter((button) => button.classes('active'))
    expect(current.map((button) => button.text())).toEqual(['Pawn E7 → E5'])
    expect(current[0]?.attributes('aria-current')).toBe('step')
  })

  it('marks no move at the starting position', () => {
    expect(mountList(0).findAll('button.active')).toHaveLength(0)
  })

  it('emits the step of the move that was clicked', async () => {
    const wrapper = mountList(3)
    await wrapper.findAll('button')[1]!.trigger('click')
    expect(wrapper.emitted('select')).toEqual([[2]])
  })
})
