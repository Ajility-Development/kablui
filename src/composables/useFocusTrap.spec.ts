import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, effectScope, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useFocusTrap } from './useFocusTrap'

function flushFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

function pressTab(shiftKey = false): void {
  document.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Tab',
      code: 'Tab',
      shiftKey,
      bubbles: true,
      cancelable: true,
    }),
  )
}

describe('useFocusTrap', () => {
  let outside: HTMLButtonElement

  beforeEach(() => {
    outside = document.createElement('button')
    outside.textContent = 'outside'
    document.body.appendChild(outside)
    outside.focus()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('focuses the first tabbable on activate and restores focus on deactivate', async () => {
    const active = ref(false)
    const containerRef = ref<HTMLElement | null>(null)

    const Host = defineComponent({
      setup() {
        useFocusTrap(containerRef, { active })
        return () =>
          h('div', { ref: containerRef }, [
            h('button', { id: 'first' }, 'First'),
            h('button', { id: 'second' }, 'Second'),
          ])
      },
    })

    mount(Host, { attachTo: document.body })
    expect(document.activeElement).toBe(outside)

    active.value = true
    await nextTick()
    await flushFrame()
    expect(document.activeElement?.id).toBe('first')

    active.value = false
    await nextTick()
    expect(document.activeElement).toBe(outside)
  })

  it('cycles Tab from last to first and Shift+Tab from first to last', async () => {
    const active = ref(true)
    const containerRef = ref<HTMLElement | null>(null)

    const Host = defineComponent({
      setup() {
        useFocusTrap(containerRef, { active })
        return () =>
          h('div', { ref: containerRef }, [
            h('button', { id: 'first' }, 'First'),
            h('button', { id: 'middle' }, 'Middle'),
            h('button', { id: 'last' }, 'Last'),
          ])
      },
    })

    mount(Host, { attachTo: document.body })
    await nextTick()
    await flushFrame()
    expect(document.activeElement?.id).toBe('first')

    document.getElementById('last')!.focus()
    pressTab(false)
    expect(document.activeElement?.id).toBe('first')

    pressTab(true)
    expect(document.activeElement?.id).toBe('last')
  })

  it('stops trapping when the effect scope is disposed', async () => {
    const active = ref(true)
    const containerRef = ref<HTMLElement | null>(null)
    const container = document.createElement('div')
    const first = document.createElement('button')
    first.id = 'scoped-first'
    first.textContent = 'First'
    container.appendChild(first)
    document.body.appendChild(container)
    containerRef.value = container

    const scope = effectScope()
    scope.run(() => {
      useFocusTrap(containerRef, { active })
    })

    await flushFrame()
    expect(document.activeElement?.id).toBe('scoped-first')

    scope.stop()
    await nextTick()
    expect(document.activeElement).toBe(outside)

    // Listener removed: Tab at last should not wrap (native behavior / no-op in jsdom)
    const last = document.createElement('button')
    last.id = 'scoped-last'
    container.appendChild(last)
    last.focus()
    const spy = vi.spyOn(first, 'focus')
    pressTab(false)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})
