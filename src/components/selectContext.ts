import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { ListItemSize } from '../utils/listItemClasses'

/** Public option shape for the `options` prop. */
export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

/** Registered option including generated a11y id. */
export interface RegisteredSelectOption extends SelectOption {
  id: string
}

export interface SelectContext {
  listboxId: string
  model: Ref<string | undefined>
  activeValue: Ref<string | undefined>
  open: Ref<boolean>
  size: ComputedRef<ListItemSize>
  register: (option: RegisteredSelectOption) => void
  unregister: (value: string) => void
  update: (value: string, option: RegisteredSelectOption) => void
  selectValue: (value: string) => void
  setActiveValue: (value: string) => void
  disabled: ComputedRef<boolean>
  testIdBase: ComputedRef<string>
}

export const SELECT_KEY: InjectionKey<SelectContext> = Symbol('kablui-select')
