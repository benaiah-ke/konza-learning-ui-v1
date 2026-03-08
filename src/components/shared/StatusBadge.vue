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
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
  danger: 'bg-danger-light text-danger',
  info: 'bg-info-light text-info',
  neutral: 'bg-muted text-muted-foreground',
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-full font-medium',
      statusClasses[status],
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
    ]"
  >
    {{ label }}
  </span>
</template>
