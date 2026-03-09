<script setup lang="ts">
import { computed } from 'vue'
import {
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserPlus,
  FileText,
  CalendarClock,
  AlertCircle,
  Wallet,
  Banknote,
  ClipboardList,
  Briefcase,
  PieChart,
} from 'lucide-vue-next'
import SafeChart from '@/components/shared/SafeChart.vue'
import type { ApexOptions } from 'apexcharts'

import StatCard from '@/components/shared/StatCard.vue'
import ChartCard from '@/components/shared/ChartCard.vue'
import { useFinanceStore } from '@/stores/finance'
import { useStaffStore } from '@/stores/staff'
import { useAcademicsStore } from '@/stores/academics'
import { useAdmissionsStore } from '@/stores/admissions'
import { useCurrency } from '@/composables/useCurrency'
import { useChartTheme } from '@/composables/useChartTheme'
import { campuses } from '@/data/campuses'

const finance = useFinanceStore()
const staffStore = useStaffStore()
const academics = useAcademicsStore()
const admissions = useAdmissionsStore()
const { formatCompact, format } = useCurrency()
const { baseOptions } = useChartTheme()

// ── KPI Computations ────────────────────────────────────────

const totalCapacity = computed(() =>
  campuses.reduce((sum, c) => sum + c.capacity, 0),
)

const totalEnrollment = computed(() =>
  campuses.reduce((sum, c) => sum + c.currentEnrollment, 0),
)

// ── Financial Health Computations ───────────────────────────

const currentMonthPayroll = computed(() => {
  const data = staffStore.payrollByMonth['2026-03']
  return data?.total ?? 0
})

const pendingApprovals = computed(() =>
  finance.pendingExpenses.length + staffStore.pendingPayroll.length,
)

// ── Expense by Month Aggregation ────────────────────────────

const expensesByMonth = computed(() => {
  const grouped: Record<string, number> = {}
  for (const e of finance.expenses) {
    const month = e.date.slice(0, 7)
    grouped[month] = (grouped[month] ?? 0) + e.amount
  }
  return grouped
})

const comparisonMonths = ['2026-01', '2026-02', '2026-03']

const comparisonLabels = ['Jan 2026', 'Feb 2026', 'Mar 2026']

const monthlyNetIncome = computed(() =>
  comparisonMonths.map((m) => {
    const rev = finance.monthlyRevenue.find((r) => r.month === m)
    return (rev?.collected ?? 0) - (expensesByMonth.value[m] ?? 0)
  }),
)

// ── Academics Summary ───────────────────────────────────────

const exceedingPct = computed(() => {
  const dist = academics.gradeDistribution
  const total = Object.values(dist).reduce((a, b) => a + b, 0)
  return total > 0 ? Math.round(((dist['Exceeding'] ?? 0) / total) * 100) : 0
})

const enrollmentUtilization = computed(() =>
  totalCapacity.value > 0
    ? Math.round((totalEnrollment.value / totalCapacity.value) * 100)
    : 0,
)

// ── Revenue Trend Chart ─────────────────────────────────────

const monthLabels = computed(() =>
  finance.monthlyRevenue.map((m) => {
    const [year, month] = m.month.split('-')
    const date = new Date(Number(year), Number(month) - 1)
    return date.toLocaleString('en-US', { month: 'short' })
  }),
)

const revenueSeries = computed(() => [
  {
    name: 'Expected',
    data: finance.monthlyRevenue.map((m) => m.expected),
  },
  {
    name: 'Collected',
    data: finance.monthlyRevenue.map((m) => m.collected),
  },
])

const revenueOptions = computed<ApexOptions>(() => ({
  ...baseOptions,
  chart: {
    ...baseOptions.chart,
    type: 'area',
    height: 300,
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.35,
      opacityTo: 0.05,
      stops: [0, 95, 100],
    },
  },
  xaxis: {
    ...baseOptions.xaxis,
    categories: monthLabels.value,
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
  stroke: {
    curve: 'smooth',
    width: 2.5,
  },
  grid: baseOptions.grid,
  legend: baseOptions.legend,
  dataLabels: { enabled: false },
}))

