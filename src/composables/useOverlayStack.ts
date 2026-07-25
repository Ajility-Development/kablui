import {
  computed,
  getCurrentInstance,
  onScopeDispose,
  ref,
  type ComputedRef,
  type ComponentInternalInstance,
} from 'vue'

export type OverlayLayer = 'dropdown' | 'overlay' | 'modal' | 'toast' | 'tooltip'

/** Token scale values matching `--z-kablui-*` in theme CSS. */
const Z_INDEX: Record<OverlayLayer, number> = {
  dropdown: 1000,
  overlay: 1200,
  modal: 1300,
  toast: 1400,
  tooltip: 1500,
}

type StackEntry = {
  id: number
  layer: OverlayLayer
}

let nextId = 0
const stack: StackEntry[] = []
/** Bumped to invalidate `isTop` computeds when the stack changes. */
const version = ref(0)

/**
 * Same-setup queue so each `useDismissable` can claim the matching
 * `useOverlayStack` `isTop` (FIFO — call stack then dismissable, or all stacks then dismissables).
 */
const instanceOverlayQueue = new WeakMap<
  ComponentInternalInstance,
  Array<ComputedRef<boolean>>
>()

function bump(): void {
  version.value += 1
}

/**
 * Register an overlay layer for z-index + Escape ownership stacking.
 * Call `register` when open and `unregister` when closed.
 */
export function useOverlayStack(layer: OverlayLayer): {
  zIndex: number
  isTop: ComputedRef<boolean>
  register: () => void
  unregister: () => void
} {
  const id = ++nextId
  const registered = ref(false)
  const zIndex = Z_INDEX[layer]

  const isTop = computed(() => {
    void version.value
    if (!registered.value || stack.length === 0) return false
    return stack[stack.length - 1]!.id === id
  })

  function register(): void {
    if (registered.value) return
    stack.push({ id, layer })
    registered.value = true
    bump()
  }

  function unregister(): void {
    if (!registered.value) return
    const idx = stack.findIndex((entry) => entry.id === id)
    if (idx !== -1) stack.splice(idx, 1)
    registered.value = false
    bump()
  }

  const instance = getCurrentInstance()
  if (instance) {
    const queue = instanceOverlayQueue.get(instance) ?? []
    queue.push(isTop)
    instanceOverlayQueue.set(instance, queue)
  }

  onScopeDispose(unregister)

  return { zIndex, isTop, register, unregister }
}

/** @internal — used by `useDismissable` to honor stack top for Escape. */
export function __claimOverlayIsTop(
  instance: ComponentInternalInstance | null,
): ComputedRef<boolean> | null {
  if (!instance) return null
  const queue = instanceOverlayQueue.get(instance)
  if (!queue || queue.length === 0) return null
  return queue.shift() ?? null
}

/** @internal — reset between tests */
export function __resetOverlayStack(): void {
  stack.length = 0
  nextId = 0
  bump()
}
