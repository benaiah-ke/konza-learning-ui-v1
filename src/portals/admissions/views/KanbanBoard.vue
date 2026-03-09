<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
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
  Plus,
  Pencil,
  Trash2,
} from 'lucide-vue-next'

import StatCard from '@/components/shared/StatCard.vue'
import AppModal from '@/components/shared/AppModal.vue'
import FormField from '@/components/shared/FormField.vue'
import FormSelect from '@/components/shared/FormSelect.vue'
import FormTextarea from '@/components/shared/FormTextarea.vue'
import { useAdmissionsStore } from '@/stores/admissions'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { generateId } from '@/utils/generateId'
import { campuses } from '@/data/campuses'
import type { AdmissionLead } from '@/types'

const store = useAdmissionsStore()
const toast = useToast()
const { confirm } = useConfirm()

// ── CRUD Modal State ────────────────────────────────────────
const showLeadModal = ref(false)
const editingLead = ref<AdmissionLead | null>(null)

const leadForm = reactive({
  childName: '',
  childAge: 0,
  parentName: '',
  parentPhone: '',
  parentEmail: '',
  source: '' as string,
  campusPreference: '' as string,
  notes: '',
})

const sourceOptions = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'walk-in', label: 'Walk-in' },
  { value: 'event', label: 'Event' },
]

const campusOptions = campuses.map((c) => ({
  value: c.id,
  label: c.name.replace('Konza ', '').replace(' Campus', ''),
}))

function openNewLeadModal() {
  editingLead.value = null
  leadForm.childName = ''
  leadForm.childAge = 0
  leadForm.parentName = ''
  leadForm.parentPhone = ''
  leadForm.parentEmail = ''
  leadForm.source = ''
  leadForm.campusPreference = ''
  leadForm.notes = ''
  showLeadModal.value = true
}

function openEditLeadModal(lead: AdmissionLead) {
  editingLead.value = lead
  leadForm.childName = lead.childName
  leadForm.childAge = lead.childAge
  leadForm.parentName = lead.parentName
  leadForm.parentPhone = lead.parentPhone
  leadForm.parentEmail = lead.parentEmail
  leadForm.source = lead.source
  leadForm.campusPreference = lead.campusPreference
  leadForm.notes = lead.notes ?? ''
  showLeadModal.value = true
}

function saveLead() {
  if (!leadForm.childName || !leadForm.parentName || !leadForm.source || !leadForm.campusPreference) return

  if (editingLead.value) {
    store.updateLead(editingLead.value.id, {
      childName: leadForm.childName,
      childAge: leadForm.childAge,
      parentName: leadForm.parentName,
      parentPhone: leadForm.parentPhone,
      parentEmail: leadForm.parentEmail,
      source: leadForm.source as AdmissionLead['source'],
      campusPreference: leadForm.campusPreference,
      notes: leadForm.notes || undefined,
    })
    toast.success('Lead updated successfully')
  } else {
    const newLead: AdmissionLead = {
      id: generateId('lead'),
      childName: leadForm.childName,
      childAge: leadForm.childAge,
      parentName: leadForm.parentName,
      parentPhone: leadForm.parentPhone,
      parentEmail: leadForm.parentEmail,
      source: leadForm.source as AdmissionLead['source'],
      stage: 'inquiry',
      campusPreference: leadForm.campusPreference,
      date: new Date().toISOString().slice(0, 10),
      notes: leadForm.notes || undefined,
    }
    store.addLead(newLead)
    toast.success('New lead added successfully')
  }

  showLeadModal.value = false
}