// ── Income vs Expenses Bar Chart ────────────────────────────

const incomeVsExpensesSeries = computed(() => [
  {
    name: 'Revenue Collected',
    data: comparisonMonths.map((m) => {
      const rev = finance.monthlyRevenue.find((r) => r.month === m)
      return rev?.collected ?? 0
    }),
  },
  {
    name: 'Total Expenses',
    data: comparisonMonths.map((m) => expensesByMonth.value[m] ?? 0),
  },
])

const incomeVsExpensesOptions = computed<ApexOptions>(() => ({
  ...baseOptions,
  chart: {
    ...baseOptions.chart,
    type: 'bar',
    height: 300,
  },
  colors: ['#22c55e', '#ef4444'],
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
    categories: comparisonLabels,
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
  legend: baseOptions.legend,
  dataLabels: { enabled: false },
}))

// ── Profit Margin Area Chart ────────────────────────────────

const profitSeries = computed(() => [
  {
    name: 'Net Income',
    data: monthlyNetIncome.value,
  },
])

const profitOptions = computed<ApexOptions>(() => ({
  ...baseOptions,
  chart: {
    ...baseOptions.chart,
    type: 'area',
    height: 300,
  },
  colors: ['#22c55e'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.05,
      stops: [0, 95, 100],
    },
  },
  xaxis: {
    ...baseOptions.xaxis,
    categories: comparisonLabels,
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
  stroke: {
    curve: 'smooth',
    width: 2.5,
  },
  grid: baseOptions.grid,
  legend: baseOptions.legend,
  dataLabels: { enabled: false },
}))

// ── Expense Breakdown Donut Chart ───────────────────────────

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

const expenseCategoryEntries = computed(() => {
  const cats = finance.expensesByCategory
  return Object.entries(cats).sort((a, b) => b[1] - a[1])
})

const expenseDonutSeries = computed(() =>
  expenseCategoryEntries.value.map(([, val]) => val),
)

const expenseDonutLabels = computed(() =>
  expenseCategoryEntries.value.map(([key]) => categoryLabels[key] ?? key),
)

const expenseDonutOptions = computed<ApexOptions>(() => ({
  chart: {
    ...baseOptions.chart,
    type: 'donut',
    height: 300,
  },
  labels: expenseDonutLabels.value,
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
            label: 'Total Expenses',
            fontSize: '13px',
            color: '#737373',
            formatter: () => formatCompact(finance.totalExpenses),
          },
        },
      },
    },
  },
  stroke: {
    width: 3,
    colors: ['#ffffff'],
  },
  legend: {
    ...baseOptions.legend,
    position: 'bottom',
  },
  tooltip: {
    ...baseOptions.tooltip,
    y: {
      formatter: (val: number) => format(val),
    },
  },
  dataLabels: { enabled: false },
}))

// ── Enrollment by Campus Chart ──────────────────────────────

const enrollmentSeries = computed(() => [
  {
    name: 'Current Enrollment',
    data: campuses.map((c) => c.currentEnrollment),
  },
  {
    name: 'Capacity',
    data: campuses.map((c) => c.capacity),
  },
])

const enrollmentOptions = computed<ApexOptions>(() => ({
  ...baseOptions,
  chart: {
    ...baseOptions.chart,
    type: 'bar',
    height: 300,
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
    categories: campuses.map((c) => c.name.replace('Konza ', '').replace(' Campus', '')),
  },
  yaxis: {
    ...baseOptions.yaxis,
    max: 140,
    labels: {
      ...(baseOptions.yaxis && !Array.isArray(baseOptions.yaxis)
        ? baseOptions.yaxis.labels
        : {}),
      formatter: (val: number) => `${val}`,
    },
  },
  tooltip: {
    ...baseOptions.tooltip,
    y: {
      formatter: (val: number) => `${val} students`,
    },
  },
  stroke: { show: false, width: 0 },
  grid: baseOptions.grid,
  legend: baseOptions.legend,
  dataLabels: { enabled: false },
}))

// ── Arrears Donut Chart ─────────────────────────────────────

const arrearsBuckets = computed(() => finance.arrearsByBucket)

