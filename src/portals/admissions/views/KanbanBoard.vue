<script setup lang="ts">
import { computed } from 'vue'
import {
  Users,
  TrendingUp,
  UserPlus,
  CheckCircle2,
  GripVertical,
  ChevronRight,
  Globe,
  UserCheck,
  Share2,
  Footprints,
  CalendarCheck,
} from 'lucide-vue-next'

import StatCard from '@/components/shared/StatCard.vue'
import { useAdmissionsStore } from '@/stores/admissions'
import { campuses } from '@/data/campuses'
import type { AdmissionLead } from '@/types'

const store = useAdmissionsStore()

// ── Stage Configuration ─────────────────────────────────────
interface StageConfig {
  key: AdmissionLead['stage']
  label: string
  color: string
  bgColor: string
  borderColor: string
  badgeBg: string
  badgeText: string
  nextStage?: AdmissionLead['stage']
}

const stages: StageConfig[] = [
  {
    key: 'inquiry',
    label: 'Inquiry',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-t-gray-400',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-700',
    nextStage: 'tour-scheduled',
  },
  {
    key: 'tour-scheduled',
    label: 'Tour Scheduled',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-t-blue-400',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
    nextStage: 'tour-completed',
  },
  {
    key: 'tour-completed',
    label: 'Tour Completed',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-t-teal-400',
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-700',
    nextStage: 'application',
  },
  {
    key: 'application',
    label: 'Application',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-t-purple-400',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-700',
    nextStage: 'assessment',
  },
  {
    key: 'assessment',
    label: 'Assessment',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-t-amber-400',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
    nextStage: 'offered',
  },
  {
    key: 'offered',
    label: 'Offered',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-t-green-400',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-700',
    nextStage: 'enrolled',
  },
  {
    key: 'enrolled',
    label: 'Enrolled',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-t-emerald-700',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
  },
  {
    key: 'waitlisted',
    label: 'Waitlisted',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-t-orange-400',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-700',
  },
]

// ── Source Config ────────────────────────────────────────────
const sourceConfig: Record<string, { label: string; bg: string; text: string }> = {
  website: { label: 'Website', bg: 'bg-blue-100', text: 'text-blue-700' },
  referral: { label: 'Referral', bg: 'bg-green-100', text: 'text-green-700' },
  'social-media': { label: 'Social Media', bg: 'bg-purple-100', text: 'text-purple-700' },
  'walk-in': { label: 'Walk-in', bg: 'bg-amber-100', text: 'text-amber-700' },
  event: { label: 'Event', bg: 'bg-rose-100', text: 'text-rose-700' },
}

// ── KPI Stats ───────────────────────────────────────────────
const enrolledCount = computed(
  () => store.admissionLeads.filter((l) => l.stage === 'enrolled').length,
)

// ── Helpers ─────────────────────────────────────────────────
function getLeadsForStage(stageKey: string) {
  return store.leadsByStage[stageKey] ?? []
}

