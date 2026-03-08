<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-foreground">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1 text-[13px] text-muted-foreground">
        {{ subtitle }}
      </p>
    </div>
    <div class="flex items-center gap-3">
      <slot />
    </div>
  </div>
</template>
