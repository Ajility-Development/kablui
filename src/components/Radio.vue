<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, useAttrs } from 'vue'
import { RADIO_GROUP_KEY } from './radioContext'

export interface RadioProps {
  value: string
  disabled?: boolean
  id?: string
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<RadioProps>(), {
  disabled: false,
})

const attrs = useAttrs()
const group = inject(RADIO_GROUP_KEY, null)
const inputRef = ref<HTMLInputElement | null>(null)

if (!group) {
  console.warn('[kablui] Radio must be used inside RadioGroup')
}

const isDisabled = computed(() => props.disabled || !!group?.disabled.value)
const isChecked = computed(() => group?.model.value === props.value)
const isInvalid = computed(() => !!group?.invalid.value)

onMounted(() => {
  if (inputRef.value) group?.register(inputRef.value)
})

onBeforeUnmount(() => {
  if (inputRef.value) group?.unregister(inputRef.value)
})

const baseClasses = [
  'size-4 shrink-0 appearance-none rounded-full border border-kablui-border bg-kablui-bg',
  'checked:border-kablui-accent checked:bg-kablui-accent',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kablui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-kablui-bg',
  'disabled:opacity-50 disabled:pointer-events-none',
].join(' ')

const classes = computed(() => [
  baseClasses,
  isInvalid.value ? 'border-kablui-danger' : '',
])

function onChange() {
  if (!group || isDisabled.value) return
  group.model.value = props.value
}

function onKeydown(event: KeyboardEvent) {
  if (!group || isDisabled.value || !inputRef.value) return
  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
    event.preventDefault()
    group.focusRelative(inputRef.value, 1)
  } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
    event.preventDefault()
    group.focusRelative(inputRef.value, -1)
  }
}
</script>

<template>
  <input
    ref="inputRef"
    type="radio"
    :id="id"
    :name="group?.name.value"
    :value="value"
    :checked="isChecked"
    :disabled="isDisabled"
    :aria-invalid="isInvalid ? 'true' : undefined"
    :class="classes"
    v-bind="attrs"
    @change="onChange"
    @keydown="onKeydown"
  />
</template>
