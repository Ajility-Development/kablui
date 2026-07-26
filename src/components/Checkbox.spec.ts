import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { expectNoA11yViolations } from '../test/a11y'
import Checkbox from './Checkbox.vue'
import Field from './Field.vue'
import FieldLabel from './FieldLabel.vue'

describe('Checkbox', () => {
  it('toggles v-model on change', async () => {
    const Host = defineComponent({
      setup() {
        const value = ref(false)
        return () =>
          h(Checkbox, {
            modelValue: value.value,
            'onUpdate:modelValue': (v: boolean) => {
              value.value = v
            },
          })
      },
    })

    const wrapper = mount(Host)
    const input = wrapper.find('input[type="checkbox"]')
    await input.setValue(true)
    expect((input.element as HTMLInputElement).checked).toBe(true)
  })

  it('supports indeterminate via aria-checked mixed and DOM property', async () => {
    const wrapper = mount(Checkbox, { props: { indeterminate: true, modelValue: false } })
    await nextTick()
    const input = wrapper.find('input').element as HTMLInputElement
    expect(input.indeterminate).toBe(true)
    expect(wrapper.find('input').attributes('aria-checked')).toBe('mixed')
  })

  it('applies invalid and disabled classes', () => {
    const invalid = mount(Checkbox, { props: { invalid: true } })
    const disabled = mount(Checkbox, { props: { disabled: true } })

    expect(invalid.find('input').classes()).toContain('border-kablui-danger')
    expect(invalid.find('input').attributes('aria-invalid')).toBe('true')
    expect(disabled.find('input').attributes('disabled')).toBeDefined()
  })

  it('emits default data-testid and allows override', () => {
    const def = mount(Checkbox)
    expect(def.find('input').attributes('data-testid')).toBe('checkbox')

    const custom = mount(Checkbox, { attrs: { 'data-testid': 'terms' } })
    expect(custom.find('input').attributes('data-testid')).toBe('terms')
  })

  it('includes focus-visible ring contract', () => {
    const className = mount(Checkbox).find('input').attributes('class') ?? ''
    expect(className).toMatch(/focus-visible:ring-kablui-focus/)
    expect(className).toMatch(/focus-visible:ring-offset-kablui-bg/)
  })

  it('uses fg border so the outline matches text color', () => {
    const className = mount(Checkbox).find('input').attributes('class') ?? ''
    expect(className).toMatch(/border-kablui-fg/)
    expect(className).not.toMatch(/border-kablui-border(?!-)/)
  })

  it('draws a text-colored check when checked (appearance-none)', () => {
    const wrapper = mount(Checkbox, { props: { modelValue: true } })
    const className = wrapper.find('input').attributes('class') ?? ''
    expect(className).toMatch(/\bpeer\b/)
    expect(className).toMatch(/appearance-none/)
    expect(className).not.toMatch(/checked:bg-kablui-accent(?:\s|$)/)

    const marks = wrapper.findAll('svg[aria-hidden="true"]')
    expect(marks.length).toBe(2)
    expect(marks[0]!.classes().join(' ')).toMatch(/text-kablui-fg/)
    expect(marks[0]!.classes().join(' ')).toMatch(/peer-checked:opacity-100/)
    expect(marks[1]!.classes().join(' ')).toMatch(/peer-indeterminate:opacity-100/)
    expect(marks[0]!.find('path').attributes('stroke')).toBe('currentColor')
  })

  it('inherits Field id wiring', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(Field, { id: 'tos' }, () => [
              h(Checkbox),
              h(FieldLabel, null, () => 'Accept terms'),
            ])
        },
      }),
    )
    await nextTick()
    expect(wrapper.find('input').attributes('id')).toBe('tos')
    expect(wrapper.find('label').attributes('for')).toBe('tos')
  })

  it('is available from barrels', async () => {
    const components = await import('./index')
    const pkg = await import('../index')
    expect(pkg.Checkbox).toBe(components.Checkbox)
  })

  it('uses semantic kablui token classes and no hex colors in the SFC', () => {
    const source = readFileSync(resolve(__dirname, 'Checkbox.vue'), 'utf8')
    expect(source).toMatch(/kablui-/)
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
              h(Field, { id: 'tos' }, () => [
                h(Checkbox),
                h(FieldLabel, null, () => 'Accept terms'),
              ]),
            ])
        },
      }),
    )
    await nextTick()
    await expectNoA11yViolations(wrapper.element)
  })
})
