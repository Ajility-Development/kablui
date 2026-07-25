import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import Select from './Select.vue'
import SelectItem from './SelectItem.vue'
import Field from './Field.vue'
import Label from './Label.vue'
import FieldHint from './FieldHint.vue'

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'mango', label: 'Mango' },
]

describe('Select', () => {
  it('opens and closes with aria-expanded', async () => {
    const wrapper = mount(Select, { props: { options, placeholder: 'Pick' } })
    const trigger = wrapper.find('button')

    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-haspopup')).toBe('listbox')

    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('[role="listbox"]').isVisible()).toBe(true)

    await trigger.trigger('keydown', { key: 'Escape' })
    expect(trigger.attributes('aria-expanded')).toBe('false')
  })

  it('selects via keyboard Enter and updates v-model', async () => {
    const wrapper = mount(Select, {
      props: { options, modelValue: '' },
    })

    const trigger = wrapper.find('button')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    const listbox = wrapper.find('[role="listbox"]')
    expect(listbox.isVisible()).toBe(true)

    await listbox.trigger('keydown', { key: 'ArrowDown' })
    await listbox.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['banana'])
    expect(trigger.attributes('aria-expanded')).toBe('false')
  })

  it('marks selected option with aria-selected', async () => {
    const wrapper = mount(Select, {
      props: { options, modelValue: 'apple' },
    })
    await wrapper.find('button').trigger('click')
    const selected = wrapper.find('[role="option"][aria-selected="true"]')
    expect(selected.exists()).toBe(true)
    expect(selected.text()).toBe('Apple')
  })

  it('supports typeahead to move active option', async () => {
    const value = ref('')
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(Select, {
              options,
              modelValue: value.value,
              'onUpdate:modelValue': (v: string) => {
                value.value = v
              },
            })
        },
      }),
    )

    const trigger = wrapper.find('button')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'm' })
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(value.value).toBe('mango')
  })

  it('works with SelectItem children', async () => {
    const value = ref('apple')
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Select,
              {
                modelValue: value.value,
                'onUpdate:modelValue': (v: string) => {
                  value.value = v
                },
              },
              () => [
                h(SelectItem, { value: 'apple' }, () => 'Apple'),
                h(SelectItem, { value: 'banana' }, () => 'Banana'),
              ],
            )
        },
      }),
    )

    await wrapper.find('button').trigger('click')
    await nextTick()
    const items = wrapper.findAll('[role="option"]')
    expect(items.length).toBeGreaterThanOrEqual(2)
    await items[1]!.trigger('click')
    expect(value.value).toBe('banana')
  })

  it('renders hidden name input for form posts', () => {
    const wrapper = mount(Select, {
      props: { options, name: 'fruit', modelValue: 'apple' },
    })
    const hidden = wrapper.find('input[type="hidden"]')
    expect(hidden.attributes('name')).toBe('fruit')
    expect(hidden.attributes('value')).toBe('apple')
  })

  it('applies invalid styles and Field aria wiring', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(Field, { id: 'country', invalid: true }, () => [
              h(Label, null, () => 'Country'),
              h(Select, { options }),
              h(FieldHint, null, () => 'Billing country'),
            ])
        },
      }),
    )
    await nextTick()
    const trigger = wrapper.find('button')
    expect(trigger.attributes('id')).toBe('country')
    expect(trigger.attributes('aria-invalid')).toBe('true')
    expect(trigger.classes()).toContain('border-kablui-danger')
    expect(trigger.attributes('aria-describedby')).toContain(
      wrapper.find('[data-slot="field-hint"]').attributes('id')!,
    )
  })

  it('includes focus-visible ring on trigger', () => {
    const className = mount(Select, { props: { options } }).find('button').attributes('class') ?? ''
    expect(className).toMatch(/focus-visible:ring-kablui-focus/)
    expect(className).toMatch(/focus-visible:ring-offset-kablui-bg/)
  })

  it('is available from barrels', async () => {
    const components = await import('./index')
    const pkg = await import('../index')
    expect(pkg.Select).toBe(components.Select)
    expect(pkg.SelectItem).toBe(components.SelectItem)
  })

  it('uses semantic kablui token classes and no hex colors in SFCs', () => {
    for (const file of ['Select.vue', 'SelectItem.vue']) {
      const source = readFileSync(resolve(__dirname, file), 'utf8')
      expect(source).toMatch(/kablui-/)
      expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
      expect(source).not.toMatch(/kablui-neutral-\d+/)
      expect(source).not.toMatch(/kablui-accent-\d+/)
    }
  })
})
