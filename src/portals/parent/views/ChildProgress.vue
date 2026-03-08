<script setup lang="ts">
import { ref, computed } from 'vue'
import SafeChart from '@/components/shared/SafeChart.vue'
import {
  ChevronDown,
  ChevronUp,
  Check,
  Circle,
  Dumbbell,
  Brain,
  Users,
  Languages,
  Paintbrush,
  Star,
  Calendar,
} from 'lucide-vue-next'
import { useChartTheme } from '@/composables/useChartTheme'
import type { Milestone } from '@/types'

const { baseOptions } = useChartTheme()

const studentId = 'stu-001'
const childName = 'Amani Wanjiku'
const childAge = '2 years 9 months'
const childClass = 'Butterfly Class'
const childCampus = 'Karen Campus'

// Extended milestones for stu-001 (demo data covering all 5 domains)
const allMilestones: Milestone[] = [
  // Physical
  { id: 'ms-001', studentId: 'stu-001', domain: 'physical', title: 'Walks steadily', description: 'Can walk across the classroom without support or falling', achieved: true, achievedDate: '2025-11-15', notes: 'Very confident walker now, enjoys exploring the outdoor area', loggedBy: 'stf-001' },
  { id: 'ms-002', studentId: 'stu-001', domain: 'physical', title: 'Stacks 4 blocks', description: 'Can stack at least 4 blocks in a tower without it falling', achieved: true, achievedDate: '2026-01-20', loggedBy: 'stf-001' },
  { id: 'ms-p3', studentId: 'stu-001', domain: 'physical', title: 'Kicks a ball forward', description: 'Can kick a ball forward while maintaining balance', achieved: true, achievedDate: '2026-02-05', loggedBy: 'stf-001' },
  { id: 'ms-p4', studentId: 'stu-001', domain: 'physical', title: 'Turns pages of a book', description: 'Can turn single pages of a board book', achieved: true, achievedDate: '2025-12-10', loggedBy: 'stf-001' },
  { id: 'ms-p5', studentId: 'stu-001', domain: 'physical', title: 'Runs without falling', description: 'Can run short distances with coordination', achieved: false, loggedBy: 'stf-001' },
  // Cognitive
  { id: 'ms-c1', studentId: 'stu-001', domain: 'cognitive', title: 'Sorts by colour', description: 'Can sort objects into groups by colour (at least 3 colours)', achieved: true, achievedDate: '2026-02-14', loggedBy: 'stf-001' },
  { id: 'ms-c2', studentId: 'stu-001', domain: 'cognitive', title: 'Matches shapes', description: 'Can match basic shapes to corresponding holes', achieved: true, achievedDate: '2026-01-28', loggedBy: 'stf-001' },
  { id: 'ms-c3', studentId: 'stu-001', domain: 'cognitive', title: 'Counts to 3', description: 'Can count objects from 1 to 3', achieved: true, achievedDate: '2026-03-01', loggedBy: 'stf-001' },
  { id: 'ms-c4', studentId: 'stu-001', domain: 'cognitive', title: 'Completes 4-piece puzzle', description: 'Can complete a simple 4-piece jigsaw puzzle', achieved: false, notes: 'Getting close, can fit 3 of 4 pieces', loggedBy: 'stf-001' },
  // Social
  { id: 'ms-s1', studentId: 'stu-001', domain: 'social', title: 'Plays alongside peers', description: 'Engages in parallel play near other children', achieved: true, achievedDate: '2025-10-20', loggedBy: 'stf-001' },
  { id: 'ms-s2', studentId: 'stu-001', domain: 'social', title: 'Shares with prompting', description: 'Shares toys when gently prompted by adults', achieved: true, achievedDate: '2026-02-01', loggedBy: 'stf-001' },
  { id: 'ms-s3', studentId: 'stu-001', domain: 'social', title: 'Waves hello/goodbye', description: 'Waves independently to greet or say goodbye', achieved: true, achievedDate: '2025-09-15', loggedBy: 'stf-001' },
  { id: 'ms-s4', studentId: 'stu-001', domain: 'social', title: 'Shows affection to familiar adults', description: 'Hugs or pats familiar teachers and caregivers', achieved: true, achievedDate: '2025-11-01', loggedBy: 'stf-001' },
  { id: 'ms-s5', studentId: 'stu-001', domain: 'social', title: 'Takes turns with support', description: 'Can take turns during simple activities with adult guidance', achieved: false, notes: 'Working on this during group activities', loggedBy: 'stf-001' },
  // Language
  { id: 'ms-024', studentId: 'stu-001', domain: 'language', title: 'Uses two-word phrases', description: 'Regularly combines two words to express ideas', achieved: true, achievedDate: '2025-12-08', loggedBy: 'stf-001' },
  { id: 'ms-l2', studentId: 'stu-001', domain: 'language', title: 'Points to named objects', description: 'Can point to common objects when named by adult', achieved: true, achievedDate: '2025-10-05', loggedBy: 'stf-001' },
  { id: 'ms-l3', studentId: 'stu-001', domain: 'language', title: 'Says 50+ words', description: 'Vocabulary includes at least 50 recognisable words', achieved: true, achievedDate: '2026-01-15', loggedBy: 'stf-001' },
  { id: 'ms-l4', studentId: 'stu-001', domain: 'language', title: 'Follows simple instructions', description: 'Can follow one-step verbal instructions', achieved: true, achievedDate: '2025-11-20', loggedBy: 'stf-001' },
  { id: 'ms-l5', studentId: 'stu-001', domain: 'language', title: 'Names body parts', description: 'Can name at least 5 body parts', achieved: false, notes: 'Knows eyes, nose, mouth. Practising ears, hands, feet.', loggedBy: 'stf-001' },
  // Creative
  { id: 'ms-cr1', studentId: 'stu-001', domain: 'creative', title: 'Scribbles with crayons', description: 'Holds crayons and makes marks on paper with intent', achieved: true, achievedDate: '2025-10-28', loggedBy: 'stf-001' },
  { id: 'ms-cr2', studentId: 'stu-001', domain: 'creative', title: 'Dances to music', description: 'Moves body rhythmically when music plays', achieved: true, achievedDate: '2025-09-20', loggedBy: 'stf-001' },
  { id: 'ms-cr3', studentId: 'stu-001', domain: 'creative', title: 'Uses playdough', description: 'Manipulates playdough by squeezing, rolling, and poking', achieved: true, achievedDate: '2026-02-20', loggedBy: 'stf-001' },
  { id: 'ms-cr4', studentId: 'stu-001', domain: 'creative', title: 'Sings along to familiar songs', description: 'Attempts to sing along with words or sounds during music time', achieved: false, notes: 'Hums along but not yet forming words in songs', loggedBy: 'stf-001' },
]

