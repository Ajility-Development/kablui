import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { expectNoA11yViolations } from '../test/a11y'
import { __resetDismissableStack } from '../composables/useDismissable'
import { __resetOverlayStack } from '../composables/useOverlayStack'
import Popover from './Popover.vue'
import PopoverContent from './PopoverContent.vue'
import PopoverTrigger from './PopoverTrigger.vue'

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

function mountPopover(props: { open?: boolean; placement?: string } = {}) {
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

describe('Popover', () => {
  it('toggles open via trigger click and aria-expanded', async () => {
    const { open } = mountPopover()
    const trigger = wrapper!.find('[data-slot="popover-trigger"]')

    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-haspopup')).toBe('dialog')
    expect(document.querySelector('[data-slot="popover-content"]')).toBeNull()

    await trigger.trigger('click')
    await nextTick()

    expect(open.value).toBe(true)
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(document.querySelector('[data-slot="popover-content"]')).not.toBeNull()
  })

  it('dismisses on Escape', async () => {
    const { open } = mountPopover({ open: true })
    await nextTick()

    expect(document.querySelector('[data-slot="popover-content"]')).not.toBeNull()

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    await nextTick()

    expect(open.value).toBe(false)
    expect(document.querySelector('[data-slot="popover-content"]')).toBeNull()
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
    expect(document.querySelector('[data-slot="popover-content"]')).not.toBeNull()

    open.value = false
    await nextTick()
    expect(document.querySelector('[data-slot="popover-content"]')).toBeNull()
  })

  it('uses dropdown stacking classes', async () => {
    mountPopover({ open: true })
    await nextTick()
    const content = document.querySelector('[data-slot="popover-content"]')
    expect(content?.className).toContain('z-kablui-dropdown')
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
