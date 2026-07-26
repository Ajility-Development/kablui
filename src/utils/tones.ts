export type { Tone, TextTone } from '../types/tone'
import type { TextTone, Tone } from '../types/tone'

/** Bordered filled surfaces (Alert, Toast). Neutral uses `bg-kablui-bg`. */
export const SURFACE_TONE_CLASSES: Record<Tone, string> = {
  neutral: 'border-kablui-border bg-kablui-bg text-kablui-fg',
  accent: 'border-kablui-accent bg-kablui-accent text-kablui-accent-fg',
  danger: 'border-kablui-danger bg-kablui-danger text-kablui-danger-fg',
  success: 'border-kablui-success bg-kablui-success text-kablui-success-fg',
  warning: 'border-kablui-warning bg-kablui-warning text-kablui-warning-fg',
}

/** Fill-only surfaces (Badge) — no border; neutral uses muted fill. */
export const BADGE_TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-kablui-muted text-kablui-fg',
  accent: 'bg-kablui-accent text-kablui-accent-fg',
  danger: 'bg-kablui-danger text-kablui-danger-fg',
  success: 'bg-kablui-success text-kablui-success-fg',
  warning: 'bg-kablui-warning text-kablui-warning-fg',
}

export const TEXT_TONE_CLASSES: Record<TextTone, string> = {
  default: 'text-kablui-fg',
  muted: 'text-kablui-muted-fg',
  accent: 'text-kablui-accent',
  danger: 'text-kablui-danger',
}
