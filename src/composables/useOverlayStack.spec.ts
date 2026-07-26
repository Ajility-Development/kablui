import { defineComponent, h, nextTick } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import {
  __resetOverlayStack,
  useOverlayStack,
  type OverlayLayer,
} from './useOverlayStack'

beforeEach(() => {
  __resetOverlayStack()
})

describe('useOverlayStack', () => {
  it('maps layers to token z-index scale', () => {
    const Host = defineComponent({
      setup() {
        const expected: Record<OverlayLayer, number> = {
          menu: 1000,
          dialog: 1300,
          toast: 1400,
          tooltip: 1500,
        }
        for (const layer of Object.keys(expected) as OverlayLayer[]) {
          expect(useOverlayStack(layer).zIndex).toBe(expected[layer])
        }
        return () => h('div')
      },
    })
    mount(Host)
  })

  it('isTop is false until register', async () => {
    const Host = defineComponent({
      setup() {
        const stack = useOverlayStack('dialog')
        return () =>
          h('div', {
            'data-top': String(stack.isTop.value),
            'data-z': String(stack.zIndex),
          })
      },
    })

    const wrapper = mount(Host)
    await nextTick()
    expect(wrapper.attributes('data-top')).toBe('false')
    expect(wrapper.attributes('data-z')).toBe('1300')
  })

  it('nested register makes the newest entry top', async () => {
    const Host = defineComponent({
      setup() {
        const outer = useOverlayStack('dialog')
        const inner = useOverlayStack('menu')
        outer.register()
        inner.register()
        return () =>
          h('div', {
            'data-outer-top': String(outer.isTop.value),
            'data-inner-top': String(inner.isTop.value),
            'data-inner-z': String(inner.zIndex),
          })
      },
    })

    const wrapper = mount(Host)
    await nextTick()

    expect(wrapper.attributes('data-outer-top')).toBe('false')
    expect(wrapper.attributes('data-inner-top')).toBe('true')
    expect(wrapper.attributes('data-inner-z')).toBe('1000')
  })

  it('unregister restores the previous entry as top', async () => {
    const Host = defineComponent({
      setup() {
        const outer = useOverlayStack('dialog')
        const inner = useOverlayStack('dialog')
        outer.register()
        inner.register()
        inner.unregister()
        return () =>
          h('div', {
            'data-outer-top': String(outer.isTop.value),
            'data-inner-top': String(inner.isTop.value),
          })
      },
    })

    const wrapper = mount(Host)
    await nextTick()

    expect(wrapper.attributes('data-outer-top')).toBe('true')
    expect(wrapper.attributes('data-inner-top')).toBe('false')
  })

  it('register is idempotent', async () => {
    const Host = defineComponent({
      setup() {
        const first = useOverlayStack('toast')
        first.register()
        first.register()
        const second = useOverlayStack('toast')
        second.register()
        return () =>
          h('div', {
            'data-first-top': String(first.isTop.value),
            'data-second-top': String(second.isTop.value),
          })
      },
    })

    const wrapper = mount(Host)
    await nextTick()

    expect(wrapper.attributes('data-first-top')).toBe('false')
    expect(wrapper.attributes('data-second-top')).toBe('true')
  })

  it('cleans up on unmount so the remaining entry becomes top', async () => {
    const Outer = defineComponent({
      setup() {
        const outer = useOverlayStack('dialog')
        outer.register()
        return () =>
          h('div', {
            id: 'outer',
            'data-top': String(outer.isTop.value),
          })
      },
    })

    const Inner = defineComponent({
      setup() {
        const inner = useOverlayStack('dialog')
        inner.register()
        return () => h('div', { id: 'inner' })
      },
    })

    const Root = defineComponent({
      props: { showInner: { type: Boolean, default: true } },
      setup(props) {
        return () =>
          h('div', [
            h(Outer),
            props.showInner ? h(Inner) : null,
          ])
      },
    })

    const wrapper = mount(Root, { props: { showInner: true } })
    await nextTick()

    expect(wrapper.find('#outer').attributes('data-top')).toBe('false')

    await wrapper.setProps({ showInner: false })
    await nextTick()

    // Outer re-renders with updated isTop after Inner's onScopeDispose unregister
    expect(wrapper.find('#outer').attributes('data-top')).toBe('true')
  })
})
