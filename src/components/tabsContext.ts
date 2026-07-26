import type { ComputedRef, InjectionKey, Ref } from 'vue'

export interface TabRegistration {
  value: string
  disabled: boolean
  el: HTMLElement
}

export interface TabsContext {
  model: Ref<string | undefined>
  orientation: ComputedRef<'horizontal' | 'vertical'>
  registerTab: (tab: TabRegistration) => void
  unregisterTab: (value: string) => void
  updateTab: (value: string, patch: Partial<Omit<TabRegistration, 'value'>>) => void
  getTabId: (value: string) => string
  getPanelId: (value: string) => string
  select: (value: string) => void
  focusRelative: (currentValue: string, delta: number) => void
  focusFirst: () => void
  focusLast: () => void
  isSelected: (value: string) => boolean
  /** Roving tabindex: selected tab, or first enabled when nothing selected. */
  isTabbable: (value: string) => boolean
  testIdBase: ComputedRef<string>
}

export const TABS_KEY: InjectionKey<TabsContext> = Symbol('kablui-tabs')
