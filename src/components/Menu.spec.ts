import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { __resetDismissableStack } from '../composables/useDismissable'
import { __resetOverlayStack } from '../composables/useOverlayStack'
import Menu from './Menu.vue'
import MenuContent from './MenuContent.vue'
import MenuItem from './MenuItem.vue'
import MenuSeparator from './MenuSeparator.vue'
import MenuTrigger from './MenuTrigger.vue'

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

function mountMenu(
  props: { open?: boolean; placement?: string } = {},
  options: { withDisabled?: boolean; onSelect?: () => void } = {},
) {
  const open = ref(props.open ?? false)
  const selected = ref<string | null>(null)

  const Host = defineComponent({
    setup() {
      return () =>
        h(
          Menu,
          {
            open: open.value,
            'onUpdate:open': (value: boolean) => {
              open.value = value
            },
            placement: props.placement ?? 'bottom-start',
          },
          () => [
            h(MenuTrigger, null, () => 'Actions'),
            h(MenuContent, null, () => [
              h(
                MenuItem,
                {
                  onSelect: () => {
                    selected.value = 'edit'
                    options.onSelect?.()
                  },
                },
                () => 'Edit',
              ),
              h(MenuSeparator),
              h(
                MenuItem,
                {
                  disabled: options.withDisabled ? true : undefined,
                  onSelect: () => {
                    selected.value = 'delete'
                    options.onSelect?.()
                  },
                },
                () => 'Delete',
              ),
              h(
                MenuItem,
                {
                  onSelect: () => {
                    selected.value = 'share'
                    options.onSelect?.()
                  },
                },
                () => 'Share',
              ),
            ]),
          ],
        )
    },
  })

  wrapper = mount(Host, { attachTo: document.body })
  return { open, selected }
}

async function flushFocus() {
  await nextTick()
  await nextTick()
}