const arrearsSeries = computed(() => [
  arrearsBuckets.value.current ?? 0,
  arrearsBuckets.value['30days'] ?? 0,
  arrearsBuckets.value['60days'] ?? 0,
  arrearsBuckets.value['90plus'] ?? 0,
])

const arrearsTotal = computed(() =>
  arrearsSeries.value.reduce((a, b) => (a ?? 0) + (b ?? 0), 0),
)

const arrearsOptions = computed<ApexOptions>(() => ({
  chart: {
    ...baseOptions.chart,
    type: 'donut',
    height: 300,
  },
  labels: ['Current', '30 Days', '60 Days', '90+ Days'],
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
            fontSize: '24px',
            fontWeight: 700,
            color: '#1a1a1a',
            offsetY: 4,
          },
          total: {
            show: true,
            label: 'Total Records',
            fontSize: '13px',
            color: '#737373',
            formatter: () => `${arrearsTotal.value}`,
          },
        },
      },
    },
  },
  stroke: {
    width: 3,
    colors: ['#ffffff'],
  },
  legend: {
    ...baseOptions.legend,
    position: 'bottom',
  },
  tooltip: {
    ...baseOptions.tooltip,
    y: {
      formatter: (val: number) => `${val} records`,
    },
  },
  dataLabels: { enabled: false },
}))

// ── Activity Feed ───────────────────────────────────────────

interface AlertItem {
  id: string
  message: string
  type: 'success' | 'warning' | 'info' | 'danger'
  time: string
  icon: typeof CheckCircle
}

const alerts: AlertItem[] = [
  {
    id: 'a1',
    message: 'KES 165,000 payment received from Wanjiku family',
    type: 'success',
    time: '12 min ago',
    icon: CheckCircle,
  },
  {
    id: 'a2',
    message: '2 unmatched M-Pesa transactions require attention',
    type: 'warning',
    time: '34 min ago',
    icon: AlertCircle,
  },
  {
    id: 'a3',
    message: 'New admission inquiry — Sarah Kipchoge for Butterfly Class',
    type: 'info',
    time: '1 hr ago',
    icon: UserPlus,
  },
  {
    id: 'a4',
    message: 'Overdue: Invoice for Njeri family (90+ days)',
    type: 'danger',
    time: '2 hrs ago',
    icon: AlertTriangle,
  },
  {
    id: 'a5',
    message: 'Term 1 2026 billing complete — 28 invoices generated',
    type: 'success',
    time: '3 hrs ago',
    icon: FileText,
  },
  {
    id: 'a6',
    message: 'Staff leave request pending: Diana Kendi (Maternity)',
    type: 'info',
    time: '5 hrs ago',
    icon: CalendarClock,
  },
]

const alertDotColor: Record<string, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  danger: 'bg-danger',
}

const alertIconColor: Record<string, string> = {
  success: 'text-success',
  warning: 'text-warning',
  info: 'text-info',
  danger: 'text-danger',
}

const alertIconBg: Record<string, string> = {
  success: 'bg-success-light',
  warning: 'bg-warning-light',
  info: 'bg-info-light',
  danger: 'bg-danger-light',
}

// ── Operations snapshot metrics ─────────────────────────────

