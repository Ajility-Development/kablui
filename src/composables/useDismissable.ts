import {
  getCurrentInstance,
  onScopeDispose,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'
import { __claimOverlayIsTop } from './useOverlayStack'

export interface UseDismissableOptions {
  active: MaybeRefOrGetter<boolean>
  onDismiss: () => void
  /** Handle Escape key. Defaults to `true`. */
  escape?: boolean
  /** Dismiss on outside `pointerdown`. Defaults to `false`. */
  outside?: boolean
}

type DismissEntry = {
  id: number
  onDismiss: () => void
  escape: boolean
  outside: boolean
}

let nextDismissId = 0
const dismissStack: DismissEntry[] = []

function topEscapeEntry(): DismissEntry | undefined {
  for (let i = dismissStack.length - 1; i >= 0; i -= 1) {
    const entry = dismissStack[i]!
    if (entry.escape) return entry
  }
  return undefined
}

function topOutsideEntry(): DismissEntry | undefined {
  for (let i = dismissStack.length - 1; i >= 0; i -= 1) {
    const entry = dismissStack[i]!
    if (entry.outside) return entry
  }
  return undefined
}

/**
 * Dismiss on Escape and optionally outside pointerdown.
 * Only the topmost stacked overlay handles Escape (via `useOverlayStack` `isTop`
 * when both are used in the same setup; otherwise a LIFO dismiss stack).
 */
export function useDismissable(
  rootRef: Ref<HTMLElement | null | undefined>,
  options: UseDismissableOptions,
): void {
  const id = ++nextDismissId
  const instance = getCurrentInstance()
  const overlayIsTop = __claimOverlayIsTop(instance)
  let inStack = false

  function escapeEnabled(): boolean {
    return options.escape !== false
  }

  function outsideEnabled(): boolean {
    return options.outside === true
  }

  function syncStack(active: boolean): void {
    if (active && !inStack) {
      dismissStack.push({
        id,
        onDismiss: options.onDismiss,
        escape: escapeEnabled(),
        outside: outsideEnabled(),
      })
      inStack = true
      return
    }

    if (!active && inStack) {
      const idx = dismissStack.findIndex((entry) => entry.id === id)
      if (idx !== -1) dismissStack.splice(idx, 1)
      inStack = false
      return
    }

    if (active && inStack) {
      const entry = dismissStack.find((e) => e.id === id)
      if (entry) {
        entry.onDismiss = options.onDismiss
        entry.escape = escapeEnabled()
        entry.outside = outsideEnabled()
      }
    }
  }

  function isAllowedByOverlayStack(): boolean {
    if (!overlayIsTop) return true
    return overlayIsTop.value
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return
    if (!escapeEnabled()) return
    if (!toValue(options.active)) return
    if (!isAllowedByOverlayStack()) return

    const top = topEscapeEntry()
    if (!top || top.id !== id) return

    event.preventDefault()
    options.onDismiss()
  }

  function onPointerDown(event: PointerEvent): void {
    if (!outsideEnabled()) return
    if (!toValue(options.active)) return
    if (!isAllowedByOverlayStack()) return

    const top = topOutsideEntry()
    if (!top || top.id !== id) return

    const root = rootRef.value
    if (!root) return

    const target = event.target
    if (!(target instanceof Node) || root.contains(target)) return

    options.onDismiss()
  }

  watch(
    () => toValue(options.active),
    (active) => {
      syncStack(!!active)
    },
    { immediate: true },
  )

  document.addEventListener('keydown', onKeydown)
  document.addEventListener('pointerdown', onPointerDown)

  onScopeDispose(() => {
    document.removeEventListener('keydown', onKeydown)
    document.removeEventListener('pointerdown', onPointerDown)
    syncStack(false)
  })
}

/** @internal — reset between tests */
export function __resetDismissableStack(): void {
  dismissStack.length = 0
  nextDismissId = 0
}
