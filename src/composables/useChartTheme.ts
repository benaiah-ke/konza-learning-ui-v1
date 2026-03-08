import type { ApexOptions } from 'apexcharts'

export function useChartTheme() {
  const baseOptions: ApexOptions = {
    chart: {
      fontFamily: 'Inter, system-ui, sans-serif',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ['#1B4D3E', '#F59E0B', '#0EA5E9', '#7C3AED', '#C2410C', '#16A34A'],
    grid: {
      borderColor: '#E5E5E0',
      strokeDashArray: 4,
      padding: { left: 0, right: 0 },
    },
    tooltip: {
      theme: 'light',
      style: { fontSize: '13px' },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    xaxis: {
      labels: {
        style: {
          colors: '#737373',
          fontSize: '12px',
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#737373',
          fontSize: '12px',
        },
      },
    },
    legend: {
      position: 'bottom',
      fontSize: '13px',
      fontWeight: 500,
      labels: { colors: '#737373' },
      markers: { size: 4, offsetX: -2 },
      itemMargin: { horizontal: 12 },
    },
  }

  return { baseOptions }
}
