import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import Textarea from './Textarea.vue'
import Field from './Field.vue'
import FieldLabel from './FieldLabel.vue'

describe('Textarea', () => {
  it('renders a native textarea and updates v-model', async () => {
    const Host = defineComponent({
      setup() {
        const value = ref('')
        return () =>
          h(Textarea, {
            modelValue: value.value,
            'onUpdate:modelValue': (v: string) => {
              value.value = v
            },
          })
      },
    })

    const wrapper = mount(Host)
    const el = wrapper.find('textarea')
    await el.setValue('notes')
    expect((el.element as HTMLTextAreaElement).value).toBe('notes')
  })

  it('maps sizes and invalid state', () => {
    const sm = mount(Textarea, { props: { size: 'sm' } })
    const invalid = mount(Textarea, { props: { invalid: true } })

    expect(sm.find('textarea').classes()).toContain('text-kablui-sm')
    expect(invalid.find('textarea').classes()).toContain('border-kablui-danger')
    expect(invalid.find('textarea').attributes('aria-invalid')).toBe('true')
  })

  it('respects rows and disabled', () => {
    const wrapper = mount(Textarea, { props: { rows: 5, disabled: true } })
    const el = wrapper.find('textarea')
    expect(el.attributes('rows')).toBe('5')
    expect(el.attributes('disabled')).toBeDefined()
  })

  it('inherits Field wiring', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(Field, { id: 'bio', invalid: true }, () => [
              h(FieldLabel, null, () => 'Bio'),
              h(Textarea),
            ])
        },
      }),
    )
    await wrapper.vm.$nextTick()
    expect(wrapper.find('textarea').attributes('id')).toBe('bio')
    expect(wrapper.find('textarea').attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('label').attributes('for')).toBe('bio')
  })

  it('includes focus-visible ring contract', () => {
    const className = mount(Textarea).find('textarea').attributes('class') ?? ''
    expect(className).toMatch(/focus-visible:ring-kablui-focus/)
    expect(className).toMatch(/focus-visible:ring-offset-kablui-bg/)
  })

  it('is available from barrels', async () => {
    const components = await import('./index')
    const pkg = await import('../index')
    expect(pkg.Textarea).toBe(components.Textarea)
  })

  it('uses semantic kablui token classes and no hex colors in the SFC', () => {
    const source = readFileSync(resolve(__dirname, 'Textarea.vue'), 'utf8')
    expect(source).toMatch(/kablui-/)
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(source).not.toMatch(/kablui-neutral-\d+/)
  })
})
