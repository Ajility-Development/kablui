<script setup lang="ts">
import { computed, onMounted, ref, useAttrs, watch } from 'vue'
import { useFieldControlAttrs } from '../composables/useField'

export interface CheckboxProps {
  indeterminate?: boolean
  disabled?: boolean
  invalid?: boolean
  name?: string
  value?: string
  id?: string
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<CheckboxProps>(), {
  indeterminate: false,
  disabled: false,
  invalid: false,
  value: 'on',
})

const model = defineModel<boolean>({ default: false })

const attrs = useAttrs()
const inputRef = ref<HTMLInputElement | null>(null)
const fieldAttrs = useFieldControlAttrs({
  id: () => props.id,
  invalid: () => props.invalid,
})

function syncIndeterminate() {
  if (inputRef.value) {
    inputRef.value.indeterminate = props.indeterminate
  }
}

onMounted(syncIndeterminate)
watch(() => props.indeterminate, syncIndeterminate)

const baseClasses = [
  'size-4 shrink-0 appearance-none rounded-kablui-sm border border-kablui-border bg-kablui-bg',
  'checked:border-kablui-accent checked:bg-kablui-accent',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kablui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-kablui-bg',
  'disabled:opacity-50 disabled:pointer-events-none',
].join(' ')

const classes = computed(() => [
  baseClasses,
  fieldAttrs.invalid.value ? 'border-kablui-danger' : '',
])

function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  model.value = target.checked
}
</script>

<template>
  <input
    ref="inputRef"
    type="checkbox"
    :id="fieldAttrs.id.value"
    :name="name"
    :value="value"
    :checked="model"
    :disabled="disabled"
    :aria-invalid="fieldAttrs.ariaInvalid.value"
    :aria-describedby="fieldAttrs.describedBy.value"
    :aria-checked="indeterminate ? 'mixed' : model ? 'true' : 'false'"
    :class="classes"
    v-bind="attrs"
    @change="onChange"
  />
</template>
