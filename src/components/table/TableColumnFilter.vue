<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  DEFAULT_NUMERIC_MATCH_MODE_OPTIONS,
  DEFAULT_TEXT_MATCH_MODE_OPTIONS,
  FilterMatchMode,
  FilterOperator,
  createEmptyAdvancedFilterMeta,
  createEmptyFilterMeta,
  getConstraints,
  isFilterMetaAdvanced,
} from '../../utils/table/filter'
import type {
  TableColumnDef,
  TableFilterConstraint,
  TableFilterDisplay,
  TableFilterMeta,
  TableFilterMetaAdvanced,
  TableFilterOperator,
  TableSize,
} from '../../utils/table/types'
import { valueTestId } from '../../utils/testId'
import Button from '../Button.vue'
import Icon from '../Icon.vue'
import Input from '../Input.vue'
import Popover from '../Popover.vue'
import PopoverContent from '../PopoverContent.vue'
import PopoverTrigger from '../PopoverTrigger.vue'
import Select from '../Select.vue'
import Separator from '../Separator.vue'
import { SlotFn } from './SlotFn'

const props = defineProps<{
  field: string
  display: TableFilterDisplay
  filterMeta?: TableFilterMeta | null
  column: TableColumnDef
  size?: TableSize
  testIdBase: string
  /** When true, menu shows AND/OR + multi-rule controls. */
  showOperator?: boolean
}>()

const emit = defineEmits<{
  apply: [meta: TableFilterMeta]
  clear: []
}>()

const open = ref(false)

const isNumeric = computed(() => props.column.dataType === 'numeric')

const defaultMatchMode = computed(() =>
  isNumeric.value ? FilterMatchMode.EQUALS : FilterMatchMode.CONTAINS,
)

const matchModeOptions = computed(() =>
  isNumeric.value ? DEFAULT_NUMERIC_MATCH_MODE_OPTIONS : DEFAULT_TEXT_MATCH_MODE_OPTIONS,
)

const operatorOptions = [
  { label: 'Match all', value: FilterOperator.AND },
  { label: 'Match any', value: FilterOperator.OR },
]

function emptyMeta(): TableFilterMeta {
  return props.showOperator
    ? createEmptyAdvancedFilterMeta(defaultMatchMode.value)
    : createEmptyFilterMeta(defaultMatchMode.value)
}

function cloneMeta(meta?: TableFilterMeta | null): TableFilterMeta {
  if (!meta) return emptyMeta()
  if (isFilterMetaAdvanced(meta)) {
    return {
      operator: meta.operator ?? FilterOperator.AND,
      constraints: meta.constraints.map((c) => ({
        value: Array.isArray(c.value) ? [...c.value] : c.value,
        matchMode: c.matchMode,
      })),
    }
  }
  return {
    value: Array.isArray(meta.value) ? [...meta.value] : meta.value,
    matchMode: meta.matchMode,
  }
}

function comparableState(meta?: TableFilterMeta | null): string {
  const resolved = meta ?? emptyMeta()
  if (isFilterMetaAdvanced(resolved) || props.showOperator) {
    const constraints = getConstraints(resolved).map((c) => ({
      value: c.value ?? null,
      matchMode: c.matchMode || defaultMatchMode.value,
    }))
    const operator = isFilterMetaAdvanced(resolved)
      ? (resolved.operator ?? FilterOperator.AND)
      : FilterOperator.AND
    return JSON.stringify({ operator, constraints })
  }
  return JSON.stringify({
    value: (resolved as { value: unknown }).value ?? null,
    matchMode: (resolved as { matchMode: string }).matchMode || defaultMatchMode.value,
  })
}

/** Draft used in menu mode (Apply commits). Row mode writes through immediately. */
const draft = ref<TableFilterMeta>(cloneMeta(props.filterMeta))

watch(
  () => props.filterMeta,
  (next) => {
    draft.value = cloneMeta(next)
  },
  { deep: true },
)

watch(open, (isOpen) => {
  if (isOpen) draft.value = cloneMeta(props.filterMeta)
})

const activeConstraints = computed(() => getConstraints(draft.value))

const isAdvanced = computed(
  () => props.showOperator || isFilterMetaAdvanced(draft.value) || isFilterMetaAdvanced(props.filterMeta),
)

const primaryConstraint = computed(() => activeConstraints.value[0] ?? {
  value: null,
  matchMode: defaultMatchMode.value,
})

const isDirty = computed(
  () => comparableState(draft.value) !== comparableState(props.filterMeta),
)

const hasActiveFilter = computed(() => {
  return getConstraints(props.filterMeta).some(
    (c) => c.value != null && c.value !== '' && !(Array.isArray(c.value) && c.value.length === 0),
  )
})

