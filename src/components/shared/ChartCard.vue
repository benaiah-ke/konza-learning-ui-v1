<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="rounded-xl border border-border bg-card p-6">
    <div class="flex items-start justify-between">
      <div>
        <h3 class="font-semibold text-card-foreground">{{ title }}</h3>
        <p v-if="subtitle" class="mt-0.5 text-sm text-muted-foreground">
          {{ subtitle }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <slot />
      </div>
    </div>
    <div class="pt-4">
      <slot name="chart" />
    </div>
  </div>
</template>
