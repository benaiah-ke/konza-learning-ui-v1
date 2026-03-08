<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, toRaw, nextTick } from 'vue'
import ApexCharts from 'apexcharts'

const props = defineProps<{
  type: string
  height: string | number
  options: Record<string, any>
  series: any[]
}>()

const chartEl = ref<HTMLDivElement | null>(null)
let chart: ApexCharts | null = null

function buildOptions(): Record<string, any> {
  const raw = toRaw(props.options) ?? {}
  return {
    ...raw,
    chart: {
      ...(raw.chart ?? {}),
      type: props.type,
      height: Number(props.height),
    },
    series: toRaw(props.series) ?? [],
  }
}

function initChart() {
  if (chart || !chartEl.value) return
  // Guard: options must be a valid object with at least a chart config
  if (!props.options || typeof props.options !== 'object') return
  try {
    chart = new ApexCharts(chartEl.value, buildOptions())
    chart.render()
  } catch (err) {
    console.warn('[SafeChart] Failed to initialise chart:', err)
    chart = null
  }
}

onMounted(() => {
  initChart()
})

// If options arrive after mount (e.g. computed resolves later), init then
watch(
  () => props.options,
  (newOpts) => {
    if (!chart && newOpts) {
      nextTick(initChart)
    } else if (chart && newOpts) {
      try {
        chart.updateOptions(buildOptions(), true, true)
      } catch (err) {
        console.warn('[SafeChart] Failed to update options:', err)
      }
    }
  },
  { deep: true },
)

watch(
  () => props.series,
  (newSeries) => {
    if (chart && newSeries) {
      try {
        chart.updateSeries(toRaw(newSeries), true)
      } catch (err) {
        console.warn('[SafeChart] Failed to update series:', err)
      }
    }
  },
  { deep: true },
)

onBeforeUnmount(() => {
  // Nullify reference only — do NOT call chart.destroy().
  // ApexCharts.destroy() removes DOM nodes synchronously, which corrupts
  // Vue's VDOM tree during the unmount phase. Vue will remove the DOM
  // elements itself; the chart instance will be garbage collected.
  chart = null
})
</script>

<template>
  <div ref="chartEl" />
</template>
