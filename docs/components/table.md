# Table

## Overview

`Table` presents row data as semantic HTML (`table` / `thead` / `tbody` / `tfoot`). Nest `TableColumn` children to declare fields, headers, and cell templates — columns register through provide/inject so dynamic `v-for` columns work.

## Examples

Focused scenarios below. Capabilities include:

- Presentation — `size`, `showGridlines`, `striped`, empty/loading, `#header` / `#footer`
- Data — selection, sort, filter, pagination
- Layout — `scrollHeight`, frozen columns/rows
- Edit & structure — cell/row edit, expansion, row groups, column groups
- Advanced — resize, reorder, visibility, lazy/virtual, state, CSV, context menu

### Presentation

#### Basic

Rows from `value` with `TableColumn` `field` / `header`.

<Demo src="./demos/table-basic.vue" />

#### Size

`size` controls cell padding and text density (`sm` / `md` default / `lg`). Side-by-side so the density difference is obvious.

<Demo src="./demos/table-size.vue" />

#### Gridlines

Cell grid borders are off by default. Pass `showGridlines` only when you want a full cell grid.

<Demo src="./demos/table-gridlines.vue" />

#### Striped

Alternating row backgrounds via `striped` (independent of gridlines).

<Demo src="./demos/table-striped.vue" />

#### Empty

Default empty state, or customize with the `#empty` slot.

<Demo src="./demos/table-empty.vue" />

#### Loading

When `loading` is true, the table shows the loading UI instead of body rows (exclusive — not a translucent mask over data). Default spinner, or `#loading` (e.g. skeletons). Passing an empty `value` while loading avoids flashing stale rows.

<Demo src="./demos/table-loading.vue" />

#### Templates

Table `#header` / `#footer` are toolbar / summary regions above and below the grid (outside the scrollport). Per-column `#body` / `#header` customize cells.

<Demo src="./demos/table-template.vue" />

### Selection

#### Checkbox selection

`TableColumn selection-mode="multiple"` adds a checkbox column and header select-all. Select-all applies to **all matching pipeline rows** (`pageSourceRows` — filtered/sorted/grouped, every page). In `lazy` mode that is the current `value` chunk only. Shift-range selection stays page-scoped.

<Demo src="./demos/table-selection-checkbox.vue" />

#### Radio selection

`TableColumn selection-mode="single"` adds a radio column for exclusive selection.

<Demo src="./demos/table-selection-radio.vue" />

### Sort

#### Sort (single)

Set `sortable` on columns. Sort toggles via the header label + sort icon control (not the empty remainder of the cell). Bind `v-model:sortField` and `v-model:sortOrder` (`1` | `-1` | `0`).

<Demo src="./demos/table-sort-single.vue" />

#### Sort (multiple)

`sortMode="multiple"` — Ctrl/Cmd+click adds columns. Priority badges appear when more than one column is sorted.

<Demo src="./demos/table-sort-multiple.vue" />

#### Pre-sorted

Initialize `sortField` / `sortOrder` (or `multiSortMeta`) for a default sort.

<Demo src="./demos/table-sort-presort.vue" />

#### Removable sort

With `removableSort`, a third click clears that column’s sort (asc → desc → none).

<Demo src="./demos/table-sort-removable.vue" />

### Pagination

#### Pagination

Set `paginate` and `rows` (page size) to slice the current value client-side. Pagination renders below the grid. Page is 1-based and unbound by default (starts at `1`).

<Demo src="./demos/table-paginate.vue" />

#### Controlled page

Bind the current page with `v-model:page`.

<Demo src="./demos/table-paginate-controlled.vue" />

### Filter

#### Filter (row)

`filterDisplay="row"` shows inputs under filterable headers. Bind `v-model:filters` with a meta object per field (`value` + `matchMode`). Import `FilterMatchMode` for match-mode constants. The built-in filter UI is **text-default** (string match modes); numeric/date/`in`/`between` modes are supported by the filter engine when you supply values yourself.