function getCampusName(campusId: string): string {
  const campus = campuses.find((c) => c.id === campusId)
  return campus ? campus.name.replace('Konza ', '').replace(' Campus', '') : campusId
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function advanceLead(leadId: string, nextStage: AdmissionLead['stage']) {
  store.moveLeadToStage(leadId, nextStage)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-foreground">Admissions Pipeline</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Kanban board tracking applications from enquiry to enrolment
      </p>
    </div>

    <!-- KPI Stats Row -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Inquiries"
        :value="store.totalInquiries.toString()"
        :change="{ value: 15, direction: 'up' }"
        :icon="UserPlus"
        icon-bg="bg-[#C2410C]/10"
        icon-color="text-[#C2410C]"
      />
      <StatCard
        label="Active Pipeline"
        :value="store.activePipeline.length.toString()"
        :icon="Users"
        icon-bg="bg-info/10"
        icon-color="text-info"
      />
      <StatCard
        label="Conversion Rate"
        :value="`${store.conversionRate}%`"
        :change="{ value: 2.5, direction: 'up' }"
        :icon="TrendingUp"
        icon-bg="bg-success/10"
        icon-color="text-success"
      />
      <StatCard
        label="Enrolled (This Term)"
        :value="enrolledCount.toString()"
        :icon="CheckCircle2"
        icon-bg="bg-emerald-500/10"
        icon-color="text-emerald-600"
      />
    </div>

    <!-- Source Breakdown -->
    <div class="rounded-xl border border-border bg-card p-4">
      <h3 class="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Lead Sources
      </h3>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(count, source) in store.leadsBySource"
          :key="source"
          :class="[
            'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium',
            sourceConfig[source]?.bg ?? 'bg-gray-100',
            sourceConfig[source]?.text ?? 'text-gray-700',
          ]"
        >
          <Globe v-if="source === 'website'" class="h-3.5 w-3.5" />
          <UserCheck v-else-if="source === 'referral'" class="h-3.5 w-3.5" />
          <Share2 v-else-if="source === 'social-media'" class="h-3.5 w-3.5" />
          <Footprints v-else-if="source === 'walk-in'" class="h-3.5 w-3.5" />
          <CalendarCheck v-else class="h-3.5 w-3.5" />
          {{ sourceConfig[source]?.label ?? source }}
          <span
            :class="[
              'inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold',
              sourceConfig[source]?.bg ?? 'bg-gray-200',
            ]"
          >
            {{ count }}
          </span>
        </div>
      </div>
    </div>

    <!-- Kanban Board -->
    <div class="overflow-x-auto pb-4">
      <div class="flex gap-4" style="min-width: max-content">
        <!-- Column for each stage -->
        <div
          v-for="stage in stages"
          :key="stage.key"
          class="flex w-[280px] shrink-0 flex-col"
        >
          <!-- Column Header -->
          <div
            :class="[
              'rounded-t-lg border-t-4 bg-card px-3 py-3 border border-border',
              stage.borderColor,
            ]"
          >
            <div class="flex items-center justify-between">
              <h3 :class="['text-sm font-semibold', stage.color]">
                {{ stage.label }}
              </h3>
              <span
                :class="[
                  'inline-flex h-6 min-w-[24px] items-center justify-center rounded-full text-xs font-bold',
                  stage.badgeBg,
                  stage.badgeText,
                ]"
              >
                {{ getLeadsForStage(stage.key).length }}
              </span>
            </div>
          </div>

          <!-- Column Body -->
          <div
            :class="[
              'flex flex-1 flex-col gap-2 rounded-b-lg border border-t-0 border-border p-2',
              stage.bgColor,
            ]"
            style="min-height: 200px"
          >
            <!-- Lead Card -->
            <div
              v-for="lead in getLeadsForStage(stage.key)"
              :key="lead.id"
              class="group rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
            >
              <!-- Drag Handle + Child Name -->
              <div class="flex items-start gap-2">
                <GripVertical class="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40 cursor-grab" />
                <div class="min-w-0 flex-1">
                  <p class="font-semibold text-sm text-card-foreground truncate">
                    {{ lead.childName }}
                  </p>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    Age {{ lead.childAge }} yrs
                  </p>
                </div>
              </div>

              <!-- Details -->
              <div class="mt-2 space-y-1.5 pl-6">
                <p class="text-xs text-muted-foreground">
                  <span class="font-medium text-card-foreground">{{ lead.parentName }}</span>
                </p>

                <!-- Source Badge -->
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    sourceConfig[lead.source]?.bg ?? 'bg-gray-100',
                    sourceConfig[lead.source]?.text ?? 'text-gray-700',
                  ]"
                >
                  {{ sourceConfig[lead.source]?.label ?? lead.source }}
                </span>

                <p class="text-xs text-muted-foreground">
                  {{ getCampusName(lead.campusPreference) }}
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ formatDate(lead.date) }}
                </p>
              </div>

              <!-- Advance Button -->
              <div v-if="stage.nextStage" class="mt-3 pl-6">
                <button
                  class="inline-flex items-center gap-1 rounded-md bg-[#C2410C]/10 px-2.5 py-1 text-xs font-medium text-[#C2410C] transition-colors hover:bg-[#C2410C]/20"
                  @click="advanceLead(lead.id, stage.nextStage!)"
                >
                  Advance
                  <ChevronRight class="h-3 w-3" />
                </button>
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-if="getLeadsForStage(stage.key).length === 0"
              class="flex flex-1 items-center justify-center p-4"
            >
              <p class="text-xs text-muted-foreground/60 italic">No leads</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
