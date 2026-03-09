<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { students } from '@/data/students'
import { incidents as allIncidents } from '@/data/milestones'
import type { Incident } from '@/types'
import StatCard from '@/components/shared/StatCard.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import DataTable from '@/components/shared/DataTable.vue'
import AppModal from '@/components/shared/AppModal.vue'
import FormSelect from '@/components/shared/FormSelect.vue'
import FormTextarea from '@/components/shared/FormTextarea.vue'
import FormCheckbox from '@/components/shared/FormCheckbox.vue'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { generateId } from '@/utils/generateId'
import {
  AlertTriangle,
  FileWarning,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-vue-next'

// Filter students for Butterfly class at Karen campus
const classStudents = computed(() =>
  students.filter(
    (s) => s.className === 'Butterfly' && s.campusId === 'campus-karen',
  ),
)

// Reactive incidents list for demo
const incidentsData = ref<Incident[]>([...allIncidents])

// Show all incidents for demo richness (including non-Butterfly students)
const displayIncidents = computed(() => incidentsData.value)

// Stats
const totalIncidents = computed(() => displayIncidents.value.length)

const openIncidents = computed(
  () => displayIncidents.value.filter((inc) => !inc.parentNotified).length,
)

const severityBreakdown = computed(() => {
  const counts = { low: 0, medium: 0, high: 0 }
  displayIncidents.value.forEach((inc) => {
    counts[inc.severity]++
  })
  return counts
})

// Helper to get student name from ID
function getStudentName(studentId: string): string {
  const student = students.find((s) => s.id === studentId)
  return student
    ? `${student.firstName} ${student.lastName}`
    : 'Unknown Student'
}

// Table columns
const columns = [
  { key: 'date', label: 'Date' },
  { key: 'studentName', label: 'Student' },
  { key: 'type', label: 'Type' },
  { key: 'severity', label: 'Severity' },
  { key: 'description', label: 'Description' },
  { key: 'parentNotified', label: 'Parent Notified', align: 'center' as const },
  { key: 'actions', label: 'Actions', align: 'center' as const },
]

// Table data
const tableData = computed(() =>
  displayIncidents.value.map((inc) => ({
    ...inc,
    studentName: getStudentName(inc.studentId),
    shortDescription:
      inc.description.length > 60
        ? inc.description.substring(0, 60) + '...'
        : inc.description,
  })),
)

// Type/Severity badge mappings
function getTypeBadge(type: string): { status: 'danger' | 'warning' | 'info' | 'neutral'; label: string } {
  switch (type) {
    case 'injury':
      return { status: 'danger', label: 'Injury' }
    case 'health':
      return { status: 'warning', label: 'Health' }
    case 'behavioral':
      return { status: 'info', label: 'Behavioral' }
    default:
      return { status: 'neutral', label: 'Other' }
  }
}

function getSeverityBadge(severity: string): { status: 'info' | 'warning' | 'danger'; label: string } {
  switch (severity) {
    case 'low':
      return { status: 'info', label: 'Low' }
    case 'medium':
      return { status: 'warning', label: 'Medium' }
    case 'high':
      return { status: 'danger', label: 'High' }
    default:
      return { status: 'info', label: severity }
  }
}

// ── Modal CRUD ─────────────────────────────────────────────
const toast = useToast()
const { confirm } = useConfirm()

const showIncidentModal = ref(false)
const editingIncidentId = ref<string | null>(null)

const studentOptions = computed(() =>
  classStudents.value.map((s) => ({
    value: s.id,
    label: `${s.firstName} ${s.lastName}`,
  })),
)

const typeOptions = [
  { value: 'injury', label: 'Injury' },
  { value: 'health', label: 'Health' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'other', label: 'Other' },
]

const severityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const defaultIncidentForm = () => ({
  studentId: classStudents.value[0]?.id ?? '',
  type: 'injury' as Incident['type'],
  severity: 'low' as Incident['severity'],
  description: '',
  actionTaken: '',
  parentNotified: false,
})

const incidentForm = reactive(defaultIncidentForm())

function openCreateModal() {
  editingIncidentId.value = null
  Object.assign(incidentForm, defaultIncidentForm())
  showIncidentModal.value = true
}

function openEditModal(incident: Incident) {
  editingIncidentId.value = incident.id
  Object.assign(incidentForm, {
    studentId: incident.studentId,
    type: incident.type,
    severity: incident.severity,
    description: incident.description,
    actionTaken: incident.actionTaken,
    parentNotified: incident.parentNotified,
  })
  showIncidentModal.value = true
}

function saveIncident() {
  if (!incidentForm.description.trim()) return

  if (editingIncidentId.value) {
    // Update existing
    const index = incidentsData.value.findIndex((i) => i.id === editingIncidentId.value)
    const existing = index !== -1 ? incidentsData.value[index] : undefined
    if (existing) {
      incidentsData.value[index] = {
        ...existing,
        studentId: incidentForm.studentId,
        type: incidentForm.type,
        severity: incidentForm.severity,
        description: incidentForm.description,
        actionTaken: incidentForm.actionTaken,
        parentNotified: incidentForm.parentNotified,
      }
    }
    toast.success('Incident updated successfully')
  } else {
    // Create new
    const incident: Incident = {
      id: generateId('inc'),
      studentId: incidentForm.studentId,
      type: incidentForm.type,
      severity: incidentForm.severity,
      description: incidentForm.description,
      actionTaken: incidentForm.actionTaken,
      reportedBy: 'stf-001',
      date: new Date().toISOString().slice(0, 10) ?? '',
      parentNotified: incidentForm.parentNotified,
    }
    incidentsData.value.unshift(incident)
    toast.success('Incident reported successfully')
  }

  showIncidentModal.value = false
}

async function deleteIncident(incidentId: string) {
  const ok = await confirm({
    title: 'Delete Incident',
    message: 'Are you sure you want to delete this incident? This action cannot be undone.',
    variant: 'danger',
  })
  if (!ok) return

  incidentsData.value = incidentsData.value.filter((i) => i.id !== incidentId)
  toast.success('Incident deleted')
}

</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-foreground">Incident & Health Log</h1>
        <p class="text-sm text-muted-foreground">
          Log incidents, health observations, and medication records
        </p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-primary/90"
        @click="openCreateModal"
      >
        <Plus class="h-4 w-4" />
        Report Incident
      </button>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Incidents"
        :value="String(totalIncidents)"
        :icon="FileWarning"
        variant="primary"
      />
      <StatCard
        label="Open (Parent Not Notified)"
        :value="String(openIncidents)"
        :icon="AlertTriangle"
        variant="danger"
      />
      <StatCard
        label="Medium / High Severity"
        :value="`${severityBreakdown.medium + severityBreakdown.high}`"
        :icon="ShieldAlert"
        variant="warning"
      />
      <StatCard
        label="Low Severity"
        :value="String(severityBreakdown.low)"
        :icon="CheckCircle"
        variant="success"
      />
    </div>

    <!-- Recent Incidents Table -->
    <div class="card p-6">
      <h2 class="mb-4 text-lg font-semibold tracking-tight text-foreground">Recent Incidents</h2>
      <DataTable :columns="columns" :data="tableData">
        <template #cell-date="{ value }">
          <span class="text-sm text-foreground">{{ value }}</span>
        </template>
        <template #cell-studentName="{ value }">
          <span class="text-sm font-medium text-foreground">{{ value }}</span>
        </template>
        <template #cell-type="{ row }">
          <StatusBadge
            :status="getTypeBadge(row.type).status"
            :label="getTypeBadge(row.type).label"
            size="sm"
          />
        </template>
        <template #cell-severity="{ row }">
          <StatusBadge
            :status="getSeverityBadge(row.severity).status"
            :label="getSeverityBadge(row.severity).label"
            size="sm"
          />
        </template>
        <template #cell-description="{ row }">
          <span class="text-sm text-muted-foreground">{{ row.shortDescription }}</span>
        </template>
        <template #cell-parentNotified="{ row }">
          <div class="flex justify-center">
            <CheckCircle v-if="row.parentNotified" class="h-5 w-5 text-success" />
            <XCircle v-else class="h-5 w-5 text-danger" />
          </div>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex items-center justify-center gap-1">
            <button
              class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Edit"
              @click="openEditModal(row as unknown as Incident)"
            >
              <Pencil class="h-4 w-4" />
            </button>
            <button
              class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
              title="Delete"
              @click="deleteIncident(row.id)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Incident Create/Edit Modal -->
    <AppModal
      :open="showIncidentModal"
      :title="editingIncidentId ? 'Edit Incident' : 'Report New Incident'"
      :subtitle="editingIncidentId ? 'Update the incident details' : 'Log an incident, health observation, or behavioral note'"
      size="lg"
      @update:open="showIncidentModal = $event"
    >
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormSelect
          v-model="incidentForm.studentId"
          label="Student"
          :options="studentOptions"
          required
        />
        <FormSelect
          v-model="incidentForm.type"
          label="Type"
          :options="typeOptions"
          required
        />
        <FormSelect
          v-model="incidentForm.severity"
          label="Severity"
          :options="severityOptions"
          required
        />
        <div class="flex items-end">
          <FormCheckbox
            v-model="incidentForm.parentNotified"
            label="Parent Notified"
          />
        </div>
        <div class="md:col-span-2">
          <FormTextarea
            v-model="incidentForm.description"
            label="Description"
            placeholder="Describe what happened..."
            :rows="3"
            required
          />
        </div>
        <div class="md:col-span-2">
          <FormTextarea
            v-model="incidentForm.actionTaken"
            label="Action Taken"
            placeholder="Describe the action taken..."
            :rows="2"
          />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            class="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted"
            @click="showIncidentModal = false"
          >
            Cancel
          </button>
          <button
            :disabled="!incidentForm.description.trim()"
            :class="[
              'rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200',
              incidentForm.description.trim()
                ? 'bg-primary hover:bg-primary/90'
                : 'bg-muted-foreground/30 cursor-not-allowed',
            ]"
            @click="saveIncident"
          >
            {{ editingIncidentId ? 'Update Incident' : 'Submit Incident' }}
          </button>
        </div>
      </template>
    </AppModal>
  </div>
</template>
