<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import {
  CalendarDays,
  CalendarCheck,
  Clock,
  TrendingUp,
  Phone,
  MapPin,
  Plus,
} from 'lucide-vue-next'
import SafeChart from '@/components/shared/SafeChart.vue'
import type { ApexOptions } from 'apexcharts'

import StatCard from '@/components/shared/StatCard.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import ChartCard from '@/components/shared/ChartCard.vue'
import AppModal from '@/components/shared/AppModal.vue'
import FormSelect from '@/components/shared/FormSelect.vue'
import FormField from '@/components/shared/FormField.vue'
import FormTextarea from '@/components/shared/FormTextarea.vue'
import { useAdmissionsStore } from '@/stores/admissions'
import { useChartTheme } from '@/composables/useChartTheme'
import { useToast } from '@/composables/useToast'
import { campuses } from '@/data/campuses'

const store = useAdmissionsStore()
const { baseOptions } = useChartTheme()
const toast = useToast()

// ── Schedule Tour Modal State ───────────────────────────────
const showTourModal = ref(false)

const tourForm = reactive({
  leadId: '' as string,
  date: '',
  time: '' as string,
  campusId: '' as string,
  notes: '',
})

const leadOptions = computed(() =>
  store.admissionLeads
    .filter((l) => l.stage === 'inquiry' || l.stage === 'tour-scheduled')
    .map((l) => ({
      value: l.id,
      label: `${l.childName} (${l.parentName})`,
    })),
)

const campusOptions = campuses.map((c) => ({
  value: c.id,
  label: c.name.replace('Konza ', '').replace(' Campus', ''),
}))

const timeOptions = [
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
]

function openTourModal() {
  tourForm.leadId = ''
  tourForm.date = ''
  tourForm.time = ''
  tourForm.campusId = ''
  tourForm.notes = ''
  showTourModal.value = true
}

function saveTour() {
  if (!tourForm.leadId || !tourForm.date || !tourForm.time || !tourForm.campusId) return

  const timeLabel = timeOptions.find((t) => t.value === tourForm.time)?.label ?? tourForm.time
  const campusName = campuses.find((c) => c.id === tourForm.campusId)?.name ?? tourForm.campusId

  // Move the lead to tour-scheduled stage and update notes with tour info
  store.moveLeadToStage(tourForm.leadId, 'tour-scheduled')
  store.updateLead(tourForm.leadId, {
    campusPreference: tourForm.campusId,
    date: tourForm.date,
    notes: `Tour scheduled: ${tourForm.date} at ${timeLabel}, ${campusName}${tourForm.notes ? '. ' + tourForm.notes : ''}`,
  })

  toast.success('Tour scheduled successfully')
  showTourModal.value = false
}

// ── Tour-related computed ───────────────────────────────────
const tourScheduledLeads = computed(() =>
  store.admissionLeads.filter((l) => l.stage === 'tour-scheduled'),
)

const tourCompletedLeads = computed(() =>
  store.admissionLeads.filter((l) => l.stage === 'tour-completed'),
)

const totalToursThisMonth = computed(() => {
  const allTourLeads = [...tourScheduledLeads.value, ...tourCompletedLeads.value]
  return allTourLeads.filter((l) => {
    const d = new Date(l.date)
    return d.getMonth() === 2 && d.getFullYear() === 2026 // March 2026
  }).length
})

const tourConversionRate = computed(() => {
  const totalTourLeads = tourScheduledLeads.value.length + tourCompletedLeads.value.length
  if (totalTourLeads === 0) return 0
  // Leads that passed through tour and advanced beyond
  const advanced = store.admissionLeads.filter((l) =>
    ['application', 'assessment', 'offered', 'enrolled'].includes(l.stage),
  ).length
  return Math.round((advanced / store.totalInquiries) * 100)
})

// ── Calendar Data (March 2026) ──────────────────────────────
const calendarYear = 2026
const calendarMonth = 2 // March (0-indexed)

// Tours scheduled on specific dates
const tourDates: Record<number, number> = {
  10: 1, // 10 March - Baraka tour
  12: 1, // 12 March - Joy tour
  14: 1, // 14 March - Salim tour
  5: 1,  // 5 March - assessment follow-up
  18: 2, // 18 March - two tours
  24: 1, // 24 March
}

const calendarDays = computed(() => {
  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay()
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate()
  const today = 8 // March 8, 2026

  const days: Array<{ day: number | null; isToday: boolean; tours: number }> = []

  // Padding for days before month starts (Sunday = 0)
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: null, isToday: false, tours: 0 })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      day: d,
      isToday: d === today,
      tours: tourDates[d] ?? 0,
    })
  }

  return days
})

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ── Upcoming Tours List ─────────────────────────────────────
interface TourItem {
  id: string
  date: string
  time: string
  parentName: string
  childName: string
  childAge: number
  phone: string
  campus: string
  status: 'scheduled' | 'confirmed'
}

