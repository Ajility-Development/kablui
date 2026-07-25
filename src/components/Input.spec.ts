import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import { expectNoA11yViolations } from '../test/a11y'
import Input from './Input.vue'
import Field from './Field.vue'
import Label from './Label.vue'
import FieldHint from './FieldHint.vue'

describe('Input', () => {
  it('renders a native input and updates v-model', async () => {
    const Host = defineComponent({
      setup() {
        const value = ref('hi')
        return () =>
          h(Input, {
            modelValue: value.value,
            'onUpdate:modelValue': (v: string) => {
              value.value = v
            },
          })
      },
    })

    const wrapper = mount(Host)
    const input = wrapper.find('input')
    expect(input.element).toBeInstanceOf(HTMLInputElement)
    await input.setValue('hello')
    expect((input.element as HTMLInputElement).value).toBe('hello')
  })

  it('maps each size exclusively', () => {
    const sm = mount(Input, { props: { size: 'sm' } })
    const md = mount(Input, { props: { size: 'md' } })
    const lg = mount(Input, { props: { size: 'lg' } })

    expect(sm.find('input').classes()).toContain('text-kablui-sm')
    expect(sm.find('input').classes()).not.toContain('text-kablui-lg')
    expect(md.find('input').classes()).toContain('text-kablui-md')
    expect(lg.find('input').classes()).toContain('text-kablui-lg')
  })

  it('applies invalid border and aria-invalid', () => {
    const wrapper = mount(Input, { props: { invalid: true } })
    const input = wrapper.find('input')
    expect(input.classes()).toContain('border-kablui-danger')
    expect(input.attributes('aria-invalid')).toBe('true')
  })

  it('sets native disabled', () => {
    const wrapper = mount(Input, { props: { disabled: true } })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    expect(wrapper.find('input').classes()).toContain('disabled:opacity-50')
  })

  it('includes focus-visible ring contract with semantic focus token', () => {
    const wrapper = mount(Input)
    const className = wrapper.find('input').attributes('class') ?? ''
    expect(className).toMatch(/focus-visible:ring-kablui-focus/)
    expect(className).toMatch(/focus-visible:ring-offset-kablui-bg/)
  })

  it('inherits Field id and aria-describedby', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(Field, { id: 'username' }, () => [
              h(Label, null, () => 'Username'),
              h(Input),
              h(FieldHint, null, () => 'Public handle'),
            ])
        },
      }),
    )
    await wrapper.vm.$nextTick()
    const input = wrapper.find('input')
    expect(input.attributes('id')).toBe('username')
    expect(wrapper.find('label').attributes('for')).toBe('username')
    expect(input.attributes('aria-describedby')).toContain(
      wrapper.find('[data-slot="field-hint"]').attributes('id')!,
    )
  })

  it('is available from component and package barrels', async () => {
    const components = await import('./index')
    expect(components.Input).toBeDefined()
    const pkg = await import('../index')
    expect(pkg.Input).toBe(components.Input)
  })

  it('uses semantic kablui token classes and no hex colors in the SFC', () => {
    const source = readFileSync(resolve(__dirname, 'Input.vue'), 'utf8')
    expect(source).toMatch(/kablui-/)
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(source).not.toMatch(/kablui-neutral-\d+/)
    expect(source).not.toMatch(/kablui-accent-\d+/)
    expect(source).not.toMatch(/kablui-danger-\d+/)
  })
})

describe('a11y', () => {
  it('has no axe violations when labeled via Field', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h('main', null, [
              h(Field, { id: 'username' }, () => [
                h(Label, null, () => 'Username'),
                h(Input),
              ]),
            ])
        },
      }),
    )
    await expectNoA11yViolations(wrapper.element)
  })
})
