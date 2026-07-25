import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { FloatingPlacement } from '../composables/useFloating'

export type PopoverOpenReason = 'keyboard' | 'pointer'

export interface PopoverContext {
  open: Ref<boolean>
  contentId: string
  placement: ComputedRef<FloatingPlacement>
  triggerRef: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
  setOpen: (value: boolean, reason?: PopoverOpenReason) => void
  toggle: (reason?: PopoverOpenReason) => void
}

export const POPOVER_KEY: InjectionKey<PopoverContext> = Symbol('kablui-popover')
