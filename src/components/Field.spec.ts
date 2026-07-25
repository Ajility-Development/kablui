import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import Field from './Field.vue'
import Label from './Label.vue'
import FieldHint from './FieldHint.vue'
import FieldError from './FieldError.vue'
import Input from './Input.vue'

describe('Field composition', () => {
  it('wires Label for to control id and describedby for hint/error', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(Field, { invalid: true, id: 'email' }, () => [
              h(Label, null, () => 'Email'),
              h(Input, { 'modelValue': '', 'onUpdate:modelValue': () => {} }),
              h(FieldHint, null, () => 'Work email'),
              h(FieldError, null, () => 'Required'),
            ])
        },
      }),
    )

    await wrapper.vm.$nextTick()

    const label = wrapper.find('label')
    const input = wrapper.find('input')
    const hint = wrapper.find('[data-slot="field-hint"]')
    const error = wrapper.find('[data-slot="field-error"]')

    expect(label.attributes('for')).toBe('email')
    expect(input.attributes('id')).toBe('email')
    expect(hint.exists()).toBe(true)
    expect(error.exists()).toBe(true)
    expect(error.attributes('role')).toBe('alert')

    const describedby = input.attributes('aria-describedby') ?? ''
    expect(describedby).toContain(hint.attributes('id')!)
    expect(describedby).toContain(error.attributes('id')!)
    expect(input.attributes('aria-invalid')).toBe('true')
  })

  it('shows required indicator on Label', () => {
    const wrapper = mount(Field, {
      slots: {
        default: '<Label required>Name</Label>',
      },
      global: { components: { Label } },
    })

    expect(wrapper.find('label').text()).toContain('*')
  })

  it('hides FieldError when there is no content', () => {
    const wrapper = mount(Field, {
      props: { invalid: true },
      slots: {
        default: '<FieldError></FieldError>',
      },
      global: { components: { FieldError } },
    })

    expect(wrapper.find('[data-slot="field-error"]').exists()).toBe(false)
  })

  it('is available from component and package barrels', async () => {
    const components = await import('./index')
    expect(components.Field).toBeDefined()
    expect(components.Label).toBeDefined()
    expect(components.FieldHint).toBeDefined()
    expect(components.FieldError).toBeDefined()

    const pkg = await import('../index')
    expect(pkg.Field).toBe(components.Field)
  })

  it('uses semantic kablui token classes and no hex colors in Field SFCs', () => {
    for (const file of ['Field.vue', 'Label.vue', 'FieldHint.vue', 'FieldError.vue']) {
      const source = readFileSync(resolve(__dirname, file), 'utf8')
      expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
      expect(source).not.toMatch(/kablui-neutral-\d+/)
      expect(source).not.toMatch(/kablui-accent-\d+/)
      expect(source).not.toMatch(/kablui-danger-\d+/)
    }
  })
})
