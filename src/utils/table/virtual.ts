/**
 * Fixed-row-height virtualization helpers for Table body windowing.
 * Used when `virtualScrollerOptions.itemSize` is set.
 */

export interface TableVirtualWindow {
  /** Inclusive start index into the source row array. */
  startIndex: number
  /** Exclusive end index into the source row array. */
  endIndex: number
  /** Spacer height (px) above the rendered window. */
  offsetTop: number
  /** Spacer height (px) below the rendered window. */
  offsetBottom: number
}

export interface ComputeVirtualWindowOptions {
  scrollTop: number
  viewportHeight: number
  itemCount: number
  itemSize: number
  /** Extra rows rendered above/below the viewport (default 5). */
  numToleratedItems?: number
}

/**
 * Compute the visible index window for a fixed-height list.
 * Returns an empty window when count/size/viewport are invalid.
 */
export function computeVirtualWindow(
  options: ComputeVirtualWindowOptions,
): TableVirtualWindow {
  const itemSize = Math.floor(options.itemSize)
  const itemCount = Math.max(0, Math.floor(options.itemCount))
  const viewportHeight = Math.max(0, options.viewportHeight)
  const scrollTop = Math.max(0, options.scrollTop)
  const overscan = Math.max(0, Math.floor(options.numToleratedItems ?? 5))

  if (itemSize < 1 || itemCount === 0) {
    return { startIndex: 0, endIndex: 0, offsetTop: 0, offsetBottom: 0 }
  }

  const visibleCount = Math.max(1, Math.ceil(viewportHeight / itemSize))
  const rawStart = Math.floor(scrollTop / itemSize)
  const startIndex = Math.max(0, rawStart - overscan)
  const endIndex = Math.min(itemCount, rawStart + visibleCount + overscan)
  const offsetTop = startIndex * itemSize
  const offsetBottom = Math.max(0, (itemCount - endIndex) * itemSize)

  return { startIndex, endIndex, offsetTop, offsetBottom }
}

/**
 * Whether a lazy-load range should be requested.
 * Avoids duplicate fetches for the same `[first, last)` window.
 */
export function shouldEmitVirtualLazyLoad(
  prev: { first: number; last: number } | null,
  next: { first: number; last: number },
): boolean {
  if (next.last <= next.first) return false
  if (!prev) return true
  return prev.first !== next.first || prev.last !== next.last
}
