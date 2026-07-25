import { inject } from 'vue'
import { TOAST_KEY, type ToastContext } from '../components/toastContext'

/**
 * Imperative toast API. Must be called under a `ToastProvider`.
 */
export function useToast(): ToastContext {
  const ctx = inject(TOAST_KEY, null)
  if (!ctx) {
    throw new Error('useToast() must be used within a <ToastProvider>.')
  }
  return ctx
}
