<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { useFieldControlAttrs } from '../composables/useField'
import { omitDataTestId, resolveTestId } from '../utils/testId'

export interface TextareaProps {
  size?: 'sm' | 'md' | 'lg'
  rows?: number
  disabled?: boolean
  invalid?: boolean
  placeholder?: string
  name?: string
  id?: string
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<TextareaProps>(), {
  size: 'md',
  rows: 3,
  disabled: false,
  invalid: false,
})

const model = defineModel<string>({ default: '' })

const attrs = useAttrs()
const testId = computed(() => resolveTestId(attrs, 'textarea'))
const bindAttrs = computed(() => omitDataTestId(attrs))
const fieldAttrs = useFieldControlAttrs({
  id: () => props.id,
  invalid: () => props.invalid,
})

const baseClasses = [
  'w-full border border-kablui-border-strong bg-kablui-bg text-kablui-fg',
  'rounded-kablui-md font-kablui-normal',
  'placeholder:text-kablui-muted-fg',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kablui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-kablui-bg',
  'disabled:opacity-50 disabled:pointer-events-none',
].join(' ')

const sizeClasses: Record<NonNullable<TextareaProps['size']>, string> = {
  sm: 'text-kablui-sm px-2 py-1',
  md: 'text-kablui-md px-3 py-1.5',
  lg: 'text-kablui-lg px-4 py-2',
}

const classes = computed(() => [
  baseClasses,
  sizeClasses[props.size],
  fieldAttrs.invalid.value ? 'border-kablui-danger' : '',
])
</script>

<template>
  <textarea
    :id="fieldAttrs.id.value"
    :name="name"
    :rows="rows"
    :disabled="disabled"
    :placeholder="placeholder"
    :value="model"
    :aria-invalid="fieldAttrs.ariaInvalid.value"
    :aria-describedby="fieldAttrs.describedBy.value"
    :class="classes"
    :data-testid="testId"
    v-bind="bindAttrs"
    @input="model = ($event.target as HTMLTextAreaElement).value"
  />
</template>
