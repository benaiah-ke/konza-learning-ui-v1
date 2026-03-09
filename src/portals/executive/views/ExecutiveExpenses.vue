<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Wallet,
  PieChart,
  Clock,
  ClipboardList,
  Building2,
} from 'lucide-vue-next'
import SafeChart from '@/components/shared/SafeChart.vue'
import type { ApexOptions } from 'apexcharts'
import StatCard from '@/components/shared/StatCard.vue'
import ChartCard from '@/components/shared/ChartCard.vue'
import DataTable from '@/components/shared/DataTable.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import PageHeader from '@/components/shared/PageHeader.vue'
import { useFinanceStore } from '@/stores/finance'
import { useCurrency } from '@/composables/useCurrency'
import { useChartTheme } from '@/composables/useChartTheme'
import { campuses } from '@/data/campuses'

const finance = useFinanceStore()
const { formatCompact, format } = useCurrency()
const { baseOptions } = useChartTheme()

// ── Campus Filter ───────────────────────────────────────────

type CampusFilter = 'all' | 'campus-karen' | 'campus-westlands'
const selectedCampus = ref<CampusFilter>('all')

const tabs: { label: string; value: CampusFilter }[] = [
  { label: 'All Campuses', value: 'all' },
  { label: 'Karen', value: 'campus-karen' },
  { label: 'Westlands', value: 'campus-westlands' },
]

// ── Filtered Data ───────────────────────────────────────────

const filteredExpenses = computed(() => {
  if (selectedCampus.value === 'all') return finance.expenses
  return finance.expenses.filter((e) => e.campusId === selectedCampus.value)
})

const filteredTotal = computed(() =>
  filteredExpenses.value.reduce((sum, e) => sum + e.amount, 0),
)

const filteredPending = computed(() =>
  filteredExpenses.value.filter((e) => e.status === 'pending').length,
)

const filteredByCategory = computed(() => {
  const grouped: Record<string, number> = {}
  for (const e of filteredExpenses.value) {
    grouped[e.category] = (grouped[e.category] ?? 0) + e.amount
  }
  return grouped
})

const largestCategory = computed(() => {
  const entries = Object.entries(filteredByCategory.value)
  if (entries.length === 0) return 'N/A'
  entries.sort((a, b) => b[1] - a[1])
  const top = entries[0]
  return top ? (categoryLabels[top[0]] ?? top[0]) : 'N/A'
})

const monthlyAverage = computed(() => Math.round(filteredTotal.value / 3))

// ── Category Labels ─────────────────────────────────────────

const categoryLabels: Record<string, string> = {
  salaries: 'Salaries',
  rent: 'Rent',
  utilities: 'Utilities',
  food: 'Food',
  supplies: 'Supplies',
  transport: 'Transport',
  maintenance: 'Maintenance',
  marketing: 'Marketing',
  other: 'Other',
}

// ── Monthly Expense Trend (Stacked Bar) ─────────────────────

const months = ['2026-01', '2026-02', '2026-03']
const monthLabels = ['Jan 2026', 'Feb 2026', 'Mar 2026']

const allCategories = computed(() => {
  const cats = new Set<string>()
  for (const e of filteredExpenses.value) cats.add(e.category)
  return [...cats].sort()
})

const trendSeries = computed(() =>
  allCategories.value.map((cat) => ({
    name: categoryLabels[cat] ?? cat,
    data: months.map((m) =>
      filteredExpenses.value
        .filter((e) => e.date.startsWith(m) && e.category === cat)
        .reduce((sum, e) => sum + e.amount, 0),
    ),
  })),
)

const trendOptions = computed<ApexOptions>(() => ({
  ...baseOptions,
  chart: {
    ...baseOptions.chart,
    type: 'bar',
    height: 320,
    stacked: true,
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 4,
      borderRadiusApplication: 'end',
      borderRadiusWhenStacked: 'last',
    },
  },
  xaxis: {
    ...baseOptions.xaxis,
    categories: monthLabels,
  },
  yaxis: {
    ...baseOptions.yaxis,
    labels: {
      ...(baseOptions.yaxis && !Array.isArray(baseOptions.yaxis)
        ? baseOptions.yaxis.labels
        : {}),
      formatter: (val: number) => formatCompact(val),
    },
  },
  tooltip: {
    ...baseOptions.tooltip,
    y: {
      formatter: (val: number) => format(val),
    },
  },
  stroke: { show: false, width: 0 },
  grid: baseOptions.grid,
  legend: {
    ...baseOptions.legend,
    position: 'bottom',
  },
  dataLabels: { enabled: false },
}))

