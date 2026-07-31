import { afterEach, describe, expect, it, vi } from 'vitest'
import { downloadCsv, escapeCsvCell, exportTableCsv } from './exportCsv'

afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('escapeCsvCell', () => {
  it('stringifies primitives and empties nullish', () => {
    expect(escapeCsvCell(null)).toBe('')
    expect(escapeCsvCell(undefined)).toBe('')
    expect(escapeCsvCell(42)).toBe('42')
    expect(escapeCsvCell(true)).toBe('true')
    expect(escapeCsvCell('plain')).toBe('plain')
  })

  it('quotes values containing separator, quotes, or newlines', () => {
    expect(escapeCsvCell('a,b')).toBe('"a,b"')
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""')
    expect(escapeCsvCell('line\nbreak')).toBe('"line\nbreak"')
  })

  it('serializes dates and objects', () => {
    const d = new Date('2024-01-15T12:00:00.000Z')
    expect(escapeCsvCell(d)).toBe('2024-01-15T12:00:00.000Z')
    expect(escapeCsvCell({ a: 1 })).toBe('"{""a"":1}"')
  })
})

describe('exportTableCsv', () => {
  const data = [
    { id: 1, name: 'Ada', role: 'Engineer' },
    { id: 2, name: 'Grace, Hopper', role: 'Admiral' },
  ]

  it('builds CSV from columns with headers', () => {
    const csv = exportTableCsv({
      data,
      columns: [
        { field: 'name', header: 'Name' },
        { field: 'role', header: 'Role' },
      ],
    })
    expect(csv).toBe('Name,Role\nAda,Engineer\n"Grace, Hopper",Admiral')
  })

  it('supports custom fields and header map', () => {
    const csv = exportTableCsv({
      data,
      fields: ['role', 'name'],
      headers: { name: 'Full name', role: 'Title' },
    })
    expect(csv).toBe('Title,Full name\nEngineer,Ada\nAdmiral,"Grace, Hopper"')
  })

  it('resolves nested field paths', () => {
    const csv = exportTableCsv({
      data: [{ country: { name: 'UK' } }],
      fields: ['country.name'],
      includeHeader: false,
    })
    expect(csv).toBe('UK')
  })

  it('supports header array and omitting the header row', () => {
    expect(
      exportTableCsv({
        data: [data[0]],
        fields: ['name'],
        headers: ['Person'],
      }),
    ).toBe('Person\nAda')
    expect(
      exportTableCsv({
        data: [data[0]],
        fields: ['name'],
        includeHeader: false,
      }),
    ).toBe('Ada')
  })

  it('supports custom separator', () => {
    const csv = exportTableCsv({
      data: [data[0]],
      fields: ['name', 'role'],
      separator: ';',
    })
    expect(csv).toBe('name;role\nAda;Engineer')
  })

  it('returns empty string when no fields are configured', () => {
    expect(exportTableCsv({ data })).toBe('')
  })

  it('triggers download when filename is provided', () => {
    const createObjectURL = vi.fn(() => 'blob:test')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })

    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})

    const csv = exportTableCsv({
      data: [data[0]],
      fields: ['name'],
      filename: 'people.csv',
    })
    expect(csv).toBe('name\nAda')
    expect(createObjectURL).toHaveBeenCalled()
    expect(click).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test')
  })
})

describe('downloadCsv', () => {
  it('is a no-op without a filename', () => {
    const createObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL: vi.fn() })
    downloadCsv('a,b', '')
    expect(createObjectURL).not.toHaveBeenCalled()
  })
})
