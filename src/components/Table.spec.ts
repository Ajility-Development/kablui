import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { expectNoA11yViolations } from '../test/a11y'
import type {
  TableCellEditCompleteEvent,
  TableColumnReorderEvent,
  TableColumnResizeEndEvent,
  TableExpandedRows,
  TableLoadEvent,
  TableRowContextMenuEvent,
  TableRowEditSaveEvent,
  TableRowReorderEvent,
  TableVirtualLazyLoadEvent,
} from '../utils/table/types'
import Input from './Input.vue'
import Table from './Table.vue'
import TableColumn from './TableColumn.vue'
import TableColumnGroup from './TableColumnGroup.vue'
import TableHeaderRow from './TableHeaderRow.vue'

const sampleRows = [
  { id: 1, name: 'Ada', role: 'Engineer' },
  { id: 2, name: 'Grace', role: 'Admiral' },
  { id: 3, name: 'Alan', role: 'Scientist' },
]

let wrapper: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

function mountBasic(props: Record<string, unknown> = {}) {
  return mount(
    defineComponent({
      components: { Table, TableColumn },
      setup() {
        const rows = (props.value as typeof sampleRows | undefined) ?? sampleRows
        return { rows, tableProps: props }
      },
      template: `
        <Table v-bind="tableProps" :value="rows" data-key="id">
          <TableColumn field="name" header="Name" />
          <TableColumn field="role" header="Role" />
        </Table>
      `,
    }),
    { attachTo: document.body },
  )
}

