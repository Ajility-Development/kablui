import { defineComponent, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { __resetIdCounter } from '../composables/useId'
import { __resetOverlayStack } from '../composables/useOverlayStack'
import { useToast } from '../composables/useToast'
import ToastProvider from './ToastProvider.vue'

/** Must match EXIT_DURATION_MS in ToastProvider.vue */
const TOAST_EXIT_MS = 200

async function flushToastExit() {
  await vi.advanceTimersByTimeAsync(TOAST_EXIT_MS)
  await nextTick()
}

function mountWithToast(
  setup: () => Record<string, unknown> | void,
  providerProps: Record<string, unknown> = {},
) {
  const Child = defineComponent({
    setup,
    template: `
      <div>
        <button type="button" data-trigger @click="onTrigger">trigger</button>
      </div>
    `,
  })

  return mount(ToastProvider, {
    props: providerProps,
    slots: { default: Child },
    attachTo: document.body,
  })
}

describe('ToastProvider', () => {
  let wrapper: VueWrapper | undefined

  beforeEach(() => {
    vi.useFakeTimers()
    __resetIdCounter()
    __resetOverlayStack()
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  it('teleports a toast region with z-kablui-toast and default bottom-end placement', async () => {
    wrapper = mountWithToast(() => {
      const { toast } = useToast()
      return {
        onTrigger: () => toast({ title: 'Hello' }),
      }
    })

    await wrapper.find('[data-trigger]').trigger('click')
    await nextTick()

    const region = document.querySelector('[data-kablui-toast-region]')
    expect(region).toBeTruthy()
    expect(region?.getAttribute('data-placement')).toBe('bottom-end')
    expect(region?.className).toMatch(/z-kablui-toast/)
    expect(region?.className).toMatch(/bottom-4/)
    expect(region?.className).toMatch(/right-4/)
    expect((region as HTMLElement).style.zIndex).toBe('1400')
    expect(region?.textContent).toContain('Hello')
  })

  it('exposes default data-testid on region, toast root, and dismiss', async () => {
    wrapper = mountWithToast(() => {
      const { toast } = useToast()
      return {
        onTrigger: () => toast({ title: 'Hello', duration: 0 }),
      }
    })

    await wrapper.find('[data-trigger]').trigger('click')
    await nextTick()

    expect(document.querySelector('[data-testid="toast-region"]')).not.toBeNull()
    expect(document.querySelector('[data-testid="toast"]')).not.toBeNull()
    expect(document.querySelector('[data-testid="toast-dismiss"]')).not.toBeNull()
  })

  it('honors placement prop', async () => {
    wrapper = mountWithToast(
      () => {
        const { toast } = useToast()
        return {
          onTrigger: () => toast({ title: 'Corner' }),
        }
      },
      { placement: 'top-start' },
    )

    await wrapper.find('[data-trigger]').trigger('click')
    await nextTick()

    const region = document.querySelector('[data-kablui-toast-region]')
    expect(region?.getAttribute('data-placement')).toBe('top-start')
    expect(region?.className).toMatch(/top-4/)
    expect(region?.className).toMatch(/left-4/)
  })

  it('dismisses a toast via the dismiss control', async () => {
    wrapper = mountWithToast(() => {
      const { toast } = useToast()
      return {
        onTrigger: () => toast({ title: 'Bye', duration: 0 }),
      }
    })

    await wrapper.find('[data-trigger]').trigger('click')
    await nextTick()

    expect(document.querySelector('[data-kablui-toast]')).toBeTruthy()

    const dismissBtn = document.querySelector(
      '[data-kablui-toast] button[aria-label="Dismiss"]',
    ) as HTMLButtonElement
    dismissBtn.click()
    await nextTick()

    expect(document.querySelector('[data-kablui-toast]')).toBeTruthy()
    expect(document.querySelector('[data-kablui-toast]')?.hasAttribute('data-exiting')).toBe(
      true,
    )

    await flushToastExit()
    expect(document.querySelector('[data-kablui-toast]')).toBeNull()
  })

  it('auto-dismisses after duration with fake timers', async () => {
    wrapper = mountWithToast(() => {
      const { toast } = useToast()
      return {
        onTrigger: () => toast({ title: 'Timed', duration: 5000 }),
      }
    })

    await wrapper.find('[data-trigger]').trigger('click')
    await nextTick()
    expect(document.body.textContent).toContain('Timed')

    await vi.advanceTimersByTimeAsync(4999)
    await nextTick()
    expect(document.body.textContent).toContain('Timed')

    await vi.advanceTimersByTimeAsync(1)
    await nextTick()
    expect(document.body.textContent).toContain('Timed')
    expect(document.querySelector('[data-kablui-toast]')?.hasAttribute('data-exiting')).toBe(
      true,
    )

    await flushToastExit()
    expect(document.body.textContent).not.toContain('Timed')
  })

  it('keeps sticky toasts when duration is 0', async () => {
    wrapper = mountWithToast(() => {
      const { toast } = useToast()
      return {
        onTrigger: () => toast({ title: 'Sticky', duration: 0 }),
      }
    })

    await wrapper.find('[data-trigger]').trigger('click')
    await nextTick()

    await vi.advanceTimersByTimeAsync(60_000)
    await nextTick()
    expect(document.body.textContent).toContain('Sticky')
  })

  it('queues toasts beyond maxVisible and promotes on dismiss', async () => {
    wrapper = mountWithToast(
      () => {
        const { toast } = useToast()
        return {
          onTrigger: () => {
            toast({ title: 'One', duration: 0 })
            toast({ title: 'Two', duration: 0 })
            toast({ title: 'Three', duration: 0 })
          },
        }
      },
      { maxVisible: 2 },
    )

    await wrapper.find('[data-trigger]').trigger('click')
    await nextTick()

    const titles = () =>
      [...document.querySelectorAll('[data-kablui-toast]')].map((el) =>
        el.querySelector('.font-kablui-semibold')?.textContent,
      )

    expect(titles()).toEqual(['One', 'Two'])
    expect(document.body.textContent).not.toContain('Three')

    const firstDismiss = document.querySelector(
      '[data-kablui-toast] button[aria-label="Dismiss"]',
    ) as HTMLButtonElement
    firstDismiss.click()
    await nextTick()
    await flushToastExit()

    expect(titles()).toEqual(['Two', 'Three'])
  })

  it('dismiss(id) removes a specific toast', async () => {
    let firstId = ''
    let api!: ReturnType<typeof useToast>
    wrapper = mountWithToast(() => {
      api = useToast()
      return {
        onTrigger: () => {
          firstId = api.toast({ title: 'First', duration: 0 })
          api.toast({ title: 'Second', duration: 0 })
        },
      }
    })

    await wrapper.find('[data-trigger]').trigger('click')
    await nextTick()

    api.dismiss(firstId)
    await nextTick()
    expect(document.body.textContent).toContain('First')
    expect(document.body.textContent).toContain('Second')

    await flushToastExit()
    expect(document.body.textContent).not.toContain('First')
    expect(document.body.textContent).toContain('Second')
  })

  it('dismiss(id) drops a queued toast without promoting it', async () => {
    let queuedId = ''
    wrapper = mountWithToast(
      () => {
        const api = useToast()
        return {
          onTrigger: () => {
            api.toast({ title: 'One', duration: 0 })
            api.toast({ title: 'Two', duration: 0 })
            queuedId = api.toast({ title: 'Queued', duration: 0 })
            api.dismiss(queuedId)
          },
        }
      },
      { maxVisible: 2 },
    )

    await wrapper.find('[data-trigger]').trigger('click')
    await nextTick()

    const titles = () =>
      [...document.querySelectorAll('[data-kablui-toast]')].map((el) =>
        el.querySelector('.font-kablui-semibold')?.textContent,
      )

    expect(titles()).toEqual(['One', 'Two'])
    expect(document.body.textContent).not.toContain('Queued')

    const firstDismiss = document.querySelector(
      '[data-kablui-toast] button[aria-label="Dismiss"]',
    ) as HTMLButtonElement
    firstDismiss.click()
    await nextTick()
    await flushToastExit()

    expect(titles()).toEqual(['Two'])
    expect(document.body.textContent).not.toContain('Queued')
  })

  it('uses the default duration when none is provided', async () => {
    wrapper = mountWithToast(() => {
      const { toast } = useToast()
      return {
        onTrigger: () => toast({ title: 'Default timed' }),
      }
    })

    await wrapper.find('[data-trigger]').trigger('click')
    await nextTick()
    expect(document.body.textContent).toContain('Default timed')

    await vi.advanceTimersByTimeAsync(4999)
    await nextTick()
    expect(document.body.textContent).toContain('Default timed')

    await vi.advanceTimersByTimeAsync(1)
    await nextTick()
    expect(document.body.textContent).toContain('Default timed')

    await flushToastExit()
    expect(document.body.textContent).not.toContain('Default timed')
  })

  it('invokes action onClick', async () => {
    const onClick = vi.fn()
    wrapper = mountWithToast(() => {
      const { toast } = useToast()
      return {
        onTrigger: () =>
          toast({
            title: 'With action',
            duration: 0,
            action: { label: 'Retry', onClick },
          }),
      }
    })

    await wrapper.find('[data-trigger]').trigger('click')
    await nextTick()

    const action = [...document.querySelectorAll('button')].find(
      (b) => b.textContent === 'Retry',
    )
    expect(action).toBeTruthy()
    action!.click()
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders description and danger role', async () => {
    wrapper = mountWithToast(() => {
      const { toast } = useToast()
      return {
        onTrigger: () =>
          toast({
            title: 'Error',
            description: 'Something broke',
            tone: 'danger',
            duration: 0,
          }),
      }
    })

    await wrapper.find('[data-trigger]').trigger('click')
    await nextTick()

    const node = document.querySelector('[data-kablui-toast]')
    expect(node?.getAttribute('role')).toBe('alert')
    expect(node?.textContent).toContain('Something broke')
  })
})
