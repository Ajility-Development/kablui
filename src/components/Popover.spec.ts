import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { expectNoA11yViolations } from '../test/a11y'
import { __resetDismissibleStack } from '../composables/useDismissible'
import type { FloatingPlacement } from '../composables/useFloating'
import { __resetOverlayStack } from '../composables/useOverlayStack'
import Popover from './Popover.vue'
import PopoverContent from './PopoverContent.vue'
import PopoverTrigger from './PopoverTrigger.vue'

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

function mountPopover(props: { open?: boolean; placement?: FloatingPlacement } = {}) {
  const open = ref(props.open ?? false)

  const Host = defineComponent({
    setup() {
      return () =>
        h(
          Popover,
          {
            open: open.value,
            'onUpdate:open': (value: boolean) => {
              open.value = value
            },
            placement: props.placement ?? 'bottom-start',
          },
          () => [
            h(PopoverTrigger, null, () => 'Open'),
            h(PopoverContent, null, () => 'Popover body'),
          ],
        )
    },
  })

  wrapper = mount(Host, { attachTo: document.body })
  return { open }
}

function contentEl() {
  return document.querySelector('[data-slot="popover-content"]') as HTMLElement | null
}

function contentIsShown() {
  const el = contentEl()
  return !!el && el.style.display !== 'none'
}

