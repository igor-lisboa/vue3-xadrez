import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import InstallAppButton from '@/components/layout/InstallAppButton.vue'

const labels = { button: 'Install app', iosHint: 'Tap Share, then Add to Home Screen.' }

describe('InstallAppButton', () => {
  it('shows the install button when the browser can install, and emits install on tap', async () => {
    const wrapper = mount(InstallAppButton, {
      props: { canInstall: true, showIosHint: false, labels },
    })
    expect(wrapper.find('button').text()).toBe('Install app')
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('install')).toHaveLength(1)
  })

  it('shows the iPhone hint instead of a button', () => {
    const wrapper = mount(InstallAppButton, {
      props: { canInstall: false, showIosHint: true, labels },
    })
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.text()).toBe('Tap Share, then Add to Home Screen.')
  })
})
