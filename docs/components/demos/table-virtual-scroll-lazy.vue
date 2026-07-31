<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Table, TableColumn, type TableVirtualLazyLoadEvent } from 'kablui'

type Person = { id: number; name: string; role: string }

const TOTAL = 5000
let database: Person[] = []

/** Sparse array: length = total; slots filled on scroll. */
const rows = ref<(Person | undefined)[]>([])
const prefetching = ref(false)
let loadTimer: ReturnType<typeof setTimeout> | null = null

function rangeNeedsFill(first: number, last: number): boolean {
  for (let i = first; i < last; i++) {
    if (rows.value[i] == null) return true
  }
  return false
}

function onLazyLoad(event: TableVirtualLazyLoadEvent) {
  if (!rangeNeedsFill(event.first, event.last)) return

  if (loadTimer) clearTimeout(loadTimer)
  prefetching.value = true
  loadTimer = setTimeout(() => {
    const next = [...rows.value]
    for (let i = event.first; i < event.last; i++) {
      if (next[i] == null) next[i] = database[i]
    }
    rows.value = next
    prefetching.value = false
    loadTimer = null
  }, 180)
}

onMounted(() => {
  database = Array.from({ length: TOTAL }, (_, i) => ({
    id: i + 1,
    name: `Person ${i + 1}`,
    role: i % 2 === 0 ? 'Engineer' : 'Designer',
  }))
  rows.value = Array.from({ length: TOTAL })
  onLazyLoad({ first: 0, last: 20 })
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <p v-if="prefetching" class="text-kablui-sm text-kablui-muted-fg m-0">Loading…</p>
    <Table
      :value="rows"
      data-key="id"
      scroll-height="280px"
      :virtual-scroller-options="{ itemSize: 40, lazy: true, delay: 50, numToleratedItems: 8 }"
      @lazy-load="onLazyLoad"
    >
      <TableColumn field="id" header="Id" width="4rem" />
      <TableColumn field="name" header="Name" />
      <TableColumn field="role" header="Role" />
    </Table>
  </div>
</template>
