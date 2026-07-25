import type { InjectionKey } from 'vue'

export type ToastTone = 'neutral' | 'accent' | 'danger' | 'success' | 'warning'

export type ToastPlacement =
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastOptions {
  tone?: ToastTone
  title: string
  description?: string
  /** Auto-dismiss ms. Defaults to `5000`. Use `0` for sticky. */
  duration?: number
  action?: ToastAction
}

export interface ToastItem {
  id: string
  tone: ToastTone
  title: string
  description?: string
  duration: number
  action?: ToastAction
}

export interface ToastContext {
  toast: (options: ToastOptions) => string
  dismiss: (id: string) => void
}

export const TOAST_KEY: InjectionKey<ToastContext> = Symbol('kablui-toast')
