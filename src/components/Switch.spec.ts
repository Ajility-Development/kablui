import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { expectNoA11yViolations } from '../test/a11y'
import Switch from './Switch.vue'
import Field from './Field.vue'
import FieldLabel from './FieldLabel.vue'

describe('Switch', () => {
  it('toggles aria-checked and v-model on click', async () => {
    const Host = defineComponent({
      setup() {
        const value = ref(false)
        return () =>
          h(Switch, {
            modelValue: value.value,
            'onUpdate:modelValue': (v: boolean) => {
              value.value = v
            },
          })
      },
    })

    const wrapper = mount(Host)
    const button = wrapper.find('button[role="switch"]')
    expect(button.attributes('aria-checked')).toBe('false')
    await button.trigger('click')
    expect(button.attributes('aria-checked')).toBe('true')
  })

  it('activates with Space', async () => {
    const value = ref(false)
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(Switch, {
              modelValue: value.value,
              'onUpdate:modelValue': (v: boolean) => {
                value.value = v
              },
            })
        },
      }),
    )

    await wrapper.find('button').trigger('keydown', { key: ' ' })
    expect(value.value).toBe(true)
  })

  it('renders hidden name input when name is set', async () => {
    const wrapper = mount(Switch, {
      props: { name: 'notify', modelValue: true, value: 'yes' },
    })
    const hidden = wrapper.find('input[type="hidden"]')
    expect(hidden.exists()).toBe(true)
    expect(hidden.attributes('name')).toBe('notify')
    expect(hidden.attributes('value')).toBe('yes')
  })

  it('emits default data-testid and allows override', () => {
    const def = mount(Switch)
    expect(def.find('button[role="switch"]').attributes('data-testid')).toBe('switch')

    const custom = mount(Switch, { attrs: { 'data-testid': 'notify' } })
    expect(custom.find('button[role="switch"]').attributes('data-testid')).toBe('notify')
  })

  it('does not toggle when disabled', async () => {
    const value = ref(false)
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(Switch, {
              disabled: true,
              modelValue: value.value,
              'onUpdate:modelValue': (v: boolean) => {
                value.value = v
              },
            })
        },
      }),
    )

    await wrapper.find('button').trigger('click')
    expect(value.value).toBe(false)
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('includes focus-visible ring contract', () => {
    const wrapper = mount(Switch)
    const className = wrapper.find('button').attributes('class') ?? ''
    expect(className).toMatch(/focus-visible:ring-kablui-focus/)
    expect(className).toMatch(/focus-visible:ring-offset-kablui-bg/)
    expect(className).toMatch(/rounded-kablui-full/)
    expect(wrapper.find('span').attributes('class')).toMatch(/rounded-kablui-full/)
  })

  it('uses fg border so the outline matches text color', () => {
    const className = mount(Switch).find('button').attributes('class') ?? ''
    expect(className).toMatch(/border-kablui-fg/)
    expect(className).not.toMatch(/border-kablui-border(?!-)/)
  })

  it('uses muted track when off and accent track when on', async () => {
    const value = ref(false)
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(Switch, {
              modelValue: value.value,
              'onUpdate:modelValue': (v: boolean) => {
                value.value = v
              },
            })
        },
      }),
    )

    const offClass = wrapper.find('button').attributes('class') ?? ''
    expect(offClass).toMatch(/bg-kablui-muted/)
    expect(offClass).not.toMatch(/(?:^|\s)bg-kablui-fg(?:\s|$)/)
    expect(offClass).not.toMatch(/bg-kablui-accent/)

    await wrapper.find('button').trigger('click')
    const onClass = wrapper.find('button').attributes('class') ?? ''
    expect(onClass).toMatch(/bg-kablui-accent/)
    expect(onClass).not.toMatch(/bg-kablui-muted/)
  })

  it('uses fg thumb when off and bg thumb when on', async () => {
    const value = ref(false)
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(Switch, {
              modelValue: value.value,
              'onUpdate:modelValue': (v: boolean) => {
                value.value = v
              },
            })
        },
      }),
    )

    const offThumb = wrapper.find('span').attributes('class') ?? ''
    expect(offThumb).toMatch(/bg-kablui-fg/)
    expect(offThumb).not.toMatch(/bg-kablui-bg/)

    await wrapper.find('button').trigger('click')
    const onThumb = wrapper.find('span').attributes('class') ?? ''
    expect(onThumb).toMatch(/bg-kablui-bg/)
    expect(onThumb).not.toMatch(/bg-kablui-fg/)
  })

  it('inherits Field wiring', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(Field, { id: 'alerts', invalid: true }, () => [
              h(Switch),
              h(FieldLabel, null, () => 'Alerts'),
            ])
        },
      }),
    )
    await nextTick()
    expect(wrapper.find('button').attributes('id')).toBe('alerts')
    expect(wrapper.find('button').attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('label').attributes('for')).toBe('alerts')
  })

  it('is available from barrels', async () => {
    const components = await import('./index')
    const pkg = await import('../index')
    expect(pkg.Switch).toBe(components.Switch)
  })

  it('uses semantic kablui token classes and no hex colors in the SFC', () => {
    const source = readFileSync(resolve(__dirname, 'Switch.vue'), 'utf8')
    expect(source).toMatch(/kablui-/)
    expect(source).toMatch(/rounded-kablui-full/)
    expect(source).not.toMatch(/\brounded-full\b/)
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(source).not.toMatch(/kablui-neutral-\d+/)
  })
})

describe('a11y', () => {
  it('has no axe violations when labeled', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h('main', null, [
              h(Field, { id: 'alerts' }, () => [
                h(Switch),
                h(FieldLabel, null, () => 'Alerts'),
              ]),
            ])
        },
      }),
    )
    await nextTick()
    await expectNoA11yViolations(wrapper.element)
  })
})
