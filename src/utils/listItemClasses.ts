export type ListItemSize = 'sm' | 'md' | 'lg'

export interface ListItemStateOptions {
  active?: boolean
  selected?: boolean
  disabled?: boolean
  size?: ListItemSize
}

const listItemSizeClasses: Record<ListItemSize, string> = {
  sm: 'text-kablui-sm px-2 py-1',
  md: 'text-kablui-md px-3 py-1.5',
  lg: 'text-kablui-lg px-3 py-2',
}

/** Shared chrome for MenuItem / SelectItem / Select prop-options. */
export const listItemBase = [
  'flex w-full cursor-pointer items-center text-left',
  'text-kablui-fg rounded-kablui-sm',
  'focus:outline-none focus:bg-kablui-muted',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kablui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-kablui-bg',
].join(' ')

export function listItemState({
  active = false,
  selected = false,
  disabled = false,
  size = 'md',
}: ListItemStateOptions = {}): string {
  return [
    listItemSizeClasses[size],
    active ? 'bg-kablui-muted' : '',
    selected ? 'font-kablui-medium' : '',
    disabled ? 'opacity-50 pointer-events-none' : 'hover:bg-kablui-muted',
  ]
    .filter(Boolean)
    .join(' ')
}
