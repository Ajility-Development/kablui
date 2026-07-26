<script setup lang="ts">
import { computed, inject, useAttrs } from 'vue'
import { listItemBase, listItemState } from '../utils/listItemClasses'
import { omitDataTestId, resolveTestId } from '../utils/testId'
import { MENU_KEY } from './menuContext'

export interface MenuItemProps {
  disabled?: boolean
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MenuItemProps>(), {
  disabled: false,
})

const emit = defineEmits<{
  select: []
}>()

const attrs = useAttrs()
const testId = computed(() => resolveTestId(attrs, 'menu-item'))
const bindAttrs = computed(() => omitDataTestId(attrs))

const menu = inject(MENU_KEY, null)

if (!menu) {
  console.warn('[kablui] MenuItem must be used inside Menu')
}

function activate() {
  if (props.disabled) return
  emit('select')
  menu?.closeOnSelect()
}

function onClick() {
  activate()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    activate()
  }
}

const classes = computed(() =>
  [listItemBase, listItemState({ disabled: props.disabled })].filter(Boolean).join(' '),
)
</script>

<template>
  <button
    type="button"
    role="menuitem"
    data-slot="menu-item"
    :data-testid="testId"
    tabindex="-1"
    :disabled="disabled || undefined"
    :aria-disabled="disabled ? 'true' : undefined"
    :class="classes"
    v-bind="bindAttrs"
    @click="onClick"
    @keydown="onKeydown"
  >
    <slot />
  </button>
</template>
