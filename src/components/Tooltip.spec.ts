import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { expectNoA11yViolations } from '../test/a11y'
import { __resetIdCounter } from '../composables/useId'
import Tooltip from './Tooltip.vue'

let wrapper: VueWrapper | undefined

beforeEach(() => {
  __resetIdCounter()
  vi.useFakeTimers()
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
  vi.useRealTimers()
})

function mountTooltip(
  props: { content?: string; delay?: number; placement?: string } = {},
) {
  const Host = defineComponent({
    setup() {
      return () =>
        h(
          Tooltip,
          {
            content: props.content ?? 'Tip text',
            delay: props.delay ?? 300,
            placement: props.placement ?? 'top',
          },
          () => h('button', { type: 'button' }, 'Hover me'),
        )
    },
  })

  wrapper = mount(Host, { attachTo: document.body })
}

describe('Tooltip', () => {
  it('shows on focus after delay and sets aria-describedby', async () => {
    mountTooltip()
    const button = wrapper!.find('button')

    await button.trigger('focusin')
    expect(document.querySelector('[role="tooltip"]')).toBeNull()

    await vi.advanceTimersByTimeAsync(300)
    await nextTick()

    const tip = document.querySelector('[role="tooltip"]')
    expect(tip).not.toBeNull()
    expect(tip?.textContent).toContain('Tip text')
    expect(button.attributes('aria-describedby')).toBe(tip?.id)
  })

  it('hides on blur and clears aria-describedby', async () => {
    mountTooltip()
    const button = wrapper!.find('button')

    await button.trigger('focusin')
    await vi.advanceTimersByTimeAsync(300)
    await nextTick()

    expect(document.querySelector('[role="tooltip"]')).not.toBeNull()

    await button.trigger('focusout')
    await vi.advanceTimersByTimeAsync(0)
    await nextTick()

    expect(document.querySelector('[role="tooltip"]')).toBeNull()
    expect(button.attributes('aria-describedby')).toBeUndefined()
  })

  it('shows on pointerenter after delay when hover is available', async () => {
    mountTooltip({ delay: 300 })
    const root = wrapper!.find('[data-slot="tooltip"]')

    await root.trigger('pointerenter')
    expect(document.querySelector('[role="tooltip"]')).toBeNull()

    await vi.advanceTimersByTimeAsync(300)
    await nextTick()

    expect(document.querySelector('[role="tooltip"]')).not.toBeNull()
  })

  it('ignores hover when matchMedia reports no hover', async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      })),
    })

    mountTooltip()
    const root = wrapper!.find('[data-slot="tooltip"]')

    await root.trigger('pointerenter')
    await vi.advanceTimersByTimeAsync(300)
    await nextTick()

    expect(document.querySelector('[role="tooltip"]')).toBeNull()
  })

  it('renders content slot and placement attribute', async () => {
    const Host = defineComponent({
      setup() {
        return () =>
          h(
            Tooltip,
            { delay: 0, placement: 'bottom-start' },
            {
              default: () => h('button', { type: 'button' }, 'Target'),
              content: () => 'Slot tip',
            },
          )
      },
    })

    wrapper = mount(Host, { attachTo: document.body })
    await wrapper.find('button').trigger('focusin')
    await vi.advanceTimersByTimeAsync(0)
    await nextTick()

    const tip = document.querySelector('[role="tooltip"]')
    expect(tip?.textContent).toContain('Slot tip')
    expect(tip?.getAttribute('data-placement')).toBe('bottom-start')
    expect(tip?.className).toContain('z-kablui-tooltip')
    expect(tip?.className).toContain('pointer-events-none')
  })
})

describe('a11y', () => {
  it('has no axe violations when open', async () => {
    const Host = defineComponent({
      setup() {
        return () =>
          h('main', null, [
            h(
              Tooltip,
              { content: 'Tip text', delay: 0 },
              () => h('button', { type: 'button' }, 'Hover me'),
            ),
          ])
      },
    })
    wrapper = mount(Host, { attachTo: document.body })
    await wrapper.find('button').trigger('focusin')
    await vi.advanceTimersByTimeAsync(0)
    await nextTick()
    // Tooltip teleports to body; reparent into the landmark for page-level region.
    const portal = document.querySelector('[role="tooltip"]')
    const landmark = document.querySelector('main')
    expect(portal).not.toBeNull()
    expect(landmark).not.toBeNull()
    landmark!.appendChild(portal!)
    // axe needs real timers; suite uses fake timers for delay control
    vi.useRealTimers()
    await expectNoA11yViolations(document.body)
  })
})
