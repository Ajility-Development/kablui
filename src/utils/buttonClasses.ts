export type ButtonVariant = 'solid' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export const base = [
  'inline-flex items-center justify-center gap-1.5 font-kablui-medium',
  'rounded-kablui-md',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kablui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-kablui-bg',
  'disabled:opacity-50 disabled:pointer-events-none',
].join(' ')

export const variantClasses: Record<ButtonVariant, string> = {
  solid: 'bg-kablui-accent text-kablui-accent-fg hover:opacity-90',
  outline:
    'border border-kablui-border-strong bg-transparent text-kablui-fg hover:bg-kablui-muted',
  ghost: 'bg-transparent text-kablui-fg hover:bg-kablui-muted',
}

export const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-kablui-sm px-2 py-1',
  md: 'text-kablui-md px-3 py-1.5',
  lg: 'text-kablui-lg px-4 py-2',
}
