import { defineComponent, h, nextTick, ref } from 'vue'
import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import {
  __resetFieldIdCounter,
  provideField,
  useField,
  useFieldControlAttrs,
} from './useField'

beforeEach(() => {
  __resetFieldIdCounter()
})

describe('useField', () => {
  it('provides control, hint, and error ids with describedBy merge', async () => {
    const Consumer = defineComponent({
      setup() {
        const field = useField()!
        field.setHasHint(true)
        field.setHasError(true)
        return () =>
          h('div', {
            id: field.controlId.value,
            'data-describedby': field.describedBy.value,
            'data-invalid': field.invalid.value ? 'true' : 'false',
          })
      },
    })

    const Provider = defineComponent({
      setup() {
        provideField({ invalid: true })
        return () => h(Consumer)
      },
    })

    const wrapper = mount(Provider)
    await nextTick()

    expect(wrapper.attributes('id')).toMatch(/^kablui-control-/)
    expect(wrapper.attributes('data-describedby')).toMatch(/kablui-hint-/)
    expect(wrapper.attributes('data-describedby')).toMatch(/kablui-error-/)
    expect(wrapper.attributes('data-invalid')).toBe('true')
  })

  it('useFieldControlAttrs merges local invalid with field context', async () => {
    const Consumer = defineComponent({
      setup() {
        const field = useField()!
        field.setHasHint(true)
        const attrs = useFieldControlAttrs({ invalid: false })
        return () =>
          h('input', {
            id: attrs.id.value,
            'aria-invalid': attrs.ariaInvalid.value,
            'aria-describedby': attrs.describedBy.value,
          })
      },
    })

    const Provider = defineComponent({
      setup() {
        const invalid = ref(true)
        provideField({ invalid, id: 'stable-id' })
        return () => h(Consumer)
      },
    })

    const wrapper = mount(Provider)
    await nextTick()
    const input = wrapper.find('input')

    expect(input.attributes('id')).toBe('stable-id')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toMatch(/kablui-hint-/)
  })

  it('updates controlId when ProvideFieldOptions.id changes', async () => {
    const fieldId = ref('first-id')

    const Consumer = defineComponent({
      setup() {
        const field = useField()!
        const attrs = useFieldControlAttrs({})
        return () =>
          h('div', {
            id: attrs.id.value,
            'data-control-id': field.controlId.value,
          })
      },
    })

    const Provider = defineComponent({
      setup() {
        provideField({ id: fieldId })
        return () => h(Consumer)
      },
    })

    const wrapper = mount(Provider)
    await nextTick()

    expect(wrapper.attributes('id')).toBe('first-id')
    expect(wrapper.attributes('data-control-id')).toBe('first-id')

    fieldId.value = 'second-id'
    await nextTick()

    expect(wrapper.attributes('id')).toBe('second-id')
    expect(wrapper.attributes('data-control-id')).toBe('second-id')
  })

  it('returns null outside a Field provider', () => {
    const Consumer = defineComponent({
      setup() {
        const field = useField()
        return () => h('span', { 'data-field': field ? 'yes' : 'no' })
      },
    })

    const wrapper = mount(Consumer)
    expect(wrapper.attributes('data-field')).toBe('no')
  })
})
