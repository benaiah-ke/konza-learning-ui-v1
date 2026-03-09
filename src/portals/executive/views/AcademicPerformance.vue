<script setup lang="ts">
import { computed } from 'vue'
import type { ApexOptions } from 'apexcharts'
import {
  GraduationCap,
  TrendingUp,
  Users,
  BarChart3,
} from 'lucide-vue-next'
import StatCard from '@/components/shared/StatCard.vue'
import ChartCard from '@/components/shared/ChartCard.vue'
import SafeChart from '@/components/shared/SafeChart.vue'
import PageHeader from '@/components/shared/PageHeader.vue'
import { useAcademicsStore } from '@/stores/academics'
import { useStudentsStore } from '@/stores/students'
import { useChartTheme } from '@/composables/useChartTheme'

const academicsStore = useAcademicsStore()
const studentsStore = useStudentsStore()
const { baseOptions } = useChartTheme()

// ── Subject label mapping ───────────────────────────────────────────
const subjectLabelMap: Record<string, string> = {
  numeracy: 'Numeracy',
  literacy: 'Literacy',
  kiswahili: 'Kiswahili',
  science: 'Science',
  'creative-arts': 'Creative Arts',
  'social-skills': 'Social Skills',
  'physical-development': 'Physical Dev',
}

const subjectKeys = computed(() => Object.keys(academicsStore.averageScoreBySubject))
const subjectLabels = computed(() => subjectKeys.value.map((k) => subjectLabelMap[k] ?? k))
const subjectScores = computed(() => subjectKeys.value.map((k) => academicsStore.averageScoreBySubject[k]))

// ── Stat card values ────────────────────────────────────────────────
const formattedAverage = computed(() => `${academicsStore.overallAverageScore.toFixed(1)} / 5`)

const exceedingPercent = computed(() => {
  const dist = academicsStore.gradeDistribution
  const total = Object.values(dist).reduce((a, b) => a + b, 0)
  if (total === 0) return '0%'
  return `${Math.round(((dist['Exceeding'] ?? 0) / total) * 100)}%`
})

const gradeDistributionMode = computed(() => {
  const dist = academicsStore.gradeDistribution
  let maxGrade = 'Meeting'
  let maxCount = 0
  for (const [grade, count] of Object.entries(dist)) {
    if (count > maxCount) {
      maxCount = count
      maxGrade = grade
    }
  }
  return maxGrade
})

// ── Bar chart: Average Score by Subject ─────────────────────────────
const barOptions = computed<ApexOptions>(() => ({
  ...baseOptions,
  chart: { ...baseOptions.chart, type: 'bar', height: 320 },
  plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
  xaxis: { ...baseOptions.xaxis, categories: subjectLabels.value },
  yaxis: { ...baseOptions.yaxis, min: 0, max: 5, tickAmount: 5 },
}))

const barSeries = computed(() => [
  { name: 'Average Score', data: subjectScores.value },
])

// ── Donut chart: Grade Distribution ─────────────────────────────────
const donutOptions = computed<ApexOptions>(() => ({
  ...baseOptions,
  chart: { ...baseOptions.chart, type: 'donut', height: 320 },
  labels: ['Exceeding', 'Meeting', 'Approaching', 'Developing', 'Beginning'],
  colors: ['#059669', '#0284C7', '#D97706', '#EA580C', '#DC2626'],
}))

const donutSeries = computed(() => {
  const dist = academicsStore.gradeDistribution
  return [dist['Exceeding'], dist['Meeting'], dist['Approaching'], dist['Developing'], dist['Beginning']]
})

// ── Performance table helpers ───────────────────────────────────────
function getStudentName(studentId: string): string {
  const student = studentsStore.getStudentById(studentId)
  return student ? `${student.firstName} ${student.lastName}` : 'Unknown'
}

function scoreBarColor(avg: number): string {
  if (avg >= 4) return 'bg-success'
  if (avg >= 3) return 'bg-info'
  if (avg >= 2) return 'bg-warning'
  return 'bg-danger'
}

function scoreTextColor(avg: number): string {
  if (avg >= 4) return 'text-success'
  if (avg >= 3) return 'text-info'
  if (avg >= 2) return 'text-warning'
  return 'text-danger'
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Academic Performance"
      subtitle="Term 1 2026 — Early Years Assessment Overview"
    />

    <!-- Stat cards -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Average Score"
        :value="formattedAverage"
        :icon="GraduationCap"
        variant="primary"
      />
      <StatCard
        label="Students Exceeding"
        :value="exceedingPercent"
        :icon="TrendingUp"
        variant="success"
      />
      <StatCard
        label="Students Assessed"
        :value="String(academicsStore.assessedStudentCount)"
        :icon="Users"
        variant="info"
      />
      <StatCard
        label="Most Common Grade"
        :value="gradeDistributionMode"
        :icon="BarChart3"
        variant="warning"
      />
    </div>

    <!-- Charts row -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ChartCard title="Average Score by Subject" subtitle="Across all assessed students">
        <template #chart>
          <SafeChart
            type="bar"
            height="320"
            :options="barOptions"
            :series="barSeries"
          />
        </template>
      </ChartCard>

      <ChartCard title="Grade Distribution" subtitle="Breakdown across all records">
        <template #chart>
          <SafeChart
            type="donut"
            height="320"
            :options="donutOptions"
            :series="donutSeries"
          />
        </template>
      </ChartCard>
    </div>

    <!-- Performance table -->
    <div class="card p-6">
      <div class="mb-4">
        <h3 class="font-semibold tracking-tight text-card-foreground">Student Performance Rankings</h3>
        <p class="mt-0.5 text-sm text-muted-foreground">
          All assessed students ranked by average score
        </p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border text-left">
              <th class="pb-3 pr-4 font-medium text-muted-foreground w-16">Rank</th>
              <th class="pb-3 pr-4 font-medium text-muted-foreground">Student Name</th>
              <th class="pb-3 pr-4 font-medium text-muted-foreground text-center w-32">Avg Score</th>
              <th class="pb-3 font-medium text-muted-foreground w-48">Performance</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(entry, index) in academicsStore.classPerformanceSummary"
              :key="entry.studentId"
              class="border-b border-border/50 last:border-0"
            >
              <td class="py-3 pr-4 font-medium text-muted-foreground">
                {{ index + 1 }}
              </td>
              <td class="py-3 pr-4 font-medium text-card-foreground">
                {{ getStudentName(entry.studentId) }}
              </td>
              <td class="py-3 pr-4 text-center">
                <span
                  :class="['font-semibold', scoreTextColor(entry.average)]"
                >
                  {{ entry.average.toFixed(1) }}
                </span>
              </td>
              <td class="py-3">
                <div class="flex items-center gap-2">
                  <div class="h-2 w-full rounded-full bg-muted">
                    <div
                      :class="['h-2 rounded-full transition-all', scoreBarColor(entry.average)]"
                      :style="{ width: `${(entry.average / 5) * 100}%` }"
                    />
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
