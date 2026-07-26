import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { expectNoA11yViolations } from '../test/a11y'
import { __resetDismissibleStack } from '../composables/useDismissible'
import { __resetOverlayStack } from '../composables/useOverlayStack'
import Select from './Select.vue'
import SelectItem from './SelectItem.vue'
import Field from './Field.vue'
import FieldLabel from './FieldLabel.vue'
import FieldHint from './FieldHint.vue'

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'mango', label: 'Mango' },
]

let wrapper: VueWrapper | undefined

beforeEach(() => {
  __resetDismissibleStack()
  __resetOverlayStack()
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

function listbox() {
  return document.querySelector('[role="listbox"]') as HTMLElement | null
}

describe('Select', () => {
  it('opens and closes with aria-expanded', async () => {
    wrapper = mount(Select, {
      props: { options, placeholder: 'Pick' },
      attachTo: document.body,
    })
    const trigger = wrapper.find('button')

    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-haspopup')).toBe('listbox')

    await trigger.trigger('click')
    await nextTick()
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(listbox()?.hidden).toBeFalsy()
    expect(getComputedStyle(listbox()!).display).not.toBe('none')

    await trigger.trigger('keydown', { key: 'Escape' })
    await nextTick()
    expect(trigger.attributes('aria-expanded')).toBe('false')
  })

  it('selects via keyboard Enter and updates v-model', async () => {
    wrapper = mount(Select, {
      props: { options, modelValue: '' },
      attachTo: document.body,
    })

    const trigger = wrapper.find('button')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    const box = listbox()!
    expect(box).toBeTruthy()

    box.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['banana'])
    expect(trigger.attributes('aria-expanded')).toBe('false')
  })

  it('marks selected option with aria-selected', async () => {
    wrapper = mount(Select, {
      props: { options, modelValue: 'apple' },
      attachTo: document.body,
    })
    await wrapper.find('button').trigger('click')
    await nextTick()
    const selected = document.querySelector('[role="option"][aria-selected="true"]')
    expect(selected).not.toBeNull()
    expect(selected?.textContent?.trim()).toBe('Apple')
  })

  it('supports typeahead to move active option', async () => {
    const value = ref('')
    wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(Select, {
              options,
              modelValue: value.value,
              'onUpdate:modelValue': (v: string | undefined) => {
                if (v !== undefined) value.value = v
              },
            })
        },
      }),
      { attachTo: document.body },
    )

    const trigger = wrapper.find('button')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'm' })
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(value.value).toBe('mango')
  })

  it('works with SelectItem children', async () => {
    const value = ref('apple')
    wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Select,
              {
                modelValue: value.value,
                'onUpdate:modelValue': (v: string | undefined) => {
                  if (v !== undefined) value.value = v
                },
              },
              () => [
                h(SelectItem, { value: 'apple' }, () => 'Apple'),
                h(SelectItem, { value: 'banana' }, () => 'Banana'),
              ],
            )
        },
      }),
      { attachTo: document.body },
    )

    await wrapper.find('button').trigger('click')
    await nextTick()
    const items = document.querySelectorAll('[role="option"]')
    expect(items.length).toBeGreaterThanOrEqual(2)
    ;(items[1] as HTMLElement).click()
    await nextTick()
    expect(value.value).toBe('banana')
  })

  it('warns when both options prop and SelectItem children are provided', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(Select, { options }, () => [h(SelectItem, { value: 'x' }, () => 'X')])
        },
      }),
    )
    await nextTick()
    expect(
      warn.mock.calls.some((c) =>
        String(c[0]).includes('both `options` prop and SelectItem children'),
      ),
    ).toBe(true)
    warn.mockRestore()
  })

  it('teleports listbox with menu stacking classes', async () => {
    wrapper = mount(Select, {
      props: { options },
      attachTo: document.body,
    })
    await wrapper.find('button').trigger('click')
    await nextTick()
    const box = listbox()
    expect(box).not.toBeNull()
    expect(box?.parentElement).toBe(document.body)
    expect(box?.className).toContain('z-kablui-menu')
    expect(box?.className).toContain('shadow-kablui-md')
  })

  it('renders hidden name input for form posts', () => {
    wrapper = mount(Select, {
      props: { options, name: 'fruit', modelValue: 'apple' },
    })
    const hidden = wrapper.find('input[type="hidden"]')
    expect(hidden.attributes('name')).toBe('fruit')
    expect(hidden.attributes('value')).toBe('apple')
  })

  it('applies invalid styles and Field aria wiring', async () => {
    wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(Field, { id: 'country', invalid: true }, () => [
              h(FieldLabel, null, () => 'Country'),
              h(Select, { options }),
              h(FieldHint, null, () => 'Billing country'),
            ])
        },
      }),
      { attachTo: document.body },
    )
    await nextTick()
    const trigger = wrapper.find('button')
    expect(trigger.attributes('id')).toBe('country')
    expect(trigger.attributes('aria-invalid')).toBe('true')
    expect(trigger.classes()).toContain('border-kablui-danger')
    expect(trigger.attributes('aria-describedby')).toContain(
      wrapper.find('[data-slot="field-hint"]').attributes('id')!,
    )
    expect(listbox()?.getAttribute('aria-labelledby')).toBe('country')
  })

  it('names the listbox with placeholder aria-label when unlabeled', () => {
    wrapper = mount(Select, {
      props: { options, placeholder: 'Pick' },
      attachTo: document.body,
    })
    const box = listbox()
    expect(box?.getAttribute('aria-label')).toBe('Pick')
    expect(box?.getAttribute('aria-labelledby')).toBeNull()
  })

  it('includes focus-visible ring on trigger', () => {
    wrapper = mount(Select, { props: { options } })
    const className = wrapper.find('button').attributes('class') ?? ''
    expect(className).toMatch(/focus-visible:ring-kablui-focus/)
    expect(className).toMatch(/focus-visible:ring-offset-kablui-bg/)
  })

  it('emits default data-testid on trigger, listbox, and options', async () => {
    const countryOptions = [
      { value: 'US', label: 'United States' },
      { value: 'CA', label: 'Canada' },
    ]
    wrapper = mount(Select, {
      props: { options: countryOptions },
      attachTo: document.body,
    })

    expect(wrapper.find('[data-testid="select"]').exists()).toBe(true)

    await wrapper.find('button').trigger('click')
    await nextTick()

    expect(document.querySelector('[data-testid="select-listbox"]')).not.toBeNull()
    expect(document.querySelector('[data-testid="select-option-us"]')).not.toBeNull()
    expect(document.querySelector('[data-testid="select-option-ca"]')).not.toBeNull()
  })

  it('derives listbox and option testids from consumer data-testid base', async () => {
    const countryOptions = [
      { value: 'US', label: 'United States' },
      { value: 'CA', label: 'Canada' },
    ]
    wrapper = mount(Select, {
      props: { options: countryOptions },
      attrs: { 'data-testid': 'country' },
      attachTo: document.body,
    })

    expect(wrapper.find('[data-testid="country"]').exists()).toBe(true)

    await wrapper.find('button').trigger('click')
    await nextTick()

    expect(document.querySelector('[data-testid="country-listbox"]')).not.toBeNull()
    expect(document.querySelector('[data-testid="country-option-us"]')).not.toBeNull()
  })

  it('emits option data-testid for SelectItem children', async () => {
    wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(Select, null, () => [
              h(SelectItem, { value: 'US' }, () => 'United States'),
              h(SelectItem, { value: 'CA' }, () => 'Canada'),
            ])
        },
      }),
      { attachTo: document.body },
    )

    await wrapper.find('button').trigger('click')
    await nextTick()

    expect(document.querySelector('[data-testid="select-option-us"]')).not.toBeNull()
    expect(document.querySelector('[data-testid="select-option-ca"]')).not.toBeNull()
  })

  it('uses semantic kablui token classes and no hex colors in SFCs', () => {
    for (const file of ['Select.vue', 'SelectItem.vue', '../utils/listItemClasses.ts']) {
      const source = readFileSync(resolve(__dirname, file), 'utf8')
      expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
      expect(source).not.toMatch(/kablui-neutral-\d+/)
      expect(source).not.toMatch(/kablui-accent-\d+/)
    }
    expect(readFileSync(resolve(__dirname, 'Select.vue'), 'utf8')).toMatch(/kablui-/)
    expect(readFileSync(resolve(__dirname, '../utils/listItemClasses.ts'), 'utf8')).toMatch(
      /kablui-/,
    )
  })
})

describe('a11y', () => {
  function mountLabeledSelect() {
    return mount(
      defineComponent({
        setup() {
          return () =>
            h('main', null, [
              h(Field, { id: 'fruit' }, () => [
                h(FieldLabel, null, () => 'Fruit'),
                h(Select, { options, placeholder: 'Pick' }),
              ]),
            ])
        },
      }),
      { attachTo: document.body },
    )
  }

  it('has no axe violations when closed', async () => {
    wrapper = mountLabeledSelect()
    await nextTick()
    await expectNoA11yViolations(wrapper.element)
  })

  it('has no axe violations when open', async () => {
    wrapper = mountLabeledSelect()
    await nextTick()
    await wrapper.find('button').trigger('click')
    await nextTick()
    const portal = listbox()
    const landmark = document.querySelector('main')
    expect(portal).not.toBeNull()
    expect(landmark).not.toBeNull()
    landmark!.appendChild(portal!)
    await expectNoA11yViolations(document.body)
  })
})