// ── Category Breakdown Donut ────────────────────────────────

const donutEntries = computed(() =>
  Object.entries(filteredByCategory.value).sort((a, b) => b[1] - a[1]),
)

const donutSeries = computed(() => donutEntries.value.map(([, val]) => val))
const donutLabels = computed(() =>
  donutEntries.value.map(([key]) => categoryLabels[key] ?? key),
)

const donutOptions = computed<ApexOptions>(() => ({
  chart: {
    ...baseOptions.chart,
    type: 'donut',
    height: 320,
  },
  labels: donutLabels.value,
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '14px',
            color: '#737373',
            offsetY: -8,
          },
          value: {
            show: true,
            fontSize: '20px',
            fontWeight: 700,
            color: '#1a1a1a',
            offsetY: 4,
            formatter: (val: string) => formatCompact(Number(val)),
          },
          total: {
            show: true,
            label: 'Total',
            fontSize: '13px',
            color: '#737373',
            formatter: () => formatCompact(filteredTotal.value),
          },
        },
      },
    },
  },
  stroke: { width: 3, colors: ['#ffffff'] },
  legend: { ...baseOptions.legend, position: 'bottom' },
  tooltip: {
    ...baseOptions.tooltip,
    y: { formatter: (val: number) => format(val) },
  },
  dataLabels: { enabled: false },
}))

// ── Campus Comparison (All Campuses only) ───────────────────

function campusExpensesByMonth(campusId: string) {
  return months.map((m) =>
    finance.expenses
      .filter((e) => e.campusId === campusId && e.date.startsWith(m))
      .reduce((sum, e) => sum + e.amount, 0),
  )
}

const comparisonSeries = computed(() => [
  { name: 'Karen', data: campusExpensesByMonth('campus-karen') },
  { name: 'Westlands', data: campusExpensesByMonth('campus-westlands') },
])

const comparisonOptions = computed<ApexOptions>(() => ({
  ...baseOptions,
  chart: {
    ...baseOptions.chart,
    type: 'bar',
    height: 320,
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 6,
      borderRadiusApplication: 'end',
    },
  },
  xaxis: {
    ...baseOptions.xaxis,
    categories: monthLabels,
  },
  yaxis: {
    ...baseOptions.yaxis,
    labels: {
      ...(baseOptions.yaxis && !Array.isArray(baseOptions.yaxis)
        ? baseOptions.yaxis.labels
        : {}),
      formatter: (val: number) => formatCompact(val),
    },
  },
  tooltip: {
    ...baseOptions.tooltip,
    y: { formatter: (val: number) => format(val) },
  },
  stroke: { show: false, width: 0 },
  grid: baseOptions.grid,
  legend: baseOptions.legend,
  dataLabels: { enabled: false },
}))

// ── Expense Table ───────────────────────────────────────────

function getCampusName(campusId: string): string {
  const campus = campuses.find((c) => c.id === campusId)
  return campus ? campus.name.replace('Konza ', '').replace(' Campus', '') : campusId
}

const tableColumns = [
  { key: 'date', label: 'Date' },
  { key: 'categoryLabel', label: 'Category' },
  { key: 'description', label: 'Description' },
  { key: 'vendor', label: 'Vendor' },
  { key: 'amount', label: 'Amount', align: 'right' as const },
  { key: 'campusName', label: 'Campus' },
  { key: 'status', label: 'Status', align: 'center' as const },
]

