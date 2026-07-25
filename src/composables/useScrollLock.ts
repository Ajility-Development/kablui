import {
  onScopeDispose,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'

let lockCount = 0
let savedOverflow = ''

function lockBody(): void {
  if (typeof document === 'undefined') return
  if (lockCount === 0) {
    savedOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  lockCount += 1
}

function unlockBody(): void {
  if (typeof document === 'undefined') return
  if (lockCount === 0) return
  lockCount -= 1
  if (lockCount === 0) {
    document.body.style.overflow = savedOverflow
    savedOverflow = ''
  }
}

/** @internal — reset between tests */
export function __resetScrollLock(): void {
  lockCount = 0
  savedOverflow = ''
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
}

/**
 * Ref-counted `document.body` overflow lock.
 * Nested callers (e.g. stacked Dialogs) stay locked until the last unlock.
 */
export function useScrollLock(active: MaybeRefOrGetter<boolean>): void {
  let held = false

  const sync = (shouldLock: boolean) => {
    if (shouldLock && !held) {
      lockBody()
      held = true
    } else if (!shouldLock && held) {
      unlockBody()
      held = false
    }
  }

  watch(
    () => toValue(active),
    (value) => sync(value),
    { immediate: true },
  )

  onScopeDispose(() => {
    if (held) {
      unlockBody()
      held = false
    }
  })
}
