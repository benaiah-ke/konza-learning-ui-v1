<script setup lang="ts">
import ToastContainer from '@/components/shared/ToastContainer.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
</script>

<template>
  <RouterView />
  <ToastContainer />
  <ConfirmDialog />
</template>