function ensureAdvanced(): TableFilterMetaAdvanced {
  if (isFilterMetaAdvanced(draft.value)) return draft.value
  const simple = draft.value as { value: unknown; matchMode: string }
  draft.value = {
    operator: FilterOperator.AND,
    constraints: [{
      value: simple.value ?? null,
      matchMode: simple.matchMode || defaultMatchMode.value,
    }],
  }
  return draft.value
}

function coerceScalar(value: unknown): unknown {
  if (value === '' || value == null) return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isNaN(n) ? null : n
}

function coerceConstraintValue(constraint: TableFilterConstraint): unknown {
  if (!isNumeric.value) {
    return Array.isArray(constraint.value) ? [...constraint.value] : constraint.value
  }
  if (constraint.matchMode === FilterMatchMode.BETWEEN) {
    const arr = Array.isArray(constraint.value) ? constraint.value : [null, null]
    return [coerceScalar(arr[0]), coerceScalar(arr[1])]
  }
  return coerceScalar(constraint.value)
}

function coerceMetaForCommit(meta: TableFilterMeta): TableFilterMeta {
  if (isFilterMetaAdvanced(meta)) {
    return {
      operator: meta.operator ?? FilterOperator.AND,
      constraints: meta.constraints.map((c) => ({
        matchMode: c.matchMode,
        value: coerceConstraintValue(c),
      })),
    }
  }
  return {
    matchMode: meta.matchMode,
    value: coerceConstraintValue(meta),
  }
}

function filterCallback() {
  emit('apply', coerceMetaForCommit(draft.value))
}

function onRowValueInput(value: string) {
  if (isFilterMetaAdvanced(draft.value)) {
    const next = ensureAdvanced()
    next.constraints[0] = {
      ...next.constraints[0]!,
      value: value === '' ? null : value,
    }
    draft.value = { ...next, constraints: [...next.constraints] }
  } else {
    draft.value = {
      value: value === '' ? null : value,
      matchMode: (draft.value as { matchMode: string }).matchMode || defaultMatchMode.value,
    }
  }
  filterCallback()
}

function setConstraintValue(index: number, value: string) {
  const next = ensureAdvanced()
  const list = [...next.constraints]
  list[index] = { ...list[index]!, value: value === '' ? null : value }
  draft.value = { ...next, constraints: list }
}

function setBetweenValue(index: number, bound: 0 | 1, value: string) {
  const next = ensureAdvanced()
  const list = [...next.constraints]
  const current = list[index]!
  const arr = Array.isArray(current.value) ? [...current.value] : [null, null]
  arr[bound] = value === '' ? null : value
  list[index] = { ...current, value: arr }
  draft.value = { ...next, constraints: list }
}

function adjustValueForMatchMode(value: unknown, matchMode: string): unknown {
  if (matchMode === FilterMatchMode.BETWEEN) {
    return Array.isArray(value) ? value : [null, null]
  }
  if (Array.isArray(value)) return null
  return value
}

function setConstraintMatchMode(index: number, matchMode: string) {
  if (isAdvanced.value) {
    const next = ensureAdvanced()
    const list = [...next.constraints]
    const prev = list[index]!
    list[index] = {
      ...prev,
      matchMode,
      value: adjustValueForMatchMode(prev.value, matchMode),
    }
    draft.value = { ...next, constraints: list }
  } else {
    const prev = draft.value as { value: unknown; matchMode: string }
    draft.value = {
      value: adjustValueForMatchMode(prev.value, matchMode),
      matchMode,
    }
  }
}

function setOperator(operator: string) {
  const next = ensureAdvanced()
  draft.value = { ...next, operator: operator as TableFilterOperator }
}

function addConstraint() {
  const next = ensureAdvanced()
  draft.value = {
    ...next,
    constraints: [
      ...next.constraints,
      { value: null, matchMode: defaultMatchMode.value },
    ],
  }
}

function removeConstraint(index: number) {
  const next = ensureAdvanced()
  if (next.constraints.length <= 1) return
  draft.value = {
    ...next,
    constraints: next.constraints.filter((_, i) => i !== index),
  }
}

function onApply() {
  filterCallback()
  open.value = false
}

function onMenuSubmit() {
  if (!isDirty.value) return
  onApply()
}

function onClear() {
  draft.value = emptyMeta()
  emit('clear')
  open.value = false
}

function constraintInputValue(constraint: TableFilterConstraint): string {
  if (constraint.value == null || Array.isArray(constraint.value)) return ''
  return String(constraint.value)
}

function betweenBoundValue(constraint: TableFilterConstraint, bound: 0 | 1): string {
  if (!Array.isArray(constraint.value)) return ''
  const v = constraint.value[bound]
  return v == null ? '' : String(v)
}

function isBetweenMode(constraint: TableFilterConstraint): boolean {
  return constraint.matchMode === FilterMatchMode.BETWEEN
}

const inputSize = computed(() => (props.size === 'lg' ? 'md' : 'sm') as 'sm' | 'md')
</script>