Column `field` paths may be nested (`country.name`) — cell display, sort, filter, and CSV export all resolve nested paths.

<Demo src="./demos/table-filter-row.vue" />

#### Filter (menu)

`filterDisplay="menu"` opens a [Popover](./popover.md) with match modes, Apply / Clear, and optional multi-rule AND/OR when the field meta uses `operator` + `constraints`. Columns default to text modes; set `dataType="numeric"` for integer/number match modes (equals, comparisons, between) with number inputs.

<Demo src="./demos/table-filter-menu.vue" />

#### Global filter

Put a search control in the table `#header` slot bound to `filters.global`. List searchable fields with `globalFilterFields` (nested paths allowed).

<Demo src="./demos/table-filter-global.vue" />

### Scroll and frozen

#### Vertical scroll

Fixed height: set `scrollHeight` to a CSS length (e.g. `240px`). The table opens a scrollport with that max height and a sticky header. Prefer this when the viewport size is known.

<Demo src="./demos/table-scroll-vertical.vue" />

#### Horizontal scroll

Wide columns use `minWidth` / `width`. Constrain the host width so content overflows — the scrollport scrolls horizontally (no unrelated gridlines in this demo).

<Demo src="./demos/table-scroll-horizontal.vue" />

#### Flex scroll

Parent-driven height: `scrollHeight="flex"` fills the parent instead of a fixed CSS length. Put the table in a flex column with a defined height and `min-h-0` on the flex child — unlike vertical scroll, the scrollport grows/shrinks with the parent.

<Demo src="./demos/table-scroll-flex.vue" />

#### Frozen columns

`TableColumn frozen` pins a column during horizontal scroll. Use `alignFrozen="left"` (default) or `"right"`. Demo uses a narrow host + `scrollHeight` so pinning is visible while scrolling.

<Demo src="./demos/table-frozen-columns.vue" />

#### Frozen rows

`frozenValue` pins rows above the scrollable body while the rest of `value` scrolls under a sticky header. Requires a vertical scrollport (`scrollHeight`). Frozen rows share selection keyboard focus (`tabindex` / Arrow keys / `data-focused`) with the body; prefer a checkbox/radio column when using cell edit, same as body rows.

<Demo src="./demos/table-frozen-rows.vue" />

### Edit

#### Cell edit

`editMode="cell"` — click a cell with a column `#editor` slot to edit. Enter or outside click completes (`cell-edit-complete`); Escape cancels (`cell-edit-cancel`). Apply `newValue` / `newData` in the complete handler.

<Demo src="./demos/table-edit-cell.vue" />

#### Row edit

`editMode="row"` with `v-model:editingRows` and a `rowEditor` column. Requires `dataKey`. Edit / Save / Cancel controls; `#editor` shows while the row is editing. Handle `row-edit-save` to persist.

<Demo src="./demos/table-edit-row.vue" />

#### Cell edit + selection

Checkbox selection stays independent of cell edit clicks — selecting a row does not open an editor, and editing a cell does not toggle selection.

<Demo src="./demos/table-edit-cell-selection.vue" />

### Expansion and groups

#### Row expansion

`TableColumn expander` plus `v-model:expandedRows` (object map keyed by `dataKey`, or an array of rows). Detail content goes in the table `#expansion` slot. Emits `row-expand` / `row-collapse`. **Incompatible with virtual scroll** — expansion rows are skipped (and a console warning is emitted) when `virtualScrollerOptions` is active.

<Demo src="./demos/table-row-expansion.vue" />

#### Row group (subheader)

`groupRowsBy` with `rowGroupMode="subheader"` inserts `#groupheader` / `#groupfooter` chrome around each group. Rows are clustered by the group field before pagination (page units are data rows). **Incompatible with virtual scroll** — group chrome is disabled (flat window only) when virtualization is active.

<Demo src="./demos/table-row-group-subheader.vue" />

#### Row group (rowspan)