const opsMetrics = computed(() => [
  {
    section: 'Staff',
    items: [
      { label: 'Active Staff', value: `${staffStore.activeStaff.length}`, color: 'text-info' },
      { label: 'Pending Leave', value: `${staffStore.pendingLeaveRequests.length}`, color: 'text-warning' },
    ],
  },
  {
    section: 'Admissions',
    items: [
      { label: 'Active Pipeline', value: `${admissions.activePipeline.length} leads`, color: 'text-primary' },
      { label: 'Conversion Rate', value: `${admissions.conversionRate}%`, color: 'text-success' },
    ],
  },
  {
    section: 'Academics',
    items: [
      { label: 'Avg Score', value: `${academics.overallAverageScore} / 5`, color: 'text-primary' },
      { label: 'Exceeding Grade', value: `${exceedingPct.value}%`, color: 'text-success' },
    ],
  },
  {
    section: 'Enrollment',
    items: [
      { label: 'Students', value: `${totalEnrollment.value} / ${totalCapacity.value}`, color: 'text-info' },
      { label: 'Utilization', value: `${enrollmentUtilization.value}%`, color: 'text-primary' },
    ],
  },
])
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"
        >
          <TrendingUp class="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground">Command Dashboard</h1>
          <p class="text-sm text-muted-foreground">
            Real-time metrics across all Konza Learning Centre campuses
          </p>
        </div>
      </div>
    </div>

    <!-- Row 1: Revenue KPI Cards -->
    <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Revenue"
        :value="formatCompact(finance.totalRevenue)"
        :change="{ value: 8.3, direction: 'up' }"
        :icon="DollarSign"
        variant="primary"
      />
      <StatCard
        label="Total Collected"
        :value="formatCompact(finance.totalCollected)"
        :change="{ value: 5.1, direction: 'up' }"
        :icon="CheckCircle"
        variant="success"
      />
      <StatCard
        label="Collection Rate"
        :value="`${finance.collectionRate}%`"
        :change="{ value: 3.2, direction: 'up' }"
        :icon="TrendingUp"
        variant="success"
      />
      <StatCard
        label="Outstanding Arrears"
        :value="formatCompact(finance.totalArrears)"
        :change="{ value: 15.6, direction: 'up' }"
        :icon="AlertTriangle"
        variant="danger"
      />
    </div>

    <!-- Row 2: Financial Health Cards -->
    <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Expenses"
        :value="formatCompact(finance.totalExpenses)"
        :icon="Wallet"
        variant="warning"
      />
      <StatCard
        label="Net Income"
        :value="formatCompact(finance.netIncome)"
        :icon="finance.netIncome >= 0 ? TrendingUp : TrendingDown"
        :variant="finance.netIncome >= 0 ? 'success' : 'danger'"
      />
      <StatCard
        label="Payroll (Mar 2026)"
        :value="formatCompact(currentMonthPayroll)"
        :icon="Banknote"
        variant="info"
      />
      <StatCard
        label="Pending Approvals"
        :value="String(pendingApprovals)"
        :icon="ClipboardList"
        variant="neutral"
      />
    </div>

    <!-- Row 3: Income vs Expenses + Profit Margin -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ChartCard
        title="Income vs Expenses"
        subtitle="Monthly comparison — Jan to Mar 2026"
      >
        <template #default>
          <div class="flex items-center gap-1.5">
            <DollarSign class="h-4 w-4 text-muted-foreground" />
            <span class="text-xs text-muted-foreground">
              Net: {{ formatCompact(finance.netIncome) }}
            </span>
          </div>
        </template>
        <template #chart>
          <SafeChart
            type="bar"
            :height="300"
            :options="incomeVsExpensesOptions"
            :series="incomeVsExpensesSeries"
          />
        </template>
      </ChartCard>

      <ChartCard
        title="Monthly Profit Margin"
        subtitle="Revenue collected minus total expenses"
      >
        <template #default>
          <div class="flex items-center gap-1.5">
            <TrendingUp class="h-4 w-4 text-success" />
            <span class="text-xs font-medium text-success">
              Profitable
            </span>
          </div>
        </template>
        <template #chart>
          <SafeChart
            type="area"
            :height="300"
            :options="profitOptions"
            :series="profitSeries"
          />
        </template>
      </ChartCard>
    </div>

    <!-- Row 4: Revenue Trend (full width) -->
    <ChartCard
      title="Revenue Trend"
      subtitle="Expected vs Collected over 12 months"
    >
      <template #default>
        <div class="flex items-center gap-1.5">
          <Clock class="h-4 w-4 text-muted-foreground" />
          <span class="text-xs text-muted-foreground">Apr 2025 - Mar 2026</span>
        </div>
      </template>
      <template #chart>
        <SafeChart
          type="area"
          :height="300"
          :options="revenueOptions"
          :series="revenueSeries"
        />
      </template>
    </ChartCard>

    <!-- Row 5: Expense Breakdown + Arrears Aging -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ChartCard
        title="Expense Breakdown"
        subtitle="Spending by category"
      >
        <template #default>
          <div class="flex items-center gap-1.5">
            <PieChart class="h-4 w-4 text-warning" />
            <span class="text-xs font-medium text-warning">
              {{ formatCompact(finance.totalExpenses) }} total
            </span>
          </div>
        </template>
        <template #chart>
          <SafeChart
            type="donut"
            :height="300"
            :options="expenseDonutOptions"
            :series="expenseDonutSeries"
          />
        </template>
      </ChartCard>

      <ChartCard
        title="Arrears Aging Distribution"
        subtitle="Outstanding balances by aging bucket"
      >
        <template #default>
          <div class="flex items-center gap-1.5">
            <AlertTriangle class="h-4 w-4 text-danger" />
            <span class="text-xs font-medium text-danger">
              {{ arrearsTotal }} records
            </span>
          </div>
        </template>
        <template #chart>
          <SafeChart
            type="donut"
            :height="300"
            :options="arrearsOptions"
            :series="arrearsSeries"
          />
        </template>
      </ChartCard>
    </div>

    <!-- Row 6: Enrollment + Operations Snapshot -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ChartCard
        title="Enrollment by Campus"
        subtitle="Current enrollment vs total capacity"
      >
        <template #default>
          <div class="flex items-center gap-1.5">
            <Users class="h-4 w-4 text-muted-foreground" />
            <span class="text-xs text-muted-foreground">
              {{ totalEnrollment }} of {{ totalCapacity }} total
            </span>
          </div>
        </template>
        <template #chart>
          <SafeChart
            type="bar"
            :height="300"
            :options="enrollmentOptions"
            :series="enrollmentSeries"
          />
        </template>
      </ChartCard>

      <!-- Operations Snapshot -->
      <div class="card p-6">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-semibold tracking-tight text-card-foreground">Operations Snapshot</h3>
            <p class="mt-0.5 text-sm text-muted-foreground">
              Cross-domain summary of all operations
            </p>
          </div>
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Briefcase class="h-4 w-4 text-primary" />
          </div>
        </div>
        <div class="mt-5 grid grid-cols-2 gap-4">
          <div
            v-for="group in opsMetrics"
            :key="group.section"
            class="rounded-xl border border-border p-4"
          >
            <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {{ group.section }}
            </p>
            <div class="space-y-2.5">
              <div
                v-for="item in group.items"
                :key="item.label"
                class="flex items-center justify-between"
              >
                <span class="text-sm text-muted-foreground">{{ item.label }}</span>
                <span :class="['text-sm font-semibold', item.color]">{{ item.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 7: Recent Activity -->
    <div class="card p-6">
      <div class="flex items-start justify-between">
        <div>
          <h3 class="font-semibold tracking-tight text-card-foreground">Recent Activity</h3>
          <p class="mt-0.5 text-sm text-muted-foreground">
            Latest alerts and notifications
          </p>
        </div>
        <div
          class="flex h-8 items-center rounded-lg bg-danger-light px-3 text-xs font-medium text-danger ring-1 ring-danger/10"
        >
          {{ finance.overdueInvoices.length }} overdue
        </div>
      </div>
      <div class="mt-4 max-h-[320px] space-y-1 overflow-y-auto pr-1">
        <div
          v-for="alert in alerts"
          :key="alert.id"
          class="group flex items-start gap-3 rounded-lg px-3 py-3 transition-all duration-200 hover:bg-muted/50"
        >
          <!-- Icon -->
          <div
            :class="[
              'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
              alertIconBg[alert.type],
            ]"
          >
            <component
              :is="alert.icon"
              :class="['h-4 w-4', alertIconColor[alert.type]]"
            />
          </div>
          <!-- Content -->
          <div class="min-w-0 flex-1">
            <p class="text-sm leading-snug text-card-foreground">
              {{ alert.message }}
            </p>
            <p class="mt-1 text-xs text-muted-foreground">
              {{ alert.time }}
            </p>
          </div>
          <!-- Status dot -->
          <div class="mt-2 shrink-0">
            <span
              :class="[
                'inline-block h-2 w-2 rounded-full',
                alertDotColor[alert.type],
              ]"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
