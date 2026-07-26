<script setup lang="ts">
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const classes = [
  'inline-flex size-7 shrink-0 items-center justify-center',
  'rounded-kablui-sm text-current hover:bg-kablui-muted',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kablui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-kablui-bg',
].join(' ')

function onClick(event: MouseEvent) {
  emit('click', event)
}
</script>

<template>
  <button
    type="button"
    :class="classes"
    aria-label="Dismiss"
    @click="onClick"
  >
    <span aria-hidden="true">&times;</span>
  </button>
</template>
