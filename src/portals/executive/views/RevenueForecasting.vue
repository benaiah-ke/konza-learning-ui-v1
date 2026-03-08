<script setup lang="ts">
import { computed } from 'vue'
import SafeChart from '@/components/shared/SafeChart.vue'
import { DollarSign, TrendingUp, TrendingDown, Calculator } from 'lucide-vue-next'
import StatCard from '@/components/shared/StatCard.vue'
import ChartCard from '@/components/shared/ChartCard.vue'
import DataTable from '@/components/shared/DataTable.vue'
import PageHeader from '@/components/shared/PageHeader.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { useFinanceStore } from '@/stores/finance'
import { useCurrency } from '@/composables/useCurrency'
import { useChartTheme } from '@/composables/useChartTheme'

const financeStore = useFinanceStore()
const { format, formatCompact } = useCurrency()
const { baseOptions } = useChartTheme()

// KPI computations
const totalAnnualRevenue = computed(() =>
  financeStore.monthlyRevenue.reduce((sum, m) => sum + m.expected, 0),
)

const ytdCollected = computed(() =>
  financeStore.monthlyRevenue.reduce((sum, m) => sum + m.collected, 0),
)

const ytdExpected = computed(() =>
  financeStore.monthlyRevenue.reduce((sum, m) => sum + m.expected, 0),
)

const projectedShortfall = computed(() => {
  const shortfall = ytdExpected.value - ytdCollected.value
  return shortfall > 0 ? shortfall : 0
})

const avgMonthlyCollection = computed(() => {
  const months = financeStore.monthlyRevenue.length
  return months > 0 ? Math.round(ytdCollected.value / months) : 0
})

// Chart data - actuals + 3 month projection
const monthLabels = computed(() => {
  const actual = financeStore.monthlyRevenue.map((m) => {
    const [year, month] = m.month.split('-')
    const date = new Date(Number(year), Number(month) - 1)
    return date.toLocaleDateString('en-KE', { month: 'short', year: '2-digit' })
  })
  return [...actual, 'Apr \'26', 'May \'26', 'Jun \'26']
})

const avgCollectionRate = computed(() => {
  const total = financeStore.monthlyRevenue.reduce((sum, m) => sum + m.collected, 0)
  const totalExpected = financeStore.monthlyRevenue.reduce((sum, m) => sum + m.expected, 0)
  return totalExpected > 0 ? total / totalExpected : 0
})

const areaChartOptions = computed(() => ({
  ...baseOptions,
  chart: {
    ...baseOptions.chart,
    type: 'area' as const,
  },
  stroke: {
    curve: 'smooth' as const,
    width: [2, 2, 2],
    dashArray: [0, 0, 5],
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.15,
      opacityTo: 0.02,
      stops: [0, 90, 100],
    },
  },
  xaxis: {
    ...baseOptions.xaxis,
    categories: monthLabels.value,
  },
  yaxis: {
    ...baseOptions.yaxis,
    labels: {
      ...(baseOptions.yaxis && !Array.isArray(baseOptions.yaxis) ? baseOptions.yaxis.labels : {}),
      formatter: (val: number) => formatCompact(val),
    },
  },
  tooltip: {
    ...baseOptions.tooltip,
    y: {
      formatter: (val: number) => (val ? format(val) : 'N/A'),
    },
  },
}))

const areaChartSeries = computed(() => {
  const expectedData = financeStore.monthlyRevenue.map((m) => m.expected)
  const collectedData = financeStore.monthlyRevenue.map((m) => m.collected)

  // Project 3 months forward based on average expected and collection rate
  const lastExpected = expectedData[expectedData.length - 1] ?? 4800000
  const projectedExpected = [lastExpected, lastExpected, lastExpected]
  const projectedCollected = projectedExpected.map((e) =>
    Math.round(e * avgCollectionRate.value),
  )

  return [
    {
      name: 'Expected',
      data: [...expectedData, ...projectedExpected],
    },
    {
      name: 'Collected',
      data: [...collectedData, ...Array(3).fill(null)],
    },
    {
      name: 'Projected',
      data: [...Array(expectedData.length).fill(null), ...projectedCollected],
    },
  ]
})

