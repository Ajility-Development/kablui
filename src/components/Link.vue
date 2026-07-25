<script setup lang="ts">
export interface LinkProps {
  href: string
  external?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<LinkProps>(), {
  external: false,
  disabled: false,
})

const baseClasses = [
  'text-kablui-accent underline underline-offset-2',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kablui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-kablui-bg',
  'aria-disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:text-kablui-muted-fg aria-disabled:no-underline',
].join(' ')

function onClick(event: MouseEvent) {
  if (props.disabled) {
    event.preventDefault()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (props.disabled && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
  }
}
</script>

<template>
  <a
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    :aria-disabled="disabled || undefined"
    :tabindex="disabled ? -1 : undefined"
    :class="baseClasses"
    @click="onClick"
    @keydown="onKeydown"
  >
    <slot />
  </a>
</template>
