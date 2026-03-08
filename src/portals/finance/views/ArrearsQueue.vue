<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  CircleDollarSign,
  Users,
  Handshake,
  AlertTriangle,
  MessageSquare,
  Mail,
  PhoneCall,
  ChevronDown,
  ChevronUp,
} from 'lucide-vue-next'
import SafeChart from '@/components/shared/SafeChart.vue'
import type { ApexOptions } from 'apexcharts'
import { format } from 'date-fns'

import StatCard from '@/components/shared/StatCard.vue'
import ChartCard from '@/components/shared/ChartCard.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import PageHeader from '@/components/shared/PageHeader.vue'
import { useFinanceStore } from '@/stores/finance'
import { useStudentsStore } from '@/stores/students'
import { useCurrency } from '@/composables/useCurrency'
import { useChartTheme } from '@/composables/useChartTheme'
import { parents } from '@/data/parents'

const financeStore = useFinanceStore()
const studentsStore = useStudentsStore()
const { format: formatCurrency, formatCompact } = useCurrency()
const { baseOptions } = useChartTheme()

// ── Expanded rows state ─────────────────────────────────────
const expandedRows = ref<Set<string>>(new Set())

function toggleRow(id: string) {
  if (expandedRows.value.has(id)) {
    expandedRows.value.delete(id)
  } else {
    expandedRows.value.add(id)
  }
}

// ── Stats ───────────────────────────────────────────────────
const totalArrearsAmount = computed(() =>
  financeStore.arrearsRecords.reduce((sum, a) => sum + a.totalOwed, 0),
)

const accountsInArrears = computed(() => financeStore.arrearsRecords.length)

const promiseToPayCount = computed(
  () => financeStore.arrearsRecords.filter((a) => a.status === 'promise-to-pay').length,
)

const escalatedCount = computed(
  () => financeStore.arrearsRecords.filter((a) => a.status === 'escalated').length,
)

// ── Arrears Donut Chart ─────────────────────────────────────
const bucketAmounts = computed(() => {
  const amounts: Record<string, number> = {
    current: 0,
    '30days': 0,
    '60days': 0,
    '90plus': 0,
  }
  for (const record of financeStore.arrearsRecords) {
    amounts[record.agingBucket] = (amounts[record.agingBucket] ?? 0) + record.totalOwed
  }
  return amounts
})

const donutSeries = computed(() => [
  bucketAmounts.value.current,
  bucketAmounts.value['30days'],
  bucketAmounts.value['60days'],
  bucketAmounts.value['90plus'],
])

const donutOptions = computed<ApexOptions>(() => ({
  chart: {
    ...baseOptions.chart,
    type: 'donut',
    height: 280,
  },
  colors: ['#F59E0B', '#F97316', '#EF4444', '#991B1B'],
  labels: ['Current', '30 Days', '60 Days', '90+ Days'],
  plotOptions: {
    pie: {
      donut: {
        size: '72%',
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '13px',
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
            label: 'Total Arrears',
            fontSize: '12px',
            color: '#737373',
            formatter: () => formatCompact(totalArrearsAmount.value),
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
      formatter: (val: number) => formatCurrency(val),
    },
  },
  dataLabels: { enabled: false },
}))

// ── Queue Data ──────────────────────────────────────────────
const bucketLabelMap: Record<string, string> = {
  current: 'Current',
  '30days': '30 Days',
  '60days': '60 Days',
  '90plus': '90+ Days',
}

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

const recordStatusLabel: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  'promise-to-pay': 'Promise to Pay',
  escalated: 'Escalated',
}

const queueData = computed(() =>
  financeStore.arrearsRecords.map((record) => {
    const student = studentsStore.getStudentById(record.studentId)
    const parent = parents.find((p) => p.id === record.parentId)

    return {
      id: record.id,
      studentName: student
        ? `${student.firstName} ${student.lastName}`
        : 'Unknown Student',
      parentName: parent
        ? `${parent.firstName} ${parent.lastName}`
        : 'Unknown Parent',
      parentPhone: parent?.phone ?? '-',
      amountOwed: record.totalOwed,
      agingBucket: record.agingBucket,
      agingBucketLabel: bucketLabelMap[record.agingBucket] ?? '',
      agingBucketStatus: bucketStatusMap[record.agingBucket] ?? 'info',
      status: record.status,
      statusLabel: recordStatusLabel[record.status] ?? record.status,
      statusType: recordStatusMap[record.status] ?? 'neutral',
      lastContactDate: record.lastContactDate,
      lastContactMethod: record.lastContactMethod,
      notes: record.notes ?? '',
    }
  }),
)

function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'dd MMM yyyy')
}

function handleSendSMS(id: string) {
  financeStore.sendFollowUp(id)
}

