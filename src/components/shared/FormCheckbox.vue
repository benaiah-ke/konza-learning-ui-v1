<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    label: string
    id?: string
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const fieldId = computed(() => props.id ?? `checkbox-${props.label.toLowerCase().replace(/\s+/g, '-')}`)

function onChange(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).checked)
}
</script>

<template>
  <label :for="fieldId" class="flex cursor-pointer items-center gap-2.5">
    <input
      :id="fieldId"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
      @change="onChange"
    />
    <span class="text-sm text-foreground">{{ label }}</span>
  </label>
</template>
