<script setup lang="ts">
import { computed } from 'vue'
import SafeChart from '@/components/shared/SafeChart.vue'
import { AlertTriangle, Users, Clock, CircleDollarSign } from 'lucide-vue-next'
import StatCard from '@/components/shared/StatCard.vue'
import ChartCard from '@/components/shared/ChartCard.vue'
import DataTable from '@/components/shared/DataTable.vue'
import PageHeader from '@/components/shared/PageHeader.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { useFinanceStore } from '@/stores/finance'
import { useStudentsStore } from '@/stores/students'
import { useCurrency } from '@/composables/useCurrency'
import { useChartTheme } from '@/composables/useChartTheme'
import { parents } from '@/data/parents'

const financeStore = useFinanceStore()
const studentsStore = useStudentsStore()
const { format, formatCompact } = useCurrency()
const { baseOptions } = useChartTheme()

// Summary stats
const totalArrearsAmount = computed(() =>
  financeStore.arrearsRecords.reduce((sum, a) => sum + a.totalOwed, 0),
)

const accountsInArrears = computed(() => financeStore.arrearsRecords.length)

const avgDaysOutstanding = computed(() => {
  const bucketDays: Record<string, number> = {
    current: 15,
    '30days': 30,
    '60days': 60,
    '90plus': 120,
  }
  const totalDays = financeStore.arrearsRecords.reduce(
    (sum, a) => sum + (bucketDays[a.agingBucket] ?? 0),
    0,
  )
  return accountsInArrears.value > 0 ? Math.round(totalDays / accountsInArrears.value) : 0
})

const highestArrear = computed(() =>
  Math.max(...financeStore.arrearsRecords.map((a) => a.totalOwed), 0),
)

// Stacked bar chart - arrears by aging bucket
const bucketLabels: Record<string, string> = {
  current: 'Current',
  '30days': '30 Days',
  '60days': '60 Days',
  '90plus': '90+ Days',
}

const bucketAmounts = computed(() => {
  const amounts: Record<string, number> = {
    current: 0,
    '30days': 0,
    '60days': 0,
    '90plus': 0,
  }
  for (const record of financeStore.arrearsRecords) {
    amounts[record.agingBucket] += record.totalOwed
  }
  return amounts
})

const barChartOptions = computed(() => ({
  ...baseOptions,
  chart: {
    ...baseOptions.chart,
    type: 'bar' as const,
    stacked: true,
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '50%',
      borderRadius: 6,
      borderRadiusApplication: 'end' as const,
      borderRadiusWhenStacked: 'last' as const,
    },
  },
  colors: ['#0EA5E9', '#F59E0B', '#EF4444', '#7C3AED'],
  xaxis: {
    ...baseOptions.xaxis,
    categories: ['Arrears by Aging Bucket'],
  },
  yaxis: {
    ...baseOptions.yaxis,
    labels: {
      ...baseOptions.yaxis?.labels,
      formatter: (val: number) => formatCompact(val),
    },
  },
  tooltip: {
    ...baseOptions.tooltip,
    y: {
      formatter: (val: number) => format(val),
    },
  },
  legend: {
    ...baseOptions.legend,
    position: 'bottom' as const,
  },
}))

const barChartSeries = computed(() =>
  Object.entries(bucketAmounts.value).map(([key, amount]) => ({
    name: bucketLabels[key],
    data: [amount],
  })),
)

// Detail table
const detailColumns = [
  { key: 'studentName', label: 'Student Name' },
  { key: 'parentName', label: 'Parent' },
  { key: 'amountOwed', label: 'Amount Owed', align: 'right' as const },
  { key: 'agingBucket', label: 'Aging Bucket', align: 'center' as const },
  { key: 'status', label: 'Status', align: 'center' as const },
  { key: 'lastContact', label: 'Last Contact' },
  { key: 'notes', label: 'Notes' },
]

const bucketStatusMap: Record<string, 'info' | 'warning' | 'danger'> = {
  current: 'info',
  '30days': 'warning',
  '60days': 'danger',
  '90plus': 'danger',
}

const recordStatusMap: Record<string, 'neutral' | 'info' | 'warning' | 'danger'> = {
  new: 'neutral',
  contacted: 'info',
  'promise-to-pay': 'warning',
  escalated: 'danger',
}

const statusLabelMap: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  'promise-to-pay': 'Promise to Pay',
  escalated: 'Escalated',
}

const detailData = computed(() =>
  financeStore.arrearsRecords.map((record) => {
    const student = studentsStore.getStudentById(record.studentId)
    const parent = parents.find((p) => p.id === record.parentId)

    const studentName = student
      ? `${student.firstName} ${student.lastName}`
      : 'Unknown Student'
    const parentName = parent
      ? `${parent.firstName} ${parent.lastName}`
      : 'Unknown Parent'

    const lastContact = record.lastContactDate
      ? `${record.lastContactDate} (${record.lastContactMethod ?? ''})`
      : 'No contact'

    return {
      studentName,
      parentName,
      amountOwed: record.totalOwed,
      agingBucket: record.agingBucket,
      agingBucketLabel: bucketLabels[record.agingBucket],
      agingBucketStatus: bucketStatusMap[record.agingBucket],
      status: record.status,
      statusLabel: statusLabelMap[record.status] ?? record.status,
      statusType: recordStatusMap[record.status] ?? 'neutral',
      lastContact,
      notes: record.notes ?? '-',
    }
  }),
)
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Arrears Aging Report"
      subtitle="Outstanding fee balances grouped by aging period"
    />

    <!-- Summary stat cards -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Arrears"
        :value="formatCompact(totalArrearsAmount)"
        :icon="CircleDollarSign"
        variant="danger"
      />
      <StatCard
        label="Accounts in Arrears"
        :value="accountsInArrears.toString()"
        :icon="Users"
        variant="warning"
      />
      <StatCard
        label="Avg Days Outstanding"
        :value="`${avgDaysOutstanding} days`"
        :icon="Clock"
        variant="info"
      />
      <StatCard
        label="Highest Single Arrear"
        :value="formatCompact(highestArrear)"
        :icon="AlertTriangle"
        variant="danger"
      />
    </div>

    <!-- Stacked bar chart -->
    <ChartCard
      title="Arrears by Aging Bucket"
      subtitle="Breakdown of outstanding amounts by aging period"
    >
      <template #chart>
        <SafeChart
          type="bar"
          height="300"
          :options="barChartOptions"
          :series="barChartSeries"
        />
      </template>
    </ChartCard>

    <!-- Arrears detail table -->
    <div class="card p-6">
      <div class="mb-4">
        <h3 class="font-semibold tracking-tight text-card-foreground">Arrears Detail</h3>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Individual arrears records with contact history
        </p>
      </div>

      <DataTable :columns="detailColumns" :data="detailData">
        <template #cell-studentName="{ value }">
          <span class="font-medium text-card-foreground">{{ value }}</span>
        </template>

        <template #cell-amountOwed="{ value }">
          <span class="font-semibold text-danger">{{ format(value) }}</span>
        </template>

        <template #cell-agingBucket="{ row }">
          <StatusBadge
            :status="row.agingBucketStatus"
            :label="row.agingBucketLabel"
            size="sm"
          />
        </template>

        <template #cell-status="{ row }">
          <StatusBadge
            :status="row.statusType"
            :label="row.statusLabel"
            size="sm"
          />
        </template>

        <template #cell-notes="{ value }">
          <span class="max-w-xs truncate text-sm text-muted-foreground">{{ value }}</span>
        </template>
      </DataTable>
    </div>
  </div>
</template>
