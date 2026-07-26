import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { FloatingPlacement } from '../composables/useFloating'
import type { OpenReason } from '../types/overlay'

export interface PopoverContext {
  open: Ref<boolean>
  contentId: string
  placement: ComputedRef<FloatingPlacement>
  triggerRef: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
  setOpen: (value: boolean, reason?: OpenReason) => void
  toggle: (reason?: OpenReason) => void
}

export const POPOVER_KEY: InjectionKey<PopoverContext> = Symbol('kablui-popover')