describe('Menu', () => {
  it('toggles open via trigger click and exposes menu ARIA', async () => {
    const { open } = mountMenu()
    const trigger = wrapper!.find('[data-slot="menu-trigger"]')

    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-haspopup')).toBe('menu')
    expect(trigger.attributes('aria-controls')).toBeTruthy()
    expect(document.querySelector('[data-slot="menu-content"]')).toBeNull()

    await trigger.trigger('click')
    await nextTick()

    expect(open.value).toBe(true)
    expect(trigger.attributes('aria-expanded')).toBe('true')

    const content = document.querySelector('[data-slot="menu-content"]')
    expect(content).not.toBeNull()
    expect(content?.getAttribute('role')).toBe('menu')
    expect(content?.id).toBe(trigger.attributes('aria-controls'))
  })

  it('closes when a MenuItem is selected', async () => {
    const onSelect = vi.fn()
    const { open, selected } = mountMenu({ open: true }, { onSelect })
    await flushFocus()

    const items = document.querySelectorAll('[data-slot="menu-item"]')
    expect(items.length).toBe(3)

    ;(items[0] as HTMLElement).click()
    await flushFocus()

    expect(onSelect).toHaveBeenCalled()
    expect(selected.value).toBe('edit')
    expect(open.value).toBe(false)
    expect(document.querySelector('[data-slot="menu-content"]')).toBeNull()
  })

  it('does not select a disabled MenuItem', async () => {
    const onSelect = vi.fn()
    const { open } = mountMenu({ open: true }, { withDisabled: true, onSelect })
    await flushFocus()

    const items = document.querySelectorAll('[data-slot="menu-item"]')
    const disabled = items[1] as HTMLButtonElement
    expect(disabled.disabled).toBe(true)
    expect(disabled.getAttribute('aria-disabled')).toBe('true')

    disabled.click()
    await nextTick()

    expect(onSelect).not.toHaveBeenCalled()
    expect(open.value).toBe(true)
  })

  it('dismisses on Escape and restores focus to trigger', async () => {
    const { open } = mountMenu()
    const trigger = wrapper!.find('[data-slot="menu-trigger"]')
    const button = trigger.element as HTMLButtonElement
    button.focus()

    await trigger.trigger('keydown', { key: 'Enter' })
    await flushFocus()

    expect(open.value).toBe(true)
    expect(document.activeElement).not.toBe(button)

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    await flushFocus()

    expect(open.value).toBe(false)
    expect(document.querySelector('[data-slot="menu-content"]')).toBeNull()
    expect(document.activeElement).toBe(button)
  })

  it('dismisses on outside pointerdown', async () => {
    const { open } = mountMenu({ open: true })
    await nextTick()

    document.body.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, composed: true }),
    )
    await nextTick()

    expect(open.value).toBe(false)
  })

  it('does not dismiss when pointerdown is inside content', async () => {
    const { open } = mountMenu({ open: true })
    await nextTick()

    const content = document.querySelector('[data-slot="menu-content"]')!
    content.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, composed: true }),
    )
    await nextTick()

    expect(open.value).toBe(true)
  })

  it('exposes data-placement on content', async () => {
    mountMenu({ open: true, placement: 'top-end' })
    await nextTick()

    const content = document.querySelector('[data-slot="menu-content"]')
    expect(content?.getAttribute('data-placement')).toBe('top-end')
  })

  it('focuses the first item when opened', async () => {
    mountMenu()
    const trigger = wrapper!.find('[data-slot="menu-trigger"]')
    ;(trigger.element as HTMLButtonElement).focus()

    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await flushFocus()

    const first = document.querySelector('[data-slot="menu-item"]') as HTMLElement
    expect(document.activeElement).toBe(first)
  })

  it('navigates items with Arrow Up/Down and Home/End', async () => {
    mountMenu({ open: true })
    await flushFocus()

    const content = document.querySelector('[data-slot="menu-content"]')!
    const items = [
      ...document.querySelectorAll<HTMLElement>('[data-slot="menu-item"]'),
    ]

    expect(document.activeElement).toBe(items[0])

    content.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    )
    expect(document.activeElement).toBe(items[1])

    content.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    )
    expect(document.activeElement).toBe(items[2])

    content.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true }),
    )
    expect(document.activeElement).toBe(items[0])

    content.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
    )
    expect(document.activeElement).toBe(items[2])

    content.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    )
    expect(document.activeElement).toBe(items[1])
  })

  it('skips disabled items during keyboard navigation', async () => {
    mountMenu({ open: true }, { withDisabled: true })
    await flushFocus()

    const content = document.querySelector('[data-slot="menu-content"]')!
    const items = [
      ...document.querySelectorAll<HTMLElement>('[data-slot="menu-item"]'),
    ]

    expect(document.activeElement).toBe(items[0])

    content.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    )
    // items[1] is disabled — should land on Share
    expect(document.activeElement).toBe(items[2])
  })

  it('activates focused item with Enter and Space', async () => {
    const { open, selected } = mountMenu({ open: true })
    await flushFocus()

    const items = [
      ...document.querySelectorAll<HTMLElement>('[data-slot="menu-item"]'),
    ]
    items[2]!.focus()

    items[2]!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    )
    await flushFocus()

    expect(selected.value).toBe('share')
    expect(open.value).toBe(false)
  })

  it('activates focused item with Space', async () => {
    const { open, selected } = mountMenu({ open: true })
    await flushFocus()

    const item = document.querySelector('[data-slot="menu-item"]') as HTMLElement
    item.focus()
    item.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))
    await flushFocus()

    expect(selected.value).toBe('edit')
    expect(open.value).toBe(false)
  })

  it('renders MenuSeparator with role="separator"', async () => {
    mountMenu({ open: true })
    await nextTick()

    const separator = document.querySelector('[data-slot="menu-separator"]')
    expect(separator).not.toBeNull()
    expect(separator?.getAttribute('role')).toBe('separator')
  })

  it('supports controlled v-model:open', async () => {
    const open = ref(false)
    const Host = defineComponent({
      setup() {
        return () =>
          h(
            Menu,
            {
              open: open.value,
              'onUpdate:open': (value: boolean) => {
                open.value = value
              },
            },
            () => [
              h(MenuTrigger, null, () => 'Open'),
              h(MenuContent, null, () => [h(MenuItem, null, () => 'One')]),
            ],
          )
      },
    })

    wrapper = mount(Host, { attachTo: document.body })
    open.value = true
    await nextTick()
    expect(document.querySelector('[data-slot="menu-content"]')).not.toBeNull()

    open.value = false
    await nextTick()
    expect(document.querySelector('[data-slot="menu-content"]')).toBeNull()
  })

  it('uses dropdown stacking classes', async () => {
    mountMenu({ open: true })
    await nextTick()
    const content = document.querySelector('[data-slot="menu-content"]')
    expect(content?.className).toContain('z-kablui-dropdown')
    expect(content?.className).toContain('shadow-kablui-md')
  })

  it('warns when parts are used outside Menu', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const orphanTrigger = mount(MenuTrigger, { slots: { default: () => 'x' } })
    const orphanContent = mount(MenuContent)
    const orphanItem = mount(MenuItem, { slots: { default: () => 'x' } })
    const orphanSeparator = mount(MenuSeparator)

    expect(warn).toHaveBeenCalled()
    expect(warn.mock.calls.some((c) => String(c[0]).includes('MenuTrigger'))).toBe(
      true,
    )
    expect(warn.mock.calls.some((c) => String(c[0]).includes('MenuContent'))).toBe(
      true,
    )
    expect(warn.mock.calls.some((c) => String(c[0]).includes('MenuItem'))).toBe(true)
    expect(
      warn.mock.calls.some((c) => String(c[0]).includes('MenuSeparator')),
    ).toBe(true)

    orphanTrigger.unmount()
    orphanContent.unmount()
    orphanItem.unmount()
    orphanSeparator.unmount()
    warn.mockRestore()
  })

  it('is available from component and package barrels', async () => {
    const components = await import('./index')
    expect(components.Menu).toBeDefined()
    expect(components.MenuTrigger).toBeDefined()
    expect(components.MenuContent).toBeDefined()
    expect(components.MenuItem).toBeDefined()
    expect(components.MenuSeparator).toBeDefined()

    const pkg = await import('../index')
    expect(pkg.Menu).toBe(components.Menu)
    expect(pkg.MenuTrigger).toBe(components.MenuTrigger)
    expect(pkg.MenuContent).toBe(components.MenuContent)
    expect(pkg.MenuItem).toBe(components.MenuItem)
    expect(pkg.MenuSeparator).toBe(components.MenuSeparator)
  })

  it('uses semantic kablui token classes and no hex colors in SFCs', () => {
    for (const file of [
      'MenuTrigger.vue',
      'MenuContent.vue',
      'MenuItem.vue',
      'MenuSeparator.vue',
    ]) {
      const source = readFileSync(resolve(__dirname, file), 'utf8')
      expect(source).toMatch(/kablui-/)
      expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
      expect(source).not.toMatch(/kablui-neutral-\d+/)
      expect(source).not.toMatch(/kablui-accent-\d+/)
    }
  })
})
