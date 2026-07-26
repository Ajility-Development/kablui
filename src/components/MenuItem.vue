<script setup lang="ts">
import { computed, inject } from 'vue'
import { listItemBase, listItemState } from '../utils/listItemClasses'
import { MENU_KEY } from './menuContext'

export interface MenuItemProps {
  disabled?: boolean
}

const props = withDefaults(defineProps<MenuItemProps>(), {
  disabled: false,
})

const emit = defineEmits<{
  select: []
}>()

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
    tabindex="-1"
    :disabled="disabled || undefined"
    :aria-disabled="disabled ? 'true' : undefined"
    :class="classes"
    @click="onClick"
    @keydown="onKeydown"
  >
    <slot />
  </button>
</template>
