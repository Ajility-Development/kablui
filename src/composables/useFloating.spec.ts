import { defineComponent, h, nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import {
  useFloating,
  type FloatingPlacement,
} from './useFloating'

type Rect = Pick<DOMRect, 'top' | 'right' | 'bottom' | 'left' | 'width' | 'height' | 'x' | 'y'>

function rect(partial: Partial<Rect>): DOMRect {
  const top = partial.top ?? 0
  const left = partial.left ?? 0
  const width = partial.width ?? 0
  const height = partial.height ?? 0
  const right = partial.right ?? left + width
  const bottom = partial.bottom ?? top + height
  return {
    top,
    left,
    width,
    height,
    right,
    bottom,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect
}

function mockRect(el: HTMLElement, value: DOMRect) {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(value)
}

async function flushMeasure() {
  await nextTick()
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

describe('useFloating', () => {
  let originalInnerWidth: number
  let originalInnerHeight: number

  beforeEach(() => {
    originalInnerWidth = window.innerWidth
    originalInnerHeight = window.innerHeight
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 800 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 600 })
  })

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: originalInnerWidth,
    })
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: originalInnerHeight,
    })
    vi.restoreAllMocks()
  })

  function mountFloating(options: {
    open?: boolean
    placement?: FloatingPlacement
    anchorRect: DOMRect
    floatingRect: DOMRect
  }) {
    const open = ref(options.open ?? true)
    const placement = ref<FloatingPlacement>(options.placement ?? 'bottom-start')
    const styleSnapshot = ref<Record<string, string>>({})

    const Host = defineComponent({
      setup() {
        const anchorRef = ref<HTMLElement | null>(null)
        const floatingRef = ref<HTMLElement | null>(null)
        const { style } = useFloating(anchorRef, floatingRef, { open, placement })

        return () => {
          styleSnapshot.value = { ...(style.value as Record<string, string>) }
          return h('div', [
            h('button', { ref: anchorRef, 'data-testid': 'anchor' }, 'anchor'),
            h(
              'div',
              { ref: floatingRef, 'data-testid': 'floating', style: style.value },
              'floating',
            ),
          ])
        }
      },
    })

    const wrapper = mount(Host)
    const anchor = wrapper.get('[data-testid="anchor"]').element as HTMLElement
    const floating = wrapper.get('[data-testid="floating"]').element as HTMLElement
    mockRect(anchor, options.anchorRect)
    mockRect(floating, options.floatingRect)
    // Recompute now that rect mocks are attached
    window.dispatchEvent(new Event('resize'))

    return { wrapper, open, placement, styleSnapshot, anchor, floating }
  }

  it('returns empty style when closed', async () => {
    const { styleSnapshot, open } = mountFloating({
      open: false,
      anchorRect: rect({ top: 100, left: 100, width: 80, height: 32 }),
      floatingRect: rect({ width: 120, height: 40 }),
    })

    await nextTick()
    expect(styleSnapshot.value).toEqual({})

    open.value = true
    await nextTick()
    expect(styleSnapshot.value.position).toBe('fixed')
  })

  it('uses pending fixed/hidden style when open but floating el is missing', async () => {
    const open = ref(true)
    const placement = ref<FloatingPlacement>('bottom-start')
    const styleSnapshot = ref<Record<string, string>>({})

    const Host = defineComponent({
      setup() {
        const anchorRef = ref<HTMLElement | null>(null)
        const floatingRef = ref<HTMLElement | null>(null)
        const { style } = useFloating(anchorRef, floatingRef, { open, placement })

        return () => {
          styleSnapshot.value = { ...(style.value as Record<string, string>) }
          return h('div', [
            h('button', { ref: anchorRef, 'data-testid': 'anchor' }, 'anchor'),
            // floatingRef intentionally left null
          ])
        }
      },
    })

    const wrapper = mount(Host)
    await flushMeasure()

    expect(styleSnapshot.value).toEqual({
      position: 'fixed',
      visibility: 'hidden',
      top: '0px',
      left: '0px',
    })
    wrapper.unmount()
  })

  it('measures on open via nextTick + rAF without scroll', async () => {
    const open = ref(false)
    const placement = ref<FloatingPlacement>('bottom-start')
    const styleSnapshot = ref<Record<string, string>>({})

    const Host = defineComponent({
      setup() {
        const anchorRef = ref<HTMLElement | null>(null)
        const floatingRef = ref<HTMLElement | null>(null)
        const { style } = useFloating(anchorRef, floatingRef, { open, placement })

        return () => {
          styleSnapshot.value = { ...(style.value as Record<string, string>) }
          return h('div', [
            h('button', { ref: anchorRef, 'data-testid': 'anchor' }, 'anchor'),
            h(
              'div',
              { ref: floatingRef, 'data-testid': 'floating', style: style.value },
              'floating',
            ),
          ])
        }
      },
    })

    const wrapper = mount(Host)
    const anchor = wrapper.get('[data-testid="anchor"]').element as HTMLElement
    const floating = wrapper.get('[data-testid="floating"]').element as HTMLElement
    mockRect(anchor, rect({ top: 100, left: 200, width: 80, height: 32 }))
    mockRect(floating, rect({ width: 120, height: 40 }))

    open.value = true
    await flushMeasure()

    expect(styleSnapshot.value).toEqual({
      position: 'fixed',
      top: '132px',
      left: '200px',
    })
    wrapper.unmount()
  })

  it('positions bottom-start with position: fixed', async () => {
    const { styleSnapshot } = mountFloating({
      placement: 'bottom-start',
      anchorRect: rect({ top: 100, left: 200, width: 80, height: 32 }),
      floatingRect: rect({ width: 120, height: 40 }),
    })

    // Force a recompute after mocks are in place
    window.dispatchEvent(new Event('resize'))
    await nextTick()

    expect(styleSnapshot.value).toEqual({
      position: 'fixed',
      top: '132px',
      left: '200px',
    })
  })

  it('positions top-end, left-center, and right-start', async () => {
    const cases: Array<{
      placement: FloatingPlacement
      top: string
      left: string
    }> = [
      {
        placement: 'top-end',
        // anchor bottom 132? top 100 height 32 → floating above: y = 100 - 40 = 60
        // end: left = 200 + 80 - 120 = 160
        top: '60px',
        left: '160px',
      },
      {
        placement: 'left',
        // center align Y: 100 + (32 - 40) / 2 = 96; x = 200 - 120 = 80
        top: '96px',
        left: '80px',
      },
      {
        placement: 'right-start',
        // x = 280; y = 100
        top: '100px',
        left: '280px',
      },
    ]

    for (const c of cases) {
      const { wrapper, styleSnapshot } = mountFloating({
        placement: c.placement,
        anchorRect: rect({ top: 100, left: 200, width: 80, height: 32 }),
        floatingRect: rect({ width: 120, height: 40 }),
      })
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      expect(styleSnapshot.value, c.placement).toEqual({
        position: 'fixed',
        top: c.top,
        left: c.left,
      })
      wrapper.unmount()
    }
  })

  it('flips bottom to top when clipped by the viewport', async () => {
    const { styleSnapshot } = mountFloating({
      placement: 'bottom-start',
      // near bottom of 600px viewport; floating height 80 would overflow
      anchorRect: rect({ top: 560, left: 100, width: 60, height: 30 }),
      floatingRect: rect({ width: 100, height: 80 }),
    })

    window.dispatchEvent(new Event('resize'))
    await nextTick()

    // flipped to top: y = 560 - 80 = 480
    expect(styleSnapshot.value).toEqual({
      position: 'fixed',
      top: '480px',
      left: '100px',
    })
  })

  it('flips right to left when clipped by the viewport', async () => {
    const { styleSnapshot } = mountFloating({
      placement: 'right-start',
      anchorRect: rect({ top: 100, left: 740, width: 50, height: 30 }),
      floatingRect: rect({ width: 100, height: 40 }),
    })

    window.dispatchEvent(new Event('resize'))
    await nextTick()

    // flipped to left: x = 740 - 100 = 640
    expect(styleSnapshot.value).toEqual({
      position: 'fixed',
      top: '100px',
      left: '640px',
    })
  })

  it('recomputes on scroll and resize', async () => {
    const { styleSnapshot, anchor, floating } = mountFloating({
      placement: 'bottom-start',
      anchorRect: rect({ top: 100, left: 50, width: 40, height: 20 }),
      floatingRect: rect({ width: 80, height: 30 }),
    })

    window.dispatchEvent(new Event('resize'))
    await nextTick()
    expect(styleSnapshot.value.top).toBe('120px')
    expect(styleSnapshot.value.left).toBe('50px')

    mockRect(anchor, rect({ top: 200, left: 90, width: 40, height: 20 }))
    mockRect(floating, rect({ width: 80, height: 30 }))

    window.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(styleSnapshot.value.top).toBe('220px')
    expect(styleSnapshot.value.left).toBe('90px')

    mockRect(anchor, rect({ top: 40, left: 10, width: 40, height: 20 }))
    window.dispatchEvent(new Event('resize'))
    await nextTick()
    expect(styleSnapshot.value.top).toBe('60px')
    expect(styleSnapshot.value.left).toBe('10px')
  })

  it('updates when placement changes', async () => {
    const { styleSnapshot, placement } = mountFloating({
      placement: 'bottom-start',
      anchorRect: rect({ top: 100, left: 100, width: 80, height: 32 }),
      floatingRect: rect({ width: 120, height: 40 }),
    })

    window.dispatchEvent(new Event('resize'))
    await nextTick()
    expect(styleSnapshot.value.top).toBe('132px')

    placement.value = 'top-start'
    await nextTick()
    expect(styleSnapshot.value).toEqual({
      position: 'fixed',
      top: '60px',
      left: '100px',
    })
  })

  it('stops listening when closed and cleans up on unmount', async () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { wrapper, open } = mountFloating({
      open: true,
      anchorRect: rect({ top: 10, left: 10, width: 20, height: 20 }),
      floatingRect: rect({ width: 40, height: 20 }),
    })

    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true)
    expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function))

    open.value = false
    await nextTick()
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true)
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))

    open.value = true
    await nextTick()
    wrapper.unmount()
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true)
  })
})
