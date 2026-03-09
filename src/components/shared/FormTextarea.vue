<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label: string
    id?: string
    rows?: number
    placeholder?: string
    required?: boolean
    error?: string
    disabled?: boolean
  }>(),
  {
    rows: 3,
    placeholder: '',
    required: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const fieldId = computed(() => props.id ?? `textarea-${props.label.toLowerCase().replace(/\s+/g, '-')}`)

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <div>
    <label :for="fieldId" class="mb-1.5 block text-sm font-medium text-foreground">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    <textarea
      :id="fieldId"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :class="[
        'w-full rounded-xl border bg-white px-3 py-2 text-sm text-foreground shadow-sm transition-colors resize-none',
        'focus:outline-none focus:ring-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error
          ? 'border-danger focus:border-danger focus:ring-danger/10'
          : 'border-border focus:border-primary focus:ring-primary/10',
      ]"
      @input="onInput"
    />
    <p v-if="error" class="mt-1 text-xs text-danger">{{ error }}</p>
  </div>
</template>
