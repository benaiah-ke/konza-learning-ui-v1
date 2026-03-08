<script setup lang="ts">
import { computed } from 'vue'
import {
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserPlus,
  FileText,
  CalendarClock,
  AlertCircle,
} from 'lucide-vue-next'
import VueApexCharts from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'

import StatCard from '@/components/shared/StatCard.vue'
import ChartCard from '@/components/shared/ChartCard.vue'
import { useFinanceStore } from '@/stores/finance'
import { useStudentsStore } from '@/stores/students'
import { useCurrency } from '@/composables/useCurrency'
import { useChartTheme } from '@/composables/useChartTheme'
import { campuses } from '@/data/campuses'

const finance = useFinanceStore()
const students = useStudentsStore()
const { formatCompact, format } = useCurrency()
const { baseOptions } = useChartTheme()

// ── KPI Computations ────────────────────────────────────────

const totalCapacity = computed(() =>
  campuses.reduce((sum, c) => sum + c.capacity, 0),
)

const totalEnrollment = computed(() =>
  campuses.reduce((sum, c) => sum + c.currentEnrollment, 0),
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
  colors: ['#1B4D3E', '#F59E0B'],
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
  colors: ['#0EA5E9', '#E5E5E0'],
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
  arrearsBuckets.value.current,
  arrearsBuckets.value['30days'],
  arrearsBuckets.value['60days'],
  arrearsBuckets.value['90plus'],
])

const arrearsTotal = computed(() =>
  arrearsSeries.value.reduce((a, b) => a + b, 0),
)

const arrearsOptions = computed<ApexOptions>(() => ({
  chart: {
    ...baseOptions.chart,
    type: 'donut',
    height: 300,
  },
  colors: ['#F59E0B', '#F97316', '#EF4444', '#991B1B'],
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
    message: 'New admission inquiry \u2014 Sarah Kipchoge for Butterfly Class',
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
    message: 'Term 1 2026 billing complete \u2014 28 invoices generated',
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
  success: 'bg-success/10',
  warning: 'bg-warning/10',
  info: 'bg-info/10',
  danger: 'bg-danger/10',
}
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
          <h1 class="text-2xl font-bold text-foreground">Command Dashboard</h1>
          <p class="text-sm text-muted-foreground">
            Real-time metrics across all Konza Learning Centre campuses
          </p>
        </div>
      </div>
    </div>

    <!-- KPI Cards Row -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Revenue"
        :value="formatCompact(finance.totalRevenue)"
        :change="{ value: 8.3, direction: 'up' }"
        :icon="DollarSign"
        icon-bg="bg-primary/10"
        icon-color="text-primary"
      />
      <StatCard
        label="Total Enrollment"
        :value="`${totalEnrollment} / ${totalCapacity}`"
        :change="{ value: 12.4, direction: 'up' }"
        :icon="Users"
        icon-bg="bg-info/10"
        icon-color="text-info"
      />
      <StatCard
        label="Collection Rate"
        :value="`${finance.collectionRate}%`"
        :change="{ value: 3.2, direction: 'up' }"
        :icon="TrendingUp"
        icon-bg="bg-success/10"
        icon-color="text-success"
      />
      <StatCard
        label="Outstanding Arrears"
        :value="formatCompact(finance.totalArrears)"
        :change="{ value: 15.6, direction: 'up' }"
        :icon="AlertTriangle"
        icon-bg="bg-danger/10"
        icon-color="text-danger"
      />
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Revenue Trend -->
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
          <VueApexCharts
            type="area"
            :height="300"
            :options="revenueOptions"
            :series="revenueSeries"
          />
        </template>
      </ChartCard>

      <!-- Enrollment by Campus -->
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
          <VueApexCharts
            type="bar"
            :height="300"
            :options="enrollmentOptions"
            :series="enrollmentSeries"
          />
        </template>
      </ChartCard>
    </div>

    <!-- Bottom Row -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Arrears Distribution -->
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
          <VueApexCharts
            type="donut"
            :height="300"
            :options="arrearsOptions"
            :series="arrearsSeries"
          />
        </template>
      </ChartCard>

      <!-- Recent Alerts & Activity -->
      <div class="rounded-xl border border-border bg-card p-6">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-semibold text-card-foreground">Recent Activity</h3>
            <p class="mt-0.5 text-sm text-muted-foreground">
              Latest alerts and notifications
            </p>
          </div>
          <div
            class="flex h-8 items-center rounded-full bg-danger/10 px-3 text-xs font-medium text-danger"
          >
            {{ finance.overdueInvoices.length }} overdue
          </div>
        </div>
        <div class="mt-4 max-h-[320px] space-y-1 overflow-y-auto pr-1">
          <div
            v-for="alert in alerts"
            :key="alert.id"
            class="group flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-muted/50"
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
  </div>
</template>