describe('Table', () => {
  it('renders rows with column field/header', async () => {
    wrapper = mountBasic()
    await nextTick()

    expect(wrapper.find('[data-testid="table"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="table-column-header-name"]').text()).toBe('Name')
    expect(wrapper.find('[data-testid="table-column-header-role"]').text()).toBe('Role')

    const rows = wrapper.findAll('[data-testid^="table-row-"]')
    expect(rows).toHaveLength(3)
    expect(wrapper.find('[data-testid="table-row-1"]').text()).toContain('Ada')
    expect(wrapper.find('[data-testid="table-row-1"]').text()).toContain('Engineer')
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.find('thead').exists()).toBe(true)
    expect(wrapper.find('tbody').exists()).toBe(true)
  })

  it('supports dynamic v-for columns register/unregister', async () => {
    const fields = ref(['name', 'role'])

    wrapper = mount(
      defineComponent({
        components: { Table, TableColumn },
        setup() {
          return { rows: sampleRows, fields }
        },
        template: `
          <Table :value="rows" data-key="id">
            <TableColumn
              v-for="field in fields"
              :key="field"
              :field="field"
              :header="field"
            />
          </Table>
        `,
      }),
      { attachTo: document.body },
    )
    await nextTick()

    expect(wrapper.findAll('th')).toHaveLength(2)
    expect(wrapper.find('[data-testid="table-column-header-name"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="table-column-header-role"]').exists()).toBe(true)

    fields.value = ['name']
    await nextTick()

    expect(wrapper.findAll('th')).toHaveLength(1)
    expect(wrapper.find('[data-testid="table-column-header-name"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="table-column-header-role"]').exists()).toBe(false)

    fields.value = ['name', 'role', 'id']
    await nextTick()

    expect(wrapper.findAll('th')).toHaveLength(3)
    expect(wrapper.find('[data-testid="table-column-header-id"]').exists()).toBe(true)
  })

  it('shows empty state when value is empty', async () => {
    wrapper = mountBasic({ value: [] })
    await nextTick()

    expect(wrapper.find('[data-testid="table-empty"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="empty"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid^="table-row-"]')).toHaveLength(0)
  })

  it('shows loading content instead of body rows and sets aria-busy', async () => {
    wrapper = mountBasic({ loading: true })
    await nextTick()

    const root = wrapper.find('[data-testid="table"]')
    expect(root.attributes('data-loading')).toBe('true')
    expect(wrapper.find('[data-testid="table-loading"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="spinner"]').exists()).toBe(true)
    expect(wrapper.find('table').attributes('aria-busy')).toBe('true')
    // Exclusive loading: live data rows must not render under a mask
    expect(wrapper.findAll('[data-testid^="table-row-"]')).toHaveLength(0)
    expect(wrapper.find('[data-testid="table-row-1"]').exists()).toBe(false)
  })

  it('applies size utility classes on cells for sm/md/lg', async () => {
    for (const [size, paddingClass, textClass] of [
      ['sm', 'px-2', 'text-kablui-sm'],
      ['md', 'px-3', 'text-kablui-md'],
      ['lg', 'px-4', 'text-kablui-lg'],
    ] as const) {
      wrapper?.unmount()
      wrapper = mountBasic({ size })
      await nextTick()

      const th = wrapper.find('[data-testid="table-column-header-name"]')
      const td = wrapper.find('[data-testid="table-cell-1-name"]')
      expect(th.classes().join(' ')).toContain(paddingClass)
      expect(th.classes().join(' ')).toContain(textClass)
      expect(td.classes().join(' ')).toContain(paddingClass)
      expect(td.classes().join(' ')).toContain(textClass)
    }
  })

  it('has no cell grid by default; showGridlines adds borders', async () => {
    wrapper = mountBasic()
    await nextTick()

    const th = wrapper.find('[data-testid="table-column-header-name"]')
    const td = wrapper.find('[data-testid="table-cell-1-name"]')
    const row = wrapper.find('[data-testid="table-row-1"]')
    expect(th.classes().join(' ')).not.toMatch(/\bborder\b/)
    expect(td.classes().join(' ')).not.toMatch(/\bborder\b/)
    expect(row.classes().join(' ')).not.toMatch(/border-b/)

    wrapper.unmount()
    wrapper = mountBasic({ showGridlines: true, striped: true })
    await nextTick()

    const root = wrapper.find('[data-testid="table"]')
    expect(root.attributes('data-gridlines')).toBe('true')
    expect(root.attributes('data-striped')).toBe('true')

    const thGrid = wrapper.find('[data-testid="table-column-header-name"]')
    const tdGrid = wrapper.find('[data-testid="table-cell-1-name"]')
    expect(thGrid.classes().join(' ')).toMatch(/\bborder\b/)
    expect(tdGrid.classes().join(' ')).toMatch(/\bborder\b/)
    // Striped backgrounds stay independent of gridlines
    expect(wrapper.find('[data-testid="table-row-2"]').classes().join(' ')).toMatch(
      /bg-kablui-muted/,
    )
  })

  it('does not mount a scrollport for naked tables', async () => {
    wrapper = mountBasic()
    await nextTick()

    expect(wrapper.find('[data-testid="table-scroll"]').exists()).toBe(false)
    expect(wrapper.find('[data-slot="table-scroll"]').exists()).toBe(false)
    const root = wrapper.find('[data-testid="table"]')
    expect(root.classes().join(' ')).not.toMatch(/rounded-kablui-md/)
    expect(root.classes().join(' ')).not.toMatch(/\bborder\b/)
    expect(root.classes().join(' ')).not.toMatch(/overflow-hidden/)
  })

  it('uses border-separate for sticky-friendly table layout', async () => {
    wrapper = mountBasic({ scrollHeight: '200px' })
    await nextTick()

    const tableEl = wrapper.find('table')
    expect(tableEl.classes().join(' ')).toMatch(/border-separate/)
    expect(tableEl.classes().join(' ')).toMatch(/border-spacing-0/)
    expect(tableEl.classes().join(' ')).not.toMatch(/border-collapse/)
  })

  it('renders custom body and table header/footer slots', async () => {
    wrapper = mount(
      defineComponent({
        components: { Table, TableColumn },
        setup() {
          return { rows: sampleRows }
        },
        template: `
          <Table :value="rows" data-key="id">
            <template #header>People</template>
            <template #footer>3 rows</template>
            <TableColumn field="name" header="Name">
              <template #body="{ data }">
                <strong>{{ data.name }}</strong>
              </template>
            </TableColumn>
            <TableColumn field="role" header="Role" />
          </Table>
        `,
      }),
      { attachTo: document.body },
    )
    await nextTick()

    expect(wrapper.find('[data-testid="table-header"]').text()).toBe('People')
    expect(wrapper.find('[data-testid="table-footer"]').text()).toBe('3 rows')
    expect(wrapper.find('[data-testid="table-row-1"] strong').text()).toBe('Ada')
  })

  it('has no a11y violations for basic table', async () => {
    wrapper = mountBasic()
    await nextTick()
    await expectNoA11yViolations(wrapper.element)
  })

  it('has no a11y violations for empty table', async () => {
    wrapper = mountBasic({ value: [] })
    await nextTick()
    await expectNoA11yViolations(wrapper.element)
  })

  // --- sort (Wave 1) ---
  describe('sort', () => {
    const sortRows = [
      { id: 1, name: 'Ada', role: 'Engineer', score: 90 },
      { id: 2, name: 'Grace', role: 'Admiral', score: 95 },
      { id: 3, name: 'Alan', role: 'Scientist', score: 88 },
    ]

    function mountSortable(options: {
      props?: Record<string, unknown>
      removableSort?: boolean
      sortMode?: 'single' | 'multiple'
      sortField?: string | null
      sortOrder?: number | null
      multiSortMeta?: { field: string; order: number }[]
    } = {}) {
      const sortField = ref(options.sortField ?? null)
      const sortOrder = ref(options.sortOrder ?? null)
      const multiSortMeta = ref(options.multiSortMeta ?? [])

      return mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows: sortRows,
              sortField,
              sortOrder,
              multiSortMeta,
              removableSort: options.removableSort ?? false,
              sortMode: options.sortMode ?? 'single',
              tableProps: options.props ?? {},
            }
          },
          template: `
            <Table
              v-bind="tableProps"
              :value="rows"
              data-key="id"
              :sort-mode="sortMode"
              :removable-sort="removableSort"
              v-model:sort-field="sortField"
              v-model:sort-order="sortOrder"
              v-model:multi-sort-meta="multiSortMeta"
            >
              <TableColumn field="name" header="Name" sortable />
              <TableColumn field="role" header="Role" sortable />
              <TableColumn field="score" header="Score" sortable />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
    }

    function rowNames(w: VueWrapper) {
      return w.findAll('[data-testid^="table-row-"]').map((row) => {
        const cell = row.find('[data-testid^="table-cell-"][data-testid$="-name"]:not([data-testid*="-editor-"])')
        return cell.text()
      })
    }

    it('sorts ascending then descending on header click (single)', async () => {
      wrapper = mountSortable()
      await nextTick()

      const nameSort = wrapper.find('[data-testid="table-sort-name"]')
      expect(nameSort.exists()).toBe(true)

      await nameSort.trigger('click')
      await nextTick()
      expect(rowNames(wrapper!)).toEqual(['Ada', 'Alan', 'Grace'])
      expect(wrapper.find('[data-testid="table-column-header-name"]').attributes('aria-sort')).toBe(
        'ascending',
      )

      await nameSort.trigger('click')
      await nextTick()
      expect(rowNames(wrapper!)).toEqual(['Grace', 'Alan', 'Ada'])
      expect(wrapper.find('[data-testid="table-column-header-name"]').attributes('aria-sort')).toBe(
        'descending',
      )
    })

    it('exposes a button so Enter/Space activate sort natively', async () => {
      wrapper = mountSortable()
      await nextTick()

      const nameSort = wrapper.find('[data-testid="table-sort-name"]')
      expect(nameSort.element.tagName).toBe('BUTTON')
      expect(nameSort.attributes('type')).toBe('button')

      // Browsers map Enter/Space on <button> to click; VTU exercises the same path.
      await nameSort.trigger('click')
      await nextTick()
      expect(rowNames(wrapper!)).toEqual(['Ada', 'Alan', 'Grace'])
    })

    it('applies pre-sort from sortField/sortOrder', async () => {
      wrapper = mountSortable({ sortField: 'score', sortOrder: -1 })
      await nextTick()

      expect(rowNames(wrapper!)).toEqual(['Grace', 'Ada', 'Alan'])
      expect(wrapper.find('[data-testid="table-column-header-score"]').attributes('aria-sort')).toBe(
        'descending',
      )
      expect(wrapper.find('[data-testid="table-sort-score"]').attributes('data-sort-order')).toBe(
        '-1',
      )
    })

    it('clears sort on third click when removableSort', async () => {
      wrapper = mountSortable({ removableSort: true })
      await nextTick()

      const nameSort = wrapper.find('[data-testid="table-sort-name"]')
      await nameSort.trigger('click')
      await nextTick()
      await nameSort.trigger('click')
      await nextTick()
      await nameSort.trigger('click')
      await nextTick()

      expect(wrapper.find('[data-testid="table-column-header-name"]').attributes('aria-sort')).toBe(
        'none',
      )
      expect(rowNames(wrapper!)).toEqual(['Ada', 'Grace', 'Alan'])
    })

    it('adds multi-sort with metaKey and shows order badges', async () => {
      wrapper = mountSortable({ sortMode: 'multiple' })
      await nextTick()

      await wrapper.find('[data-testid="table-sort-name"]').trigger('click')
      await nextTick()
      await wrapper
        .find('[data-testid="table-sort-role"]')
        .trigger('click', { metaKey: true })
      await nextTick()

      expect(wrapper.find('[data-testid="table-sort-badge-name"]').text()).toBe('1')
      expect(wrapper.find('[data-testid="table-sort-badge-role"]').text()).toBe('2')
      expect(wrapper.find('[data-testid="table-column-header-name"]').attributes('aria-sort')).toBe(
        'ascending',
      )
      expect(wrapper.find('[data-testid="table-column-header-role"]').attributes('aria-sort')).toBe(
        'ascending',
      )
    })

    it('emits sort with updated meta', async () => {
      wrapper = mountSortable()
      await nextTick()

      await wrapper.find('[data-testid="table-sort-name"]').trigger('click')
      await nextTick()

      const table = wrapper.findComponent(Table)
      expect(table.emitted('sort')).toBeTruthy()
      const payload = table.emitted('sort')![0]![0] as {
        sortField: string
        sortOrder: number
      }
      expect(payload.sortField).toBe('name')
      expect(payload.sortOrder).toBe(1)
    })

    it('has no a11y violations for sortable headers', async () => {
      wrapper = mountSortable({ sortField: 'name', sortOrder: 1 })
      await nextTick()
      await expectNoA11yViolations(wrapper.element)
    })
  })

  // --- pagination (Wave 1) ---
  describe('pagination', () => {
    const manyRows = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      name: `Person ${i + 1}`,
      role: 'Engineer',
    }))

    it('slices rows and renders Pagination when paginate is true', async () => {
      wrapper = mountBasic({ value: manyRows, paginate: true, rows: 5 })
      await nextTick()

      expect(wrapper.find('[data-testid="table"]').attributes('data-paginate')).toBe(
        'true',
      )
      expect(wrapper.findAll('[data-testid^="table-row-"]')).toHaveLength(5)
      expect(wrapper.find('[data-testid="table-row-1"]').text()).toContain('Person 1')
      expect(wrapper.find('[data-testid="table-row-5"]').text()).toContain('Person 5')
      expect(wrapper.find('[data-testid="table-row-6"]').exists()).toBe(false)

      expect(wrapper.find('[data-testid="table-paginator"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="table-pagination"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="table-pagination-page-3"]').exists()).toBe(true)
    })

    it('updates displayed rows when the page changes', async () => {
      wrapper = mountBasic({ value: manyRows, paginate: true, rows: 5, page: 1 })
      await nextTick()

      await wrapper.find('[data-testid="table-pagination-page-2"]').trigger('click')
      await nextTick()

      expect(wrapper.findAll('[data-testid^="table-row-"]')).toHaveLength(5)
      expect(wrapper.find('[data-testid="table-row-6"]').text()).toContain('Person 6')
      expect(wrapper.find('[data-testid="table-row-10"]').text()).toContain('Person 10')
      expect(wrapper.find('[data-testid="table-row-1"]').exists()).toBe(false)
    })

    it('supports controlled v-model:page', async () => {
      const page = ref(1)

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return { rows: manyRows, page }
          },
          template: `
            <Table
              v-model:page="page"
              :value="rows"
              data-key="id"
              paginate
              :rows="5"
            >
              <TableColumn field="name" header="Name" />
              <TableColumn field="role" header="Role" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      expect(wrapper.find('[data-testid="table-row-1"]').exists()).toBe(true)

      page.value = 3
      await nextTick()

      expect(wrapper.findAll('[data-testid^="table-row-"]')).toHaveLength(2)
      expect(wrapper.find('[data-testid="table-row-11"]').text()).toContain('Person 11')
      expect(wrapper.find('[data-testid="table-row-12"]').text()).toContain('Person 12')

      await wrapper.find('[data-testid="table-pagination-page-2"]').trigger('click')
      await nextTick()

      expect(page.value).toBe(2)
      expect(wrapper.find('[data-testid="table-row-6"]').exists()).toBe(true)
    })

    it('does not render paginator when paginate is false', async () => {
      wrapper = mountBasic({ value: manyRows, paginate: false })
      await nextTick()

      expect(wrapper.findAll('[data-testid^="table-row-"]')).toHaveLength(12)
      expect(wrapper.find('[data-testid="table-paginator"]').exists()).toBe(false)
    })

    it('uses totalRecords for pageCount when provided', async () => {
      wrapper = mountBasic({
        value: manyRows.slice(0, 5),
        paginate: true,
        rows: 5,
        totalRecords: 20,
      })
      await nextTick()

      // 20 / 5 = 4 pages even though only 5 client rows are present
      expect(wrapper.find('[data-testid="table-pagination-page-4"]').exists()).toBe(true)
      expect(wrapper.findAll('[data-testid^="table-row-"]')).toHaveLength(5)
    })

    it('has no a11y violations when paginated', async () => {
      wrapper = mountBasic({ value: manyRows, paginate: true, rows: 5 })
      await nextTick()
      await expectNoA11yViolations(wrapper.element)
    })
  })

  // --- selection (Wave 1) ---
  describe('selection', () => {
    function mountSelectable(options: {
      selectionMode?: 'single' | 'multiple'
      metaKeySelection?: boolean
      columnSelection?: 'single' | 'multiple'
      selection?: unknown | unknown[] | null
    } = {}) {
      const selection = ref(options.selection ?? (options.selectionMode === 'multiple' || options.columnSelection === 'multiple' ? [] : null))

      return {
        selection,
        wrapper: mount(
          defineComponent({
            components: { Table, TableColumn },
            setup() {
              return {
                rows: sampleRows,
                selection,
                selectionMode: options.selectionMode,
                metaKeySelection: options.metaKeySelection ?? false,
                columnSelection: options.columnSelection,
              }
            },
            template: `
              <Table
                :value="rows"
                data-key="id"
                :selection-mode="selectionMode"
                :meta-key-selection="metaKeySelection"
                v-model:selection="selection"
              >
                <TableColumn
                  v-if="columnSelection"
                  :selection-mode="columnSelection"
                  header-style="width: 3rem"
                />
                <TableColumn field="name" header="Name" />
                <TableColumn field="role" header="Role" />
              </Table>
            `,
          }),
          { attachTo: document.body },
        ),
      }
    }

    it('selects a single row on click', async () => {
      const mounted = mountSelectable({ selectionMode: 'single' })
      wrapper = mounted.wrapper
      await nextTick()

      await wrapper.find('[data-testid="table-row-2"]').trigger('click')
      await nextTick()

      expect(mounted.selection.value).toEqual({ id: 2, name: 'Grace', role: 'Admiral' })
      expect(wrapper.find('[data-testid="table-row-2"]').attributes('aria-selected')).toBe('true')
      expect(wrapper.find('[data-testid="table-row-2"]').attributes('data-selected')).toBe('true')
      expect(wrapper.find('[data-testid="table-row-1"]').attributes('aria-selected')).toBe('false')
    })

    it('toggles multiple selection on click when metaKeySelection is false', async () => {
      const mounted = mountSelectable({ selectionMode: 'multiple' })
      wrapper = mounted.wrapper
      await nextTick()

      await wrapper.find('[data-testid="table-row-1"]').trigger('click')
      await wrapper.find('[data-testid="table-row-3"]').trigger('click')
      await nextTick()

      expect(mounted.selection.value).toEqual([
        { id: 1, name: 'Ada', role: 'Engineer' },
        { id: 3, name: 'Alan', role: 'Scientist' },
      ])
    })

    it('replaces selection on plain click and toggles with metaKey when metaKeySelection', async () => {
      const mounted = mountSelectable({
        selectionMode: 'multiple',
        metaKeySelection: true,
      })
      wrapper = mounted.wrapper
      await nextTick()

      await wrapper.find('[data-testid="table-row-1"]').trigger('click')
      await wrapper.find('[data-testid="table-row-2"]').trigger('click')
      await nextTick()
      expect(mounted.selection.value).toEqual([{ id: 2, name: 'Grace', role: 'Admiral' }])

      await wrapper.find('[data-testid="table-row-3"]').trigger('click', { ctrlKey: true })
      await nextTick()
      expect(mounted.selection.value).toEqual([
        { id: 2, name: 'Grace', role: 'Admiral' },
        { id: 3, name: 'Alan', role: 'Scientist' },
      ])
    })

    it('selects a range with shift+click when metaKeySelection', async () => {
      const mounted = mountSelectable({
        selectionMode: 'multiple',
        metaKeySelection: true,
      })
      wrapper = mounted.wrapper
      await nextTick()

      await wrapper.find('[data-testid="table-row-1"]').trigger('click')
      await wrapper.find('[data-testid="table-row-3"]').trigger('click', { shiftKey: true })
      await nextTick()

      expect(mounted.selection.value).toHaveLength(3)
    })

    it('renders checkbox column with select-all', async () => {
      const mounted = mountSelectable({ columnSelection: 'multiple' })
      wrapper = mounted.wrapper
      await nextTick()

      const selectAll = wrapper.find('[data-testid="table-select-all"]')
      expect(selectAll.exists()).toBe(true)
      expect(wrapper.find('[data-testid="table-row-select-1"]').exists()).toBe(true)

      await selectAll.setValue(true)
      await nextTick()
      expect(mounted.selection.value).toHaveLength(3)

      const table = wrapper.findComponent(Table)
      expect(table.emitted('row-select')?.length).toBeGreaterThan(0)
    })

    it('toggles a row via checkbox without requiring selectionMode on Table', async () => {
      const mounted = mountSelectable({ columnSelection: 'multiple' })
      wrapper = mounted.wrapper
      await nextTick()

      const checkbox = wrapper.find('[data-testid="table-row-select-2"]')
      await checkbox.setValue(true)
      await nextTick()

      expect(mounted.selection.value).toEqual([{ id: 2, name: 'Grace', role: 'Admiral' }])
      expect(wrapper.find('[data-testid="table-row-2"]').attributes('aria-selected')).toBe('true')
    })

    it('renders radio column for single selection', async () => {
      const mounted = mountSelectable({ columnSelection: 'single' })
      wrapper = mounted.wrapper
      await nextTick()

      const radio = wrapper.find('[data-testid="table-selection-radio-2"]')
      expect(radio.exists()).toBe(true)
      await radio.setValue()
      await nextTick()

      expect(mounted.selection.value).toEqual({ id: 2, name: 'Grace', role: 'Admiral' })
      expect(wrapper.find('[data-testid="table-row-2"]').attributes('aria-selected')).toBe('true')
    })

    it('supports keyboard focus, Space toggle, Home/End, and Ctrl+A', async () => {
      const mounted = mountSelectable({ selectionMode: 'multiple' })
      wrapper = mounted.wrapper
      await nextTick()

      const first = wrapper.find('[data-testid="table-row-1"]')
      await first.trigger('keydown', { key: 'ArrowDown' })
      await nextTick()
      expect(document.activeElement).toBe(wrapper.find('[data-testid="table-row-2"]').element)

      await wrapper.find('[data-testid="table-row-2"]').trigger('keydown', { key: ' ' })
      await nextTick()
      expect(mounted.selection.value).toEqual([{ id: 2, name: 'Grace', role: 'Admiral' }])

      await wrapper.find('[data-testid="table-row-2"]').trigger('keydown', { key: 'End' })
      await nextTick()
      expect(document.activeElement).toBe(wrapper.find('[data-testid="table-row-3"]').element)

      await wrapper.find('[data-testid="table-row-3"]').trigger('keydown', { key: 'Home' })
      await nextTick()
      expect(document.activeElement).toBe(wrapper.find('[data-testid="table-row-1"]').element)

      await wrapper.find('[data-testid="table-row-1"]').trigger('keydown', { key: 'a', ctrlKey: true })
      await nextTick()
      expect(mounted.selection.value).toHaveLength(3)
    })

    it('marks the focused row with data-focused without a visible ring', async () => {
      const mounted = mountSelectable({ selectionMode: 'multiple' })
      wrapper = mounted.wrapper
      await nextTick()

      const first = wrapper.find('[data-testid="table-row-1"]')
      expect(first.attributes('data-focused')).toBe('true')
      expect(first.classes().join(' ')).not.toMatch(/ring-kablui-focus/)

      await first.trigger('keydown', { key: 'ArrowDown' })
      await nextTick()

      expect(wrapper.find('[data-testid="table-row-1"]').attributes('data-focused')).toBeUndefined()
      const second = wrapper.find('[data-testid="table-row-2"]')
      expect(second.attributes('data-focused')).toBe('true')
      expect(second.classes().join(' ')).not.toMatch(/ring-2/)
      expect(second.classes().join(' ')).not.toMatch(/ring-kablui-focus/)
    })

    it('extends selection with Shift+ArrowDown', async () => {
      const mounted = mountSelectable({ selectionMode: 'multiple' })
      wrapper = mounted.wrapper
      await nextTick()

      const first = wrapper.find('[data-testid="table-row-1"]')
      await first.trigger('keydown', { key: ' ' })
      await nextTick()
      await first.trigger('keydown', { key: 'ArrowDown', shiftKey: true })
      await nextTick()

      expect(mounted.selection.value).toHaveLength(2)
    })

    it('emits row-select and row-unselect', async () => {
      const mounted = mountSelectable({ selectionMode: 'single' })
      wrapper = mounted.wrapper
      await nextTick()

      const table = wrapper.findComponent(Table)
      await wrapper.find('[data-testid="table-row-1"]').trigger('click')
      await nextTick()

      const selectEvents = table.emitted('row-select')
      expect(selectEvents).toBeTruthy()
      expect(selectEvents![0]![0]).toMatchObject({
        data: { id: 1, name: 'Ada', role: 'Engineer' },
        index: 0,
      })

      await wrapper.find('[data-testid="table-row-1"]').trigger('click')
      await nextTick()
      const unselectEvents = table.emitted('row-unselect')
      expect(unselectEvents).toBeTruthy()
      expect(unselectEvents![0]![0]).toMatchObject({
        data: { id: 1, name: 'Ada', role: 'Engineer' },
        index: 0,
      })
    })

    it('emits transition-only select-all / clear-all with pipeline indices', async () => {
      const mounted = mountSelectable({ columnSelection: 'multiple' })
      wrapper = mounted.wrapper
      await nextTick()

      const table = wrapper.findComponent(Table)

      // Pre-select middle row, then select-all — only missing rows emit row-select.
      await wrapper.find('[data-testid="table-row-select-2"]').setValue(true)
      await nextTick()
      expect(table.emitted('row-select')).toHaveLength(1)

      await wrapper.find('[data-testid="table-select-all"]').setValue(true)
      await nextTick()
      const afterSelectAll = table.emitted('row-select')!
      expect(afterSelectAll).toHaveLength(3)
      expect(afterSelectAll.slice(1).map((e) => (e[0] as { index: number }).index).sort()).toEqual([
        0, 2,
      ])
      expect(mounted.selection.value).toHaveLength(3)

      // Select-all again must not re-emit already-selected rows.
      await wrapper.find('[data-testid="table-select-all"]').setValue(true)
      await nextTick()
      expect(table.emitted('row-select')).toHaveLength(3)

      // Clear-all emits pipeline indices (not selection-array order).
      await wrapper.find('[data-testid="table-select-all"]').setValue(false)
      await nextTick()
      const unselects = table.emitted('row-unselect')!
      expect(unselects).toHaveLength(3)
      expect(unselects.map((e) => (e[0] as { index: number }).index).sort()).toEqual([0, 1, 2])
      expect(mounted.selection.value).toHaveLength(0)
    })

    it('has no a11y violations for checkbox selection', async () => {
      const mounted = mountSelectable({ columnSelection: 'multiple' })
      wrapper = mounted.wrapper
      await nextTick()
      await expectNoA11yViolations(wrapper.element)
    })

    it('has no a11y violations for radio selection', async () => {
      const mounted = mountSelectable({ columnSelection: 'single' })
      wrapper = mounted.wrapper
      await nextTick()
      await expectNoA11yViolations(wrapper.element)
    })
  })

  // --- scroll / frozen (Wave 2) ---
  describe('scroll / frozen', () => {
    const wideRows = [
      {
        id: 1,
        name: 'Ada',
        role: 'Engineer',
        company: 'Analytical',
        city: 'London',
        status: 'Active',
        balance: '$1',
      },
      {
        id: 2,
        name: 'Grace',
        role: 'Admiral',
        company: 'Navy',
        city: 'NYC',
        status: 'Active',
        balance: '$2',
      },
    ]

    it('applies scrollHeight max-height and sticky thead on the scroll container', async () => {
      wrapper = mountBasic({ scrollHeight: '240px', value: sampleRows })
      await nextTick()

      const root = wrapper.find('[data-testid="table"]')
      expect(root.attributes('data-scroll')).toBe('240px')

      const scroll = wrapper.find('[data-testid="table-scroll"]')
      expect(scroll.exists()).toBe(true)
      expect(scroll.classes().join(' ')).toMatch(/overflow-auto/)
      expect((scroll.element as HTMLElement).style.maxHeight).toBe('240px')

      const thead = wrapper.find('[data-slot="table-thead"]')
      expect(thead.attributes('data-sticky')).toBe('true')
      const th = wrapper.find('[data-testid="table-column-header-name"]')
      expect(th.classes().join(' ')).toMatch(/sticky/)
      expect((th.element as HTMLElement).style.top).toBe('0px')
    })

    it('coalesces ResizeObserver callbacks into one animation frame and cancels on unmount', async () => {
      const rafQueue: FrameRequestCallback[] = []
      let nextRafId = 1
      const rafStub = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        rafQueue.push(cb)
        return nextRafId++
      })
      const cancelStub = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})

      const observerCallbacks: ResizeObserverCallback[] = []
      class MockResizeObserver {
        constructor(cb: ResizeObserverCallback) {
          observerCallbacks.push(cb)
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      }
      vi.stubGlobal('ResizeObserver', MockResizeObserver)

      try {
        wrapper = mountBasic({ scrollHeight: '200px' })
        await nextTick()

        expect(observerCallbacks).toHaveLength(2)

        const scheduledBefore = rafQueue.length
        for (const cb of observerCallbacks) {
          cb([], {} as ResizeObserver)
        }
        // Both observers share one pending frame
        expect(rafQueue.length - scheduledBefore).toBe(1)

        // Further notifications while a frame is pending do not schedule another
        for (const cb of observerCallbacks) {
          cb([], {} as ResizeObserver)
        }
        expect(rafQueue.length - scheduledBefore).toBe(1)

        wrapper.unmount()
        wrapper = undefined
        expect(cancelStub).toHaveBeenCalled()
      } finally {
        rafStub.mockRestore()
        cancelStub.mockRestore()
        vi.unstubAllGlobals()
      }
    })

    it('supports scrollHeight flex on root and scroll container', async () => {
      wrapper = mountBasic({ scrollHeight: 'flex' })
      await nextTick()

      const root = wrapper.find('[data-testid="table"]')
      expect(root.attributes('data-scroll')).toBe('flex')
      expect(root.attributes('data-scroll-flex')).toBe('true')
      expect(root.classes().join(' ')).toMatch(/flex/)
      expect(root.classes().join(' ')).toMatch(/h-full/)

      const scroll = wrapper.find('[data-testid="table-scroll"]')
      expect(scroll.classes().join(' ')).toMatch(/flex-1/)
      expect((scroll.element as HTMLElement).style.minHeight).toBe('0px')
    })

    it('marks frozen columns with data attributes and sticky offsets', async () => {
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return { rows: wideRows }
          },
          template: `
            <Table :value="rows" data-key="id" scroll-height="200px">
              <TableColumn field="name" header="Name" frozen min-width="120px" />
              <TableColumn field="role" header="Role" min-width="160px" />
              <TableColumn field="company" header="Company" min-width="180px" />
              <TableColumn field="city" header="City" min-width="140px" />
              <TableColumn field="status" header="Status" min-width="120px" />
              <TableColumn field="balance" header="Balance" frozen align-frozen="right" min-width="100px" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      const nameHeader = wrapper.find('[data-testid="table-column-header-name"]')
      expect(nameHeader.attributes('data-frozen')).toBe('true')
      expect(nameHeader.attributes('data-frozen-align')).toBe('left')
      expect(nameHeader.classes().join(' ')).toMatch(/sticky/)
      expect((nameHeader.element as HTMLElement).style.left).toBe('0px')

      const balanceHeader = wrapper.find('[data-testid="table-column-header-balance"]')
      expect(balanceHeader.attributes('data-frozen')).toBe('true')
      expect(balanceHeader.attributes('data-frozen-align')).toBe('right')
      expect(balanceHeader.classes().join(' ')).toMatch(/sticky/)
      expect((balanceHeader.element as HTMLElement).style.right).toBe('0px')

      const nameCell = wrapper.find('[data-testid="table-cell-1-name"]')
      expect(nameCell.attributes('data-frozen')).toBe('true')
      expect(nameCell.classes().join(' ')).toMatch(/sticky/)
    })

    it('renders frozenValue rows with frozen-row markers', async () => {
      const frozen = [{ id: 0, name: 'Pinned', role: 'Lead' }]
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return { rows: sampleRows, frozen }
          },
          template: `
            <Table :value="rows" :frozen-value="frozen" data-key="id" scroll-height="200px">
              <TableColumn field="name" header="Name" />
              <TableColumn field="role" header="Role" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      const frozenRow = wrapper.find('[data-testid="table-frozen-row-0"]')
      expect(frozenRow.exists()).toBe(true)
      expect(frozenRow.attributes('data-frozen-row')).toBe('true')
      expect(frozenRow.text()).toContain('Pinned')

      expect(wrapper.find('[data-testid="table-row-1"]').exists()).toBe(true)
      expect(wrapper.find('[data-slot="table-thead"]').attributes('data-sticky')).toBe('true')
    })

    it('uses accent-tinted opaque background on selected frozen cells', async () => {
      const frozen = [{ id: 0, name: 'Pinned', role: 'Lead' }]
      const selection = ref(frozen.slice())

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return { rows: sampleRows, frozen, selection }
          },
          template: `
            <Table
              v-model:selection="selection"
              :value="rows"
              :frozen-value="frozen"
              data-key="id"
              selection-mode="multiple"
              scroll-height="200px"
            >
              <TableColumn field="name" header="Name" frozen min-width="120px" />
              <TableColumn field="role" header="Role" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      const frozenCell = wrapper.find('[data-testid="table-frozen-cell-0-name"]')
      expect(frozenCell.exists()).toBe(true)
      expect(frozenCell.classes().join(' ')).toMatch(/bg-kablui-accent/)
      expect(wrapper.find('[data-testid="table-frozen-row-0"]').attributes('data-selected')).toBe(
        'true',
      )
    })

    it('keeps size/gridlines/striped working with scrollHeight', async () => {
      wrapper = mountBasic({
        scrollHeight: '180px',
        size: 'sm',
        showGridlines: true,
        striped: true,
      })
      await nextTick()

      const root = wrapper.find('[data-testid="table"]')
      expect(root.attributes('data-size')).toBe('sm')
      expect(root.attributes('data-gridlines')).toBe('true')
      expect(root.attributes('data-striped')).toBe('true')
      expect(wrapper.find('[data-testid="table-scroll"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="table-row-2"]').classes().join(' ')).toMatch(
        /bg-kablui-muted/,
      )
    })

    it('has no a11y violations with scroll and frozen columns', async () => {
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return { rows: wideRows }
          },
          template: `
            <Table :value="rows" data-key="id" scroll-height="200px">
              <TableColumn field="name" header="Name" frozen min-width="120px" />
              <TableColumn field="role" header="Role" min-width="160px" />
              <TableColumn field="balance" header="Balance" frozen align-frozen="right" min-width="100px" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()
      await expectNoA11yViolations(wrapper.element)
    })
  })

  // --- filter (Wave 2) ---
  describe('filter', () => {
    const filterRowsData = [
      { id: 1, name: 'Ada Lovelace', role: 'Engineer' },
      { id: 2, name: 'Grace Hopper', role: 'Admiral' },
      { id: 3, name: 'Alan Turing', role: 'Scientist' },
      { id: 4, name: 'Katherine Johnson', role: 'Mathematician' },
    ]

    function filterRowNames(w: VueWrapper) {
      return w.findAll('[data-testid^="table-row-"]').map((row) => {
        return row.find('[data-testid^="table-cell-"][data-testid$="-name"]:not([data-testid*="-editor-"])').text()
      })
    }

    it('filters rows in row display mode', async () => {
      const filters = ref({
        name: { value: null as string | null, matchMode: 'contains' },
      })

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return { rows: filterRowsData, filters }
          },
          template: `
            <Table
              v-model:filters="filters"
              :value="rows"
              data-key="id"
              filter-display="row"
            >
              <TableColumn field="name" header="Name" filterable />
              <TableColumn field="role" header="Role" filterable />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      expect(wrapper.find('[data-testid="table"]').attributes('data-filter-display')).toBe('row')
      expect(wrapper.find('[data-testid="table-filter-row"]').exists()).toBe(true)
      expect(filterRowNames(wrapper)).toHaveLength(4)

      const input = wrapper.find('[data-testid="table-filter-input-name"]')
      await input.setValue('Ada')
      await nextTick()

      expect(filterRowNames(wrapper)).toEqual(['Ada Lovelace'])
      expect(filters.value.name.value).toBe('Ada')

      const table = wrapper.findComponent(Table)
      expect(table.emitted('filter')).toBeTruthy()
    })

    it('applies menu filter on Apply and supports advanced OR constraints', async () => {
      const filters = ref({
        role: {
          operator: 'or',
          constraints: [
            { value: null as string | null, matchMode: 'equals' },
            { value: null as string | null, matchMode: 'equals' },
          ],
        },
      })

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return { rows: filterRowsData, filters }
          },
          template: `
            <Table
              v-model:filters="filters"
              :value="rows"
              data-key="id"
              filter-display="menu"
            >
              <TableColumn field="name" header="Name" />
              <TableColumn field="role" header="Role" filterable />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      const menu = wrapper.find('[data-testid="table-filter-menu-role"]')
      expect(menu.exists()).toBe(true)
      await wrapper.find('[data-testid="table-filter-trigger-role"]').trigger('click')
      await nextTick()

      const input0 = document.body.querySelector(
        '[data-testid="table-filter-input-role-0"]',
      ) as HTMLInputElement | null
      const input1 = document.body.querySelector(
        '[data-testid="table-filter-input-role-1"]',
      ) as HTMLInputElement | null
      expect(input0).toBeTruthy()
      expect(input1).toBeTruthy()

      input0!.value = 'Admiral'
      input0!.dispatchEvent(new Event('input', { bubbles: true }))
      input1!.value = 'Scientist'
      input1!.dispatchEvent(new Event('input', { bubbles: true }))
      await nextTick()

      const apply = document.body.querySelector(
        '[data-testid="table-filter-apply-role"]',
      ) as HTMLButtonElement | null
      apply!.click()
      await nextTick()

      expect(filterRowNames(wrapper!)).toEqual(['Grace Hopper', 'Alan Turing'])
    })

    it('filter trigger shares header content cluster (not pushed by flex-1 sibling)', async () => {
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return { rows: filterRowsData }
          },
          template: `
            <Table :value="rows" data-key="id" filter-display="menu">
              <TableColumn field="name" header="Name" sortable filterable />
              <TableColumn field="role" header="Role" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      const menu = wrapper.find('[data-testid="table-filter-menu-name"]')
      const sort = wrapper.find('[data-testid="table-sort-name"]')
      expect(menu.exists()).toBe(true)
      expect(sort.exists()).toBe(true)

      const cluster = menu.element.parentElement
      expect(cluster).toBeTruthy()
      expect(cluster!.contains(sort.element)).toBe(true)
      expect(cluster!.className).toMatch(/inline-flex/)
      expect(cluster!.className).not.toMatch(/flex-1/)

      // Filter must not sit after a flex-1 sibling that pins it to the far right.
      for (const sibling of Array.from(cluster!.children)) {
        if (sibling === menu.element) break
        expect((sibling as HTMLElement).className).not.toMatch(/flex-1/)
      }
    })

    it('applies global filter via filters.global + globalFilterFields', async () => {
      const filters = ref({
        global: { value: 'uk' as string | null, matchMode: 'contains' },
      })

      const globalRows = [
        { id: 1, name: 'Ada', country: 'UK' },
        { id: 2, name: 'Grace', country: 'US' },
        { id: 3, name: 'Alan', country: 'UK' },
      ]

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return { rows: globalRows, filters }
          },
          template: `
            <Table
              v-model:filters="filters"
              :value="rows"
              data-key="id"
              :global-filter-fields="['name', 'country']"
            >
              <TableColumn field="name" header="Name" />
              <TableColumn field="country" header="Country" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      expect(wrapper.findAll('[data-testid^="table-row-"]')).toHaveLength(2)
      expect(wrapper.find('[data-testid="table-row-1"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="table-row-3"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="table-row-2"]').exists()).toBe(false)
    })

    it('resets page to 1 when filters change while paginated', async () => {
      const page = ref(2)
      const filters = ref({
        name: { value: null as string | null, matchMode: 'contains' },
      })
      const many = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        name: `Person ${i + 1}`,
        role: 'Engineer',
      }))

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return { rows: many, page, filters }
          },
          template: `
            <Table
              v-model:page="page"
              v-model:filters="filters"
              :value="rows"
              data-key="id"
              paginate
              :rows="5"
              filter-display="row"
            >
              <TableColumn field="name" header="Name" filterable />
              <TableColumn field="role" header="Role" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()
      expect(page.value).toBe(2)

      await wrapper.find('[data-testid="table-filter-input-name"]').setValue('Person 1')
      await nextTick()

      expect(page.value).toBe(1)
    })

    it('runs filter before sort in the client pipeline', async () => {
      const filters = ref({
        name: { value: 'a', matchMode: 'startsWith' },
      })
      const sortField = ref('name')
      const sortOrder = ref<-1 | 1 | 0>(-1)

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return { rows: filterRowsData, filters, sortField, sortOrder }
          },
          template: `
            <Table
              v-model:filters="filters"
              v-model:sort-field="sortField"
              v-model:sort-order="sortOrder"
              :value="rows"
              data-key="id"
            >
              <TableColumn field="name" header="Name" sortable />
              <TableColumn field="role" header="Role" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      // Filtered to Ada + Alan, then sorted descending by name → Alan, Ada
      expect(filterRowNames(wrapper)).toEqual(['Alan Turing', 'Ada Lovelace'])
    })

    it('has no a11y violations for row filters', async () => {
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows: filterRowsData,
              filters: ref({
                name: { value: null, matchMode: 'contains' },
              }),
            }
          },
          template: `
            <Table
              v-model:filters="filters"
              :value="rows"
              data-key="id"
              filter-display="row"
            >
              <TableColumn field="name" header="Name" filterable />
              <TableColumn field="role" header="Role" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()
      await expectNoA11yViolations(wrapper.element)
    })
  })

  // --- edit (Wave 2) ---
  describe('edit', () => {
    it('enters cell edit on click, completes on Enter, and emits cell-edit-complete', async () => {
      const rows = ref([
        { id: 1, name: 'Ada', role: 'Engineer' },
        { id: 2, name: 'Grace', role: 'Admiral' },
      ])
      const completed = ref<TableCellEditCompleteEvent | null>(null)

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn, Input },
          setup() {
            return {
              rows,
              onComplete: (e: TableCellEditCompleteEvent) => {
                completed.value = e
                const next = [...rows.value]
                const row = next[e.index] as Record<string, unknown> | undefined
                if (row && e.field) row[e.field] = e.newValue
                rows.value = next as typeof rows.value
              },
            }
          },
          template: `
            <Table
              :value="rows"
              data-key="id"
              edit-mode="cell"
              @cell-edit-complete="onComplete"
            >
              <TableColumn field="name" header="Name">
                <template #editor="{ data, field }">
                  <Input v-model="data[field]" data-testid="name-editor" />
                </template>
              </TableColumn>
              <TableColumn field="role" header="Role" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      const nameCells = wrapper.findAll('[data-testid^="table-cell-"][data-testid$="-name"]:not([data-testid*="-editor-"])')
      await nameCells[0]!.trigger('click')
      await nextTick()

      expect(wrapper.find('[data-testid="table-cell-editor-1-name"]').exists()).toBe(true)
      expect(wrapper.find('[data-editing="true"]').exists()).toBe(true)

      const input = wrapper.find('[data-testid="name-editor"]')
      await input.setValue('Augusta')
      await input.trigger('keydown', { key: 'Enter' })
      await nextTick()

      expect(completed.value).toMatchObject({
        field: 'name',
        newValue: 'Augusta',
        type: 'enter',
        index: 0,
      })
      expect(rows.value[0]!.name).toBe('Augusta')
      expect(wrapper.find('[data-testid="table-cell-editor-1-name"]').exists()).toBe(false)
    })

    it('cancels cell edit on Escape and emits cell-edit-cancel', async () => {
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn, Input },
          setup() {
            return { rows: sampleRows }
          },
          template: `
            <Table :value="rows" data-key="id" edit-mode="cell">
              <TableColumn field="name" header="Name">
                <template #editor="{ data, field }">
                  <Input v-model="data[field]" data-testid="name-editor" />
                </template>
              </TableColumn>
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      await wrapper.find('[data-testid="table-cell-1-name"]').trigger('click')
      await nextTick()
      expect(wrapper.find('[data-testid="table-cell-editor-1-name"]').exists()).toBe(true)

      const table = wrapper.findComponent(Table)
      await wrapper.find('[data-testid="name-editor"]').trigger('keydown', { key: 'Escape' })
      await nextTick()

      expect(table.emitted('cell-edit-cancel')).toBeTruthy()
      expect(table.emitted('cell-edit-cancel')![0]![0]).toMatchObject({
        field: 'name',
        index: 0,
      })
      expect(wrapper.find('[data-testid="table-cell-editor-1-name"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="table-row-1"]').text()).toContain('Ada')
    })

    it('row edit init / save / cancel with rowEditor controls', async () => {
      const rows = ref([
        { id: 1, name: 'Ada', role: 'Engineer' },
        { id: 2, name: 'Grace', role: 'Admiral' },
      ])
      const editingRows = ref<typeof rows.value>([])
      const saved = ref<TableRowEditSaveEvent | null>(null)

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn, Input },
          setup() {
            return {
              rows,
              editingRows,
              onSave: (e: TableRowEditSaveEvent) => {
                saved.value = e
                const data = e.data as { id: number }
                const index = rows.value.findIndex((r) => r.id === data.id)
                if (index === -1) return
                const next = [...rows.value]
                next[index] = e.newData as (typeof rows.value)[number]
                rows.value = next
              },
            }
          },
          template: `
            <Table
              v-model:editing-rows="editingRows"
              :value="rows"
              data-key="id"
              edit-mode="row"
              @row-edit-save="onSave"
            >
              <TableColumn field="name" header="Name">
                <template #editor="{ data, field }">
                  <Input v-model="data[field]" data-testid="name-editor" />
                </template>
              </TableColumn>
              <TableColumn field="role" header="Role">
                <template #editor="{ data, field }">
                  <Input v-model="data[field]" />
                </template>
              </TableColumn>
              <TableColumn row-editor />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      const editBtn = wrapper.find('[data-testid="table-row-edit-1"]')
      expect(editBtn.attributes('aria-label')).toBe('Edit')
      await editBtn.trigger('click')
      await nextTick()

      expect(editingRows.value).toHaveLength(1)
      expect(wrapper.find('[data-testid="table-cell-editor-1-name"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="table-row-save-1"]').attributes('aria-label')).toBe('Save')
      expect(wrapper.find('[data-testid="table-row-cancel-1"]').attributes('aria-label')).toBe(
        'Cancel',
      )

      const table = wrapper.findComponent(Table)
      expect(table.emitted('row-edit-init')).toBeTruthy()

      await wrapper.find('[data-testid="name-editor"]').setValue('Augusta')
      await wrapper.find('[data-testid="table-row-save-1"]').trigger('click')
      await nextTick()

      expect(saved.value).toMatchObject({
        index: 0,
        newData: { id: 1, name: 'Augusta', role: 'Engineer' },
      })
      expect(rows.value[0]!.name).toBe('Augusta')
      expect(editingRows.value).toHaveLength(0)

      await wrapper.find('[data-testid="table-row-edit-2"]').trigger('click')
      await nextTick()
      await wrapper.find('[data-testid="name-editor"]').setValue('No save')
      await wrapper.find('[data-testid="table-row-cancel-2"]').trigger('click')
      await nextTick()

      expect(table.emitted('row-edit-cancel')).toBeTruthy()
      expect(rows.value[1]!.name).toBe('Grace')
      expect(editingRows.value).toHaveLength(0)
    })

    it('keeps checkbox selection independent of cell edit clicks', async () => {
      const rows = ref([...sampleRows])
      const selection = ref<typeof sampleRows>([])

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn, Input },
          setup() {
            return { rows, selection }
          },
          template: `
            <Table
              v-model:selection="selection"
              :value="rows"
              data-key="id"
              edit-mode="cell"
            >
              <TableColumn selection-mode="multiple" />
              <TableColumn field="name" header="Name">
                <template #editor="{ data, field }">
                  <Input v-model="data[field]" data-testid="name-editor" />
                </template>
              </TableColumn>
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      await wrapper.find('[data-testid="table-row-select-1"]').setValue(true)
      await nextTick()
      expect(selection.value).toHaveLength(1)
      expect(wrapper.find('[data-testid="table-cell-editor-1-name"]').exists()).toBe(false)

      await wrapper.find('[data-testid="table-cell-1-name"]').trigger('click')
      await nextTick()
      expect(wrapper.find('[data-testid="table-cell-editor-1-name"]').exists()).toBe(true)
      expect(selection.value).toHaveLength(1)
    })

    it('has no a11y violations in row edit mode', async () => {
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn, Input },
          setup() {
            const editingRows = ref<typeof sampleRows>([])
            return { rows: sampleRows, editingRows }
          },
          template: `
            <Table
              v-model:editing-rows="editingRows"
              :value="rows"
              data-key="id"
              edit-mode="row"
            >
              <TableColumn field="name" header="Name">
                <template #editor="{ data, field }">
                  <Input v-model="data[field]" />
                </template>
              </TableColumn>
              <TableColumn row-editor />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()
      await expectNoA11yViolations(wrapper.element)
    })
  })

  describe('resize / reorder', () => {
    function dispatchPointer(
      target: EventTarget,
      type: 'pointerdown' | 'pointermove' | 'pointerup',
      clientX: number,
    ) {
      target.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          clientX,
          pointerId: 1,
          pointerType: 'mouse',
        }),
      )
    }

    it('applies overflow clip classes on resizable cells', async () => {
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return { rows: sampleRows }
          },
          template: `
            <Table :value="rows" data-key="id" resizable-columns>
              <TableColumn field="name" header="Name" width="100px" />
              <TableColumn field="role" header="Role" width="100px" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      const th = wrapper.find('[data-testid="table-column-header-name"]')
      const td = wrapper.find('[data-testid="table-cell-1-name"]')
      for (const el of [th, td]) {
        const classes = el.classes().join(' ')
        expect(classes).toMatch(/overflow-hidden/)
        expect(classes).toMatch(/text-ellipsis/)
        expect(classes).toMatch(/whitespace-nowrap/)
        expect(classes).toMatch(/min-w-0/)
      }
    })

    it('fit mode steals width from the adjacent column and emits column-resize-end', async () => {
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return { rows: sampleRows }
          },
          template: `
            <Table
              :value="rows"
              data-key="id"
              resizable-columns
              column-resize-mode="fit"
              show-gridlines
            >
              <TableColumn field="name" header="Name" width="100px" />
              <TableColumn field="role" header="Role" width="100px" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      const handle = wrapper.find('[data-testid="table-column-resize-name"]')
      expect(handle.exists()).toBe(true)
      expect(handle.attributes('aria-label')).toBe('Resize column')

      const nameTh = wrapper.find('[data-testid="table-column-header-name"]')
      const roleTh = wrapper.find('[data-testid="table-column-header-role"]')
      // Seed measured widths so resize does not depend on jsdom layout
      Object.defineProperty(nameTh.element, 'offsetWidth', { configurable: true, value: 100 })
      Object.defineProperty(roleTh.element, 'offsetWidth', { configurable: true, value: 100 })

      dispatchPointer(handle.element, 'pointerdown', 100)
      dispatchPointer(document, 'pointermove', 130)
      dispatchPointer(document, 'pointerup', 130)
      await nextTick()

      const resizeEvents = wrapper.findComponent(Table).emitted('column-resize-end')
      expect(resizeEvents).toBeTruthy()
      const payload = resizeEvents![0]![0] as TableColumnResizeEndEvent
      expect(payload.field).toBe('name')
      expect(payload.width).toBe(130)
      expect(payload.delta).toBe(30)
      expect(nameTh.attributes('style')).toContain('130px')
      expect(roleTh.attributes('style')).toContain('70px')
    })

    it('expand mode grows table width without shrinking the neighbor', async () => {
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return { rows: sampleRows }
          },
          template: `
            <Table
              :value="rows"
              data-key="id"
              resizable-columns
              column-resize-mode="expand"
            >
              <TableColumn field="name" header="Name" width="100px" />
              <TableColumn field="role" header="Role" width="100px" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      const handle = wrapper.find('[data-testid="table-column-resize-name"]')
      const nameTh = wrapper.find('[data-testid="table-column-header-name"]')
      const roleTh = wrapper.find('[data-testid="table-column-header-role"]')
      Object.defineProperty(nameTh.element, 'offsetWidth', { configurable: true, value: 100 })
      Object.defineProperty(roleTh.element, 'offsetWidth', { configurable: true, value: 100 })

      dispatchPointer(handle.element, 'pointerdown', 100)
      dispatchPointer(document, 'pointermove', 140)
      dispatchPointer(document, 'pointerup', 140)
      await nextTick()

      expect(nameTh.attributes('style')).toContain('140px')
      expect(roleTh.attributes('style')).toContain('100px')
      expect(wrapper.find('table').attributes('style')).toContain('240px')
    })

    it('reorders columns via drag-and-drop and updates columnOrder', async () => {
      const columnOrder = ref<string[]>([])
      const reorderPayloads: TableColumnReorderEvent[] = []

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows: sampleRows,
              columnOrder,
              onColumnReorder: (e: TableColumnReorderEvent) => reorderPayloads.push(e),
            }
          },
          template: `
            <Table
              v-model:column-order="columnOrder"
              :value="rows"
              data-key="id"
              reorderable-columns
              @column-reorder="onColumnReorder"
            >
              <TableColumn field="name" header="Name" />
              <TableColumn field="role" header="Role" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      expect(wrapper.find('[data-testid="table-column-reorder-name"]').exists()).toBe(true)

      const headers = wrapper.findAll('thead tr:first-child th')
      expect(headers[0]!.text()).toContain('Name')

      const dataTransfer = {
        data: '' as string,
        effectAllowed: 'all',
        dropEffect: 'none',
        setData(type: string, val: string) {
          if (type === 'text/plain') this.data = val
        },
        getData(type: string) {
          return type === 'text/plain' ? this.data : ''
        },
      }

      await headers[0]!.trigger('dragstart', { dataTransfer })
      await headers[1]!.trigger('dragover', { dataTransfer })
      await headers[1]!.trigger('drop', { dataTransfer })
      await nextTick()

      expect(columnOrder.value).toEqual(['role', 'name'])
      expect(reorderPayloads).toHaveLength(1)
      expect(reorderPayloads[0]!.dragIndex).toBe(0)
      expect(reorderPayloads[0]!.dropIndex).toBe(1)
      expect(reorderPayloads[0]!.columnOrder).toEqual(['role', 'name'])

      const headersAfter = wrapper.findAll('thead tr:first-child th')
      expect(headersAfter[0]!.text()).toContain('Role')
      expect(headersAfter[1]!.text()).toContain('Name')
    })

    it('reorders rows via handle drag-and-drop and emits row-reorder', async () => {
      const rows = ref([...sampleRows])
      const reorderPayloads: TableRowReorderEvent[] = []

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows,
              onRowReorder: (e: TableRowReorderEvent) => {
                reorderPayloads.push(e)
                rows.value = e.value as typeof sampleRows
              },
            }
          },
          template: `
            <Table
              :value="rows"
              data-key="id"
              reorderable-rows
              @row-reorder="onRowReorder"
            >
              <TableColumn row-reorder header-style="width: 3rem" />
              <TableColumn field="name" header="Name" />
              <TableColumn field="role" header="Role" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      const handle = wrapper.find('[data-testid="table-row-reorder-1"]')
      expect(handle.exists()).toBe(true)
      expect(handle.attributes('aria-label')).toBe('Reorder row')

      const dataTransfer = {
        data: '' as string,
        effectAllowed: 'all',
        dropEffect: 'none',
        setData(type: string, val: string) {
          if (type === 'text/plain') this.data = val
        },
        getData(type: string) {
          return type === 'text/plain' ? this.data : ''
        },
      }

      const targetRow = wrapper.find('[data-testid="table-row-3"]')
      await handle.trigger('dragstart', { dataTransfer })
      await targetRow.trigger('dragover', { dataTransfer })
      await targetRow.trigger('drop', { dataTransfer })
      await nextTick()

      expect(reorderPayloads).toHaveLength(1)
      expect(reorderPayloads[0]!.dragIndex).toBe(0)
      expect(reorderPayloads[0]!.dropIndex).toBe(2)
      expect(rows.value.map((r) => r.id)).toEqual([2, 3, 1])
    })

    it('has no a11y violations with resize and reorder enabled', async () => {
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return { rows: sampleRows }
          },
          template: `
            <Table
              :value="rows"
              data-key="id"
              resizable-columns
              reorderable-columns
              reorderable-rows
            >
              <TableColumn row-reorder />
              <TableColumn field="name" header="Name" />
              <TableColumn field="role" header="Role" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()
      await expectNoA11yViolations(wrapper.element)
    })
  })

  // --- column groups / visibility model (Wave 3) ---
  describe('column visibility', () => {
    it('hides columns via visible=false', async () => {
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return { rows: sampleRows }
          },
          template: `
            <Table :value="rows" data-key="id">
              <TableColumn field="name" header="Name" />
              <TableColumn field="role" header="Role" :visible="false" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      expect(wrapper.find('[data-testid="table-column-header-name"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="table-column-header-role"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid^="table-cell-"][data-testid$="-role"]').exists()).toBe(false)
      expect(wrapper.findAll('th')).toHaveLength(1)
    })

    it('hides columns via v-model:hiddenColumns', async () => {
      const hiddenColumns = ref<string[]>(['role'])

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return { rows: sampleRows, hiddenColumns }
          },
          template: `
            <Table v-model:hidden-columns="hiddenColumns" :value="rows" data-key="id">
              <TableColumn field="name" header="Name" />
              <TableColumn field="role" header="Role" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      expect(wrapper.find('[data-testid="table-column-header-name"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="table-column-header-role"]').exists()).toBe(false)

      hiddenColumns.value = []
      await nextTick()
      expect(wrapper.find('[data-testid="table-column-header-role"]').exists()).toBe(true)

      hiddenColumns.value = ['name']
      await nextTick()
      expect(wrapper.find('[data-testid="table-column-header-name"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="table-column-header-role"]').exists()).toBe(true)
    })
  })

  describe('column group', () => {
    it('renders multi-row headers with colspan and rowspan', async () => {
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn, TableColumnGroup, TableHeaderRow },
          setup() {
            return {
              rows: [
                { id: 1, product: 'A', ly: 10, ty: 20 },
                { id: 2, product: 'B', ly: 30, ty: 40 },
              ],
            }
          },
          template: `
            <Table :value="rows" data-key="id">
              <TableColumnGroup type="header">
                <TableHeaderRow>
                  <TableColumn header="Product" field="product" :rowspan="2" />
                  <TableColumn header="Sales" :colspan="2" />
                </TableHeaderRow>
                <TableHeaderRow>
                  <TableColumn field="ly" header="Last Year" />
                  <TableColumn field="ty" header="This Year" />
                </TableHeaderRow>
              </TableColumnGroup>
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      const headerRows = wrapper.findAll('[data-testid^="table-header-row"]')
      expect(headerRows.length).toBeGreaterThanOrEqual(2)

      const productTh = wrapper.find('[data-testid="table-column-header-product"]')
      expect(productTh.exists()).toBe(true)
      expect(productTh.attributes('rowspan')).toBe('2')

      const salesGroup = wrapper.find('[data-testid="table-column-header-group-sales"]')
      expect(salesGroup.exists()).toBe(true)
      expect(salesGroup.attributes('colspan')).toBe('2')

      expect(wrapper.find('[data-testid="table-column-header-ly"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="table-column-header-ty"]').exists()).toBe(true)

      // Body uses leaf columns only (3 fields), not chrome cells
      const firstRow = wrapper.find('[data-testid="table-row-1"]')
      expect(firstRow.findAll('td')).toHaveLength(3)
      expect(firstRow.text()).toContain('A')
      expect(firstRow.text()).toContain('10')
    })

    it('keeps sort on leaf columns inside a group', async () => {
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn, TableColumnGroup, TableHeaderRow },
          setup() {
            return {
              rows: [
                { id: 1, product: 'B', ly: 30 },
                { id: 2, product: 'A', ly: 10 },
              ],
            }
          },
          template: `
            <Table :value="rows" data-key="id">
              <TableColumnGroup type="header">
                <TableHeaderRow>
                  <TableColumn header="Product" field="product" :rowspan="2" sortable />
                  <TableColumn header="Metrics" :colspan="1" />
                </TableHeaderRow>
                <TableHeaderRow>
                  <TableColumn field="ly" header="LY" sortable />
                </TableHeaderRow>
              </TableColumnGroup>
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      await wrapper.find('[data-testid="table-sort-product"]').trigger('click')
      await nextTick()

      const rows = wrapper.findAll('[data-testid^="table-row-"]')
      expect(rows[0]!.text()).toContain('A')
      expect(rows[1]!.text()).toContain('B')
    })

    it('has no a11y violations for column groups', async () => {
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn, TableColumnGroup, TableHeaderRow },
          setup() {
            return {
              rows: [{ id: 1, product: 'A', ly: 10, ty: 20 }],
            }
          },
          template: `
            <Table :value="rows" data-key="id">
              <TableColumnGroup type="header">
                <TableHeaderRow>
                  <TableColumn header="Product" field="product" :rowspan="2" />
                  <TableColumn header="Sales" :colspan="2" />
                </TableHeaderRow>
                <TableHeaderRow>
                  <TableColumn field="ly" header="Last Year" />
                  <TableColumn field="ty" header="This Year" />
                </TableHeaderRow>
              </TableColumnGroup>
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()
      await expectNoA11yViolations(wrapper.element)
    })
  })

  // --- expand / group (Wave 3) ---
  describe('expand / group', () => {
    const groupRows = [
      { id: 1, name: 'Ada', role: 'Engineer' },
      { id: 2, name: 'Alan', role: 'Engineer' },
      { id: 3, name: 'Grace', role: 'Admiral' },
      { id: 4, name: 'Katherine', role: 'Mathematician' },
    ]

    it('expands a row via expander toggler and emits row-expand', async () => {
      const expandedRows = ref<TableExpandedRows>({})
      const expandPayloads: unknown[] = []
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows: groupRows,
              expandedRows,
              onExpand: (e: { data: unknown }) => expandPayloads.push(e.data),
            }
          },
          template: `
            <Table
              v-model:expanded-rows="expandedRows"
              :value="rows"
              data-key="id"
              @row-expand="onExpand"
            >
              <TableColumn expander />
              <TableColumn field="name" header="Name" />
              <template #expansion="{ data }">
                <span data-testid="expansion-body">{{ data.name }} detail</span>
              </template>
            </Table>
          `,
        }),
      )
      await nextTick()
      expect(wrapper.find('[data-testid="table-expansion-1"]').exists()).toBe(false)
      await wrapper.find('[data-testid="table-row-toggler-1"]').trigger('click')
      await nextTick()
      expect(wrapper.find('[data-testid="table-expansion-1"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="expansion-body"]').text()).toContain('Ada')
      expect(expandedRows.value).toEqual({ '1': true })
      expect(expandPayloads).toHaveLength(1)
      const toggler = wrapper.find('[data-testid="table-row-toggler-1"]')
      expect(toggler.attributes('aria-expanded')).toBe('true')
      expect(toggler.attributes('aria-controls')).toBeTruthy()
    })

    it('collapses an expanded row and emits row-collapse', async () => {
      const expandedRows = ref<TableExpandedRows>({ '1': true })
      const collapsePayloads: unknown[] = []
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows: groupRows,
              expandedRows,
              onCollapse: (e: { data: unknown }) => collapsePayloads.push(e.data),
            }
          },
          template: `
            <Table
              v-model:expanded-rows="expandedRows"
              :value="rows"
              data-key="id"
              @row-collapse="onCollapse"
            >
              <TableColumn expander />
              <TableColumn field="name" header="Name" />
              <template #expansion>
                <span>detail</span>
              </template>
            </Table>
          `,
        }),
      )
      await nextTick()
      expect(wrapper.find('[data-testid="table-expansion-1"]').exists()).toBe(true)
      await wrapper.find('[data-testid="table-row-toggler-1"]').trigger('click')
      await nextTick()
      expect(wrapper.find('[data-testid="table-expansion-1"]').exists()).toBe(false)
      expect(expandedRows.value).toEqual({})
      expect(collapsePayloads).toHaveLength(1)
    })

    it('renders subheader group chrome', async () => {
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return { rows: groupRows }
          },
          template: `
            <Table
              :value="rows"
              data-key="id"
              group-rows-by="role"
              row-group-mode="subheader"
            >
              <TableColumn field="name" header="Name" />
              <TableColumn field="role" header="Role" />
              <template #groupheader="{ groupValue }">
                <span data-testid="gh-label">{{ groupValue }}</span>
              </template>
              <template #groupfooter="{ rows: members }">
                <span data-testid="gf-count">{{ members.length }}</span>
              </template>
            </Table>
          `,
        }),
      )
      await nextTick()
      expect(wrapper.find('[data-testid="table-group-header-engineer"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="table-group-footer-engineer"]').exists()).toBe(true)
      expect(wrapper.findAll('[data-testid="gh-label"]').map((n) => n.text())).toContain('Engineer')
    })

    it('applies rowspan on the group field column', async () => {
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return { rows: groupRows }
          },
          template: `
            <Table
              :value="rows"
              data-key="id"
              group-rows-by="role"
              row-group-mode="rowspan"
            >
              <TableColumn field="role" header="Role" />
              <TableColumn field="name" header="Name" />
            </Table>
          `,
        }),
      )
      await nextTick()
      const roleCells = wrapper.findAll('[data-testid^="table-cell-"][data-testid$="-role"]:not([data-testid*="-editor-"])')
      expect(roleCells[0]!.attributes('rowspan')).toBe('2')
      expect(roleCells).toHaveLength(3)
    })

    it('expands and collapses row groups', async () => {
      const expandedRowGroups = ref<unknown[]>([])
      const expandGroups: unknown[] = []
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows: groupRows,
              expandedRowGroups,
              onGroupExpand: (e: { data: unknown }) => expandGroups.push(e.data),
            }
          },
          template: `
            <Table
              v-model:expanded-row-groups="expandedRowGroups"
              :value="rows"
              data-key="id"
              group-rows-by="role"
              row-group-mode="subheader"
              expandable-row-groups
              @rowgroup-expand="onGroupExpand"
            >
              <TableColumn field="name" header="Name" />
              <template #groupheader="{ groupValue }">{{ groupValue }}</template>
            </Table>
          `,
        }),
      )
      await nextTick()
      expect(wrapper.find('[data-testid="table-row-1"]').exists()).toBe(false)
      await wrapper.find('[data-testid="table-group-toggler-engineer"]').trigger('click')
      await nextTick()
      expect(wrapper.find('[data-testid="table-row-1"]').exists()).toBe(true)
      expect(expandedRowGroups.value).toEqual(['Engineer'])
      expect(expandGroups).toEqual(['Engineer'])
      const toggler = wrapper.find('[data-testid="table-group-toggler-engineer"]')
      expect(toggler.attributes('aria-expanded')).toBe('true')
    })

    it('has no a11y violations for row expansion', async () => {
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            const expandedRows = ref<TableExpandedRows>({ '1': true })
            return { rows: groupRows, expandedRows }
          },
          template: `
            <Table v-model:expanded-rows="expandedRows" :value="rows" data-key="id">
              <TableColumn expander />
              <TableColumn field="name" header="Name" />
              <template #expansion="{ data }">{{ data.name }}</template>
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()
      await expectNoA11yViolations(wrapper.element)
    })
  })

  // --- context menu (Wave 4) ---
  describe('context menu', () => {
    function mountContextMenu(options: { contextMenu?: boolean; paginate?: boolean } = {}) {
      const contextMenuSelection = ref<unknown>(null)
      const page = ref(options.paginate ? 2 : 1)
      const events: TableRowContextMenuEvent[] = []

      return {
        contextMenuSelection,
        events,
        wrapper: mount(
          defineComponent({
            components: { Table, TableColumn },
            setup() {
              return {
                rows: sampleRows,
                contextMenuSelection,
                page,
                contextMenu: options.contextMenu ?? true,
                paginate: options.paginate ?? false,
                onRowContextMenu: (e: TableRowContextMenuEvent) => events.push(e),
              }
            },
            template: `
              <Table
                v-model:context-menu-selection="contextMenuSelection"
                v-model:page="page"
                :value="rows"
                data-key="id"
                :context-menu="contextMenu"
                :paginate="paginate"
                :rows="2"
                @row-contextmenu="onRowContextMenu"
              >
                <TableColumn field="name" header="Name" />
                <TableColumn field="role" header="Role" />
              </Table>
            `,
          }),
          { attachTo: document.body },
        ),
      }
    }

    it('updates contextMenuSelection and emits row-contextmenu on right-click', async () => {
      const mounted = mountContextMenu()
      wrapper = mounted.wrapper
      await nextTick()

      const row = wrapper.find('[data-testid="table-row-2"]')
      await row.trigger('contextmenu')
      await nextTick()

      expect(mounted.contextMenuSelection.value).toEqual({
        id: 2,
        name: 'Grace',
        role: 'Admiral',
      })
      expect(row.attributes('data-context-menu-selection')).toBe('true')
      expect(mounted.events).toHaveLength(1)
      expect(mounted.events[0]).toMatchObject({
        data: { id: 2, name: 'Grace', role: 'Admiral' },
        index: 1,
      })
      expect(mounted.events[0]!.originalEvent).toBeInstanceOf(Event)
    })

    it('calls preventDefault on the contextmenu event when enabled', async () => {
      const mounted = mountContextMenu()
      wrapper = mounted.wrapper
      await nextTick()

      const row = wrapper.find('[data-testid="table-row-1"]')
      const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
      const prevented = !row.element.dispatchEvent(event)
      await nextTick()

      expect(prevented || event.defaultPrevented).toBe(true)
      expect(mounted.contextMenuSelection.value).toEqual({
        id: 1,
        name: 'Ada',
        role: 'Engineer',
      })
    })

    it('does not handle contextmenu when contextMenu is false', async () => {
      const mounted = mountContextMenu({ contextMenu: false })
      wrapper = mounted.wrapper
      await nextTick()

      const row = wrapper.find('[data-testid="table-row-1"]')
      const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
      row.element.dispatchEvent(event)
      await nextTick()

      expect(event.defaultPrevented).toBe(false)
      expect(mounted.contextMenuSelection.value).toBeNull()
      expect(mounted.events).toHaveLength(0)
      expect(row.attributes('data-context-menu-selection')).toBeUndefined()
    })

    it('emits pipeline index when paginated', async () => {
      const mounted = mountContextMenu({ paginate: true })
      wrapper = mounted.wrapper
      await nextTick()

      // page 2, rows=2 → visible row is Alan (index 2 in full pipeline)
      await wrapper.find('[data-testid="table-row-3"]').trigger('contextmenu')
      await nextTick()

      expect(mounted.events).toHaveLength(1)
      expect(mounted.events[0]).toMatchObject({
        data: { id: 3, name: 'Alan', role: 'Scientist' },
        index: 2,
      })
    })
  })

  // --- state / export (Wave 4) ---
  describe('stateful', () => {
    const STATE_KEY = 'kablui-table-spec-state'

    afterEach(() => {
      sessionStorage.removeItem(STATE_KEY)
      localStorage.removeItem(STATE_KEY)
    })

    it('persists and restores page, sort, filters, selection, and hiddenColumns', async () => {
      const page = ref(1)
      const sortField = ref<string | null>(null)
      const sortOrder = ref<1 | -1 | 0 | null>(null)
      const filters = ref({
        global: { value: null as string | null, matchMode: 'contains' },
      })
      const selection = ref<(typeof sampleRows)[number] | null>(null)
      const hiddenColumns = ref<string[]>([])

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows: sampleRows,
              page,
              sortField,
              sortOrder,
              filters,
              selection,
              hiddenColumns,
            }
          },
          template: `
            <Table
              v-model:page="page"
              v-model:sort-field="sortField"
              v-model:sort-order="sortOrder"
              v-model:filters="filters"
              v-model:selection="selection"
              v-model:hidden-columns="hiddenColumns"
              :value="rows"
              data-key="id"
              selection-mode="single"
              paginate
              :rows="1"
              state-key="${STATE_KEY}"
              state-storage="session"
              :global-filter-fields="['name']"
            >
              <TableColumn field="name" header="Name" sortable />
              <TableColumn field="role" header="Role" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()
      await nextTick()

      sortField.value = 'name'
      sortOrder.value = -1
      // Keep enough matches for page 2 (Pagination clamps page to pageCount).
      filters.value = {
        global: { value: 'a', matchMode: 'contains' },
      }
      selection.value = sampleRows[0]
      hiddenColumns.value = ['role']
      await nextTick()
      // Set page after filters — filter changes reset page to 1.
      page.value = 2
      await nextTick()
      await nextTick()

      const raw = sessionStorage.getItem(STATE_KEY)
      expect(raw).toBeTruthy()
      const saved = JSON.parse(raw!)
      expect(saved.page).toBe(2)
      expect(saved.sortField).toBe('name')
      expect(saved.sortOrder).toBe(-1)
      expect(saved.filters.global.value).toBe('a')
      expect(saved.selectionKeys).toEqual(['1'])
      expect(saved.hiddenColumns).toEqual(['role'])

      wrapper.unmount()

      const page2 = ref(1)
      const sortField2 = ref<string | null>(null)
      const sortOrder2 = ref<1 | -1 | 0 | null>(null)
      const filters2 = ref({
        global: { value: null as string | null, matchMode: 'contains' },
      })
      const selection2 = ref<(typeof sampleRows)[number] | null>(null)
      const hiddenColumns2 = ref<string[]>([])

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows: sampleRows,
              page: page2,
              sortField: sortField2,
              sortOrder: sortOrder2,
              filters: filters2,
              selection: selection2,
              hiddenColumns: hiddenColumns2,
            }
          },
          template: `
            <Table
              v-model:page="page"
              v-model:sort-field="sortField"
              v-model:sort-order="sortOrder"
              v-model:filters="filters"
              v-model:selection="selection"
              v-model:hidden-columns="hiddenColumns"
              :value="rows"
              data-key="id"
              selection-mode="single"
              paginate
              :rows="1"
              state-key="${STATE_KEY}"
              state-storage="session"
              :global-filter-fields="['name']"
            >
              <TableColumn field="name" header="Name" sortable />
              <TableColumn field="role" header="Role" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      expect(page2.value).toBe(2)
      expect(sortField2.value).toBe('name')
      expect(sortOrder2.value).toBe(-1)
      expect(filters2.value.global.value).toBe('a')
      expect(selection2.value).toEqual(sampleRows[0])
      expect(hiddenColumns2.value).toEqual(['role'])
    })

    it('clamps restored page when past pageCount', async () => {
      const STATE_KEY = 'kablui-table-spec-page-clamp'
      sessionStorage.setItem(
        STATE_KEY,
        JSON.stringify({
          page: 99,
          sortField: null,
          sortOrder: null,
          multiSortMeta: [],
          filters: {},
          columnOrder: [],
          hiddenColumns: [],
        }),
      )

      const page = ref(1)
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return { rows: sampleRows, page }
          },
          template: `
            <Table
              v-model:page="page"
              :value="rows"
              data-key="id"
              paginate
              :rows="2"
              state-key="${STATE_KEY}"
              state-storage="session"
            >
              <TableColumn field="name" header="Name" />
              <TableColumn field="role" header="Role" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()
      await nextTick()

      // 3 rows / 2 per page → pageCount 2; page 99 clamps to 2.
      expect(page.value).toBe(2)
      sessionStorage.removeItem(STATE_KEY)
    })
  })

  describe('export', () => {
    it('exposes exportCsv for filtered rows', async () => {
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            const filters = ref({
              global: { value: 'Ada', matchMode: 'contains' },
            })
            return { rows: sampleRows, filters }
          },
          template: `
            <Table
              v-model:filters="filters"
              :value="rows"
              data-key="id"
              export-filename="test.csv"
              :global-filter-fields="['name']"
            >
              <TableColumn field="name" header="Name" />
              <TableColumn field="role" header="Role" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()
      const table = wrapper.findComponent(Table)
      const csv = (table.vm as unknown as { exportCsv: (o?: object) => string }).exportCsv({
        filename: '',
      })
      expect(csv).toContain('Name,Role')
      expect(csv).toContain('Ada,Engineer')
      expect(csv).not.toContain('Grace')
    })
  })

  // --- lazy / virtual (Wave 4) ---
  describe('lazy', () => {
    const serverPage = [
      { id: 11, name: 'Server A', role: 'Engineer' },
      { id: 12, name: 'Server B', role: 'Designer' },
      { id: 13, name: 'Server C', role: 'Engineer' },
    ]

    it('renders value as-is without client paging when lazy', async () => {
      wrapper = mountBasic({
        value: serverPage,
        lazy: true,
        paginate: true,
        rows: 2,
        totalRecords: 30,
        page: 2,
      })
      await nextTick()

      expect(wrapper.find('[data-testid="table"]').attributes('data-lazy')).toBe('true')
      // All 3 server rows shown (no client slice to 2)
      expect(wrapper.findAll('[data-testid^="table-row-"]')).toHaveLength(3)
      expect(wrapper.find('[data-testid="table-row-11"]').text()).toContain('Server A')
      // totalRecords drives page count: 30/2 = 15
      expect(wrapper.find('[data-testid="table-pagination-page-15"]').exists()).toBe(true)
    })

    it('does not client-sort when lazy', async () => {
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows: [
                { id: 1, name: 'Zed' },
                { id: 2, name: 'Amy' },
              ],
            }
          },
          template: `
            <Table :value="rows" data-key="id" lazy sort-field="name" :sort-order="1">
              <TableColumn field="name" header="Name" sortable />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      const texts = wrapper.findAll('[data-testid^="table-row-"]').map((r) => r.text())
      expect(texts[0]).toContain('Zed')
      expect(texts[1]).toContain('Amy')
    })

    it('emits page and load when the page changes under lazy', async () => {
      const loads: TableLoadEvent[] = []
      const pages: TableLoadEvent[] = []

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            const page = ref(1)
            return {
              rows: serverPage,
              page,
              onLoad: (e: TableLoadEvent) => loads.push(e),
              onPage: (e: TableLoadEvent) => pages.push(e),
            }
          },
          template: `
            <Table
              v-model:page="page"
              :value="rows"
              data-key="id"
              lazy
              paginate
              :rows="5"
              :total-records="20"
              @load="onLoad"
              @page="onPage"
            >
              <TableColumn field="name" header="Name" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      await wrapper.find('[data-testid="table-pagination-page-2"]').trigger('click')
      await nextTick()

      expect(pages.length).toBeGreaterThanOrEqual(1)
      expect(loads.length).toBeGreaterThanOrEqual(1)
      const last = loads[loads.length - 1]!
      expect(last.page).toBe(2)
      expect(last.first).toBe(5)
      expect(last.rows).toBe(5)
      expect(last.totalRecords).toBe(20)
    })

    it('emits load on sort when lazy', async () => {
      const loads: TableLoadEvent[] = []

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows: serverPage,
              onLoad: (e: TableLoadEvent) => loads.push(e),
            }
          },
          template: `
            <Table
              :value="rows"
              data-key="id"
              lazy
              paginate
              :rows="5"
              :total-records="20"
              @load="onLoad"
            >
              <TableColumn field="name" header="Name" sortable />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      await wrapper.find('[data-testid="table-sort-name"]').trigger('click')
      await nextTick()

      expect(loads.length).toBeGreaterThanOrEqual(1)
      expect(loads[loads.length - 1]!.sortField).toBe('name')
    })

    it('has no a11y violations when lazy + paginated', async () => {
      wrapper = mountBasic({
        value: serverPage,
        lazy: true,
        paginate: true,
        rows: 5,
        totalRecords: 30,
      })
      await nextTick()
      await expectNoA11yViolations(wrapper.element)
    })

    it('emits load on mount when lazy (after hydrate)', async () => {
      const loads: TableLoadEvent[] = []
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows: serverPage,
              onLoad: (e: TableLoadEvent) => loads.push(e),
            }
          },
          template: `
            <Table
              :value="rows"
              data-key="id"
              lazy
              paginate
              :rows="5"
              :total-records="20"
              @load="onLoad"
            >
              <TableColumn field="name" header="Name" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()
      await nextTick()

      expect(loads.length).toBeGreaterThanOrEqual(1)
      expect(loads[0]!.page).toBe(1)
      expect(loads[0]!.first).toBe(0)
    })
  })

  describe('virtual scroll', () => {
    const manyVirtual = Array.from({ length: 200 }, (_, i) => ({
      id: i + 1,
      name: `Person ${i + 1}`,
    }))

    it('windows rows and renders spacers for a large local array', async () => {
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows: manyVirtual,
              virtualScrollerOptions: { itemSize: 40, numToleratedItems: 2 },
            }
          },
          template: `
            <Table
              :value="rows"
              data-key="id"
              scroll-height="200px"
              :virtual-scroller-options="virtualScrollerOptions"
            >
              <TableColumn field="name" header="Name" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()
      await nextTick()

      expect(wrapper.find('[data-testid="table"]').attributes('data-virtual')).toBe('true')
      const rendered = wrapper.findAll('[data-testid^="table-row-"]')
      expect(rendered.length).toBeGreaterThan(0)
      expect(rendered.length).toBeLessThan(manyVirtual.length)
      // Bottom spacer present when not scrolled to end
      expect(wrapper.find('[data-testid="table-virtual-spacer-bottom"]').exists()).toBe(true)
    })

    it('scrolls the virtual window so End/Arrow focus lands on the target row', async () => {
      const selection = ref<(typeof manyVirtual)[number] | null>(null)

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows: manyVirtual,
              selection,
              virtualScrollerOptions: { itemSize: 40, numToleratedItems: 2 },
            }
          },
          template: `
            <Table
              v-model:selection="selection"
              :value="rows"
              data-key="id"
              selection-mode="single"
              scroll-height="200px"
              :virtual-scroller-options="virtualScrollerOptions"
            >
              <TableColumn field="name" header="Name" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()
      await nextTick()

      const first = wrapper.find('[data-testid="table-row-1"]')
      expect(first.exists()).toBe(true)
      expect(wrapper.find('[data-testid="table-row-200"]').exists()).toBe(false)

      await first.trigger('keydown', { key: 'End' })
      await nextTick()
      await nextTick()

      const last = wrapper.find('[data-testid="table-row-200"]')
      expect(last.exists()).toBe(true)
      expect(document.activeElement).toBe(last.element)

      await last.trigger('keydown', { key: 'ArrowUp' })
      await nextTick()
      await nextTick()

      const prev = wrapper.find('[data-testid="table-row-199"]')
      expect(prev.exists()).toBe(true)
      expect(document.activeElement).toBe(prev.element)
    })

    it('emits lazy-load for virtual lazy mode', async () => {
      const events: TableVirtualLazyLoadEvent[] = []
      const sparse = Array.from({ length: 100 }) as unknown[]

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows: sparse,
              virtualScrollerOptions: { itemSize: 40, lazy: true, delay: 0 },
              onLazyLoad: (e: TableVirtualLazyLoadEvent) => events.push(e),
            }
          },
          template: `
            <Table
              :value="rows"
              scroll-height="200px"
              :virtual-scroller-options="virtualScrollerOptions"
              @lazy-load="onLazyLoad"
            >
              <TableColumn field="name" header="Name" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()
      await nextTick()

      expect(events.length).toBeGreaterThanOrEqual(1)
      expect(events[0]!.first).toBe(0)
      expect(events[0]!.last).toBeGreaterThan(0)
    })

    it('has no a11y violations with virtual scroll', async () => {
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows: manyVirtual.slice(0, 50),
              virtualScrollerOptions: { itemSize: 40 },
            }
          },
          template: `
            <Table
              :value="rows"
              data-key="id"
              scroll-height="200px"
              :virtual-scroller-options="virtualScrollerOptions"
            >
              <TableColumn field="name" header="Name" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()
      await expectNoA11yViolations(wrapper.element)
    })

    it('does not enable virtualization without scrollHeight', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows: manyVirtual.slice(0, 30),
              virtualScrollerOptions: { itemSize: 40 },
            }
          },
          template: `
            <Table
              :value="rows"
              data-key="id"
              :virtual-scroller-options="virtualScrollerOptions"
            >
              <TableColumn field="name" header="Name" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      expect(wrapper.find('[data-testid="table"]').attributes('data-virtual')).toBeUndefined()
      expect(wrapper.findAll('[data-testid^="table-row-"]')).toHaveLength(30)
      expect(warn).toHaveBeenCalled()
      warn.mockRestore()
    })

    it('skips expansion rows under virtual and warns', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const expandedRows = ref<TableExpandedRows>({ '1': true })

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows: manyVirtual.slice(0, 40),
              expandedRows,
              virtualScrollerOptions: { itemSize: 40 },
            }
          },
          template: `
            <Table
              v-model:expanded-rows="expandedRows"
              :value="rows"
              data-key="id"
              scroll-height="200px"
              :virtual-scroller-options="virtualScrollerOptions"
            >
              <TableColumn expander />
              <TableColumn field="name" header="Name" />
              <template #expansion>Detail</template>
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()
      await nextTick()

      expect(wrapper.find('[data-testid="table"]').attributes('data-virtual')).toBe('true')
      expect(wrapper.find('[data-slot="table-expansion"]').exists()).toBe(false)
      expect(warn.mock.calls.some((c) => String(c[0]).includes('expansion'))).toBe(true)
      warn.mockRestore()
    })

    it('skips group chrome under virtual and warns', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const grouped = Array.from({ length: 40 }, (_, i) => ({
        id: i + 1,
        name: `Person ${i + 1}`,
        role: i % 2 === 0 ? 'Engineer' : 'Designer',
      }))

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows: grouped,
              virtualScrollerOptions: { itemSize: 40 },
            }
          },
          template: `
            <Table
              :value="rows"
              data-key="id"
              group-rows-by="role"
              row-group-mode="subheader"
              scroll-height="200px"
              :virtual-scroller-options="virtualScrollerOptions"
            >
              <TableColumn field="name" header="Name" />
              <TableColumn field="role" header="Role" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()
      await nextTick()

      expect(wrapper.find('[data-slot="table-group-header"]').exists()).toBe(false)
      expect(warn.mock.calls.some((c) => String(c[0]).includes('groupRowsBy'))).toBe(true)
      warn.mockRestore()
    })
  })

  describe('cross-feature integration', () => {
    const people = [
      { id: 1, name: 'Ada', role: 'Engineer', score: 90 },
      { id: 2, name: 'Grace', role: 'Admiral', score: 95 },
      { id: 3, name: 'Alan', role: 'Scientist', score: 88 },
      { id: 4, name: 'Katherine', role: 'Mathematician', score: 97 },
      { id: 5, name: 'Margaret', role: 'Engineer', score: 91 },
      { id: 6, name: 'Dorothy', role: 'Scientist', score: 86 },
    ]

    it('composes filter + sort + page + selection + cell edit', async () => {
      const page = ref(1)
      const sortField = ref<string | null>('name')
      const sortOrder = ref<1 | -1 | 0 | null>(1)
      const filters = ref({
        role: { value: 'Engineer', matchMode: 'equals' },
      })
      const selection = ref<(typeof people)[number][]>([])
      const rows = ref(people.map((r) => ({ ...r })))

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn, Input },
          setup() {
            function onCellEditComplete(e: TableCellEditCompleteEvent) {
              const data = e.data as (typeof people)[number]
              const i = rows.value.findIndex((r) => r.id === data.id)
              if (i < 0 || !e.field) return
              rows.value = rows.value.map((r, idx) =>
                idx === i ? { ...r, [e.field!]: e.newValue } : r,
              )
            }
            return { rows, page, sortField, sortOrder, filters, selection, onCellEditComplete }
          },
          template: `
            <Table
              v-model:page="page"
              v-model:sort-field="sortField"
              v-model:sort-order="sortOrder"
              v-model:filters="filters"
              v-model:selection="selection"
              :value="rows"
              data-key="id"
              selection-mode="multiple"
              paginate
              :rows="1"
              filter-display="row"
              edit-mode="cell"
              @cell-edit-complete="onCellEditComplete"
            >
              <TableColumn selection-mode="multiple" />
              <TableColumn field="name" header="Name" sortable>
                <template #editor="{ data, field }">
                  <Input v-model="data[field]" size="sm" />
                </template>
              </TableColumn>
              <TableColumn field="role" header="Role" filterable sortable />
              <TableColumn field="score" header="Score" sortable />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      // Filter leaves Engineers (Ada, Margaret); sorted by name asc → Ada then Margaret.
      expect(wrapper.findAll('tr[data-testid^="table-row-"]')).toHaveLength(1)
      expect(wrapper.text()).toContain('Ada')

      // Select the visible row.
      await wrapper.find('[data-testid="table-row-select-1"]').setValue(true)
      await nextTick()
      expect(selection.value).toHaveLength(1)
      expect(selection.value[0]?.id).toBe(1)

      // Page to Margaret.
      page.value = 2
      await nextTick()
      expect(wrapper.text()).toContain('Margaret')
      expect(wrapper.text()).not.toContain('Ada')

      // Cell-edit Margaret's name.
      await wrapper.find('[data-testid="table-cell-5-name"]').trigger('click')
      await nextTick()
      const editor = wrapper.find('[data-testid="table-cell-editor-5-name"] input')
      expect(editor.exists()).toBe(true)
      await editor.setValue('Maggie')
      await editor.trigger('keydown', { key: 'Enter' })
      await nextTick()
      expect(rows.value.find((r) => r.id === 5)?.name).toBe('Maggie')

      // Selection of Ada (page 1) is preserved across page/edit.
      expect(selection.value.map((r) => r.id)).toEqual([1])
    })

    it('edits a frozen row cell and completes with Enter', async () => {
      const frozen = ref([{ id: 0, name: 'Pinned', role: 'Lead' }])
      const rows = ref([
        { id: 1, name: 'Ada', role: 'Engineer' },
        { id: 2, name: 'Grace', role: 'Admiral' },
      ])

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn, Input },
          setup() {
            function onCellEditComplete(e: TableCellEditCompleteEvent) {
              const data = e.data as { id: number; name: string; role: string }
              frozen.value = frozen.value.map((r) =>
                r.id === data.id && e.field ? { ...r, [e.field]: e.newValue } : r,
              )
            }
            return { rows, frozen, onCellEditComplete }
          },
          template: `
            <Table
              :value="rows"
              :frozen-value="frozen"
              data-key="id"
              scroll-height="200px"
              edit-mode="cell"
              @cell-edit-complete="onCellEditComplete"
            >
              <TableColumn field="name" header="Name">
                <template #editor="{ data, field }">
                  <Input v-model="data[field]" size="sm" />
                </template>
              </TableColumn>
              <TableColumn field="role" header="Role" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      await wrapper.find('[data-testid="table-frozen-cell-0-name"]').trigger('click')
      await nextTick()
      const editor = wrapper.find('[data-testid="table-frozen-cell-editor-0-name"] input')
      expect(editor.exists()).toBe(true)
      await editor.setValue('Pinned Lead')
      await editor.trigger('keydown', { key: 'Enter' })
      await nextTick()
      expect(frozen.value[0]?.name).toBe('Pinned Lead')
    })

    it('restores persisted page after filter hydration (no reset race)', async () => {
      const STATE_KEY = 'kablui-table-hydrate-page'
      sessionStorage.setItem(
        STATE_KEY,
        JSON.stringify({
          page: 2,
          sortField: null,
          sortOrder: null,
          multiSortMeta: [],
          filters: { global: { value: 'a', matchMode: 'contains' } },
          columnOrder: [],
          hiddenColumns: [],
        }),
      )

      const page = ref(1)
      const filters = ref({
        global: { value: null as string | null, matchMode: 'contains' },
      })

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return { rows: people, page, filters }
          },
          template: `
            <Table
              v-model:page="page"
              v-model:filters="filters"
              :value="rows"
              data-key="id"
              paginate
              :rows="1"
              state-key="${STATE_KEY}"
              state-storage="session"
              :global-filter-fields="['name', 'role']"
            >
              <TableColumn field="name" header="Name" />
              <TableColumn field="role" header="Role" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()
      await nextTick()

      expect(filters.value.global.value).toBe('a')
      expect(page.value).toBe(2)
      sessionStorage.removeItem(STATE_KEY)
    })

    it('does not emit page/load while hydrating persisted state', async () => {
      const STATE_KEY = 'kablui-table-hydrate-silent'
      sessionStorage.setItem(
        STATE_KEY,
        JSON.stringify({
          page: 2,
          sortField: null,
          sortOrder: null,
          multiSortMeta: [],
          filters: {},
          columnOrder: [],
          hiddenColumns: [],
        }),
      )

      const pages: TableLoadEvent[] = []
      const loads: TableLoadEvent[] = []
      const page = ref(1)

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows: people,
              page,
              onPage: (e: TableLoadEvent) => pages.push(e),
              onLoad: (e: TableLoadEvent) => loads.push(e),
            }
          },
          template: `
            <Table
              v-model:page="page"
              :value="rows"
              data-key="id"
              lazy
              paginate
              :rows="2"
              :total-records="6"
              state-key="${STATE_KEY}"
              state-storage="session"
              @page="onPage"
              @load="onLoad"
            >
              <TableColumn field="name" header="Name" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()
      await nextTick()

      expect(page.value).toBe(2)
      // Hydration must not emit page; lazy mount emits a single post-hydrate load.
      expect(pages).toHaveLength(0)
      expect(loads.length).toBe(1)
      expect(loads[0]!.page).toBe(2)
      sessionStorage.removeItem(STATE_KEY)
    })

    it('re-applies selection keys when value arrives after restore', async () => {
      const STATE_KEY = 'kablui-table-async-selection'
      sessionStorage.setItem(
        STATE_KEY,
        JSON.stringify({
          page: 1,
          selectionKeys: ['2', '4'],
          columnOrder: [],
          hiddenColumns: [],
        }),
      )

      const rows = ref<{ id: number; name: string }[]>([])
      const selection = ref<{ id: number; name: string }[]>([])

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return { rows, selection }
          },
          template: `
            <Table
              v-model:selection="selection"
              :value="rows"
              data-key="id"
              selection-mode="multiple"
              state-key="${STATE_KEY}"
              state-storage="session"
            >
              <TableColumn field="name" header="Name" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()
      expect(selection.value).toEqual([])

      rows.value = people.map((r) => ({ id: r.id, name: r.name }))
      await nextTick()

      expect(selection.value.map((r) => r.id).sort()).toEqual([2, 4])
      sessionStorage.removeItem(STATE_KEY)
    })

    it('resolves nested field paths for cell display and sort', async () => {
      const nested = [
        { id: 1, name: 'Ada', country: { name: 'UK' } },
        { id: 2, name: 'Grace', country: { name: 'US' } },
        { id: 3, name: 'Alan', country: { name: 'FR' } },
      ]

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows: nested,
              sortField: ref('country.name'),
              sortOrder: ref(1 as const),
            }
          },
          template: `
            <Table
              v-model:sort-field="sortField"
              v-model:sort-order="sortOrder"
              :value="rows"
              data-key="id"
            >
              <TableColumn field="name" header="Name" />
              <TableColumn field="country.name" header="Country" sortable />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      const texts = wrapper.findAll('[data-testid^="table-row-"]').map((r) => r.text())
      expect(texts[0]).toContain('FR')
      expect(texts[1]).toContain('UK')
      expect(texts[2]).toContain('US')
      expect(wrapper.find('[data-testid^="table-cell-"][data-testid$="-country-name"]').exists()).toBe(true)
    })

    it('gives frozen rows keyboard focus parity', async () => {
      const frozen = ref([{ id: 0, name: 'Pinned', role: 'Lead' }])
      const selection = ref<{ id: number; name: string; role: string } | null>(null)

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return { rows: sampleRows, frozen, selection }
          },
          template: `
            <Table
              v-model:selection="selection"
              :value="rows"
              :frozen-value="frozen"
              data-key="id"
              selection-mode="single"
              scroll-height="200px"
            >
              <TableColumn field="name" header="Name" />
              <TableColumn field="role" header="Role" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      const frozenRow = wrapper.find('[data-testid="table-frozen-row-0"]')
      expect(frozenRow.exists()).toBe(true)
      expect(frozenRow.attributes('tabindex')).toBeDefined()

      await frozenRow.trigger('keydown', { key: 'Enter' })
      await nextTick()
      expect(selection.value?.id).toBe(0)
      expect(frozenRow.attributes('data-focused')).toBe('true')
    })

    it('reorders columns by visible leaf id under column groups', async () => {
      const order = ref<string[]>([])
      const events: TableColumnReorderEvent[] = []

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn, TableColumnGroup, TableHeaderRow },
          setup() {
            return {
              rows: sampleRows,
              order,
              onReorder: (e: TableColumnReorderEvent) => events.push(e),
            }
          },
          template: `
            <Table
              v-model:column-order="order"
              :value="rows"
              data-key="id"
              reorderable-columns
              @column-reorder="onReorder"
            >
              <TableColumnGroup type="header">
                <TableHeaderRow>
                  <TableColumn header="Info" :colspan="2" />
                </TableHeaderRow>
                <TableHeaderRow>
                  <TableColumn field="name" header="Name" />
                  <TableColumn field="role" header="Role" />
                </TableHeaderRow>
              </TableColumnGroup>
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      const nameHeader = wrapper.find('[data-testid="table-column-header-name"]')
      const roleHeader = wrapper.find('[data-testid="table-column-header-role"]')
      expect(nameHeader.exists()).toBe(true)
      expect(roleHeader.exists()).toBe(true)
      // Group chrome is not reorderable
      expect(
        wrapper.find('[data-testid="table-column-header-group-info"]').attributes('draggable'),
      ).toBeUndefined()

      const dataTransfer = {
        data: '' as string,
        effectAllowed: 'all',
        dropEffect: 'none',
        setData(type: string, val: string) {
          if (type === 'text/plain') this.data = val
        },
        getData(type: string) {
          return type === 'text/plain' ? this.data : ''
        },
      }

      // Leaf row indices are 0/1 locally; resolve via visibleColumns id (name=0, role=1).
      await nameHeader.trigger('dragstart', { dataTransfer })
      await roleHeader.trigger('dragover', { dataTransfer })
      await roleHeader.trigger('drop', { dataTransfer })
      await nextTick()

      expect(events).toHaveLength(1)
      expect(events[0]!.dragIndex).toBe(0)
      expect(events[0]!.dropIndex).toBe(1)
      expect(events[0]!.columnOrder).toEqual(['role', 'name'])
      expect(order.value).toEqual(['role', 'name'])
    })

    it('has no a11y violations for filter+sort+page+selection composite', async () => {
      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows: people,
              page: ref(1),
              sortField: ref<string | null>('name'),
              sortOrder: ref<1 | -1 | 0 | null>(1),
              filters: ref({
                role: { value: null as string | null, matchMode: 'contains' },
              }),
              selection: ref([] as typeof people),
            }
          },
          template: `
            <Table
              v-model:page="page"
              v-model:sort-field="sortField"
              v-model:sort-order="sortOrder"
              v-model:filters="filters"
              v-model:selection="selection"
              :value="rows"
              data-key="id"
              selection-mode="multiple"
              paginate
              :rows="3"
              filter-display="row"
            >
              <TableColumn selection-mode="multiple" />
              <TableColumn field="name" header="Name" sortable />
              <TableColumn field="role" header="Role" filterable sortable />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()
      await expectNoA11yViolations(wrapper.element)
    })
  })

  describe('filter menu apply dirty', () => {
    it('applies dirty draft and closes panel on Enter in filter input', async () => {
      const filters = ref({
        name: {
          operator: 'and',
          constraints: [{ value: null as string | null, matchMode: 'contains' }],
        },
      })

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows: [
                { id: 1, name: 'Ada', role: 'Engineer' },
                { id: 2, name: 'Grace', role: 'Admiral' },
              ],
              filters,
            }
          },
          template: `
            <Table
              v-model:filters="filters"
              :value="rows"
              data-key="id"
              filter-display="menu"
            >
              <TableColumn field="name" header="Name" filterable />
              <TableColumn field="role" header="Role" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      const trigger = wrapper.find('[data-testid="table-filter-trigger-name"]')
      await trigger.trigger('click')
      await nextTick()

      const input = document.body.querySelector(
        '[data-testid="table-filter-input-name-0"]',
      ) as HTMLInputElement | null
      expect(input).toBeTruthy()
      input!.value = 'Ada'
      input!.dispatchEvent(new Event('input', { bubbles: true }))
      await nextTick()

      const form = input!.closest('form')
      expect(form).toBeTruthy()
      form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await nextTick()

      expect(filters.value.name.constraints[0]?.value).toBe('Ada')
      // PopoverContent uses v-show — closed panels remain in the DOM but hidden.
      expect(trigger.attributes('aria-expanded')).toBe('false')
    })

    it('does not apply clean draft on Enter in filter input', async () => {
      const filters = ref({
        name: {
          operator: 'and',
          constraints: [{ value: null as string | null, matchMode: 'contains' }],
        },
      })

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows: [
                { id: 1, name: 'Ada', role: 'Engineer' },
                { id: 2, name: 'Grace', role: 'Admiral' },
              ],
              filters,
            }
          },
          template: `
            <Table
              v-model:filters="filters"
              :value="rows"
              data-key="id"
              filter-display="menu"
            >
              <TableColumn field="name" header="Name" filterable />
              <TableColumn field="role" header="Role" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      const trigger = wrapper.find('[data-testid="table-filter-trigger-name"]')
      await trigger.trigger('click')
      await nextTick()

      const input = document.body.querySelector(
        '[data-testid="table-filter-input-name-0"]',
      ) as HTMLInputElement | null
      expect(input).toBeTruthy()

      const form = input!.closest('form')
      expect(form).toBeTruthy()
      form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await nextTick()

      expect(filters.value.name.constraints[0]?.value).toBeNull()
      expect(trigger.attributes('aria-expanded')).toBe('true')
    })

    it('disables Apply until the draft differs, then disables again after Apply', async () => {
      const filters = ref({
        name: {
          operator: 'and',
          constraints: [{ value: null as string | null, matchMode: 'contains' }],
        },
      })

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows: [
                { id: 1, name: 'Ada', role: 'Engineer' },
                { id: 2, name: 'Grace', role: 'Admiral' },
              ],
              filters,
            }
          },
          template: `
            <Table
              v-model:filters="filters"
              :value="rows"
              data-key="id"
              filter-display="menu"
            >
              <TableColumn field="name" header="Name" filterable />
              <TableColumn field="role" header="Role" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      await wrapper.find('[data-testid="table-filter-trigger-name"]').trigger('click')
      await nextTick()

      const apply = () =>
        document.body.querySelector(
          '[data-testid="table-filter-apply-name"]',
        ) as HTMLButtonElement | null

      expect(apply()?.disabled).toBe(true)

      const input = document.body.querySelector(
        '[data-testid="table-filter-input-name-0"]',
      ) as HTMLInputElement | null
      expect(input).toBeTruthy()
      input!.value = 'Ada'
      input!.dispatchEvent(new Event('input', { bubbles: true }))
      await nextTick()

      expect(apply()?.disabled).toBe(false)

      apply()!.click()
      await nextTick()

      // Re-open: committed state matches draft → Apply disabled again.
      await wrapper.find('[data-testid="table-filter-trigger-name"]').trigger('click')
      await nextTick()
      expect(apply()?.disabled).toBe(true)
      expect(filters.value.name.constraints[0]?.value).toBe('Ada')
    })

    it('renders separators between advanced filter rules', async () => {
      const filters = ref({
        role: {
          operator: 'or',
          constraints: [
            { value: null as string | null, matchMode: 'equals' },
            { value: null as string | null, matchMode: 'equals' },
          ],
        },
      })

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return {
              rows: [
                { id: 1, name: 'Ada', role: 'Engineer' },
                { id: 2, name: 'Grace', role: 'Admiral' },
              ],
              filters,
            }
          },
          template: `
            <Table
              v-model:filters="filters"
              :value="rows"
              data-key="id"
              filter-display="menu"
            >
              <TableColumn field="name" header="Name" />
              <TableColumn field="role" header="Role" filterable />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      await wrapper
        .find('[data-testid="table-filter-trigger-role"]')
        .trigger('click')
      await nextTick()

      const panel = document.body.querySelector('[data-testid="table-filter-panel-role"]')
      expect(panel).toBeTruthy()
      expect(panel!.querySelectorAll('[data-testid="separator"]').length).toBe(1)
    })
  })

  describe('numeric column filter', () => {
    it('filters a Score-like numeric column via menu (equals + coerce to number)', async () => {
      const filters = ref({
        score: {
          operator: 'and',
          constraints: [{ value: null as number | null, matchMode: 'equals' }],
        },
      })
      const rows = [
        { id: 1, name: 'Ada', score: 90 },
        { id: 2, name: 'Grace', score: 95 },
        { id: 3, name: 'Alan', score: 88 },
      ]

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return { rows, filters }
          },
          template: `
            <Table
              v-model:filters="filters"
              :value="rows"
              data-key="id"
              filter-display="menu"
            >
              <TableColumn field="name" header="Name" />
              <TableColumn field="score" header="Score" filterable data-type="numeric" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      await wrapper.find('[data-testid="table-filter-trigger-score"]').trigger('click')
      await nextTick()

      const matchSelect = document.body.querySelector(
        '[data-testid="table-filter-match-mode-score-0"]',
      )
      expect(matchSelect).toBeTruthy()

      const input = document.body.querySelector(
        '[data-testid="table-filter-input-score-0"]',
      ) as HTMLInputElement | null
      expect(input).toBeTruthy()
      expect(input!.type).toBe('number')

      input!.value = '90'
      input!.dispatchEvent(new Event('input', { bubbles: true }))
      await nextTick()

      const apply = document.body.querySelector(
        '[data-testid="table-filter-apply-score"]',
      ) as HTMLButtonElement | null
      expect(apply?.disabled).toBe(false)
      apply!.click()
      await nextTick()

      expect(filters.value.score.constraints[0]?.value).toBe(90)
      expect(typeof filters.value.score.constraints[0]?.value).toBe('number')

      const names = wrapper!
        .findAll('[data-testid^="table-row-"]')
        .map((row) => row.find('[data-testid^="table-cell-"][data-testid$="-name"]:not([data-testid*="-editor-"])').text())
      expect(names).toEqual(['Ada'])
    })

    it('supports between with two number inputs', async () => {
      const filters = ref({
        score: {
          operator: 'and',
          constraints: [{ value: null as unknown, matchMode: 'between' }],
        },
      })
      const rows = [
        { id: 1, name: 'Ada', score: 90 },
        { id: 2, name: 'Grace', score: 95 },
        { id: 3, name: 'Alan', score: 88 },
      ]

      wrapper = mount(
        defineComponent({
          components: { Table, TableColumn },
          setup() {
            return { rows, filters }
          },
          template: `
            <Table
              v-model:filters="filters"
              :value="rows"
              data-key="id"
              filter-display="menu"
            >
              <TableColumn field="name" header="Name" />
              <TableColumn field="score" header="Score" filterable data-type="numeric" />
            </Table>
          `,
        }),
        { attachTo: document.body },
      )
      await nextTick()

      await wrapper
        .find('[data-testid="table-filter-trigger-score"]')
        .trigger('click')
      await nextTick()

      const min = document.body.querySelector(
        '[data-testid="table-filter-input-min-score-0"]',
      ) as HTMLInputElement | null
      const max = document.body.querySelector(
        '[data-testid="table-filter-input-max-score-0"]',
      ) as HTMLInputElement | null
      expect(min).toBeTruthy()
      expect(max).toBeTruthy()
      expect(min!.type).toBe('number')
      expect(max!.type).toBe('number')

      min!.value = '89'
      min!.dispatchEvent(new Event('input', { bubbles: true }))
      max!.value = '92'
      max!.dispatchEvent(new Event('input', { bubbles: true }))
      await nextTick()

      ;(
        document.body.querySelector(
          '[data-testid="table-filter-apply-score"]',
        ) as HTMLButtonElement
      ).click()
      await nextTick()

      expect(filters.value.score.constraints[0]?.value).toEqual([89, 92])

      const names = wrapper!
        .findAll('[data-testid^="table-row-"]')
        .map((row) => row.find('[data-testid^="table-cell-"][data-testid$="-name"]:not([data-testid*="-editor-"])').text())
      expect(names).toEqual(['Ada'])
    })
  })
})
