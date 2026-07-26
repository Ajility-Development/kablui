import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { expectNoA11yViolations } from '../test/a11y'
import Alert from './Alert.vue'

describe('Alert', () => {
  it('renders default slot content', () => {
    const wrapper = mount(Alert, { slots: { default: 'Something happened' } })

    expect(wrapper.attributes('data-testid')).toBe('alert')
    expect(wrapper.text()).toContain('Something happened')
  })

  it('renders optional title', () => {
    const wrapper = mount(Alert, {
      props: { title: 'Heads up' },
      slots: { default: 'Details' },
    })

    expect(wrapper.text()).toContain('Heads up')
    expect(wrapper.text()).toContain('Details')
  })

  it('uses role="status" for non-danger tones and role="alert" for danger', () => {
    const status = mount(Alert, {
      props: { tone: 'success' },
      slots: { default: 'Ok' },
    })
    const alert = mount(Alert, {
      props: { tone: 'danger' },
      slots: { default: 'Fail' },
    })

    expect(status.attributes('role')).toBe('status')
    expect(alert.attributes('role')).toBe('alert')
  })

  it('applies default neutral tone classes', () => {
    const wrapper = mount(Alert, { slots: { default: 'Default' } })
    const classes = wrapper.classes()

    expect(classes).toContain('bg-kablui-bg')
    expect(classes).toContain('text-kablui-fg')
    expect(classes).toContain('border-kablui-border')
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
      const wrapper = mount(Alert, {
        props: { tone },
        slots: { default: tone },
      })
      const classes = wrapper.classes()

      expect(classes).toContain(tokenByTone[tone])
      for (const other of tones) {
        if (other === tone) continue
        expect(classes).not.toContain(tokenByTone[other])
      }
    }
  })

  it('shows dismiss control when dismissible and emits dismiss', async () => {
    const wrapper = mount(Alert, {
      props: { dismissible: true },
      slots: { default: 'Closeable' },
    })

    const button = wrapper.find('button[aria-label="Dismiss"]')
    expect(button.exists()).toBe(true)

    await button.trigger('click')
    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })

  it('hides dismiss control by default', () => {
    const wrapper = mount(Alert, { slots: { default: 'Static' } })

    expect(wrapper.find('button[aria-label="Dismiss"]').exists()).toBe(false)
  })

  it('uses semantic kablui token classes and no hex colors in the SFC', () => {
    const source = readFileSync(resolve(__dirname, 'Alert.vue'), 'utf8')

    expect(source).toMatch(/kablui-/)
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(source).not.toMatch(/kablui-neutral-\d+/)
    expect(source).not.toMatch(/kablui-accent-\d+/)
    expect(source).not.toMatch(/kablui-danger-\d+/)
    expect(source).not.toMatch(/kablui-success-\d+/)
    expect(source).not.toMatch(/kablui-warning-\d+/)
  })
})

describe('a11y', () => {
  const tones = ['neutral', 'accent', 'danger', 'success', 'warning'] as const

  for (const tone of tones) {
    it(`has no axe violations for ${tone} tone`, async () => {
      const wrapper = mount(
        defineComponent({
          setup() {
            return () =>
              h('main', null, [
                h(
                  Alert,
                  { tone, title: `${tone} title` },
                  () => `${tone} message`,
                ),
              ])
          },
        }),
      )
      await expectNoA11yViolations(wrapper.element)
    })
  }
})