function handleRecordCall(id: string) {
  financeStore.sendFollowUp(id)
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Arrears Management Queue"
      subtitle="Track and manage overdue fee collections"
    />

    <!-- Stats and Chart Row -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Stats Column -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
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
          label="Promise to Pay"
          :value="promiseToPayCount.toString()"
          :icon="Handshake"
          variant="info"
        />
        <StatCard
          label="Escalated"
          :value="escalatedCount.toString()"
          :icon="AlertTriangle"
          variant="danger"
        />
      </div>

      <!-- Donut Chart -->
      <ChartCard
        title="Arrears by Aging"
        subtitle="Distribution by aging bucket (KES)"
      >
        <template #chart>
          <SafeChart
            type="donut"
            :height="280"
            :options="donutOptions"
            :series="donutSeries"
          />
        </template>
      </ChartCard>
    </div>

    <!-- Follow-up Queue Table -->
    <div class="card p-6">
      <div class="mb-4">
        <h3 class="font-semibold tracking-tight text-card-foreground">Follow-up Queue</h3>
        <p class="mt-0.5 text-sm text-muted-foreground">
          {{ queueData.length }} arrears records requiring attention
        </p>
      </div>

      <div class="overflow-hidden rounded-xl border border-border">
        <table class="w-full">
          <thead>
            <tr class="bg-muted/50">
              <th class="w-8 px-3 py-3" />
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Student
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Parent / Phone
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Amount Owed
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Aging
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Last Contact
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="row in queueData" :key="row.id">
              <!-- Main row -->
              <tr
                class="border-b border-border transition-all duration-200 hover:bg-muted/30"
                :class="{ 'bg-muted/20': expandedRows.has(row.id) }"
              >
                <!-- Expand toggle -->
                <td class="px-3 py-3">
                  <button
                    class="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
                    @click="toggleRow(row.id)"
                  >
                    <ChevronUp v-if="expandedRows.has(row.id)" class="h-4 w-4" />
                    <ChevronDown v-else class="h-4 w-4" />
                  </button>
                </td>
                <!-- Student -->
                <td class="px-4 py-3">
                  <span class="font-medium text-card-foreground">{{ row.studentName }}</span>
                </td>
                <!-- Parent / Phone -->
                <td class="px-4 py-3">
                  <div class="text-sm text-card-foreground">{{ row.parentName }}</div>
                  <div class="text-xs text-muted-foreground">{{ row.parentPhone }}</div>
                </td>
                <!-- Amount -->
                <td class="px-4 py-3 text-right">
                  <span class="font-bold tracking-tight text-danger">{{ formatCurrency(row.amountOwed) }}</span>
                </td>
                <!-- Aging Bucket -->
                <td class="px-4 py-3 text-center">
                  <StatusBadge
                    :status="row.agingBucketStatus"
                    :label="row.agingBucketLabel"
                    size="sm"
                  />
                </td>
                <!-- Status -->
                <td class="px-4 py-3 text-center">
                  <StatusBadge
                    :status="row.statusType"
                    :label="row.statusLabel"
                    size="sm"
                  />
                </td>
                <!-- Last Contact -->
                <td class="px-4 py-3">
                  <template v-if="row.lastContactDate">
                    <div class="text-sm text-card-foreground">
                      {{ formatDate(row.lastContactDate) }}
                    </div>
                    <div class="text-xs text-muted-foreground">
                      via {{ row.lastContactMethod }}
                    </div>
                  </template>
                  <span v-else class="text-xs text-muted-foreground">No contact</span>
                </td>
                <!-- Actions -->
                <td class="px-4 py-3">
                  <div class="flex items-center justify-center gap-1.5">
                    <button
                      class="inline-flex items-center gap-1 rounded-lg bg-success/10 px-2 py-1 text-xs font-medium text-success ring-1 ring-success/10 transition-all duration-200 hover:bg-success/20"
                      title="Send SMS"
                      @click="handleSendSMS(row.id)"
                    >
                      <MessageSquare class="h-3 w-3" />
                      SMS
                    </button>
                    <button
                      class="inline-flex items-center gap-1 rounded-lg bg-info/10 px-2 py-1 text-xs font-medium text-info ring-1 ring-info/10 transition-all duration-200 hover:bg-info/20"
                      title="Send Email"
                    >
                      <Mail class="h-3 w-3" />
                      Email
                    </button>
                    <button
                      class="inline-flex items-center gap-1 rounded-lg bg-warning/10 px-2 py-1 text-xs font-medium text-warning ring-1 ring-warning/10 transition-all duration-200 hover:bg-warning/20"
                      title="Record Call"
                      @click="handleRecordCall(row.id)"
                    >
                      <PhoneCall class="h-3 w-3" />
                      Call
                    </button>
                  </div>
                </td>
              </tr>
              <!-- Expanded notes row -->
              <tr v-if="expandedRows.has(row.id)" class="border-b border-border bg-muted/10">
                <td colspan="8" class="px-4 py-3">
                  <div class="ml-8 rounded-xl border border-border bg-card p-4">
                    <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</p>
                    <p class="mt-1 text-sm text-card-foreground">
                      {{ row.notes || 'No notes recorded for this record.' }}
                    </p>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
