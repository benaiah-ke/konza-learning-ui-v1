import { computed } from 'vue'
import type { ApexOptions } from 'apexcharts'

function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
}

export function useChartTheme() {
  const colors = computed(() => [
    getCSSVar('--color-chart-1'),
    getCSSVar('--color-chart-2'),
    getCSSVar('--color-chart-3'),
    getCSSVar('--color-chart-4'),
    getCSSVar('--color-chart-5'),
    getCSSVar('--color-chart-6'),
  ])

  const baseOptions = computed<ApexOptions>(() => ({
    chart: {
      fontFamily: 'Onest, system-ui, sans-serif',
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent',
    },
    colors: colors.value,
    grid: {
      borderColor: getCSSVar('--color-border'),
      strokeDashArray: 4,
      padding: { left: 0, right: 0 },
    },
    tooltip: {
      theme: 'light',
      style: { fontSize: '12px' },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    xaxis: {
      labels: {
        style: {
          colors: getCSSVar('--color-muted-foreground'),
          fontSize: '12px',
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: getCSSVar('--color-muted-foreground'),
          fontSize: '12px',
        },
      },
    },
    legend: {
      position: 'bottom',
      fontSize: '12px',
      fontWeight: 500,
      labels: { colors: getCSSVar('--color-muted-foreground') },
      markers: { size: 4, offsetX: -2 },
      itemMargin: { horizontal: 12 },
    },
  }))

  return { baseOptions, colors }
}