const studentMilestones = computed(() =>
  allMilestones.filter((m) => m.studentId === studentId),
)

type DomainKey = 'physical' | 'cognitive' | 'social' | 'language' | 'creative'

const domainConfig: Record<DomainKey, { label: string; icon: typeof Dumbbell; color: string; bg: string; chartColor: string }> = {
  physical: { label: 'Physical', icon: Dumbbell, color: 'text-info', bg: 'bg-info-light', chartColor: '#2563EB' },
  cognitive: { label: 'Cognitive', icon: Brain, color: 'text-success', bg: 'bg-success-light', chartColor: '#16A34A' },
  social: { label: 'Social', icon: Users, color: 'text-primary', bg: 'bg-primary/10', chartColor: '#1B4D3E' },
  language: { label: 'Language', icon: Languages, color: 'text-warning', bg: 'bg-warning-light', chartColor: '#D97706' },
  creative: { label: 'Creative', icon: Paintbrush, color: 'text-danger', bg: 'bg-danger-light', chartColor: '#DB2777' },
}

const domains: DomainKey[] = ['physical', 'cognitive', 'social', 'language', 'creative']

function getDomainMilestones(domain: DomainKey) {
  return studentMilestones.value.filter((m) => m.domain === domain)
}

function getDomainProgress(domain: DomainKey) {
  const ms = getDomainMilestones(domain)
  if (ms.length === 0) return 0
  const achieved = ms.filter((m) => m.achieved).length
  return Math.round((achieved / ms.length) * 100)
}

const overallProgress = computed(() => {
  const total = studentMilestones.value.length
  if (total === 0) return 0
  const achieved = studentMilestones.value.filter((m) => m.achieved).length
  return Math.round((achieved / total) * 100)
})

const achievedCount = computed(() =>
  studentMilestones.value.filter((m) => m.achieved).length,
)

// Radar chart
const radarSeries = computed(() => [
  {
    name: 'Progress',
    data: domains.map((d) => getDomainProgress(d)),
  },
])