async function flushMeasure() {
  await nextTick()
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

type Rect = Pick<DOMRect, 'top' | 'right' | 'bottom' | 'left' | 'width' | 'height' | 'x' | 'y'>

function rect(partial: Partial<Rect>): DOMRect {
  const top = partial.top ?? 0
  const left = partial.left ?? 0
  const width = partial.width ?? 0
  const height = partial.height ?? 0
  return {
    top,
    left,
    width,
    height,
    right: partial.right ?? left + width,
    bottom: partial.bottom ?? top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect
}

describe('Popover', () => {
  it('toggles open via trigger click and aria-expanded', async () => {
    const { open } = mountPopover()
    const trigger = wrapper!.find('[data-slot="popover-trigger"]')

    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-haspopup')).toBe('dialog')
    expect(contentIsShown()).toBe(false)

    await trigger.trigger('click')
    await nextTick()

    expect(open.value).toBe(true)
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(contentIsShown()).toBe(true)
  })

  it('positions content with fixed coordinates on first open without scroll', async () => {
    mountPopover()
    const trigger = wrapper!.find('[data-slot="popover-trigger"]')
    const triggerEl = trigger.element as HTMLElement
    const content = contentEl()
    expect(content).not.toBeNull()

    vi.spyOn(triggerEl, 'getBoundingClientRect').mockReturnValue(
      rect({ top: 100, left: 200, width: 80, height: 32 }),
    )
    vi.spyOn(content!, 'getBoundingClientRect').mockReturnValue(
      rect({ width: 120, height: 40 }),
    )

    await trigger.trigger('click')
    await flushMeasure()

    expect(contentIsShown()).toBe(true)
    expect(content!.style.position).toBe('fixed')
    expect(content!.style.top).toBe('132px')
    expect(content!.style.left).toBe('200px')
    expect(content!.style.visibility).not.toBe('hidden')
  })

  it('exposes default data-testid matching data-slot names', async () => {
    mountPopover({ open: true })
    await nextTick()

    expect(wrapper!.find('[data-testid="popover"]').exists()).toBe(true)
    expect(wrapper!.find('[data-testid="popover-trigger"]').exists()).toBe(true)
    expect(document.querySelector('[data-testid="popover-content"]')).not.toBeNull()
  })

  it('dismisses on Escape', async () => {
    const { open } = mountPopover({ open: true })
    await nextTick()

    expect(contentIsShown()).toBe(true)

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    await nextTick()

    expect(open.value).toBe(false)
    expect(contentIsShown()).toBe(false)
  })

  it('dismisses on outside pointerdown', async () => {
    const { open } = mountPopover({ open: true })
    await nextTick()

    document.body.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, composed: true }),
    )
    await nextTick()

    expect(open.value).toBe(false)
  })

  it('does not dismiss when pointerdown is inside content', async () => {
    const { open } = mountPopover({ open: true })
    await nextTick()

    const content = document.querySelector('[data-slot="popover-content"]')!
    content.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, composed: true }),
    )
    await nextTick()

    expect(open.value).toBe(true)
  })

  it('exposes data-placement on content', async () => {
    mountPopover({ open: true, placement: 'top-end' })
    await nextTick()

    const content = document.querySelector('[data-slot="popover-content"]')
    expect(content?.getAttribute('data-placement')).toBe('top-end')
  })

  it('forwards attrs to the teleported dialog panel', async () => {
    const open = ref(true)
    const Host = defineComponent({
      setup() {
        return () =>
          h(
            Popover,
            {
              open: open.value,
              'onUpdate:open': (value: boolean) => {
                open.value = value
              },
            },
            () => [
              h(PopoverTrigger, null, () => 'Open'),
              h(
                PopoverContent,
                { 'aria-label': 'Details' },
                () => 'Popover body',
              ),
            ],
          )
      },
    })
    wrapper = mount(Host, { attachTo: document.body })
    await nextTick()

    const content = document.querySelector('[data-slot="popover-content"]')
    expect(content?.getAttribute('role')).toBe('dialog')
    expect(content?.getAttribute('aria-label')).toBe('Details')
  })

  it('focuses content when opened via keyboard', async () => {
    mountPopover()
    const trigger = wrapper!.find('[data-slot="popover-trigger"]')
    const button = trigger.element as HTMLButtonElement
    button.focus()

    await trigger.trigger('keydown', { key: 'Enter' })
    await nextTick()
    await nextTick()

    const content = document.querySelector(
      '[data-slot="popover-content"]',
    ) as HTMLElement | null
    expect(content).not.toBeNull()
    expect(document.activeElement).toBe(content)
  })

  it('restores focus to trigger on close', async () => {
    mountPopover()
    const trigger = wrapper!.find('[data-slot="popover-trigger"]')
    const button = trigger.element as HTMLButtonElement
    button.focus()

    await trigger.trigger('keydown', { key: 'Enter' })
    await nextTick()
    await nextTick()

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    await nextTick()
    await nextTick()

    expect(document.activeElement).toBe(button)
  })

  it('supports controlled v-model:open', async () => {
    const open = ref(false)
    const Host = defineComponent({
      setup() {
        return () =>
          h(
            Popover,
            {
              open: open.value,
              'onUpdate:open': (value: boolean) => {
                open.value = value
              },
            },
            () => [
              h(PopoverTrigger, null, () => 'Open'),
              h(PopoverContent, null, () => 'Body'),
            ],
          )
      },
    })

    wrapper = mount(Host, { attachTo: document.body })
    open.value = true
    await nextTick()
    expect(contentIsShown()).toBe(true)

    open.value = false
    await nextTick()
    expect(contentIsShown()).toBe(false)
  })

  it('uses menu stacking classes', async () => {
    mountPopover({ open: true })
    await nextTick()
    const content = document.querySelector('[data-slot="popover-content"]')
    expect(content?.className).toContain('z-kablui-menu')
    expect(content?.className).toContain('shadow-kablui-md')
  })

  it('warns when Trigger is used outside Popover', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const orphan = mount(PopoverTrigger, { slots: { default: () => 'x' } })
    expect(warn).toHaveBeenCalled()
    orphan.unmount()
    warn.mockRestore()
  })
})

describe('a11y', () => {
  it('has no axe violations when open', async () => {
    const open = ref(true)
    const Host = defineComponent({
      setup() {
        return () =>
          h('main', null, [
            h(
              Popover,
              {
                open: open.value,
                'onUpdate:open': (value: boolean) => {
                  open.value = value
                },
              },
              () => [
                h(PopoverTrigger, null, () => 'Open'),
                h(
                  PopoverContent,
                  { 'aria-label': 'Details' },
                  () => 'Popover body',
                ),
              ],
            ),
          ])
      },
    })
    wrapper = mount(Host, { attachTo: document.body })
    await nextTick()
    // PopoverContent teleports to body; reparent into the landmark for page-level region.
    const portal = document.querySelector('[data-slot="popover-content"]')
    const landmark = document.querySelector('main')
    expect(portal).not.toBeNull()
    expect(landmark).not.toBeNull()
    landmark!.appendChild(portal!)
    await expectNoA11yViolations(document.body)
  })
})
