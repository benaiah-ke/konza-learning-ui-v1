<script setup lang="ts">
import { ref, computed } from 'vue'
import SafeChart from '@/components/shared/SafeChart.vue'
import { Building2, Users, GraduationCap, BarChart3 } from 'lucide-vue-next'
import StatCard from '@/components/shared/StatCard.vue'
import ChartCard from '@/components/shared/ChartCard.vue'
import DataTable from '@/components/shared/DataTable.vue'
import PageHeader from '@/components/shared/PageHeader.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { useStudentsStore } from '@/stores/students'
import { useFinanceStore } from '@/stores/finance'
import { useCurrency } from '@/composables/useCurrency'
import { useChartTheme } from '@/composables/useChartTheme'
import { campuses } from '@/data/campuses'

const studentsStore = useStudentsStore()
const financeStore = useFinanceStore()
const { format, formatCompact } = useCurrency()
const { baseOptions } = useChartTheme()

type CampusFilter = 'all' | 'campus-karen' | 'campus-westlands'
const selectedCampus = ref<CampusFilter>('all')

const tabs: { label: string; value: CampusFilter }[] = [
  { label: 'Both Campuses', value: 'all' },
  { label: 'Karen', value: 'campus-karen' },
  { label: 'Westlands', value: 'campus-westlands' },
]

// Per-campus computed data
function getCampusStats(campusId: string) {
  const campus = campuses.find((c) => c.id === campusId)!
  const campusStudents = studentsStore.getStudentsByCampus(campusId)
  const studentIds = new Set(campusStudents.map((s) => s.id))

  const campusInvoices = financeStore.invoices.filter((inv) => studentIds.has(inv.studentId))
  const totalBilled = campusInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
  const totalPaid = campusInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0)
  const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 1000) / 10 : 0

  return {
    name: campus.name.replace('Konza ', ''),
    shortName: campus.name.replace('Konza ', '').replace(' Campus', ''),
    enrollment: campus.currentEnrollment,
    capacity: campus.capacity,
    enrollmentPercent: Math.round((campus.currentEnrollment / campus.capacity) * 100),
    staffCount: campus.staffCount,
    revenue: totalBilled,
    collected: totalPaid,
    collectionRate,
  }
}

const karenStats = computed(() => getCampusStats('campus-karen'))
const westlandsStats = computed(() => getCampusStats('campus-westlands'))

const visibleCampuses = computed(() => {
  if (selectedCampus.value === 'campus-karen') return [karenStats.value]
  if (selectedCampus.value === 'campus-westlands') return [westlandsStats.value]
  return [karenStats.value, westlandsStats.value]
})

// Comparison chart
const comparisonChartOptions = computed(() => ({
  ...baseOptions,
  chart: {
    ...baseOptions.chart,
    type: 'bar' as const,
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 6,
      borderRadiusApplication: 'end' as const,
    },
  },
  xaxis: {
    ...baseOptions.xaxis,
    categories: ['Enrollment', 'Revenue (M)', 'Collection Rate (%)'],
  },
  yaxis: {
    ...baseOptions.yaxis,
    labels: {
      ...baseOptions.yaxis?.labels,
      formatter: (val: number) => val.toFixed(0),
    },
  },
  tooltip: {
    ...baseOptions.tooltip,
    y: {
      formatter: (val: number, opts: { dataPointIndex: number }) => {
        if (opts.dataPointIndex === 1) return formatCompact(val * 1_000_000)
        if (opts.dataPointIndex === 2) return `${val}%`
        return val.toString()
      },
    },
  },
}))

const comparisonChartSeries = computed(() => [
  {
    name: 'Karen',
    data: [
      karenStats.value.enrollment,
      Math.round((karenStats.value.revenue / 1_000_000) * 10) / 10,
      karenStats.value.collectionRate,
    ],
  },
  {
    name: 'Westlands',
    data: [
      westlandsStats.value.enrollment,
      Math.round((westlandsStats.value.revenue / 1_000_000) * 10) / 10,
      westlandsStats.value.collectionRate,
    ],
  },
])

// Class utilization data
const classNames = ['Butterfly', 'Giraffe', 'Elephant', 'Lion', 'Dolphin']
const classCapacities: Record<string, number> = {
  Butterfly: 20,
  Giraffe: 20,
  Elephant: 18,
  Lion: 18,
  Dolphin: 20,
}

