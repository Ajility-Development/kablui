import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import RadioGroup from './RadioGroup.vue'
import Radio from './Radio.vue'
import Field from './Field.vue'
import Label from './Label.vue'

describe('RadioGroup / Radio', () => {
  it('updates model when selection changes', async () => {
    const Host = defineComponent({
      setup() {
        const value = ref('a')
        return () =>
          h(
            RadioGroup,
            {
              modelValue: value.value,
              'onUpdate:modelValue': (v: string) => {
                value.value = v
              },
              name: 'choice',
            },
            () => [h(Radio, { value: 'a' }), h(Radio, { value: 'b' })],
          )
      },
    })

    const wrapper = mount(Host)
    const radios = wrapper.findAll('input[type="radio"]')
    expect(radios).toHaveLength(2)
    await radios[1]!.setValue(true)
    expect((radios[1]!.element as HTMLInputElement).checked).toBe(true)
    expect((radios[0]!.element as HTMLInputElement).checked).toBe(false)
  })

  it('skips disabled options when arrowing', async () => {
    const value = ref('a')
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              RadioGroup,
              {
                modelValue: value.value,
                'onUpdate:modelValue': (v: string) => {
                  value.value = v
                },
                name: 'skip',
              },
              () => [
                h(Radio, { value: 'a' }),
                h(Radio, { value: 'b', disabled: true }),
                h(Radio, { value: 'c' }),
              ],
            )
        },
      }),
    )

    await nextTick()
    const first = wrapper.findAll('input')[0]!
    await first.trigger('keydown', { key: 'ArrowDown' })
    expect(value.value).toBe('c')
  })

  it('exposes radiogroup role and orientation', () => {
    const wrapper = mount(RadioGroup, {
      props: { orientation: 'horizontal' },
      slots: { default: '<Radio value="x" />' },
      global: { components: { Radio } },
    })

    const group = wrapper.find('[role="radiogroup"]')
    expect(group.exists()).toBe(true)
    expect(group.attributes('aria-orientation')).toBe('horizontal')
  })

  it('marks invalid from Field and shares name', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(Field, { invalid: true, id: 'plan' }, () => [
              h(Label, null, () => 'Plan'),
              h(RadioGroup, { name: 'plan' }, () => [
                h(Radio, { value: 'free' }),
                h(Radio, { value: 'pro' }),
              ]),
            ])
        },
      }),
    )
    await nextTick()
    const group = wrapper.find('[role="radiogroup"]')
    expect(group.attributes('id')).toBe('plan')
    expect(group.attributes('aria-invalid')).toBe('true')
    const radios = wrapper.findAll('input[type="radio"]')
    expect(radios[0]!.attributes('name')).toBe('plan')
    expect(radios[1]!.attributes('name')).toBe('plan')
  })

  it('includes focus-visible ring on radios', () => {
    const wrapper = mount(RadioGroup, {
      slots: { default: '<Radio value="x" />' },
      global: { components: { Radio } },
    })
    const className = wrapper.find('input').attributes('class') ?? ''
    expect(className).toMatch(/focus-visible:ring-kablui-focus/)
  })

  it('is available from barrels', async () => {
    const components = await import('./index')
    const pkg = await import('../index')
    expect(pkg.RadioGroup).toBe(components.RadioGroup)
    expect(pkg.Radio).toBe(components.Radio)
  })

  it('uses semantic kablui token classes and no hex colors in SFCs', () => {
    for (const file of ['RadioGroup.vue', 'Radio.vue']) {
      const source = readFileSync(resolve(__dirname, file), 'utf8')
      expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
      expect(source).not.toMatch(/kablui-neutral-\d+/)
    }
  })
})