<template>
  <!-- --- filter row cell --- -->
  <div
    v-if="display === 'row'"
    class="min-w-0"
    :data-testid="valueTestId(testIdBase, 'filter-row', field)"
  >
    <SlotFn
      v-if="column.slots.filter"
      :fn="column.slots.filter"
      :props="{
        filterModel: primaryConstraint,
        filterCallback,
        value: filterMeta,
        field,
        column,
      }"
    />
    <Input
      v-else
      :type="isNumeric ? 'number' : 'text'"
      :model-value="constraintInputValue(primaryConstraint)"
      :size="inputSize"
      :placeholder="`Filter ${column.header ?? field}`"
      :data-testid="valueTestId(testIdBase, 'filter-input', field)"
      @update:model-value="onRowValueInput"
    />
  </div>

  <!-- --- filter menu --- -->
  <div
    v-else
    class="inline-flex shrink-0"
    :data-testid="valueTestId(testIdBase, 'filter-menu', field)"
  >
  <Popover
    v-model:open="open"
    placement="bottom-end"
  >
    <PopoverTrigger
      variant="ghost"
      size="sm"
      :data-test-id="valueTestId(testIdBase, 'filter-trigger', field)"
      :aria-label="`Filter ${column.header ?? field}`"
    >
      <Icon size="sm" :class="hasActiveFilter ? 'text-kablui-accent' : 'text-kablui-muted-fg'">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
      </Icon>
    </PopoverTrigger>
    <PopoverContent :aria-label="`Filter ${column.header ?? field}`">
      <form
        class="flex w-64 flex-col gap-2"
        :data-testid="valueTestId(testIdBase, 'filter-panel', field)"
        @submit.prevent="onMenuSubmit"
      >
        <Select
          v-if="isAdvanced"
          :model-value="(draft as TableFilterMetaAdvanced).operator ?? FilterOperator.AND"
          :options="operatorOptions"
          size="sm"
          :data-testid="valueTestId(testIdBase, 'filter-operator', field)"
          @update:model-value="setOperator($event ?? FilterOperator.AND)"
        />

        <div
          v-for="(constraint, index) in activeConstraints"
          :key="index"
          class="flex flex-col gap-1.5"
        >
          <Separator v-if="index > 0" />

          <Select
            :model-value="constraint.matchMode"
            :options="matchModeOptions"
            size="sm"
            :data-testid="valueTestId(testIdBase, 'filter-match-mode', `${field}-${index}`)"
            @update:model-value="setConstraintMatchMode(index, $event ?? defaultMatchMode)"
          />

          <SlotFn
            v-if="column.slots.filter"
            :fn="column.slots.filter"
            :props="{
              filterModel: constraint,
              filterCallback,
              value: filterMeta,
              field,
              column,
            }"
          />
          <div
            v-else-if="isNumeric && isBetweenMode(constraint)"
            class="flex items-center gap-1.5"
          >
            <Input
              type="number"
              :model-value="betweenBoundValue(constraint, 0)"
              :size="inputSize"
              placeholder="Min"
              :data-testid="valueTestId(testIdBase, 'filter-input-min', `${field}-${index}`)"
              @update:model-value="setBetweenValue(index, 0, $event)"
            />
            <Input
              type="number"
              :model-value="betweenBoundValue(constraint, 1)"
              :size="inputSize"
              placeholder="Max"
              :data-testid="valueTestId(testIdBase, 'filter-input-max', `${field}-${index}`)"
              @update:model-value="setBetweenValue(index, 1, $event)"
            />
          </div>
          <Input
            v-else
            :type="isNumeric ? 'number' : 'text'"
            :model-value="constraintInputValue(constraint)"
            :size="inputSize"
            placeholder="Value"
            :data-testid="valueTestId(testIdBase, 'filter-input', `${field}-${index}`)"
            @update:model-value="setConstraintValue(index, $event)"
          />

          <Button
            v-if="isAdvanced && activeConstraints.length > 1"
            type="button"
            variant="ghost"
            size="sm"
            :data-testid="valueTestId(testIdBase, 'filter-remove-rule', `${field}-${index}`)"
            @click="removeConstraint(index)"
          >
            Remove rule
          </Button>
        </div>

        <Button
          v-if="isAdvanced"
          type="button"
          variant="outline"
          size="sm"
          :data-testid="valueTestId(testIdBase, 'filter-add-rule', field)"
          @click="addConstraint"
        >
          Add rule
        </Button>

        <div class="flex items-center justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            :data-testid="valueTestId(testIdBase, 'filter-clear', field)"
            @click="onClear"
          >
            Clear
          </Button>
          <Button
            type="submit"
            variant="solid"
            size="sm"
            :disabled="!isDirty"
            :data-testid="valueTestId(testIdBase, 'filter-apply', field)"
          >
            Apply
          </Button>
        </div>
      </form>
    </PopoverContent>
  </Popover>
  </div>
</template>
