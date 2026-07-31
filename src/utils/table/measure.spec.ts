import { describe, expect, it } from 'vitest'
import { measureLeafColumnWidths } from './measure'

function makeTable(html: string): HTMLTableElement {
  const host = document.createElement('div')
  host.innerHTML = html
  document.body.appendChild(host)
  return host.querySelector('table')!
}

describe('measureLeafColumnWidths', () => {
  it('prefers body first-row td widths by data-column-id', () => {
    const table = makeTable(`
      <table>
        <thead>
          <tr>
            <th data-column-id="group" colspan="2">Group</th>
          </tr>
          <tr>
            <th data-column-id="a">A</th>
            <th data-column-id="b">B</th>
          </tr>
        </thead>
        <tbody>
          <tr data-testid="table-row-1">
            <td data-column-id="a" style="width: 80px">1</td>
            <td data-column-id="b" style="width: 120px">2</td>
          </tr>
        </tbody>
      </table>
    `)
    // jsdom offsetWidth is 0; stub widths.
    table.querySelectorAll('td, th').forEach((el) => {
      Object.defineProperty(el, 'offsetWidth', {
        get() {
          return Number((el as HTMLElement).style.width.replace('px', '')) || 0
        },
      })
    })

    const widths = measureLeafColumnWidths(table, [{ id: 'a' }, { id: 'b' }])
    expect(widths).toEqual({ a: 80, b: 120 })
    table.parentElement?.remove()
  })

  it('falls back to leaf th by data-column-id when body is empty', () => {
    const table = makeTable(`
      <table>
        <thead>
          <tr>
            <th colspan="2">Group</th>
          </tr>
          <tr>
            <th data-column-id="a" style="width: 50px">A</th>
            <th data-column-id="b" style="width: 70px">B</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `)
    table.querySelectorAll('th').forEach((el) => {
      Object.defineProperty(el, 'offsetWidth', {
        get() {
          return Number((el as HTMLElement).style.width.replace('px', '')) || 0
        },
      })
    })

    const widths = measureLeafColumnWidths(table, [{ id: 'a' }, { id: 'b' }])
    expect(widths).toEqual({ a: 50, b: 70 })
    table.parentElement?.remove()
  })

  it('ignores frozen and spacer rows when picking the body row', () => {
    const table = makeTable(`
      <table>
        <thead><tr><th data-column-id="a">A</th></tr></thead>
        <tbody>
          <tr data-frozen-row="true" data-testid="table-frozen-row-x">
            <td data-column-id="a" style="width: 10px">f</td>
          </tr>
          <tr aria-hidden="true"><td style="height: 40px"></td></tr>
          <tr data-testid="table-row-1">
            <td data-column-id="a" style="width: 90px">1</td>
          </tr>
        </tbody>
      </table>
    `)
    table.querySelectorAll('td').forEach((el) => {
      Object.defineProperty(el, 'offsetWidth', {
        get() {
          return Number((el as HTMLElement).style.width.replace('px', '')) || 0
        },
      })
    })

    expect(measureLeafColumnWidths(table, [{ id: 'a' }])).toEqual({ a: 90 })
    table.parentElement?.remove()
  })
})