`rowGroupMode="rowspan"` merges the group field column with `rowspan` across contiguous same-value cells.

<Demo src="./demos/table-row-group-rowspan.vue" />

#### Expandable row groups

With `expandableRowGroups` in subheader mode, bind `v-model:expandedRowGroups` (array of group values). Emits `rowgroup-expand` / `rowgroup-collapse`.

<Demo src="./demos/table-row-group-expandable.vue" />

### Columns

#### Column resize (fit)

`resizableColumns` with `columnResizeMode="fit"` (default): dragging a header handle steals width from the adjacent column so overall table width stays constant.

<Demo src="./demos/table-col-resize-fit.vue" />

#### Column resize (expand)

`columnResizeMode="expand"` grows or shrinks the table as you resize. Works with scrollable tables (sticky headers stay aligned).

<Demo src="./demos/table-col-resize-expand.vue" />

#### Column reorder

`reorderableColumns` enables drag-and-drop on column headers. Bind `v-model:columnOrder` (array of field names / ids) or listen for `column-reorder`. Frozen and unfrozen columns do not reorder across the freeze boundary.

<Demo src="./demos/table-col-reorder.vue" />

#### Row reorder

`reorderableRows` with a `TableColumn row-reorder` handle column. Drop emits `row-reorder` (and `update:value`) with the new order; apply `event.value` to your data. Use a stable `dataKey`.

<Demo src="./demos/table-row-reorder.vue" />

#### Column toggle

Bind `v-model:hiddenColumns` (array of field names) to hide columns. Per-column `visible` also works. The toggle UI is a consumer pattern — typically [Popover](./popover.md) or [Menu](./menu.md) with [Checkbox](./checkbox.md).

<Demo src="./demos/table-column-toggle.vue" />

#### Column group

Multi-level headers via `TableColumnGroup` + `TableHeaderRow`. Leaf columns (with `field`) are body columns; chrome cells omit `field` and use `colspan` / `rowspan`.

<Demo src="./demos/table-column-group.vue" />

#### Column group + sort / filter

Sort and filter still work on leaf columns inside a group (`sortable` / `filterable` + `filterDisplay`).

<Demo src="./demos/table-column-group-filter-sort.vue" />

### Lazy and virtual

#### Lazy

Set `lazy` so the table does not client-filter/sort/page. Pass the current server page in `value`, set `totalRecords` for the paginator, and handle `@load` (or `@page` / `@sort` / `@filter`) to refetch. Select-all applies to the current `value` only.

<Demo src="./demos/table-lazy.vue" />

#### Virtual scroll

Large local arrays: set `virtualScrollerOptions.itemSize` **and** `scrollHeight` to window-render fixed-height rows. Omitting `scrollHeight` disables virtualization (console warning).

**Incompatible with** row expansion and `groupRowsBy` group chrome (rowspan / subheader / expandable groups). Those paths are skipped so scroll math stays fixed-height.

<Demo src="./demos/table-virtual-scroll.vue" />

#### Virtual scroll (lazy)

Sparse `value` (pre-sized array) filled on demand via `@lazy-load` when `virtualScrollerOptions.lazy` is true. Same `scrollHeight` requirement and expansion/grouping incompatibilities as above. Do not use exclusive `loading` for virtual lazy prefetch (it replaces the scrollport content).

<Demo src="./demos/table-virtual-scroll-lazy.vue" />

### State and export

#### Stateful

Set `stateKey` to persist page, sort (`sortField` / `sortOrder` / `multiSortMeta`), filters, selection keys (requires `dataKey`), `columnOrder`, and `hiddenColumns`. Use `stateStorage="session"` (default) or `"local"`. Restore runs on mount without emitting `page`/`load`; selection keys re-apply when `value` arrives asynchronously. Changes are saved automatically. SSR / missing Web Storage is a no-op.

Helpers: `loadTableState` / `saveTableState` / `clearTableState` are exported from the package root.

