import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Toast from './Toast.vue'

describe('Toast', () => {
  it('renders title and optional description', () => {
    const wrapper = mount(Toast, {
      props: { title: 'Saved', description: 'Your changes were stored.' },
    })

    expect(wrapper.text()).toContain('Saved')
    expect(wrapper.text()).toContain('Your changes were stored.')
  })

  it('exposes default data-testid on root and dismiss', () => {
    const wrapper = mount(Toast, { props: { title: 'Saved' } })

    expect(wrapper.attributes('data-testid')).toBe('toast')
    expect(wrapper.find('[data-testid="toast-dismiss"]').exists()).toBe(true)
  })

  it('uses role="status" for non-danger tones and role="alert" for danger', () => {
    const status = mount(Toast, { props: { title: 'Ok', tone: 'success' } })
    const alert = mount(Toast, { props: { title: 'Fail', tone: 'danger' } })

    expect(status.attributes('role')).toBe('status')
    expect(alert.attributes('role')).toBe('alert')
  })

  it('wires aria-labelledby to the title', () => {
    const wrapper = mount(Toast, {
      props: { title: 'Hello', description: 'World' },
    })

    const labelledBy = wrapper.attributes('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    expect(wrapper.find(`#${labelledBy}`).text()).toBe('Hello')

    const describedBy = wrapper.attributes('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(wrapper.find(`#${describedBy}`).text()).toBe('World')
  })

  it('emits dismiss from the dismiss control', async () => {
    const wrapper = mount(Toast, { props: { title: 'Closeable' } })

    await wrapper.find('button[aria-label="Dismiss"]').trigger('click')
    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })

  it('dismiss control inherits surface text color (text-current)', () => {
    const wrapper = mount(Toast, { props: { title: 'Closeable', tone: 'danger' } })
    const dismiss = wrapper.find('button[aria-label="Dismiss"]')

    expect(dismiss.classes()).toContain('text-current')
    expect(dismiss.classes()).not.toContain('text-kablui-muted-fg')
  })

  it('omits aria-describedby when there is no description', () => {
    const wrapper = mount(Toast, { props: { title: 'Title only' } })

    expect(wrapper.attributes('aria-describedby')).toBeUndefined()
    expect(wrapper.attributes('aria-labelledby')).toBeTruthy()
  })

  it('renders action and emits action', async () => {
    const wrapper = mount(Toast, {
      props: { title: 'Undoable', action: { label: 'Undo' } },
    })

    const action = wrapper.findAll('button').find((b) => b.text() === 'Undo')
    expect(action).toBeTruthy()
    await action!.trigger('click')
    expect(wrapper.emitted('action')).toHaveLength(1)
  })

  it('maps each tone exclusively', () => {
    const tones = ['neutral', 'accent', 'danger', 'success', 'warning'] as const
    const tokenByTone = {
      neutral: 'bg-kablui-bg',
      accent: 'bg-kablui-accent',
      danger: 'bg-kablui-danger',
      success: 'bg-kablui-success',
      warning: 'bg-kablui-warning',
    } as const

    for (const tone of tones) {
      const wrapper = mount(Toast, { props: { title: tone, tone } })
      const classes = wrapper.classes()

      expect(classes).toContain(tokenByTone[tone])
      for (const other of tones) {
        if (other === tone) continue
        expect(classes).not.toContain(tokenByTone[other])
      }
    }
  })

  it('uses semantic kablui token classes and no hex colors in the SFC', () => {
    const source = readFileSync(resolve(__dirname, 'Toast.vue'), 'utf8')

    expect(source).toMatch(/kablui-/)
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })
})