async function deleteLead(lead: AdmissionLead) {
  const ok = await confirm({
    title: 'Delete Lead',
    message: `Are you sure you want to delete the lead for ${lead.childName}? This action cannot be undone.`,
    variant: 'danger',
  })
  if (ok) {
    store.deleteLead(lead.id)
    toast.success('Lead deleted successfully')
  }
}

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
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-t-border',
    badgeBg: 'bg-muted',
    badgeText: 'text-muted-foreground',
    nextStage: 'tour-scheduled',
  },
  {
    key: 'tour-scheduled',
    label: 'Tour Scheduled',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-t-border',
    badgeBg: 'bg-muted',
    badgeText: 'text-muted-foreground',
    nextStage: 'tour-completed',
  },
  {
    key: 'tour-completed',
    label: 'Tour Completed',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-t-border',
    badgeBg: 'bg-muted',
    badgeText: 'text-muted-foreground',
    nextStage: 'application',
  },
  {
    key: 'application',
    label: 'Application',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-t-border',
    badgeBg: 'bg-muted',
    badgeText: 'text-muted-foreground',
    nextStage: 'assessment',
  },
  {
    key: 'assessment',
    label: 'Assessment',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-t-border',
    badgeBg: 'bg-muted',
    badgeText: 'text-muted-foreground',
    nextStage: 'offered',
  },
  {
    key: 'offered',
    label: 'Offered',
    color: 'text-success-foreground',
    bgColor: 'bg-success-light/50',
    borderColor: 'border-t-success',
    badgeBg: 'bg-success-light',
    badgeText: 'text-success-foreground',
    nextStage: 'enrolled',
  },
  {
    key: 'enrolled',
    label: 'Enrolled',
    color: 'text-success-foreground',
    bgColor: 'bg-success-light/50',
    borderColor: 'border-t-success',
    badgeBg: 'bg-success-light',
    badgeText: 'text-success-foreground',
  },
  {
    key: 'waitlisted',
    label: 'Waitlisted',
    color: 'text-warning-foreground',
    bgColor: 'bg-warning-light/50',
    borderColor: 'border-t-warning',
    badgeBg: 'bg-warning-light',
    badgeText: 'text-warning-foreground',
  },
]