<Demo src="./demos/table-stateful.vue" />

#### Export CSV

Use the pure `exportTableCsv({ data, columns, … })` helper for custom fields/headers (nested field paths supported), or call the Table instance method `exportCsv()` (exports current filtered rows; default filename from `exportFilename`).

```ts
import { exportTableCsv, loadTableState, saveTableState, clearTableState } from 'kablui'

exportTableCsv({
  data: rows,
  columns: [
    { field: 'name', header: 'Name' },
    { field: 'role', header: 'Role' },
  ],
  filename: 'people.csv',
})
```

<Demo src="./demos/table-export.vue" />

#### Context menu

Enable `contextMenu` and bind `v-model:contextMenuSelection`. Right-click a row to prevent the browser menu, set the model, and emit `row-contextmenu` (`{ originalEvent, data, index }`). Open a [Menu](./menu.md) from that event — typically with a fixed invisible `MenuTrigger` at the pointer and controlled `open`.

<Demo src="./demos/table-context-menu.vue" />

### Composites

#### Advanced (composite)

Filter, sort, pagination, multi-select, and cell edit together — the common client-side data grid composition.

<Demo src="./demos/table-advanced.vue" />

#### Database editor

A richer sample: global search, status filter, checkbox selection with bulk action, and row edit with `#editor` slots (including [Select](./select.md) / [Badge](./badge.md)). No extra table APIs — composition only.

<Demo src="./demos/table-database-editor.vue" />

## Props / Models / Emits / Slots

### Table

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `unknown[]` | `[]` | Row data array |
| `dataKey` | `string` | — | Property used as a stable row key |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Cell padding + text density |
| `showGridlines` | `boolean` | `false` | Draw cell grid borders (off by default) |
| `striped` | `boolean` | `false` | Alternate row background |
| `loading` | `boolean` | `false` | Exclusive loading UI instead of body rows; sets `aria-busy` on the table |
| `selectionMode` | `'single' \| 'multiple'` | — | Enable row-click selection |
| `metaKeySelection` | `boolean` | `false` | Multiple: plain click replaces; Ctrl/Cmd toggles; Shift ranges |
| `sortMode` | `'single' \| 'multiple'` | `'single'` | One column at a time, or Ctrl/Cmd multi-column |
| `removableSort` | `boolean` | `false` | Third click clears sort on that column |
| `paginate` | `boolean` | `false` | Enable client-side paging and show Pagination below the grid |
| `rows` | `number` | `10` | Page size when `paginate` is true |
| `totalRecords` | `number` | — | Total count for `pageCount` (defaults to pipeline length; required for accurate lazy paging) |
| `lazy` | `boolean` | `false` | Skip client filter/sort/group/page; render `value` as-is and emit load intents |
| `virtualScrollerOptions` | `TableVirtualScrollerOptions` | — | Fixed-row virtualization (`itemSize`, optional `lazy` / `numToleratedItems` / `delay` / `onLazyLoad`) |
| `filterDisplay` | `'row' \| 'menu'` | — | Column filter UI placement; omit to hide column filters |
| `globalFilterFields` | `string[]` | — | Fields searched by the `global` key in `filters` |
| `scrollHeight` | `string` | — | Opens a scrollport: CSS length for fixed max-height, or `'flex'` to fill a sized flex parent |
| `frozenValue` | `unknown[]` | `[]` | Rows pinned at the top of the body while the rest scroll |
| `editMode` | `'cell' \| 'row'` | — | Enable cell click-to-edit or row editor controls |
| `editButtonAriaLabel` | `string` | `'Edit'` | Accessible label for the row-edit Edit button |
| `saveButtonAriaLabel` | `string` | `'Save'` | Accessible label for the row-edit Save button |
| `cancelButtonAriaLabel` | `string` | `'Cancel'` | Accessible label for the row-edit Cancel button |
| `groupRowsBy` | `string` | — | Field used to cluster rows (supports nested paths) |
| `rowGroupMode` | `'subheader' \| 'rowspan'` | — | Group chrome mode |
| `expandableRowGroups` | `boolean` | `false` | Expand/collapse subheader groups |
| `expandButtonAriaLabel` | `string` | `'Expand'` | Accessible label for expand toggles |
| `collapseButtonAriaLabel` | `string` | `'Collapse'` | Accessible label for collapse toggles |
| `resizableColumns` | `boolean` | `false` | Show drag handles to resize column widths |
| `columnResizeMode` | `'fit' \| 'expand'` | `'fit'` | Fit steals from adjacent; expand grows the table |
| `reorderableColumns` | `boolean` | `false` | Drag column headers to reorder |
| `reorderableRows` | `boolean` | `false` | Drag rows to reorder (`rowReorder` column recommended) |
| `columnResizeHandleAriaLabel` | `string` | `'Resize column'` | Accessible label for resize handles |
| `columnReorderHandleAriaLabel` | `string` | `'Reorder column'` | Accessible label for column drag handles |
| `rowReorderHandleAriaLabel` | `string` | `'Reorder row'` | Accessible label for row drag handles |
| `stateKey` | `string` | — | Persist view state under this Web Storage key |
| `stateStorage` | `'session' \| 'local'` | `'session'` | Storage backend for `stateKey` |
| `exportFilename` | `string` | `'download.csv'` | Default filename for exposed `exportCsv()` |
| `contextMenu` | `boolean` | `false` | Enable row right-click: preventDefault, update model, emit `row-contextmenu` |

