<script setup lang="ts">
export interface ButtonProps {
  variant?: 'solid' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'solid',
  size: 'md',
  disabled: false,
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const baseClasses = [
  'inline-flex items-center justify-center gap-1.5 font-kablui-medium',
  'rounded-kablui-md',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kablui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-kablui-bg',
  'disabled:opacity-50 disabled:pointer-events-none',
].join(' ')

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  solid: 'bg-kablui-accent text-kablui-accent-fg hover:opacity-90',
  outline:
    'border border-kablui-border-strong bg-transparent text-kablui-fg hover:bg-kablui-muted',
  ghost: 'bg-transparent text-kablui-fg hover:bg-kablui-muted',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'text-kablui-sm px-2 py-1',
  md: 'text-kablui-md px-3 py-1.5',
  lg: 'text-kablui-lg px-4 py-2',
}

function onClick(event: MouseEvent) {
  if (props.disabled) return
  emit('click', event)
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[baseClasses, variantClasses[variant], sizeClasses[size]]"
    @click="onClick"
  >
    <slot />
  </button>
</template>
