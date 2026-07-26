<script setup lang="ts">
import { computed, watch } from 'vue'
import Button from './Button.vue'

export interface PaginationProps {
  pageCount: number
  siblingCount?: number
  disabled?: boolean
  /** Accessible name for the nav. Default: "Pagination" */
  label?: string
}

const props = withDefaults(defineProps<PaginationProps>(), {
  siblingCount: 1,
  disabled: false,
  label: 'Pagination',
})

const page = defineModel<number>('page', { default: 1 })

type PageItem = number | 'ellipsis'

function range(start: number, end: number): number[] {
  const length = Math.max(0, end - start + 1)
  return Array.from({ length }, (_, i) => start + i)
}

const normalizedPageCount = computed(() => Math.max(0, Math.floor(props.pageCount)))

/** Clamped page used for UI once pageCount >= 1; otherwise the raw model. */
const effectivePage = computed(() => {
  const pageCount = normalizedPageCount.value
  if (pageCount < 1) return page.value
  return Math.min(Math.max(1, page.value), pageCount)
})

watch(
  [page, normalizedPageCount],
  () => {
    const pageCount = normalizedPageCount.value
    // Avoid thrashing when there is no valid page range.
    if (pageCount < 1) return
    const clamped = Math.min(Math.max(1, page.value), pageCount)
    if (clamped !== page.value) {
      page.value = clamped
    }
  },
  { immediate: true },
)

const items = computed<PageItem[]>(() => {
  const pageCount = normalizedPageCount.value
  if (pageCount === 0) return []

  const siblingCount = Math.max(0, Math.floor(props.siblingCount))
  const current = effectivePage.value

  // first + last + current + 2*siblings + 2 ellipsis
  const totalNumbers = siblingCount * 2 + 5

  if (totalNumbers >= pageCount) {
    return range(1, pageCount)
  }

  const leftSibling = Math.max(current - siblingCount, 1)
  const rightSibling = Math.min(current + siblingCount, pageCount)

  const showLeftEllipsis = leftSibling > 2
  const showRightEllipsis = rightSibling < pageCount - 1

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 3 + 2 * siblingCount
    return [...range(1, leftItemCount), 'ellipsis', pageCount]
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightItemCount = 3 + 2 * siblingCount
    return [1, 'ellipsis', ...range(pageCount - rightItemCount + 1, pageCount)]
  }

  return [
    1,
    'ellipsis',
    ...range(leftSibling, rightSibling),
    'ellipsis',
    pageCount,
  ]
})

const atStart = computed(() => effectivePage.value <= 1)
const atEnd = computed(() => {
  const pageCount = normalizedPageCount.value
  if (pageCount < 1) return true
  return effectivePage.value >= pageCount
})

function goTo(next: number) {
  if (props.disabled) return
  const pageCount = normalizedPageCount.value
  if (next < 1 || next > pageCount) return
  if (next === page.value) return
  page.value = next
}

function prev() {
  goTo(effectivePage.value - 1)
}

function next() {
  goTo(effectivePage.value + 1)
}
</script>

<template>
  <nav
    :aria-label="label"
    :aria-disabled="disabled || undefined"
    class="inline-flex items-center gap-1 text-kablui-fg"
  >
    <Button
      variant="outline"
      size="sm"
      :disabled="disabled || atStart"
      aria-label="Previous page"
      @click="prev"
    >
      Previous
    </Button>

    <template v-for="(item, index) in items" :key="`${item}-${index}`">
      <span
        v-if="item === 'ellipsis'"
        class="inline-flex min-w-8 items-center justify-center px-1 text-kablui-muted-fg"
        aria-hidden="true"
      >
        …
      </span>
      <Button
        v-else
        :variant="item === effectivePage ? 'solid' : 'outline'"
        size="sm"
        :disabled="disabled"
        :aria-label="`Page ${item}`"
        :aria-current="item === effectivePage ? 'page' : undefined"
        @click="goTo(item)"
      >
        {{ item }}
      </Button>
    </template>

    <Button
      variant="outline"
      size="sm"
      :disabled="disabled || atEnd"
      aria-label="Next page"
      @click="next"
    >
      Next
    </Button>
  </nav>
</template>
