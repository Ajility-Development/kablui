<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, useAttrs } from 'vue'
import { omitDataTestId, sanitizeTestIdValue, valueTestId } from '../utils/testId'
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
const testId = computed(() =>
  group
    ? valueTestId(group.testIdBase.value, 'radio', props.value)
    : `radio-${sanitizeTestIdValue(props.value)}`,
)
const bindAttrs = computed(() => omitDataTestId(attrs))

onMounted(() => {
  if (inputRef.value) group?.register(inputRef.value)
})

onBeforeUnmount(() => {
  if (inputRef.value) group?.unregister(inputRef.value)
})

const baseClasses = [
  'kablui-radio size-4 shrink-0 appearance-none rounded-kablui-full border border-kablui-fg bg-kablui-bg',
  'text-kablui-fg',
  'checked:border-kablui-accent',
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
    :data-testid="testId"
    v-bind="bindAttrs"
    @change="onChange"
    @keydown="onKeydown"
  />
</template>

<style>
/*
 * Native radio markers are removed by appearance-none. Restore a center
 * dot via currentColor (text-kablui-fg on the control — same as label text).
 */
.kablui-radio:checked {
  background-image: radial-gradient(circle, currentColor 40%, transparent 41%);
}
</style>
