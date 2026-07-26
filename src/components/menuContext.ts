import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { FloatingPlacement } from '../composables/useFloating'
import type { OpenReason } from '../types/overlay'

export interface MenuContext {
  open: Ref<boolean>
  contentId: string
  placement: ComputedRef<FloatingPlacement>
  triggerRef: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
  setOpen: (value: boolean, reason?: OpenReason) => void
  toggle: (reason?: OpenReason) => void
  getEnabledItems: () => HTMLElement[]
  focusFirstItem: () => void
  focusItemRelative: (current: HTMLElement | null, delta: number) => void
  focusItemAtEdge: (edge: 'start' | 'end') => void
  closeOnSelect: () => void
}

export const MENU_KEY: InjectionKey<MenuContext> = Symbol('kablui-menu')