const tableData = computed(() =>
  [...filteredExpenses.value]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((e) => ({
      ...e,
      categoryLabel: categoryLabels[e.category] ?? e.category,
      campusName: getCampusName(e.campusId),
      formattedAmount: format(e.amount),
    })),
)
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Expense Analysis"
      subtitle="Detailed expense tracking and comparison across campuses"
    />

    <!-- Campus selector tabs -->
    <div class="flex gap-1 rounded-xl bg-muted p-1">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        :class="[
          'flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200',
          selectedCampus === tab.value
            ? 'bg-card text-card-foreground shadow-sm'
            : 'text-muted-foreground hover:text-card-foreground',
        ]"
        @click="selectedCampus = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Expenses"
        :value="formatCompact(filteredTotal)"
        :icon="Wallet"
        variant="warning"
      />
      <StatCard
        label="Largest Category"
        :value="largestCategory"
        :icon="PieChart"
        variant="primary"
      />
      <StatCard
        label="Pending Approval"
        :value="String(filteredPending)"
        :icon="ClipboardList"
        variant="danger"
      />
      <StatCard
        label="Monthly Average"
        :value="formatCompact(monthlyAverage)"
        :icon="Clock"
        variant="info"
      />
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Monthly Trend (Stacked) -->
      <ChartCard
        title="Monthly Expense Trend"
        subtitle="Expenses by category per month"
      >
        <template #default>
          <div class="flex items-center gap-1.5">
            <Clock class="h-4 w-4 text-muted-foreground" />
            <span class="text-xs text-muted-foreground">Jan - Mar 2026</span>
          </div>
        </template>
        <template #chart>
          <SafeChart
            type="bar"
            :height="320"
            :options="trendOptions"
            :series="trendSeries"
          />
        </template>
      </ChartCard>

      <!-- Category Breakdown -->
      <ChartCard
        title="Category Breakdown"
        subtitle="Spending distribution by category"
      >
        <template #default>
          <div class="flex items-center gap-1.5">
            <Wallet class="h-4 w-4 text-warning" />
            <span class="text-xs font-medium text-warning">
              {{ formatCompact(filteredTotal) }} total
            </span>
          </div>
        </template>
        <template #chart>
          <SafeChart
            type="donut"
            :height="320"
            :options="donutOptions"
            :series="donutSeries"
          />
        </template>
      </ChartCard>
    </div>

    <!-- Campus Comparison (only when All Campuses selected) -->
    <ChartCard
      v-if="selectedCampus === 'all'"
      title="Campus Expense Comparison"
      subtitle="Karen vs Westlands monthly expenses"
    >
      <template #default>
        <div class="flex items-center gap-1.5">
          <Building2 class="h-4 w-4 text-muted-foreground" />
          <span class="text-xs text-muted-foreground">Side-by-side comparison</span>
        </div>
      </template>
      <template #chart>
        <SafeChart
          type="bar"
          :height="320"
          :options="comparisonOptions"
          :series="comparisonSeries"
        />
      </template>
    </ChartCard>

    <!-- Expense Table -->
    <div class="card p-6">
      <div class="mb-4">
        <h3 class="font-semibold tracking-tight text-card-foreground">All Expenses</h3>
        <p class="mt-0.5 text-sm text-muted-foreground">
          {{ filteredExpenses.length }} records
          {{ selectedCampus !== 'all' ? `for ${getCampusName(selectedCampus)}` : 'across both campuses' }}
        </p>
      </div>
      <DataTable :columns="tableColumns" :data="tableData">
        <template #cell-date="{ value }">
          <span class="text-sm text-foreground">{{ value }}</span>
        </template>
        <template #cell-categoryLabel="{ value }">
          <span class="text-sm font-medium text-foreground">{{ value }}</span>
        </template>
        <template #cell-description="{ value }">
          <span class="text-sm text-muted-foreground">{{ value }}</span>
        </template>
        <template #cell-amount="{ row }">
          <span class="text-sm font-semibold text-foreground">{{ row.formattedAmount }}</span>
        </template>
        <template #cell-status="{ row }">
          <StatusBadge
            :status="row.status === 'approved' ? 'success' : row.status === 'pending' ? 'warning' : 'danger'"
            :label="row.status === 'approved' ? 'Approved' : row.status === 'pending' ? 'Pending' : 'Rejected'"
            size="sm"
          />
        </template>
      </DataTable>
    </div>
  </div>
</template>
