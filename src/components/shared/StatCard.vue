<script setup lang="ts">
import { type Component } from 'vue'
import { ArrowUpRight, ArrowDownRight } from 'lucide-vue-next'

interface Change {
  value: number
  direction: 'up' | 'down'
}

defineProps<{
  label: string
  value: string
  change?: Change
  icon?: Component
  iconBg?: string
  iconColor?: string
}>()
</script>

<template>
  <div class="group bg-white rounded-2xl border border-border/60 p-5 shadow-sm hover:shadow-md transition-all duration-200">
    <div class="flex items-start justify-between">
      <div class="space-y-1.5 min-w-0 flex-1">
        <p class="text-[13px] font-medium text-muted-foreground truncate">{{ label }}</p>
        <p class="text-2xl font-bold text-foreground tracking-tight">{{ value }}</p>
        <div v-if="change" class="flex items-center gap-1.5 pt-0.5">
          <span
            :class="[
              'inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md',
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
          'flex h-11 w-11 items-center justify-center rounded-xl shrink-0 ml-3 transition-transform duration-200 group-hover:scale-105',
          iconBg ?? 'bg-primary/10',
        ]"
      >
        <component
          :is="icon"
          :class="['h-5 w-5', iconColor ?? 'text-primary']"
        />
      </div>
    </div>
  </div>
</template>
