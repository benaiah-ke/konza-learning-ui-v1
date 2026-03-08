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
  <div class="bg-card rounded-xl border border-border p-6">
    <div class="flex items-start justify-between">
      <div class="space-y-2">
        <p class="text-sm text-muted-foreground">{{ label }}</p>
        <p class="text-3xl font-bold text-card-foreground">{{ value }}</p>
        <div v-if="change" class="flex items-center gap-1 text-sm">
          <span
            :class="[
              'inline-flex items-center gap-0.5 font-medium',
              change.direction === 'up' ? 'text-success' : 'text-danger',
            ]"
          >
            <ArrowUpRight v-if="change.direction === 'up'" class="h-4 w-4" />
            <ArrowDownRight v-else class="h-4 w-4" />
            {{ Math.abs(change.value) }}%
          </span>
        </div>
      </div>
      <div
        v-if="icon"
        :class="[
          'flex h-10 w-10 items-center justify-center rounded-full',
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
