import { ref, readonly } from 'vue'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration: number
}

const toasts = ref<Toast[]>([])

let counter = 0

function addToast(message: string, type: Toast['type'], duration = 4000) {
  const id = `toast-${++counter}`
  toasts.value.push({ id, message, type, duration })
  setTimeout(() => {
    removeToast(id)
  }, duration)
}

function removeToast(id: string) {
  const index = toasts.value.findIndex((t) => t.id === id)
  if (index !== -1) toasts.value.splice(index, 1)
}

export function useToast() {
  return {
    toasts: readonly(toasts),
    removeToast,
    success: (message: string, duration?: number) => addToast(message, 'success', duration),
    error: (message: string, duration?: number) => addToast(message, 'error', duration),
    warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
    info: (message: string, duration?: number) => addToast(message, 'info', duration),
  }
}
