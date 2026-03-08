<script setup lang="ts">
import { type Component } from 'vue'

defineProps<{
  title: string
  description: string
  icon?: Component
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div
      v-if="icon"
      class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"
    >
      <component :is="icon" class="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 class="text-lg font-semibold text-foreground">{{ title }}</h3>
    <p class="mt-1 max-w-sm text-sm text-muted-foreground">
      {{ description }}
    </p>
    <div class="mt-4">
      <slot />
    </div>
  </div>
</template>
