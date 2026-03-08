<script setup lang="ts">
import { type Component } from 'vue'
import { ArrowUpRight, ArrowDownRight } from 'lucide-vue-next'

interface Change {
  value: number
  direction: 'up' | 'down'
}

type Variant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const props = withDefaults(
  defineProps<{
    label: string
    value: string
    change?: Change
    icon?: Component
    variant?: Variant
    iconBg?: string
    iconColor?: string
  }>(),
  {
    variant: 'primary',
  },
)

const variantStyles: Record<Variant, { bg: string; text: string }> = {
  primary: { bg: 'bg-primary/10', text: 'text-primary' },
  success: { bg: 'bg-success-light', text: 'text-success' },
  warning: { bg: 'bg-warning-light', text: 'text-warning' },
  danger: { bg: 'bg-danger-light', text: 'text-danger' },
  info: { bg: 'bg-info-light', text: 'text-info' },
  neutral: { bg: 'bg-muted', text: 'text-muted-foreground' },
}

const iconBgClass = props.iconBg ?? variantStyles[props.variant].bg
const iconColorClass = props.iconColor ?? variantStyles[props.variant].text
</script>

<template>
  <div class="card p-6">
    <div class="flex items-start justify-between">
      <div class="space-y-1.5 min-w-0 flex-1">
        <p class="text-sm font-medium text-muted-foreground truncate">{{ label }}</p>
        <p class="text-3xl font-extrabold text-foreground tracking-tight">{{ value }}</p>
        <div v-if="change" class="flex items-center gap-1.5 pt-1">
          <span
            :class="[
              'inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full',
              change.direction === 'up' ? 'text-success-foreground bg-success-light' : 'text-danger-foreground bg-danger-light',
            ]"
          >
            <ArrowUpRight v-if="change.direction === 'up'" class="h-3 w-3" />
            <ArrowDownRight v-else class="h-3 w-3" />
            {{ Math.abs(change.value) }}%
          </span>
        </div>
      </div>
      <div
        v-if="icon"
        :class="[
          'flex h-12 w-12 items-center justify-center rounded-xl shrink-0 ml-4',
          iconBgClass,
        ]"
      >
        <component
          :is="icon"
          :class="['h-6 w-6', iconColorClass]"
        />
      </div>
    </div>
  </div>
</template>
