import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import type { TableExpandedRows } from '../utils/table/types'
import Input from './Input.vue'
import Table from './Table.vue'
import TableColumn from './TableColumn.vue'

/**
 * Freeze contract for documented Table no-op / disable paths.
 * These combinations are supported limitations, not incomplete features.
 */

const sampleRows = [
  { id: 1, name: 'Ada', role: 'Engineer' },
  { id: 2, name: 'Grace', role: 'Engineer' },
  { id: 3, name: 'Alan', role: 'Scientist' },
]

const manyRows = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  name: `Person ${i + 1}`,
  role: i % 2 === 0 ? 'Engineer' : 'Designer',
}))

let wrapper: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

describe('Table supported limitations', () => {
  it('disables virtualization without scrollHeight and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    wrapper = mount(
      defineComponent({
        components: { Table, TableColumn },
        setup() {
          return {
            rows: manyRows,
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
    expect(wrapper.find('[data-testid="table-virtual-spacer-bottom"]').exists()).toBe(false)
    expect(wrapper.findAll('[data-testid^="table-row-"]')).toHaveLength(manyRows.length)
    expect(warn).toHaveBeenCalledWith(
      '[kablui Table] virtualScrollerOptions requires scrollHeight; virtualization is disabled.',
    )
    warn.mockRestore()
  })

  it('skips expansion rows under virtual scroll and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const expandedRows = ref<TableExpandedRows>({ '1': true })

    wrapper = mount(
      defineComponent({
        components: { Table, TableColumn },
        setup() {
          return {
            rows: manyRows,
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
    expect(wrapper.find('[data-testid="table-expansion-1"]').exists()).toBe(false)
    expect(warn).toHaveBeenCalledWith(
      '[kablui Table] virtualScrollerOptions is incompatible with row expansion; expansion rows are skipped.',
    )
    warn.mockRestore()
  })

  it('disables subheader group chrome under virtual scroll and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    wrapper = mount(
      defineComponent({
        components: { Table, TableColumn },
        setup() {
          return {
            rows: manyRows,
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
            <template #groupheader="{ groupValue }">{{ groupValue }}</template>
          </Table>
        `,
      }),
      { attachTo: document.body },
    )
    await nextTick()
    await nextTick()

    expect(wrapper.find('[data-testid="table"]').attributes('data-virtual')).toBe('true')
    expect(wrapper.find('[data-slot="table-group-header"]').exists()).toBe(false)
    expect(wrapper.find('[data-slot="table-group-footer"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="table-group-header-engineer"]').exists()).toBe(false)
    expect(warn).toHaveBeenCalledWith(
      '[kablui Table] virtualScrollerOptions is incompatible with groupRowsBy; group chrome is disabled.',
    )
    warn.mockRestore()
  })

  it('disables rowspan group chrome under virtual scroll and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    wrapper = mount(
      defineComponent({
        components: { Table, TableColumn },
        setup() {
          return {
            rows: manyRows,
            virtualScrollerOptions: { itemSize: 40 },
          }
        },
        template: `
          <Table
            :value="rows"
            data-key="id"
            group-rows-by="role"
            row-group-mode="rowspan"
            scroll-height="200px"
            :virtual-scroller-options="virtualScrollerOptions"
          >
            <TableColumn field="role" header="Role" />
            <TableColumn field="name" header="Name" />
          </Table>
        `,
      }),
      { attachTo: document.body },
    )
    await nextTick()
    await nextTick()

    const roleCells = wrapper.findAll(
      '[data-testid^="table-cell-"][data-testid$="-role"]:not([data-testid*="-editor-"])',
    )
    expect(roleCells.length).toBeGreaterThan(0)
    expect(roleCells.every((cell) => cell.attributes('rowspan') == null)).toBe(true)
    expect(warn).toHaveBeenCalledWith(
      '[kablui Table] virtualScrollerOptions is incompatible with groupRowsBy; group chrome is disabled.',
    )
    warn.mockRestore()
  })

  it('does not start row edit without dataKey and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const editingRows = ref<typeof sampleRows>([])

    wrapper = mount(
      defineComponent({
        components: { Table, TableColumn, Input },
        setup() {
          return { rows: sampleRows, editingRows }
        },
        template: `
          <Table
            v-model:editing-rows="editingRows"
            :value="rows"
            edit-mode="row"
          >
            <TableColumn field="name" header="Name">
              <template #editor="{ data, field }">
                <Input v-model="data[field]" data-testid="name-editor" />
              </template>
            </TableColumn>
            <TableColumn row-editor />
          </Table>
        `,
      }),
      { attachTo: document.body },
    )
    await nextTick()

    const editBtn = wrapper.find('[data-testid="table-row-edit-0"]')
    expect(editBtn.exists()).toBe(true)
    await editBtn.trigger('click')
    await nextTick()

    const table = wrapper.findComponent(Table)
    expect(warn).toHaveBeenCalledWith('[kablui] Table row edit requires dataKey')
    expect(table.emitted('row-edit-init')).toBeFalsy()
    expect(editingRows.value).toHaveLength(0)
    expect(wrapper.find('[data-testid="name-editor"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="table-row-save-0"]').exists()).toBe(false)
    warn.mockRestore()
  })
})
