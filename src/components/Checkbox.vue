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
  // appearance-none strips the native glyph — SVG siblings paint the mark
  'peer col-start-1 row-start-1 size-4 shrink-0 appearance-none rounded-kablui-sm border border-kablui-fg bg-kablui-bg',
  'checked:border-kablui-accent indeterminate:border-kablui-accent',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kablui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-kablui-bg',
  'disabled:pointer-events-none',
].join(' ')

const classes = computed(() => [
  baseClasses,
  fieldAttrs.invalid.value ? 'border-kablui-danger' : '',
])

const markClasses = [
  'pointer-events-none col-start-1 row-start-1 size-3 text-kablui-fg',
  'opacity-0 transition-opacity',
].join(' ')

function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  model.value = target.checked
}
</script>

<template>
  <span class="inline-grid size-4 shrink-0 place-items-center has-[:disabled]:opacity-50">
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
    <!-- Marks use text-kablui-fg / currentColor so they match label text -->
    <svg
      class="peer-checked:opacity-100 peer-indeterminate:!opacity-0"
      :class="markClasses"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 8.25 6.75 11.5 12.5 4.5"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <svg
      class="peer-indeterminate:opacity-100"
      :class="markClasses"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 8h8"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
  </span>
</template>