| Model | Type | Default | Description |
| --- | --- | --- | --- |
| `selection` | `unknown \| unknown[] \| null` | — | Selected row(s) (`v-model:selection`) |
| `contextMenuSelection` | `unknown` | — | Right-clicked row (`v-model:contextMenuSelection`) |
| `sortField` | `string \| null` | `null` | Active sort field (`v-model:sortField`), single mode |
| `sortOrder` | `1 \| -1 \| 0 \| null` | `null` | Sort direction (`v-model:sortOrder`) |
| `multiSortMeta` | `TableSortMeta[]` | `[]` | Multi-sort entries (`v-model:multiSortMeta`) |
| `page` | `number` | `1` | Current page (`v-model:page`), 1-based |
| `filters` | `TableFilters` | `{}` | Filter meta by field (+ optional `global`) (`v-model:filters`) |
| `editingRows` | `unknown[]` | `[]` | Rows currently in row-edit mode (`v-model:editingRows`) |
| `expandedRows` | `TableExpandedRows` | — | Expanded detail rows (`v-model:expandedRows`) |
| `expandedRowGroups` | `unknown[]` | `[]` | Expanded group values (`v-model:expandedRowGroups`) |
| `columnOrder` | `string[]` | `[]` | Column order keys (`field` or id); empty = registration order |
| `hiddenColumns` | `string[]` | `[]` | Field names omitted from render (`v-model:hiddenColumns`) |

