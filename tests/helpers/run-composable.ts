import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'

/** Runs a composable inside a mounted component, so lifecycle hooks work. */
export function runComposable<T>(composable: () => T): { result: T; unmount: () => void } {
  let result: T | undefined
  const wrapper = mount(
    defineComponent({
      setup() {
        result = composable()
        return () => h('div')
      },
    }),
  )
  return {
    result: result as T,
    unmount: () => wrapper.unmount(),
  }
}