const upcomingTours = computed<TourItem[]>(() => {
  return tourScheduledLeads.value.map((lead, idx) => {
    const times = ['9:00 AM', '10:30 AM', '2:00 PM', '11:00 AM', '3:00 PM']
    return {
      id: lead.id,
      date: lead.date,
      time: times[idx % times.length] ?? '',
      parentName: lead.parentName,
      childName: lead.childName,
      childAge: lead.childAge,
      phone: lead.parentPhone,
      campus: getCampusName(lead.campusPreference),
      status: idx % 2 === 0 ? 'confirmed' as const : 'scheduled' as const,
    }
  }).sort((a, b) => a.date.localeCompare(b.date))
})

// ── Lead Source Donut Chart ─────────────────────────────────
const sourceLabels = computed(() => {
  const labels: Record<string, string> = {
    website: 'Website',
    referral: 'Referral',
    'social-media': 'Social Media',
    'walk-in': 'Walk-in',
    event: 'Event',
  }
  return Object.keys(store.leadsBySource).map((k) => labels[k] ?? k)
})

const sourceSeries = computed(() => Object.values(store.leadsBySource))

const sourceChartOptions = computed<ApexOptions>(() => ({
  chart: {
    ...baseOptions.chart,
    type: 'donut',
    height: 280,
  },
  colors: ['#3B82F6', '#16A34A', '#8B5CF6', '#F59E0B', '#EF4444'],
  labels: sourceLabels.value,
  plotOptions: {
    pie: {
      donut: {
        size: '68%',
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
            fontSize: '22px',
            fontWeight: 700,
            color: '#1a1a1a',
            offsetY: 4,
          },
          total: {
            show: true,
            label: 'Total Leads',
            fontSize: '12px',
            color: '#737373',
            formatter: () => `${store.totalInquiries}`,
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
      formatter: (val: number) => `${val} leads`,
    },
  },
  dataLabels: { enabled: false },
}))

// ── Helpers ─────────────────────────────────────────────────
function getCampusName(campusId: string): string {
  const campus = campuses.find((c) => c.id === campusId)
  return campus ? campus.name.replace('Konza ', '').replace(' Campus', '') : campusId
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-foreground">Tour Scheduling</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Schedule and manage campus tours for prospective families
        </p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-[#C2410C] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#C2410C]/90"
        @click="openTourModal"
      >
        <Plus class="h-4 w-4" />
        Schedule Tour
      </button>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Tours This Week"
        :value="'3'"
        :icon="CalendarDays"
        icon-bg="bg-[#C2410C]/10"
        icon-color="text-[#C2410C]"
      />
      <StatCard
        label="Tours This Month"
        :value="totalToursThisMonth.toString()"
        :icon="CalendarCheck"
        icon-bg="bg-info/10"
        icon-color="text-info"
      />
      <StatCard
        label="Upcoming Tours"
        :value="tourScheduledLeads.length.toString()"
        :icon="Clock"
        icon-bg="bg-warning/10"
        icon-color="text-warning"
      />
      <StatCard
        label="Tour Conversion"
        :value="`${tourConversionRate}%`"
        :change="{ value: 5.2, direction: 'up' }"
        :icon="TrendingUp"
        icon-bg="bg-success/10"
        icon-color="text-success"
      />
    </div>

    <!-- Calendar + Chart Row -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Monthly Calendar -->
      <div class="lg:col-span-2 card p-6">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h3 class="font-semibold tracking-tight text-foreground">March 2026</h3>
            <p class="text-sm text-muted-foreground mt-0.5">Tour schedule overview</p>
          </div>
          <div class="flex items-center gap-3 text-sm text-muted-foreground">
            <span class="inline-flex items-center gap-1.5">
              <span class="inline-block h-2.5 w-2.5 rounded-full bg-[#C2410C]"></span>
              Tours
            </span>
            <span class="inline-flex items-center gap-1.5">
              <span class="inline-block h-2.5 w-2.5 rounded-full bg-info"></span>
              Today
            </span>
          </div>
        </div>

        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 gap-px">
          <!-- Weekday Headers -->
          <div
            v-for="day in weekDays"
            :key="day"
            class="py-2 text-center text-sm font-medium text-muted-foreground uppercase tracking-wide"
          >
            {{ day }}
          </div>

          <!-- Day Cells -->
          <div
            v-for="(cell, idx) in calendarDays"
            :key="idx"
            :class="[
              'relative flex flex-col items-center justify-start rounded-xl p-2 min-h-[64px] transition-all duration-200',
              cell.day === null ? '' : 'hover:bg-muted/50',
              cell.isToday ? 'bg-info/10 ring-2 ring-info/25' : '',
              cell.tours > 0 && !cell.isToday ? 'bg-warning-light/50' : '',
            ]"
          >
            <span
              v-if="cell.day !== null"
              :class="[
                'text-sm font-medium',
                cell.isToday ? 'text-info font-bold' : 'text-foreground',
              ]"
            >
              {{ cell.day }}
            </span>
            <div v-if="cell.tours > 0" class="mt-1 flex items-center gap-0.5">
              <span class="inline-flex h-5 items-center rounded-full bg-warning-light px-1.5 text-xs font-bold text-warning-foreground">
                {{ cell.tours }} {{ cell.tours === 1 ? 'tour' : 'tours' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Lead Source Chart -->
      <ChartCard
        title="Lead Sources"
        subtitle="Where inquiries come from"
      >
        <template #chart>
          <SafeChart
            type="donut"
            :height="280"
            :options="sourceChartOptions"
            :series="sourceSeries"
          />
        </template>
      </ChartCard>
    </div>

    <!-- Upcoming Tours List -->
    <div class="card p-6">
      <div class="mb-5">
        <h3 class="font-semibold tracking-tight text-foreground">Upcoming Tours</h3>
        <p class="mt-0.5 text-sm text-muted-foreground">
          {{ upcomingTours.length }} tours scheduled
        </p>
      </div>

      <div class="space-y-3">
        <div
          v-for="tour in upcomingTours"
          :key="tour.id"
          class="flex flex-col gap-3 rounded-xl border border-border p-4 transition-all duration-200 hover:bg-muted/30 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <!-- Left: Date/Time -->
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-warning-light">
              <CalendarDays class="h-5 w-5 text-warning-foreground" />
            </div>
            <div>
              <p class="text-sm font-semibold tracking-tight text-foreground">
                {{ formatDate(tour.date) }}
              </p>
              <p class="text-sm text-muted-foreground">{{ tour.time }}</p>
            </div>
          </div>

          <!-- Center: Family Details -->
          <div class="flex-1 sm:px-4">
            <p class="text-sm font-medium text-foreground">
              {{ tour.parentName }}
            </p>
            <p class="text-sm text-muted-foreground">
              {{ tour.childName }} (Age {{ tour.childAge }})
            </p>
          </div>

          <!-- Contact -->
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Phone class="h-3.5 w-3.5" />
              {{ tour.phone }}
            </div>
            <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin class="h-3.5 w-3.5" />
              {{ tour.campus }}
            </div>
          </div>

          <!-- Status -->
          <StatusBadge
            :status="tour.status === 'confirmed' ? 'success' : 'warning'"
            :label="tour.status === 'confirmed' ? 'Confirmed' : 'Scheduled'"
            size="sm"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="upcomingTours.length === 0"
        class="flex flex-col items-center justify-center py-12 text-muted-foreground"
      >
        <CalendarDays class="h-8 w-8 mb-2 opacity-40" />
        <p class="text-sm">No upcoming tours scheduled</p>
      </div>
    </div>

    <!-- Schedule Tour Modal -->
    <AppModal
      :open="showTourModal"
      @update:open="showTourModal = $event"
      title="Schedule Tour"
      subtitle="Schedule a campus tour for a prospective family"
      size="md"
    >
      <div class="space-y-4">
        <FormSelect
          v-model="tourForm.leadId"
          label="Lead"
          :options="leadOptions"
          placeholder="Select a lead..."
          required
        />
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            v-model="tourForm.date"
            label="Date"
            type="date"
            required
          />
          <FormSelect
            v-model="tourForm.time"
            label="Time"
            :options="timeOptions"
            placeholder="Select time..."
            required
          />
        </div>
        <FormSelect
          v-model="tourForm.campusId"
          label="Campus"
          :options="campusOptions"
          placeholder="Select campus..."
          required
        />
        <FormTextarea
          v-model="tourForm.notes"
          label="Notes"
          placeholder="Any special requirements or notes for the tour..."
          :rows="3"
        />
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <button
            class="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            @click="showTourModal = false"
          >
            Cancel
          </button>
          <button
            class="rounded-xl bg-[#C2410C] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#C2410C]/90 disabled:opacity-50"
            :disabled="!tourForm.leadId || !tourForm.date || !tourForm.time || !tourForm.campusId"
            @click="saveTour"
          >
            Schedule Tour
          </button>
        </div>
      </template>
    </AppModal>
  </div>
</template>
