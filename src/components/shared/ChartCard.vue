<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="card">
    <div class="flex items-start justify-between p-6 pb-4">
      <div>
        <h3 class="text-base font-semibold tracking-tight text-foreground">{{ title }}</h3>
        <p v-if="subtitle" class="mt-1 text-sm text-muted-foreground">
          {{ subtitle }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <slot />
      </div>
    </div>
    <div class="px-6 pb-6">
      <slot name="chart" />
    </div>
  </div>
</template>
