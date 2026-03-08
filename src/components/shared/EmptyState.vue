<script setup lang="ts">
import { type Component } from 'vue'

defineProps<{
  title: string
  description: string
  icon?: Component
}>()
</script>

<template>
  <div class="py-16 text-center">
    <div
      v-if="icon"
      class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted"
    >
      <component :is="icon" class="h-7 w-7 text-muted-foreground/60" />
    </div>
    <h3 class="mb-2 text-lg font-semibold text-foreground">{{ title }}</h3>
    <p class="mx-auto mb-6 max-w-sm text-sm text-muted-foreground">
      {{ description }}
    </p>
    <div>
      <slot />
    </div>
  </div>
</template>
