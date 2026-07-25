import { defineComponent, h, nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { __resetDismissableStack, useDismissable } from './useDismissable'
import { __resetOverlayStack, useOverlayStack } from './useOverlayStack'

let wrapper: VueWrapper | undefined

beforeEach(() => {
  __resetDismissableStack()
  __resetOverlayStack()
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

function dispatchEscape(): void {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
  )
}

function dispatchPointerDown(target: EventTarget): void {
  target.dispatchEvent(
    new PointerEvent('pointerdown', { bubbles: true, composed: true }),
  )
}

describe('useDismissable', () => {
  it('calls onDismiss on Escape when active', async () => {
    const onDismiss = vi.fn()

    const Host = defineComponent({
      setup() {
        const rootRef = ref<HTMLElement | null>(null)
        useDismissable(rootRef, { active: true, onDismiss })
        return () => h('div', { ref: rootRef }, 'panel')
      },
    })

    wrapper = mount(Host, { attachTo: document.body })
    await nextTick()

    dispatchEscape()
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('does not dismiss on Escape when inactive', async () => {
    const onDismiss = vi.fn()

    const Host = defineComponent({
      setup() {
        const rootRef = ref<HTMLElement | null>(null)
        useDismissable(rootRef, { active: false, onDismiss })
        return () => h('div', { ref: rootRef }, 'panel')
      },
    })

    wrapper = mount(Host, { attachTo: document.body })
    await nextTick()

    dispatchEscape()
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('skips Escape when escape is false', async () => {
    const onDismiss = vi.fn()

    const Host = defineComponent({
      setup() {
        const rootRef = ref<HTMLElement | null>(null)
        useDismissable(rootRef, { active: true, onDismiss, escape: false })
        return () => h('div', { ref: rootRef }, 'panel')
      },
    })

    wrapper = mount(Host, { attachTo: document.body })
    await nextTick()

    dispatchEscape()
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('dismisses on outside pointerdown when outside is true', async () => {
    const onDismiss = vi.fn()

    const Host = defineComponent({
      setup() {
        const rootRef = ref<HTMLElement | null>(null)
        useDismissable(rootRef, { active: true, onDismiss, outside: true })
        return () => h('div', { ref: rootRef, id: 'panel' }, 'panel')
      },
    })

    wrapper = mount(Host, { attachTo: document.body })
    await nextTick()

    dispatchPointerDown(document.body)
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('does not dismiss on inside pointerdown', async () => {
    const onDismiss = vi.fn()

    const Host = defineComponent({
      setup() {
        const rootRef = ref<HTMLElement | null>(null)
        useDismissable(rootRef, { active: true, onDismiss, outside: true })
        return () =>
          h('div', { ref: rootRef, id: 'panel' }, [
            h('button', { id: 'inside' }, 'inside'),
          ])
      },
    })

    wrapper = mount(Host, { attachTo: document.body })
    await nextTick()

    dispatchPointerDown(document.getElementById('inside')!)
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('does not listen for outside clicks by default', async () => {
    const onDismiss = vi.fn()

    const Host = defineComponent({
      setup() {
        const rootRef = ref<HTMLElement | null>(null)
        useDismissable(rootRef, { active: true, onDismiss })
        return () => h('div', { ref: rootRef }, 'panel')
      },
    })

    wrapper = mount(Host, { attachTo: document.body })
    await nextTick()

    dispatchPointerDown(document.body)
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('only the topmost dismissable handles Escape', async () => {
    const outerDismiss = vi.fn()
    const innerDismiss = vi.fn()

    const Host = defineComponent({
      setup() {
        const outerRef = ref<HTMLElement | null>(null)
        const innerRef = ref<HTMLElement | null>(null)
        useDismissable(outerRef, { active: true, onDismiss: outerDismiss })
        useDismissable(innerRef, { active: true, onDismiss: innerDismiss })
        return () =>
          h('div', { ref: outerRef }, [h('div', { ref: innerRef }, 'inner')])
      },
    })

    wrapper = mount(Host, { attachTo: document.body })
    await nextTick()

    dispatchEscape()
    expect(innerDismiss).toHaveBeenCalledTimes(1)
    expect(outerDismiss).not.toHaveBeenCalled()
  })

  it('only topmost overlay stack entry handles Escape', async () => {
    const outerDismiss = vi.fn()
    const innerDismiss = vi.fn()

    const Outer = defineComponent({
      setup() {
        const rootRef = ref<HTMLElement | null>(null)
        const stack = useOverlayStack('modal')
        stack.register()
        useDismissable(rootRef, { active: true, onDismiss: outerDismiss })
        return () => h('div', { ref: rootRef, id: 'outer' }, 'outer')
      },
    })

    const Inner = defineComponent({
      setup() {
        const rootRef = ref<HTMLElement | null>(null)
        const stack = useOverlayStack('modal')
        stack.register()
        useDismissable(rootRef, { active: true, onDismiss: innerDismiss })
        return () => h('div', { ref: rootRef, id: 'inner' }, 'inner')
      },
    })

    const Root = defineComponent({
      setup() {
        return () => h('div', [h(Outer), h(Inner)])
      },
    })

    wrapper = mount(Root, { attachTo: document.body })
    await nextTick()

    dispatchEscape()
    expect(innerDismiss).toHaveBeenCalledTimes(1)
    expect(outerDismiss).not.toHaveBeenCalled()
  })

  it('restores Escape ownership after top overlay closes', async () => {
    const outerOnDismiss = vi.fn()
    const innerOnDismiss = vi.fn()
    const innerOpen = ref(true)

    const Host = defineComponent({
      setup() {
        const outerRef = ref<HTMLElement | null>(null)
        const innerRef = ref<HTMLElement | null>(null)
        const outer = useOverlayStack('modal')
        const inner = useOverlayStack('modal')

        outer.register()
        inner.register()

        useDismissable(outerRef, {
          active: true,
          onDismiss: outerOnDismiss,
        })
        useDismissable(innerRef, {
          active: innerOpen,
          onDismiss: innerOnDismiss,
        })

        return () =>
          h('div', [
            h('div', { ref: outerRef, id: 'outer' }, 'outer'),
            innerOpen.value
              ? h('div', { ref: innerRef, id: 'inner' }, 'inner')
              : null,
            h(
              'button',
              {
                id: 'close-inner',
                onClick: () => {
                  inner.unregister()
                  innerOpen.value = false
                },
              },
              'close',
            ),
          ])
      },
    })

    wrapper = mount(Host, { attachTo: document.body })
    await nextTick()

    dispatchEscape()
    expect(innerOnDismiss).toHaveBeenCalledTimes(1)
    expect(outerOnDismiss).not.toHaveBeenCalled()

    await wrapper.find('#close-inner').trigger('click')
    await nextTick()

    innerOnDismiss.mockClear()
    outerOnDismiss.mockClear()

    dispatchEscape()
    expect(outerOnDismiss).toHaveBeenCalledTimes(1)
    expect(innerOnDismiss).not.toHaveBeenCalled()
  })
})
