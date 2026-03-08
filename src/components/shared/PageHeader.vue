<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="flex items-start justify-between">
    <div>
      <h1 class="text-2xl font-bold text-foreground">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1 text-sm text-muted-foreground">
        {{ subtitle }}
      </p>
    </div>
    <div class="flex items-center gap-2">
      <slot />
    </div>
  </div>
</template>
