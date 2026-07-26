import {
  onScopeDispose,
  ref,
  toValue,
  unref,
  watch,
  type CSSProperties,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'

export type FloatingSide = 'top' | 'bottom' | 'left' | 'right'
export type FloatingAlign = 'start' | 'center' | 'end'

/** Side alone means center align (e.g. `bottom` ≡ `bottom-center`). */
export type FloatingPlacement =
  | FloatingSide
  | `${FloatingSide}-${FloatingAlign}`

export type UseFloatingOptions = {
  open: MaybeRefOrGetter<boolean>
  placement: MaybeRefOrGetter<FloatingPlacement>
}

export type UseFloatingReturn = {
  style: Ref<CSSProperties>
}

const OPPOSITE: Record<FloatingSide, FloatingSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}

function parsePlacement(placement: FloatingPlacement): {
  side: FloatingSide
  align: FloatingAlign
} {
  const [side, align] = placement.split('-') as [FloatingSide, FloatingAlign | undefined]
  return { side, align: align ?? 'center' }
}

function alignMainAxis(
  anchorStart: number,
  anchorSize: number,
  floatingSize: number,
  align: FloatingAlign,
): number {
  switch (align) {
    case 'start':
      return anchorStart
    case 'end':
      return anchorStart + anchorSize - floatingSize
    case 'center':
    default:
      return anchorStart + (anchorSize - floatingSize) / 2
  }
}

function coordsFor(
  anchor: DOMRect,
  floating: DOMRect,
  side: FloatingSide,
  align: FloatingAlign,
): { x: number; y: number } {
  switch (side) {
    case 'top':
      return {
        x: alignMainAxis(anchor.left, anchor.width, floating.width, align),
        y: anchor.top - floating.height,
      }
    case 'bottom':
      return {
        x: alignMainAxis(anchor.left, anchor.width, floating.width, align),
        y: anchor.bottom,
      }
    case 'left':
      return {
        x: anchor.left - floating.width,
        y: alignMainAxis(anchor.top, anchor.height, floating.height, align),
      }
    case 'right':
      return {
        x: anchor.right,
        y: alignMainAxis(anchor.top, anchor.height, floating.height, align),
      }
  }
}

function isPrimaryClipped(
  x: number,
  y: number,
  floating: DOMRect,
  side: FloatingSide,
  viewportWidth: number,
  viewportHeight: number,
): boolean {
  switch (side) {
    case 'top':
      return y < 0
    case 'bottom':
      return y + floating.height > viewportHeight
    case 'left':
      return x < 0
    case 'right':
      return x + floating.width > viewportWidth
  }
}

function computeStyle(
  anchor: HTMLElement,
  floating: HTMLElement,
  placement: FloatingPlacement,
): CSSProperties {
  const anchorRect = anchor.getBoundingClientRect()
  const floatingRect = floating.getBoundingClientRect()
  const { side, align } = parsePlacement(placement)

  let { x, y } = coordsFor(anchorRect, floatingRect, side, align)

  if (
    isPrimaryClipped(x, y, floatingRect, side, window.innerWidth, window.innerHeight)
  ) {
    const flipped = OPPOSITE[side]
    ;({ x, y } = coordsFor(anchorRect, floatingRect, flipped, align))
  }

  return {
    position: 'fixed',
    top: `${y}px`,
    left: `${x}px`,
  }
}

/**
 * Anchor a floating element with `position: fixed` from getBoundingClientRect.
 * Supports side × start|center|end placements and a simple primary-axis flip
 * when the preferred side is clipped by the viewport. Recomputes on scroll/resize.
 */
export function useFloating(
  anchorRef: Ref<HTMLElement | null | undefined>,
  floatingRef: Ref<HTMLElement | null | undefined>,
  options: UseFloatingOptions,
): UseFloatingReturn {
  const style = ref<CSSProperties>({})

  const update = () => {
    if (!toValue(options.open)) {
      style.value = {}
      return
    }

    const anchor = unref(anchorRef)
    const floating = unref(floatingRef)
    if (!anchor || !floating) {
      style.value = {}
      return
    }

    style.value = computeStyle(anchor, floating, toValue(options.placement))
  }

  const onScrollOrResize = () => {
    update()
  }

  let listening = false

  const startListening = () => {
    if (listening || typeof window === 'undefined') return
    listening = true
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
  }

  const stopListening = () => {
    if (!listening || typeof window === 'undefined') return
    listening = false
    window.removeEventListener('scroll', onScrollOrResize, true)
    window.removeEventListener('resize', onScrollOrResize)
  }

  watch(
    [() => toValue(options.open), () => toValue(options.placement), anchorRef, floatingRef],
    ([open]) => {
      if (open) {
        startListening()
        update()
      } else {
        stopListening()
        style.value = {}
      }
    },
    { immediate: true, flush: 'post' },
  )

  onScopeDispose(() => {
    stopListening()
  })

  return { style }
}