| Emit | Payload | Description |
| --- | --- | --- |
| `row-contextmenu` | `TableRowContextMenuEvent` | Row right-click when `contextMenu` (`{ originalEvent, data, index }`) |
| `row-select` | `TableRowSelectEvent` | Fired when a row becomes selected (`{ originalEvent, data, index }`) |
| `row-unselect` | `TableRowUnselectEvent` | Fired when a row becomes unselected |
| `sort` | `TableSortEvent` | Fired after a header sort activation |
| `filter` | `TableFilterEvent` | Fired after a column filter apply/clear (`{ filters, filteredValue }`) |
| `page` | `TablePageEvent` | Fired when `v-model:page` changes while `paginate` is on (`first`, `rows`, sort, filters, …) |
| `load` | `TableLoadEvent` | Fired under `lazy` when page/sort/filter should refetch (same payload as `page`) |
| `lazy-load` | `TableVirtualLazyLoadEvent` | Virtual scroll window changed (`first` / `last`) when `virtualScrollerOptions.lazy` |
| `cell-edit-complete` | `TableCellEditCompleteEvent` | Cell edit finished (Enter / outside); apply `newValue` / `newData` |
| `cell-edit-cancel` | `TableCellEditCancelEvent` | Cell edit cancelled (Escape) |
| `row-edit-init` | `TableRowEditInitEvent` | Row edit started |
| `row-edit-save` | `TableRowEditSaveEvent` | Row edit saved; apply `newData` |
| `row-edit-cancel` | `TableRowEditCancelEvent` | Row edit cancelled |
| `row-expand` | `TableRowExpandEvent` | Detail row expanded |
| `row-collapse` | `TableRowCollapseEvent` | Detail row collapsed |
| `rowgroup-expand` | `TableRowGroupExpandEvent` | Row group expanded (`data` is the group value) |
| `rowgroup-collapse` | `TableRowGroupCollapseEvent` | Row group collapsed |
| `column-resize-end` | `TableColumnResizeEndEvent` | Column resize drag finished |
| `column-reorder` | `TableColumnReorderEvent` | Columns reordered (`dragIndex`, `dropIndex`, `columnOrder`) |
| `row-reorder` | `TableRowReorderEvent` | Rows reordered (`dragIndex`, `dropIndex`, `value`) |
| `update:value` | `unknown[]` | Emitted with reordered rows (use with `row-reorder`) |

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | `TableColumn` children (registration host) |
| `header` | — | Table-level toolbar region above the grid (outside the scrollport) |
| `footer` | — | Table-level summary region below the grid (outside the scrollport) |
| `empty` | — | Shown when `value` is empty and not loading |
| `loading` | — | Exclusive loading content while `loading` (replaces body rows) |
| `expansion` | `{ data, index }` | Detail content under an expanded row |
| `groupheader` | `{ data, index, groupValue, rows }` | Subheader chrome for a row group |
| `groupfooter` | `{ data, index, groupValue, rows }` | Footer chrome for a row group |

Extra attributes fall through to the root wrapper.

### TableColumn

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `field` | `string` | — | Row property for default cell text |
| `header` | `string` | — | Header label (unless `#header` slot) |
| `footer` | `string` | — | Footer cell text (unless `#footer` slot) |
| `visible` | `boolean` | `true` | When `false`, column is omitted from render |
| `colspan` | `number` | `1` | Columns spanned in a grouped header/footer cell |
| `rowspan` | `number` | `1` | Rows spanned in a grouped header/footer cell |
| `align` | `'left' \| 'center' \| 'right'` | — | Text alignment |
| `width` | `string` | — | Column width |
| `minWidth` | `string` | — | Column min-width |
| `sortable` | `boolean` | `false` | Enable click / keyboard sort on the header |
| `filterable` | `boolean` | `false` | Show column filter UI when `filterDisplay` is set |
| `frozen` | `boolean` | `false` | Pin column during horizontal scroll |
| `alignFrozen` | `'left' \| 'right'` | `'left'` | Side to pin when `frozen` |
| `selectionMode` | `'single' \| 'multiple'` | — | `multiple` → checkbox + select-all; `single` → radio column |
| `rowEditor` | `boolean` | `false` | Shows Edit / Save / Cancel controls when `editMode="row"` |
| `expander` | `boolean` | `false` | Expand/collapse control for row detail (`#expansion`) |
| `rowReorder` | `boolean` | `false` | Row drag-handle column when Table `reorderableRows` is set |
| `reorderableColumn` | `boolean` | — | When `false`, excluded from column header reorder |

| Slot | Props | Description |
| --- | --- | --- |
| `body` | `{ data, field, index, column }` | Custom cell content |
| `header` | `{ column }` | Custom header cell |
| `footer` | `{ column }` | Custom footer cell |
| `filter` | `{ filterModel, filterCallback, value, field, column }` | Custom filter control; call `filterCallback` to apply |
| `editor` | `{ data, field, index, column }` | Editor UI; `data` is a working copy (`v-model` safe) |

