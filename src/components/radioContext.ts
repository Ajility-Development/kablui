import type { ComputedRef, InjectionKey, Ref } from 'vue'

export interface RadioGroupContext {
  name: ComputedRef<string>
  model: Ref<string | undefined>
  disabled: ComputedRef<boolean>
  invalid: ComputedRef<boolean>
  register: (el: HTMLInputElement) => void
  unregister: (el: HTMLInputElement) => void
  focusRelative: (current: HTMLInputElement, delta: number) => void
}

export const RADIO_GROUP_KEY: InjectionKey<RadioGroupContext> = Symbol('kablui-radio-group')
