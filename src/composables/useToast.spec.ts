import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ToastProvider from '../components/ToastProvider.vue'
import { useToast } from './useToast'

describe('useToast', () => {
  it('throws when used outside ToastProvider', () => {
    const Orphan = defineComponent({
      setup() {
        useToast()
        return () => null
      },
    })

    expect(() => mount(Orphan)).toThrow(
      /useToast\(\) must be used within a <ToastProvider>/,
    )
  })

  it('returns toast and dismiss under ToastProvider', () => {
    let api: ReturnType<typeof useToast> | undefined

    const Child = defineComponent({
      setup() {
        api = useToast()
        return () => null
      },
    })

    mount(ToastProvider, {
      slots: { default: Child },
      attachTo: document.body,
    }).unmount()

    expect(api).toBeTruthy()
    expect(typeof api!.toast).toBe('function')
    expect(typeof api!.dismiss).toBe('function')
  })
})
