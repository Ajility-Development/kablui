import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { FloatingPlacement } from '../composables/useFloating'

export type MenuOpenReason = 'keyboard' | 'pointer'

export interface MenuContext {
  open: Ref<boolean>
  contentId: string
  placement: ComputedRef<FloatingPlacement>
  triggerRef: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
  setOpen: (value: boolean, reason?: MenuOpenReason) => void
  toggle: (reason?: MenuOpenReason) => void
  getEnabledItems: () => HTMLElement[]
  focusFirstItem: () => void
  focusItemRelative: (current: HTMLElement | null, delta: number) => void
  focusItemAtEdge: (edge: 'start' | 'end') => void
  closeOnSelect: () => void
}

export const MENU_KEY: InjectionKey<MenuContext> = Symbol('kablui-menu')