Must be used inside `Table` (warns in the console otherwise).

### TableColumnGroup

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `'header' \| 'footer'` | `'header'` | Multi-row header or footer structure |

Nest `TableHeaderRow` children. Must be used inside `Table`.

### TableHeaderRow

No props. Nest `TableColumn` children (leaf columns with `field` are body columns; chrome cells omit `field` and set `colspan` / `rowspan`). Must be used inside `TableColumnGroup`.

## Accessibility

- Root grid is a real `<table>` with `<thead>`, `<tbody>`, and optional `<tfoot>`.
- Header cells use `<th scope="col">`. Grouped headers may set `colspan` / `rowspan`.
- Sortable headers set `aria-sort` to `ascending`, `descending`, or `none`, and use a focusable `<button>` (Enter / Space activate sort).
- Prefer checkbox / radio selection columns for accessible selection. Selected rows expose `aria-selected`. When selection is active, rows use roving `tabindex` (Arrow Up/Down, including frozen rows) with Space/Enter and related shortcuts as secondary keyboard support.
- Checkbox / radio selection columns reuse [Checkbox](./checkbox.md) and [Radio](./radio-group.md) with accessible labels and `data-testid` parts (`table-select-all`, `table-row-select-*`). Header select-all targets all matching rows, not only the current page.
- Filter menu triggers are labeled buttons that open a [Popover](./popover.md) dialog (Escape / outside dismiss). Row/menu filter UI is text-default; labeled text inputs.
- When `loading`, the `<table>` gets `aria-busy="true"`; loading UI replaces body rows (default `Spinner`, or `#loading`).
- Empty state uses the shared `Empty` component (or your `#empty` slot content).
- Scrollable tables keep a real `<table>`; the overflow wrapper (`data-slot="table-scroll"`) provides the scrollport only when scrolling is needed. Sticky headers / frozen cells use `position: sticky` within that scrollport. `#header` / `#footer` stay outside the scrollport.
- Virtual scroll uses top/bottom spacer rows (`aria-hidden`) and fixed row heights; only the windowed body rows are in the accessibility tree. Requires `scrollHeight`; incompatible with expansion and group chrome.
- Cell edit: Enter completes, Escape cancels (both stopPropagation so selection toggles do not fire). With `editMode="cell"`, prefer a checkbox/radio column for selection so body-cell clicks stay dedicated to editing. Frozen rows support the same cell/row editors and selection controls. Row editor buttons use `editButtonAriaLabel` / `saveButtonAriaLabel` / `cancelButtonAriaLabel` (defaults Edit / Save / Cancel).
- Row / group expand toggles expose `aria-expanded` and `aria-controls`, with `expandButtonAriaLabel` / `collapseButtonAriaLabel` (not used under virtual scroll).
- Column resize handles are labeled buttons (`columnResizeHandleAriaLabel`). Column / row reorder handles are labeled buttons (`columnReorderHandleAriaLabel` / `rowReorderHandleAriaLabel`). Group chrome cells (`body: false`) are not reorderable/resizable.

## Related

- [Checkbox](./checkbox.md) / [RadioGroup](./radio-group.md) — selection column controls
- [Pagination](./pagination.md) — page controls used when `paginate` is true
- [Popover](./popover.md) / [Menu](./menu.md) / [Checkbox](./checkbox.md) — column toggle UI pattern
- [Menu](./menu.md) — row context menu composition (`contextMenu` + `row-contextmenu`)
- [Popover](./popover.md) / [Input](./input.md) / [Select](./select.md) — filter menu, editors, and controls
- [Empty](./empty.md) — empty states
- [Spinner](./spinner.md) / [Skeleton](./skeleton.md) — loading affordances
- [Badge](./badge.md) — status cells in templates
- `exportTableCsv` / `loadTableState` / `saveTableState` / `clearTableState` — helpers exported from the package root
