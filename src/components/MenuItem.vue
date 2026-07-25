<script setup lang="ts">
import { inject } from 'vue'
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

const classes = [
  'flex w-full cursor-pointer items-center px-3 py-1.5 text-left',
  'text-kablui-md text-kablui-fg rounded-kablui-sm',
  'hover:bg-kablui-muted',
  'focus:outline-none focus:bg-kablui-muted',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kablui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-kablui-bg',
  'disabled:pointer-events-none disabled:opacity-50',
].join(' ')
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
