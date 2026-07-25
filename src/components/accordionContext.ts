import type { ComputedRef, InjectionKey } from 'vue'

export interface AccordionContext {
  type: ComputedRef<'single' | 'multiple'>
  collapsible: ComputedRef<boolean>
  isOpen: (value: string) => boolean
  toggle: (value: string) => void
  registerTrigger: (value: string, el: HTMLButtonElement | null, disabled: boolean) => void
  unregisterTrigger: (value: string) => void
  focusRelative: (currentValue: string, delta: number) => void
}

export interface AccordionItemContext {
  value: string
  disabled: ComputedRef<boolean>
  triggerId: string
  contentId: string
  isOpen: ComputedRef<boolean>
  toggle: () => void
}

export const ACCORDION_KEY: InjectionKey<AccordionContext> = Symbol('kablui-accordion')
export const ACCORDION_ITEM_KEY: InjectionKey<AccordionItemContext> = Symbol(
  'kablui-accordion-item',
)
