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
  success: 'bg-success-light text-success-foreground ring-1 ring-success/20',
  warning: 'bg-warning-light text-warning-foreground ring-1 ring-warning/20',
  danger: 'bg-danger-light text-danger-foreground ring-1 ring-danger/20',
  info: 'bg-info-light text-info-foreground ring-1 ring-info/20',
  neutral: 'bg-muted text-muted-foreground ring-1 ring-border',
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-full font-semibold',
      statusClasses[status],
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs',
    ]"
  >
    {{ label }}
  </span>
</template>
