<script setup lang="ts">
withDefaults(
  defineProps<{
    status: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
    label: string
    size?: 'sm' | 'md'
  }>(),
  {
    size: 'md',
  },
)

const statusClasses: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10',
  danger: 'bg-red-50 text-red-700 ring-1 ring-red-600/10',
  info: 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/10',
  neutral: 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/10',
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-lg font-semibold',
      statusClasses[status],
      size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
    ]"
  >
    {{ label }}
  </span>
</template>