const radarOptions = computed(() => ({
  ...baseOptions,
  chart: {
    ...baseOptions.chart,
    type: 'radar' as const,
    height: 280,
  },
  fill: {
    opacity: 0.25,
  },
  stroke: {
    width: 2,
  },
  markers: {
    size: 4,
    strokeColors: '#fff',
    strokeWidth: 2,
  },
  xaxis: {
    categories: domains.map((d) => domainConfig[d].label),
    labels: {
      style: {
        colors: Array(5).fill('#737373'),
        fontSize: '11px',
      },
    },
  },
  yaxis: {
    show: false,
    max: 100,
  },
  plotOptions: {
    radar: {
      polygons: {
        strokeColors: '#E5E5E0',
        connectorColors: '#E5E5E0',
        fill: {
          colors: ['#FAFAF8', '#F5F5F0'],
        },
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    y: {
      formatter: (val: number) => `${val}%`,
    },
  },
}))

// Expandable domains
const expandedDomain = ref<DomainKey | null>(null)

function toggleDomain(domain: DomainKey) {
  expandedDomain.value = expandedDomain.value === domain ? null : domain
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="space-y-5 pb-4">
    <!-- Progress Summary Card -->
    <div class="rounded-xl bg-parent p-4 text-white shadow-lg">
      <div class="flex items-center gap-3">
        <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 text-xl font-bold">
          AW
        </div>
        <div class="flex-1">
          <h2 class="text-lg font-bold tracking-tight">{{ childName }}</h2>
          <p class="text-sm text-white/70">{{ childAge }} &middot; {{ childClass }}</p>
          <p class="text-xs text-white/50">{{ childCampus }}</p>
        </div>
      </div>
      <div class="mt-4 flex items-center gap-3 rounded-xl bg-white/10 p-3">
        <div class="flex-1">
          <div class="flex items-center justify-between text-sm">
            <span class="text-white/70">Overall Progress</span>
            <span class="font-bold tracking-tight text-white">{{ overallProgress }}%</span>
          </div>
          <div class="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
            <div
              class="h-full rounded-full bg-white transition-all duration-500"
              :style="{ width: `${overallProgress}%` }"
            />
          </div>
        </div>
        <div class="flex flex-col items-center rounded-lg bg-white/10 px-3 py-1.5">
          <Star class="h-4 w-4 text-white/80" />
          <span class="mt-0.5 text-lg font-bold">{{ achievedCount }}</span>
          <span class="text-xs text-white/50">of {{ studentMilestones.length }}</span>
        </div>
      </div>
    </div>

    <!-- Radar Chart -->
    <div class="card p-4">
      <h3 class="text-sm font-semibold tracking-tight text-foreground">Development Overview</h3>
      <p class="text-sm text-muted-foreground">Progress across 5 key domains</p>
      <div class="mt-2">
        <SafeChart
          type="radar"
          :height="280"
          :options="radarOptions"
          :series="radarSeries"
        />
      </div>
    </div>

    <!-- Domain Breakdown -->
    <div>
      <h3 class="mb-3 text-sm font-semibold tracking-tight text-foreground">Domain Breakdown</h3>
      <div class="space-y-2">
        <div
          v-for="domain in domains"
          :key="domain"
          class="overflow-hidden card"
        >
          <!-- Domain Header -->
          <button
            class="flex w-full items-center gap-3 p-3 transition-all duration-200"
            @click="toggleDomain(domain)"
          >
            <div
              :class="[
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                domainConfig[domain].bg,
              ]"
            >
              <component
                :is="domainConfig[domain].icon"
                :class="['h-5 w-5', domainConfig[domain].color]"
              />
            </div>
            <div class="flex-1 text-left">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-foreground">
                  {{ domainConfig[domain].label }}
                </p>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-semibold tracking-tight" :class="domainConfig[domain].color">
                    {{ getDomainProgress(domain) }}%
                  </span>
                  <ChevronDown
                    v-if="expandedDomain !== domain"
                    class="h-4 w-4 text-muted-foreground/50"
                  />
                  <ChevronUp v-else class="h-4 w-4 text-muted-foreground/50" />
                </div>
              </div>
              <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :style="{
                    width: `${getDomainProgress(domain)}%`,
                    backgroundColor: domainConfig[domain].chartColor,
                  }"
                />
              </div>
            </div>
          </button>

          <!-- Milestones List -->
          <div v-if="expandedDomain === domain" class="border-t border-border px-3 pb-3">
            <div class="mt-2 space-y-2">
              <div
                v-for="milestone in getDomainMilestones(domain)"
                :key="milestone.id"
                class="flex gap-2.5 rounded-xl p-2 transition-all duration-200"
                :class="milestone.achieved ? 'bg-muted' : ''"
              >
                <div class="mt-0.5">
                  <div
                    v-if="milestone.achieved"
                    class="flex h-5 w-5 items-center justify-center rounded-full"
                    :style="{ backgroundColor: domainConfig[domain].chartColor }"
                  >
                    <Check class="h-3 w-3 text-white" />
                  </div>
                  <Circle
                    v-else
                    class="h-5 w-5 text-muted-foreground/30"
                  />
                </div>
                <div class="flex-1">
                  <p
                    class="text-sm font-medium"
                    :class="milestone.achieved ? 'text-foreground' : 'text-muted-foreground'"
                  >
                    {{ milestone.title }}
                  </p>
                  <p class="mt-0.5 text-xs text-muted-foreground">
                    {{ milestone.description }}
                  </p>
                  <div
                    v-if="milestone.achieved && milestone.achievedDate"
                    class="mt-1 flex items-center gap-1"
                  >
                    <Calendar class="h-3 w-3 text-muted-foreground/50" />
                    <span class="text-xs text-muted-foreground/70">
                      {{ formatDate(milestone.achievedDate) }}
                    </span>
                  </div>
                  <p
                    v-if="!milestone.achieved && milestone.notes"
                    class="mt-1 text-xs italic text-muted-foreground/70"
                  >
                    {{ milestone.notes }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
