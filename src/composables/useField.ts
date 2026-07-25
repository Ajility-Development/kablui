import {
  computed,
  inject,
  provide,
  ref,
  toValue,
  type ComputedRef,
  type InjectionKey,
  type MaybeRefOrGetter,
} from 'vue'
import { __resetIdCounter, useId } from './useId'

export interface FieldContext {
  controlId: string
  hintId: string
  errorId: string
  invalid: ComputedRef<boolean>
  describedBy: ComputedRef<string | undefined>
  setHasHint: (value: boolean) => void
  setHasError: (value: boolean) => void
}

const FIELD_KEY: InjectionKey<FieldContext> = Symbol('kablui-field')

/** @internal — reset between tests */
export function __resetFieldIdCounter(): void {
  __resetIdCounter()
}

export interface ProvideFieldOptions {
  invalid?: MaybeRefOrGetter<boolean | undefined>
  id?: string
}

export function provideField(options: ProvideFieldOptions = {}): FieldContext {
  const controlId = options.id ?? useId('control')
  const hintId = useId('hint')
  const errorId = useId('error')
  const hasHint = ref(false)
  const hasError = ref(false)

  const invalid = computed(() => !!toValue(options.invalid))

  const describedBy = computed(() => {
    const ids: string[] = []
    if (hasHint.value) ids.push(hintId)
    if (hasError.value) ids.push(errorId)
    return ids.length > 0 ? ids.join(' ') : undefined
  })

  const ctx: FieldContext = {
    controlId,
    hintId,
    errorId,
    invalid,
    describedBy,
    setHasHint: (value: boolean) => {
      hasHint.value = value
    },
    setHasError: (value: boolean) => {
      hasError.value = value
    },
  }

  provide(FIELD_KEY, ctx)
  return ctx
}

export function useField(): FieldContext | null {
  return inject(FIELD_KEY, null)
}

/** Merge Field context with local control props for id / aria wiring. */
export function useFieldControlAttrs(options: {
  id?: MaybeRefOrGetter<string | undefined>
  invalid?: MaybeRefOrGetter<boolean | undefined>
}): {
  id: ComputedRef<string | undefined>
  invalid: ComputedRef<boolean>
  describedBy: ComputedRef<string | undefined>
  ariaInvalid: ComputedRef<'true' | undefined>
} {
  const field = useField()

  const id = computed(() => toValue(options.id) || field?.controlId)
  const invalid = computed(() => !!(toValue(options.invalid) || field?.invalid.value))
  const describedBy = computed(() => field?.describedBy.value)
  const ariaInvalid = computed(() => (invalid.value ? ('true' as const) : undefined))

  return { id, invalid, describedBy, ariaInvalid }
}
