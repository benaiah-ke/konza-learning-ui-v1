<script setup lang="ts">
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import type { Toast } from '@/composables/useToast'

defineProps<{
  toast: Toast
}>()

const emit = defineEmits<{
  close: [id: string]
}>()

const config: Record<Toast['type'], { icon: typeof CheckCircle; bg: string; text: string; border: string }> = {
  success: { icon: CheckCircle, bg: 'bg-success-light', text: 'text-success', border: 'border-success/20' },
  error: { icon: AlertCircle, bg: 'bg-danger-light', text: 'text-danger', border: 'border-danger/20' },
  warning: { icon: AlertTriangle, bg: 'bg-warning-light', text: 'text-warning', border: 'border-warning/20' },
  info: { icon: Info, bg: 'bg-info-light', text: 'text-info', border: 'border-info/20' },
}
</script>

<template>
  <div
    :class="[
      'flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm',
      config[toast.type].bg,
      config[toast.type].border,
    ]"
  >
    <component
      :is="config[toast.type].icon"
      :class="['h-5 w-5 shrink-0', config[toast.type].text]"
    />
    <p class="flex-1 text-sm font-medium text-foreground">{{ toast.message }}</p>
    <button
      class="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
      @click="emit('close', toast.id)"
    >
      <X class="h-3.5 w-3.5" />
    </button>
  </div>
</template>
