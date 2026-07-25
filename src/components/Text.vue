<script setup lang="ts">
export interface TextProps {
  as?: 'p' | 'span' | 'div' | 'label' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  size?: 'sm' | 'md' | 'lg'
  weight?: 'normal' | 'medium' | 'semibold'
  tone?: 'default' | 'muted' | 'accent' | 'danger'
}

withDefaults(defineProps<TextProps>(), {
  as: 'p',
  size: 'md',
  weight: 'normal',
  tone: 'default',
})

const sizeClasses: Record<NonNullable<TextProps['size']>, string> = {
  sm: 'text-kablui-sm',
  md: 'text-kablui-md',
  lg: 'text-kablui-lg',
}

const weightClasses: Record<NonNullable<TextProps['weight']>, string> = {
  normal: 'font-kablui-normal',
  medium: 'font-kablui-medium',
  semibold: 'font-kablui-semibold',
}

const toneClasses: Record<NonNullable<TextProps['tone']>, string> = {
  default: 'text-kablui-fg',
  muted: 'text-kablui-muted-fg',
  accent: 'text-kablui-accent',
  danger: 'text-kablui-danger',
}
</script>

<template>
  <component
    :is="as"
    :class="[sizeClasses[size], weightClasses[weight], toneClasses[tone]]"
  >
    <slot />
  </component>
</template>
