import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import Field from './Field.vue'
import FieldLabel from './FieldLabel.vue'
import FieldHint from './FieldHint.vue'
import FieldError from './FieldError.vue'
import Input from './Input.vue'

describe('Field composition', () => {
  it('wires FieldLabel for to control id and describedby for hint/error', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(Field, { invalid: true, id: 'email' }, () => [
              h(FieldLabel, null, () => 'Email'),
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
    expect(label.attributes('data-slot')).toBe('field-label')
    expect(input.attributes('id')).toBe('email')
    expect(hint.exists()).toBe(true)
    expect(error.exists()).toBe(true)
    expect(error.attributes('role')).toBe('alert')

    const describedby = input.attributes('aria-describedby') ?? ''
    expect(describedby).toContain(hint.attributes('id')!)
    expect(describedby).toContain(error.attributes('id')!)
    expect(input.attributes('aria-invalid')).toBe('true')
  })

  it('updates FieldLabel for and control id when Field id prop changes', async () => {
    const fieldId = ref('first')

    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(Field, { id: fieldId.value }, () => [
              h(FieldLabel, null, () => 'Name'),
              h(Input, { 'modelValue': '', 'onUpdate:modelValue': () => {} }),
            ])
        },
      }),
    )

    await nextTick()
    expect(wrapper.find('label').attributes('for')).toBe('first')
    expect(wrapper.find('input').attributes('id')).toBe('first')

    fieldId.value = 'second'
    await nextTick()

    expect(wrapper.find('label').attributes('for')).toBe('second')
    expect(wrapper.find('input').attributes('id')).toBe('second')
  })

  it('shows required indicator on FieldLabel', () => {
    const wrapper = mount(Field, {
      slots: {
        default: '<FieldLabel required>Name</FieldLabel>',
      },
      global: { components: { FieldLabel } },
    })

    expect(wrapper.find('label').text()).toContain('*')
  })

  it('does not render FieldError without content even when invalid', () => {
    const wrapper = mount(Field, {
      props: { invalid: true },
      slots: {
        default: '<FieldError></FieldError>',
      },
      global: { components: { FieldError } },
    })

    expect(wrapper.find('[data-slot="field-error"]').exists()).toBe(false)
  })

  it('does not render FieldHint without content', () => {
    const wrapper = mount(Field, {
      slots: {
        default: '<FieldHint></FieldHint>',
      },
      global: { components: { FieldHint } },
    })

    expect(wrapper.find('[data-slot="field-hint"]').exists()).toBe(false)
  })

  it('uses gap-2 field spacing', () => {
    const wrapper = mount(Field)
    expect(wrapper.attributes('class')).toContain('gap-2')
    expect(wrapper.attributes('class')).not.toContain('gap-1.5')
  })

  it('uses semantic kablui token classes and no hex colors in Field SFCs', () => {
    for (const file of [
      'Field.vue',
      'FieldLabel.vue',
      'FieldHint.vue',
      'FieldError.vue',
    ]) {
      const source = readFileSync(resolve(__dirname, file), 'utf8')
      expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
      expect(source).not.toMatch(/kablui-neutral-\d+/)
      expect(source).not.toMatch(/kablui-accent-\d+/)
      expect(source).not.toMatch(/kablui-danger-\d+/)
    }
  })
})