const classTableColumns = [
  { key: 'className', label: 'Class' },
  { key: 'campus', label: 'Campus' },
  { key: 'enrolled', label: 'Enrolled', align: 'center' as const },
  { key: 'capacity', label: 'Capacity', align: 'center' as const },
  { key: 'utilization', label: 'Utilization', align: 'center' as const },
]

const classTableData = computed(() => {
  const rows: Record<string, any>[] = []
  const campusFilter = selectedCampus.value

  for (const campus of campuses) {
    if (campusFilter !== 'all' && campus.id !== campusFilter) continue

    for (const className of classNames) {
      const classStudents = studentsStore.students.filter(
        (s) => s.className === className && s.campusId === campus.id && s.status === 'active',
      )
      const cap = classCapacities[className] ?? 20
      const utilization = Math.round((classStudents.length / cap) * 100)

      rows.push({
        className,
        campus: campus.name.replace('Konza ', '').replace(' Campus', ''),
        enrolled: classStudents.length,
        capacity: cap,
        utilization,
        utilizationStatus:
          utilization >= 90 ? 'success' : utilization >= 70 ? 'warning' : 'danger',
      })
    }
  }

  return rows
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Campus Performance"
      subtitle="Side-by-side campus comparison and drill-down"
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

    <!-- Comparison cards row -->
    <div
      :class="[
        'grid gap-6',
        visibleCampuses.length === 1 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2',
      ]"
    >
      <div
        v-for="campus in visibleCampuses"
        :key="campus.name"
        class="card p-6 space-y-5"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Building2 class="h-5 w-5 text-primary" />
          </div>
          <h3 class="text-lg font-semibold tracking-tight text-card-foreground">{{ campus.name }}</h3>
        </div>

        <!-- Enrollment -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">Enrollment</span>
            <span class="font-medium text-card-foreground">
              {{ campus.enrollment }} / {{ campus.capacity }}
            </span>
          </div>
          <div class="h-2.5 w-full rounded-full bg-muted">
            <div
              class="h-2.5 rounded-full transition-all"
              :class="[
                campus.enrollmentPercent >= 90
                  ? 'bg-success'
                  : campus.enrollmentPercent >= 70
                    ? 'bg-warning'
                    : 'bg-danger',
              ]"
              :style="{ width: `${campus.enrollmentPercent}%` }"
            />
          </div>
          <p class="text-xs text-muted-foreground">{{ campus.enrollmentPercent }}% capacity</p>
        </div>

        <!-- Staff & Collection -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <p class="text-sm text-muted-foreground">Staff</p>
            <p class="text-2xl font-bold tracking-tight text-card-foreground">{{ campus.staffCount }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-sm text-muted-foreground">Collection Rate</p>
            <p class="text-2xl font-bold tracking-tight text-card-foreground">{{ campus.collectionRate }}%</p>
          </div>
        </div>

        <!-- Revenue -->
        <div class="space-y-1 border-t border-border pt-4">
          <p class="text-sm text-muted-foreground">Revenue Billed</p>
          <p class="text-xl font-semibold tracking-tight text-card-foreground">
            {{ formatCompact(campus.revenue) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Comparison bar chart -->
    <ChartCard
      v-if="selectedCampus === 'all'"
      title="Campus Comparison"
      subtitle="Karen vs Westlands across key metrics"
    >
      <template #chart>
        <SafeChart
          type="bar"
          height="320"
          :options="comparisonChartOptions"
          :series="comparisonChartSeries"
        />
      </template>
    </ChartCard>

    <!-- Class utilization table -->
    <div class="card p-6">
      <div class="mb-4">
        <h3 class="font-semibold tracking-tight text-card-foreground">Class Utilization</h3>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Enrollment by class across {{ selectedCampus === 'all' ? 'both campuses' : 'selected campus' }}
        </p>
      </div>

      <DataTable :columns="classTableColumns" :data="classTableData">
        <template #cell-className="{ value }">
          <span class="font-medium text-card-foreground">{{ value }}</span>
        </template>

        <template #cell-utilization="{ row }">
          <div class="flex items-center justify-center gap-2">
            <div class="h-2 w-16 rounded-full bg-muted">
              <div
                class="h-2 rounded-full"
                :class="[
                  row.utilizationStatus === 'success'
                    ? 'bg-success'
                    : row.utilizationStatus === 'warning'
                      ? 'bg-warning'
                      : 'bg-danger',
                ]"
                :style="{ width: `${Math.min(row.utilization, 100)}%` }"
              />
            </div>
            <StatusBadge
              :status="row.utilizationStatus"
              :label="`${row.utilization}%`"
              size="sm"
            />
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>
