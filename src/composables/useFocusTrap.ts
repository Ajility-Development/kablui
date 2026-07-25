import {
  onScopeDispose,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'
import { getTabbableElements } from './dom'

export interface UseFocusTrapOptions {
  active: MaybeRefOrGetter<boolean>
}

/**
 * Trap keyboard focus inside `containerRef` while `active`.
 * On activate: store previously focused element and move focus to the first tabbable.
 * Tab / Shift+Tab cycle within the container; on deactivate restore prior focus.
 */
export function useFocusTrap(
  containerRef: Ref<HTMLElement | null | undefined> | MaybeRefOrGetter<HTMLElement | null | undefined>,
  options: UseFocusTrapOptions,
): void {
  let previouslyFocused: HTMLElement | null = null
  let listening = false

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return

    const container = toValue(containerRef)
    if (!container) return

    const tabbables = getTabbableElements(container)
    if (tabbables.length === 0) {
      event.preventDefault()
      return
    }

    const first = tabbables[0]!
    const last = tabbables[tabbables.length - 1]!
    const active = document.activeElement as HTMLElement | null
    const focusOutside = !active || !container.contains(active)

    if (event.shiftKey) {
      if (focusOutside || active === first) {
        event.preventDefault()
        last.focus()
      }
    } else if (focusOutside || active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const activate = () => {
    const container = toValue(containerRef)
    previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    if (!listening) {
      document.addEventListener('keydown', onKeyDown, true)
      listening = true
    }

    const focusFirst = () => {
      const root = toValue(containerRef) ?? container
      if (!root) return
      const tabbables = getTabbableElements(root)
      if (tabbables.length > 0) {
        tabbables[0]!.focus()
      } else if (typeof root.focus === 'function') {
        root.focus()
      }
    }

    // Defer so Teleport / v-if content is mounted.
    requestAnimationFrame(focusFirst)
  }

  const deactivate = () => {
    if (listening) {
      document.removeEventListener('keydown', onKeyDown, true)
      listening = false
    }

    const restore = previouslyFocused
    previouslyFocused = null
    if (restore && typeof restore.focus === 'function') {
      restore.focus()
    }
  }

  watch(
    () => toValue(options.active),
    (active) => {
      if (active) activate()
      else deactivate()
    },
    { immediate: true },
  )

  onScopeDispose(() => {
    if (listening) deactivate()
  })
}
