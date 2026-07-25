import type { ComputedRef, InjectionKey, Ref } from 'vue'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  id: string
}

export interface SelectContext {
  listboxId: string
  model: Ref<string | undefined>
  activeValue: Ref<string | undefined>
  open: Ref<boolean>
  register: (option: SelectOption) => void
  unregister: (value: string) => void
  update: (value: string, option: SelectOption) => void
  selectValue: (value: string) => void
  setActiveValue: (value: string) => void
  disabled: ComputedRef<boolean>
}

export const SELECT_KEY: InjectionKey<SelectContext> = Symbol('kablui-select')