// Monthly breakdown table
const breakdownColumns = [
  { key: 'month', label: 'Month' },
  { key: 'expected', label: 'Expected (KES)', align: 'right' as const },
  { key: 'collected', label: 'Collected (KES)', align: 'right' as const },
  { key: 'variance', label: 'Variance', align: 'right' as const },
  { key: 'collectionPct', label: 'Collection %', align: 'center' as const },
  { key: 'status', label: 'Status', align: 'center' as const },
]

const breakdownData = computed(() =>
  financeStore.monthlyRevenue.map((m) => {
    const variance = m.collected - m.expected
    const pct = m.expected > 0 ? Math.round((m.collected / m.expected) * 1000) / 10 : 0
    const [year, month] = m.month.split('-')
    const date = new Date(Number(year), Number(month) - 1)
    const monthLabel = date.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })

    let statusType: 'success' | 'warning' | 'danger'
    let statusLabel: string
    if (pct >= 95) {
      statusType = 'success'
      statusLabel = 'On Track'
    } else if (pct >= 80) {
      statusType = 'warning'
      statusLabel = 'Below Target'
    } else {
      statusType = 'danger'
      statusLabel = 'Critical'
    }

    return {
      month: monthLabel,
      expected: m.expected,
      collected: m.collected,
      variance,
      collectionPct: pct,
      statusType,
      statusLabel,
    }
  }),
)

// Overall collection rate for change indicator
const overallCollectionPct = computed(() =>
  ytdExpected.value > 0
    ? Math.round((ytdCollected.value / ytdExpected.value) * 1000) / 10
    : 0,
)
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Revenue & Cashflow Forecasting"
      subtitle="Financial projections and cashflow analysis across campuses"
    />

    <!-- KPI cards row -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Annual Revenue"
        :value="formatCompact(totalAnnualRevenue)"
        :icon="DollarSign"
        variant="primary"
      />
      <StatCard
        label="YTD Collected"
        :value="formatCompact(ytdCollected)"
        :icon="TrendingUp"
        variant="success"
        :change="{ value: overallCollectionPct, direction: overallCollectionPct >= 90 ? 'up' : 'down' }"
      />
      <StatCard
        label="Projected Shortfall"
        :value="formatCompact(projectedShortfall)"
        :icon="TrendingDown"
        variant="danger"
      />
      <StatCard
        label="Avg Monthly Collection"
        :value="formatCompact(avgMonthlyCollection)"
        :icon="Calculator"
        variant="info"
      />
    </div>

    <!-- Main area chart -->
    <ChartCard
      title="Revenue Trend & Forecast"
      subtitle="Historical expected vs collected with 3-month projection"
    >
      <template #chart>
        <SafeChart
          type="area"
          height="360"
          :options="areaChartOptions"
          :series="areaChartSeries"
        />
      </template>
    </ChartCard>

    <!-- Monthly breakdown table -->
    <div class="card p-6">
      <div class="mb-4">
        <h3 class="font-semibold tracking-tight text-card-foreground">Monthly Breakdown</h3>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Detailed monthly revenue performance
        </p>
      </div>

      <DataTable :columns="breakdownColumns" :data="breakdownData">
        <template #cell-month="{ value }">
          <span class="font-medium text-card-foreground">{{ value }}</span>
        </template>

        <template #cell-expected="{ value }">
          {{ format(value) }}
        </template>

        <template #cell-collected="{ value }">
          {{ format(value) }}
        </template>

        <template #cell-variance="{ value }">
          <span
            :class="[
              'font-medium',
              value >= 0 ? 'text-success' : 'text-danger',
            ]"
          >
            {{ value >= 0 ? '+' : '' }}{{ format(value) }}
          </span>
        </template>

        <template #cell-collectionPct="{ value }">
          <span
            :class="[
              'font-semibold',
              value >= 95 ? 'text-success' : value >= 80 ? 'text-warning' : 'text-danger',
            ]"
          >
            {{ value }}%
          </span>
        </template>

        <template #cell-status="{ row }">
          <StatusBadge :status="row.statusType" :label="row.statusLabel" size="sm" />
        </template>
      </DataTable>
    </div>
  </div>
</template>
