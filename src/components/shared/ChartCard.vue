<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="rounded-2xl border border-border/60 bg-white shadow-sm">
    <div class="flex items-start justify-between px-6 pb-2 pt-6">
      <div>
        <h3 class="text-base font-semibold tracking-tight text-foreground">{{ title }}</h3>
        <p v-if="subtitle" class="mt-0.5 text-[13px] text-muted-foreground">
          {{ subtitle }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <slot />
      </div>
    </div>
    <div class="px-6 pb-6 pt-2">
      <slot name="chart" />
    </div>
  </div>
</template>
