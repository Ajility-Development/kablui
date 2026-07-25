import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { expectNoA11yViolations } from '../test/a11y'
import { __resetDismissableStack } from '../composables/useDismissable'
import { __resetIdCounter } from '../composables/useId'
import { __resetOverlayStack } from '../composables/useOverlayStack'
import { __resetScrollLock } from '../composables/useScrollLock'
import Dialog from './Dialog.vue'

let wrapper: VueWrapper | undefined

function flushFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

function dispatchEscape(): void {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
  )
}

function dispatchPointerDown(target: EventTarget): void {
  target.dispatchEvent(
    new PointerEvent('pointerdown', { bubbles: true, composed: true }),
  )
}

function panel(): HTMLElement | null {
  return document.querySelector('[data-kablui-dialog-panel]')
}

function backdrop(): HTMLElement | null {
  return document.querySelector('[data-kablui-dialog-backdrop]')
}

beforeEach(() => {
  __resetDismissableStack()
  __resetOverlayStack()
  __resetScrollLock()
  __resetIdCounter()
  document.body.innerHTML = ''
  document.body.style.overflow = ''
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
  document.body.style.overflow = ''
  __resetDismissableStack()
  __resetOverlayStack()
  __resetScrollLock()
})

describe('Dialog', () => {
  it('renders nothing when closed', () => {
    wrapper = mount(Dialog, {
      props: { open: false },
      slots: { default: 'Body' },
      attachTo: document.body,
    })

    expect(panel()).toBeNull()
    expect(document.body.textContent).not.toContain('Body')
  })

  it('opens with v-model:open and teleports content to body', async () => {
    wrapper = mount(Dialog, {
      props: { open: true },
      slots: {
        title: 'Title',
        description: 'Desc',
        default: 'Body content',
        footer: 'Footer',
      },
      attachTo: document.body,
    })
    await nextTick()

    expect(panel()).not.toBeNull()
    expect(document.body.textContent).toContain('Title')
    expect(document.body.textContent).toContain('Desc')
    expect(document.body.textContent).toContain('Body content')
    expect(document.body.textContent).toContain('Footer')
    expect(panel()?.closest('[data-kablui-dialog]')?.parentElement).toBe(
      document.body,
    )
  })

  it('emits update:open false when closed via close button', async () => {
    wrapper = mount(Dialog, {
      props: { open: true, showClose: true },
      slots: { title: 'Close me', default: 'Body' },
      attachTo: document.body,
    })
    await nextTick()

    const closeBtn = document.querySelector(
      'button[aria-label="Close"]',
    ) as HTMLButtonElement | null
    expect(closeBtn).not.toBeNull()
    closeBtn!.click()
    await nextTick()

    expect(wrapper!.emitted('update:open')).toEqual([[false]])
  })

  it('dismisses on Escape when dismissible', async () => {
    wrapper = mount(Dialog, {
      props: { open: true, dismissible: true },
      slots: { default: 'Escapable' },
      attachTo: document.body,
    })
    await nextTick()

    dispatchEscape()
    await nextTick()

    expect(wrapper!.emitted('update:open')).toEqual([[false]])
  })

  it('does not dismiss on Escape when dismissible is false', async () => {
    wrapper = mount(Dialog, {
      props: { open: true, dismissible: false },
      slots: { default: 'Locked' },
      attachTo: document.body,
    })
    await nextTick()

    dispatchEscape()
    await nextTick()

    expect(wrapper!.emitted('update:open')).toBeUndefined()
    expect(panel()).not.toBeNull()
  })

  it('dismisses on backdrop pointerdown when dismissible', async () => {
    wrapper = mount(Dialog, {
      props: { open: true, dismissible: true },
      slots: { default: 'Backdrop' },
      attachTo: document.body,
    })
    await nextTick()

    const bd = backdrop()
    expect(bd).not.toBeNull()
    dispatchPointerDown(bd!)
    await nextTick()

    expect(wrapper!.emitted('update:open')).toEqual([[false]])
  })

  it('does not dismiss on backdrop when dismissible is false', async () => {
    wrapper = mount(Dialog, {
      props: { open: true, dismissible: false },
      slots: { default: 'No backdrop' },
      attachTo: document.body,
    })
    await nextTick()

    dispatchPointerDown(backdrop()!)
    await nextTick()

    expect(wrapper!.emitted('update:open')).toBeUndefined()
  })

  it('does not dismiss when clicking inside the panel', async () => {
    wrapper = mount(Dialog, {
      props: { open: true },
      slots: { default: '<button id="inside">Inside</button>' },
      attachTo: document.body,
    })
    await nextTick()

    dispatchPointerDown(document.getElementById('inside')!)
    await nextTick()

    expect(wrapper!.emitted('update:open')).toBeUndefined()
  })

  it('sets dialog ARIA attributes and labelledby/describedby', async () => {
    wrapper = mount(Dialog, {
      props: { open: true },
      slots: {
        title: 'A11y title',
        description: 'A11y description',
        default: 'Body',
      },
      attachTo: document.body,
    })
    await nextTick()

    const el = panel()!
    expect(el.getAttribute('role')).toBe('dialog')
    expect(el.getAttribute('aria-modal')).toBe('true')

    const labelledBy = el.getAttribute('aria-labelledby')
    const describedBy = el.getAttribute('aria-describedby')
    expect(labelledBy).toBeTruthy()
    expect(describedBy).toBeTruthy()
    expect(document.getElementById(labelledBy!)?.textContent).toContain(
      'A11y title',
    )
    expect(document.getElementById(describedBy!)?.textContent).toContain(
      'A11y description',
    )
  })

  it('omits labelledby/describedby when title/description slots are absent', async () => {
    wrapper = mount(Dialog, {
      props: { open: true },
      slots: { default: 'Body only' },
      attachTo: document.body,
    })
    await nextTick()

    const el = panel()!
    expect(el.hasAttribute('aria-labelledby')).toBe(false)
    expect(el.hasAttribute('aria-describedby')).toBe(false)
  })

  it('applies modal elevation and overlay token classes', async () => {
    wrapper = mount(Dialog, {
      props: { open: true },
      slots: { default: 'Styled' },
      attachTo: document.body,
    })
    await nextTick()

    const shell = document.querySelector('[data-kablui-dialog]')!
    expect(shell.className).toContain('z-kablui-modal')
    expect(backdrop()!.className).toContain('bg-kablui-overlay')
    expect(panel()!.className).toContain('shadow-kablui-lg')
  })

  it('locks body scroll while open and unlocks on close', async () => {
    const open = ref(true)
    const Host = defineComponent({
      components: { Dialog },
      setup() {
        return { open }
      },
      template: `
        <Dialog v-model:open="open">
          <template #default>Scroll lock</template>
        </Dialog>
      `,
    })

    wrapper = mount(Host, { attachTo: document.body })
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')

    open.value = false
    await nextTick()
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('traps focus on open and restores focus on close', async () => {
    const trigger = document.createElement('button')
    trigger.id = 'trigger'
    trigger.textContent = 'Open'
    document.body.appendChild(trigger)
    trigger.focus()

    const open = ref(false)
    const Host = defineComponent({
      components: { Dialog },
      setup() {
        return { open }
      },
      template: `
        <Dialog v-model:open="open">
          <template #default>
            <button id="first-in-dialog">First</button>
            <button id="second-in-dialog">Second</button>
          </template>
        </Dialog>
      `,
    })

    wrapper = mount(Host, { attachTo: document.body })
    expect(document.activeElement).toBe(trigger)

    open.value = true
    await nextTick()
    await flushFrame()

    expect(document.activeElement?.id).toBe('first-in-dialog')

    open.value = false
    await nextTick()
    expect(document.activeElement).toBe(trigger)
  })

  it('supports custom teleport target via to prop', async () => {
    const target = document.createElement('div')
    target.id = 'dialog-root'
    document.body.appendChild(target)

    wrapper = mount(Dialog, {
      props: { open: true, to: '#dialog-root' },
      slots: { default: 'Custom target' },
      attachTo: document.body,
    })
    await nextTick()

    expect(target.querySelector('[data-kablui-dialog]')).not.toBeNull()
    expect(target.textContent).toContain('Custom target')
  })

  it('hides close button by default and shows when showClose', async () => {
    wrapper = mount(Dialog, {
      props: { open: true },
      slots: { title: 'No close', default: 'Body' },
      attachTo: document.body,
    })
    await nextTick()
    expect(document.querySelector('button[aria-label="Close"]')).toBeNull()

    await wrapper.setProps({ showClose: true })
    await nextTick()
    expect(document.querySelector('button[aria-label="Close"]')).not.toBeNull()
  })

  it('uses semantic kablui token classes and no hex colors in the SFC', () => {
    const source = readFileSync(resolve(__dirname, 'Dialog.vue'), 'utf8')

    expect(source).toMatch(/kablui-/)
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(source).not.toMatch(/kablui-neutral-\d+/)
  })
})

describe('a11y', () => {
  it('has no axe violations for open dialog', async () => {
    const Host = defineComponent({
      components: { Dialog },
      template: `
        <main>
          <Dialog :open="true">
            <template #title>A11y title</template>
            <template #description>A11y description</template>
            <template #default>Body content</template>
          </Dialog>
        </main>
      `,
    })
    wrapper = mount(Host, { attachTo: document.body })
    await nextTick()
    await expectNoA11yViolations(document.body)
  })
})
