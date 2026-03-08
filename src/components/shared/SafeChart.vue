<script setup lang="ts">
import { ref, onBeforeUnmount, nextTick } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

defineProps<{
  type: string
  height: string | number
  options: Record<string, any>
  series: any[]
}>()

const chartRef = ref<InstanceType<typeof VueApexCharts> | null>(null)
const alive = ref(true)

onBeforeUnmount(() => {
  // Destroy chart instance BEFORE Vue's unmount cycle removes DOM nodes.
  // This prevents the "Cannot read properties of null (reading 'exposed')"
  // crash that occurs when ApexCharts' internal DOM cleanup races with
  // Vue 3.5's component teardown.
  alive.value = false

  try {
    const inst = chartRef.value as any
    if (inst?.chart) {
      inst.chart.destroy()
    }
  } catch {
    // Swallow — chart may already be gone
  }
})
</script>

<template>
  <VueApexCharts
    v-if="alive"
    ref="chartRef"
    :type="type"
    :height="height"
    :options="options"
    :series="series"
  />
</template>
