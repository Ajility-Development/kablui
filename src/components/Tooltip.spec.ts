import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { expectNoA11yViolations } from '../test/a11y'
import type { FloatingPlacement } from '../composables/useFloating'
import { __resetIdCounter } from '../composables/useId'
import Field from './Field.vue'
import FieldError from './FieldError.vue'
import FieldHint from './FieldHint.vue'
import Input from './Input.vue'
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
  props: { content?: string; delay?: number; placement?: FloatingPlacement } = {},
  triggerAttrs: Record<string, string> = {},
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
          () => h('button', { type: 'button', ...triggerAttrs }, 'Hover me'),
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

  it('merges tooltip id with pre-existing aria-describedby and removes only tooltip id on hide', async () => {
    mountTooltip({}, { 'aria-describedby': 'hint-id error-id' })
    const button = wrapper!.find('button')
    const el = button.element as HTMLElement

    await button.trigger('focusin')
    await vi.advanceTimersByTimeAsync(300)
    await nextTick()

    const tip = document.querySelector('[role="tooltip"]')
    expect(tip).not.toBeNull()
    const describedBy = el.getAttribute('aria-describedby') ?? ''
    const tokens = describedBy.split(/\s+/).filter(Boolean)
    expect(tokens).toContain('hint-id')
    expect(tokens).toContain('error-id')
    expect(tokens).toContain(tip!.id)

    await button.trigger('focusout')
    await vi.advanceTimersByTimeAsync(0)
    await nextTick()

    expect(el.getAttribute('aria-describedby')).toBe('hint-id error-id')
  })

  it('re-merges tooltip id after Vue patches aria-describedby while open', async () => {
    mountTooltip({ delay: 0 }, { 'aria-describedby': 'hint-id' })
    const button = wrapper!.find('button')
    const el = button.element as HTMLElement

    await button.trigger('focusin')
    await vi.advanceTimersByTimeAsync(0)
    await nextTick()

    const tip = document.querySelector('[role="tooltip"]')
    expect(tip).not.toBeNull()
    expect(el.getAttribute('aria-describedby')?.split(/\s+/)).toContain(tip!.id)

    // Simulate Vue / Field rewriting the attribute without the tooltip token.
    el.setAttribute('aria-describedby', 'hint-id error-id')
    await nextTick()
    await Promise.resolve()

    const tokens = (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean)
    expect(tokens).toContain('hint-id')
    expect(tokens).toContain('error-id')
    expect(tokens).toContain(tip!.id)
  })

  it('preserves Field hint/error ids while Tooltip is open on Input', async () => {
    const Host = defineComponent({
      setup() {
        const value = ref('')
        return () =>
          h(Field, { invalid: true, id: 'email' }, () => [
            h(
              Tooltip,
              { content: 'More about email', delay: 0 },
              () =>
                h(Input, {
                  'modelValue': value.value,
                  'onUpdate:modelValue': (v: string) => {
                    value.value = v
                  },
                }),
            ),
            h(FieldHint, null, () => 'Work email'),
            h(FieldError, null, () => 'Required'),
          ])
      },
    })

    wrapper = mount(Host, { attachTo: document.body })
    await nextTick()

    const input = wrapper.find('input')
    const hint = wrapper.find('[data-slot="field-hint"]')
    const error = wrapper.find('[data-slot="field-error"]')
    const hintId = hint.attributes('id')!
    const errorId = error.attributes('id')!

    expect(input.attributes('aria-describedby')).toContain(hintId)
    expect(input.attributes('aria-describedby')).toContain(errorId)

    await input.trigger('focusin')
    await vi.advanceTimersByTimeAsync(0)
    await nextTick()

    const tip = document.querySelector('[role="tooltip"]')
    expect(tip).not.toBeNull()

    const describedBy = input.attributes('aria-describedby') ?? ''
    expect(describedBy).toContain(hintId)
    expect(describedBy).toContain(errorId)
    expect(describedBy).toContain(tip!.id)

    // Field may re-patch describedby; tooltip token must survive.
    await nextTick()
    const afterPatch = input.attributes('aria-describedby') ?? ''
    expect(afterPatch).toContain(hintId)
    expect(afterPatch).toContain(errorId)
    expect(afterPatch).toContain(tip!.id)

    await input.trigger('focusout')
    await vi.advanceTimersByTimeAsync(0)
    await nextTick()

    const afterHide = input.attributes('aria-describedby') ?? ''
    expect(afterHide).toContain(hintId)
    expect(afterHide).toContain(errorId)
    expect(afterHide).not.toContain(tip!.id)
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