// ── Source Config ────────────────────────────────────────────
const sourceConfig: Record<string, { label: string; bg: string; text: string }> = {
  website: { label: 'Website', bg: 'bg-info-light', text: 'text-info-foreground' },
  referral: { label: 'Referral', bg: 'bg-success-light', text: 'text-success-foreground' },
  'social-media': { label: 'Social Media', bg: 'bg-muted', text: 'text-muted-foreground' },
  'walk-in': { label: 'Walk-in', bg: 'bg-warning-light', text: 'text-warning-foreground' },
  event: { label: 'Event', bg: 'bg-danger-light', text: 'text-danger-foreground' },
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
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-foreground">Admissions Pipeline</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Kanban board tracking applications from enquiry to enrolment
        </p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-[#C2410C] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#C2410C]/90"
        @click="openNewLeadModal"
      >
        <Plus class="h-4 w-4" />
        New Lead
      </button>
    </div>

    <!-- KPI Stats Row -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Inquiries"
        :value="store.totalInquiries.toString()"
        :change="{ value: 15, direction: 'up' }"
        :icon="UserPlus"
        variant="primary"
      />
      <StatCard
        label="Active Pipeline"
        :value="store.activePipeline.length.toString()"
        :icon="Users"
        variant="info"
      />
      <StatCard
        label="Conversion Rate"
        :value="`${store.conversionRate}%`"
        :change="{ value: 2.5, direction: 'up' }"
        :icon="TrendingUp"
        variant="success"
      />
      <StatCard
        label="Enrolled (This Term)"
        :value="enrolledCount.toString()"
        :icon="CheckCircle2"
        variant="success"
      />
    </div>

    <!-- Source Breakdown -->
    <div class="card p-5">
      <h3 class="mb-3 text-sm font-semibold tracking-tight text-muted-foreground uppercase tracking-wide">
        Lead Sources
      </h3>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(count, source) in store.leadsBySource"
          :key="source"
          :class="[
            'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200',
            sourceConfig[source]?.bg ?? 'bg-muted',
            sourceConfig[source]?.text ?? 'text-muted-foreground',
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
              sourceConfig[source]?.bg ?? 'bg-muted',
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
              'rounded-t-xl border-t-4 bg-white px-3 py-3 border border-border',
              stage.borderColor,
            ]"
          >
            <div class="flex items-center justify-between">
              <h3 :class="['text-sm font-semibold tracking-tight', stage.color]">
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
              'flex flex-1 flex-col gap-2.5 rounded-b-xl border border-t-0 border-border p-2.5',
              stage.bgColor,
            ]"
            style="min-height: 200px"
          >
            <!-- Lead Card -->
            <div
              v-for="lead in getLeadsForStage(stage.key)"
              :key="lead.id"
              class="group rounded-xl border border-border bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <!-- Drag Handle + Child Name -->
              <div class="flex items-start gap-2">
                <GripVertical class="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40 cursor-grab" />
                <div class="min-w-0 flex-1">
                  <p class="font-semibold tracking-tight text-sm text-foreground truncate">
                    {{ lead.childName }}
                  </p>
                  <p class="text-sm text-muted-foreground mt-0.5">
                    Age {{ lead.childAge }} yrs
                  </p>
                </div>
              </div>

              <!-- Details -->
              <div class="mt-2 space-y-1.5 pl-6">
                <p class="text-sm text-muted-foreground">
                  <span class="font-medium text-foreground">{{ lead.parentName }}</span>
                </p>

                <!-- Source Badge -->
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    sourceConfig[lead.source]?.bg ?? 'bg-muted',
                    sourceConfig[lead.source]?.text ?? 'text-muted-foreground',
                  ]"
                >
                  {{ sourceConfig[lead.source]?.label ?? lead.source }}
                </span>

                <p class="text-sm text-muted-foreground">
                  {{ getCampusName(lead.campusPreference) }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ formatDate(lead.date) }}
                </p>
              </div>

              <!-- Actions: Advance / Edit / Delete -->
              <div class="mt-3 pl-6 flex items-center gap-2">
                <button
                  v-if="stage.nextStage"
                  class="inline-flex items-center gap-1 rounded-xl bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary shadow-sm transition-all duration-200 hover:bg-primary/20 hover:shadow"
                  @click="advanceLead(lead.id, stage.nextStage!)"
                >
                  Advance
                  <ChevronRight class="h-3 w-3" />
                </button>
                <div class="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    class="inline-flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Edit lead"
                    @click="openEditLeadModal(lead)"
                  >
                    <Pencil class="h-3 w-3" />
                  </button>
                  <button
                    class="inline-flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
                    title="Delete lead"
                    @click="deleteLead(lead)"
                  >
                    <Trash2 class="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-if="getLeadsForStage(stage.key).length === 0"
              class="flex flex-1 items-center justify-center p-4"
            >
              <p class="text-sm text-muted-foreground/60 italic">No leads</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New / Edit Lead Modal -->
    <AppModal
      :open="showLeadModal"
      @update:open="showLeadModal = $event"
      :title="editingLead ? 'Edit Lead' : 'New Lead'"
      :subtitle="editingLead ? 'Update lead information' : 'Add a new prospective family to the pipeline'"
      size="lg"
    >
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          v-model="leadForm.childName"
          label="Child Name"
          placeholder="Enter child's name"
          required
        />
        <FormField
          v-model="leadForm.childAge"
          label="Child Age"
          type="number"
          placeholder="Age in years"
          required
        />
        <FormField
          v-model="leadForm.parentName"
          label="Parent Name"
          placeholder="Enter parent's full name"
          required
        />
        <FormField
          v-model="leadForm.parentPhone"
          label="Parent Phone"
          placeholder="+254 7XX XXX XXX"
          required
        />
        <FormField
          v-model="leadForm.parentEmail"
          label="Parent Email"
          type="text"
          placeholder="parent@email.com"
          required
        />
        <FormSelect
          v-model="leadForm.source"
          label="Source"
          :options="sourceOptions"
          placeholder="Select source..."
          required
        />
        <FormSelect
          v-model="leadForm.campusPreference"
          label="Campus Preference"
          :options="campusOptions"
          placeholder="Select campus..."
          required
        />
      </div>
      <div class="mt-4">
        <FormTextarea
          v-model="leadForm.notes"
          label="Notes"
          placeholder="Any additional notes about this lead..."
          :rows="3"
        />
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <button
            class="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            @click="showLeadModal = false"
          >
            Cancel
          </button>
          <button
            class="rounded-xl bg-[#C2410C] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#C2410C]/90 disabled:opacity-50"
            :disabled="!leadForm.childName || !leadForm.parentName || !leadForm.source || !leadForm.campusPreference"
            @click="saveLead"
          >
            {{ editingLead ? 'Update Lead' : 'Add Lead' }}
          </button>
        </div>
      </template>
    </AppModal>
  </div>
</template>
