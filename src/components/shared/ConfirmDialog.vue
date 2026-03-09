<script setup lang="ts">
import { useConfirm } from '@/composables/useConfirm'
import AppModal from './AppModal.vue'
import { AlertTriangle, AlertCircle, HelpCircle } from 'lucide-vue-next'

const { isOpen, options, handleConfirm, handleCancel } = useConfirm()

const iconMap = {
  danger: AlertTriangle,
  warning: AlertCircle,
  primary: HelpCircle,
}

const iconColorMap = {
  danger: 'text-danger',
  warning: 'text-warning',
  primary: 'text-primary',
}

const iconBgMap = {
  danger: 'bg-danger-light',
  warning: 'bg-warning-light',
  primary: 'bg-primary/10',
}

const buttonColorMap = {
  danger: 'bg-danger hover:bg-danger/90 text-white',
  warning: 'bg-warning hover:bg-warning/90 text-white',
  primary: 'bg-primary hover:bg-primary/90 text-white',
}
</script>

<template>
  <AppModal
    :open="isOpen"
    :title="options.title"
    size="sm"
    :close-on-overlay="false"
    :show-close="false"
    @update:open="handleCancel"
  >
    <div class="flex gap-4">
      <div
        :class="[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          iconBgMap[options.variant ?? 'primary'],
        ]"
      >
        <component
          :is="iconMap[options.variant ?? 'primary']"
          :class="['h-5 w-5', iconColorMap[options.variant ?? 'primary']]"
        />
      </div>
      <p class="text-sm text-muted-foreground leading-relaxed">
        {{ options.message }}
      </p>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <button
          class="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          @click="handleCancel"
        >
          {{ options.cancelLabel ?? 'Cancel' }}
        </button>
        <button
          :class="[
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            buttonColorMap[options.variant ?? 'primary'],
          ]"
          @click="handleConfirm"
        >
          {{ options.confirmLabel ?? 'Confirm' }}
        </button>
      </div>
    </template>
  </AppModal>
</template>
