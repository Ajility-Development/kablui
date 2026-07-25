<script setup lang="ts">
import { inject } from 'vue'
import { MENU_KEY } from './menuContext'

const menu = inject(MENU_KEY, null)

if (!menu) {
  console.warn('[kablui] MenuSeparator must be used inside Menu')
}

const classes = 'my-1 h-px w-full shrink-0 border-0 border-t border-solid border-kablui-border'
</script>

<template>
  <div role="separator" data-slot="menu-separator" :class="classes" />
</template>
