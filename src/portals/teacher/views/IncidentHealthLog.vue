<script setup lang="ts">
import { ref, computed } from 'vue'
import { students } from '@/data/students'
import { incidents as allIncidents } from '@/data/milestones'
import type { Incident } from '@/types'
import StatCard from '@/components/shared/StatCard.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import DataTable from '@/components/shared/DataTable.vue'
import {
  AlertTriangle,
  FileWarning,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Plus,
} from 'lucide-vue-next'

// Filter students for Butterfly class at Karen campus
const classStudents = computed(() =>
  students.filter(
    (s) => s.className === 'Butterfly' && s.campusId === 'campus-karen',
  ),
)

const classStudentIds = computed(() =>
  new Set(classStudents.value.map((s) => s.id)),
)

// Reactive incidents list for demo
const incidentsData = ref<Incident[]>([...allIncidents])

// All incidents (not just filtered to Butterfly - show all for a richer view)
const allClassIncidents = computed(() =>
  incidentsData.value.filter(
    (inc) => classStudentIds.value.has(inc.studentId),
  ),
)

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

// New Incident Form
const newIncident = ref({
  studentId: classStudents.value[0]?.id ?? '',
  type: 'injury' as Incident['type'],
  severity: 'low' as Incident['severity'],
  description: '',
  actionTaken: '',
  parentNotified: false,
})

function submitIncident() {
  if (!newIncident.value.description.trim()) return

  const incident: Incident = {
    id: `inc-${Date.now()}`,
    studentId: newIncident.value.studentId,
    type: newIncident.value.type,
    severity: newIncident.value.severity,
    description: newIncident.value.description,
    actionTaken: newIncident.value.actionTaken,
    reportedBy: 'stf-001',
    date: new Date().toISOString().split('T')[0],
    parentNotified: newIncident.value.parentNotified,
  }

  incidentsData.value.unshift(incident)

  // Reset form
  newIncident.value = {
    studentId: classStudents.value[0]?.id ?? '',
    type: 'injury',
    severity: 'low',
    description: '',
    actionTaken: '',
    parentNotified: false,
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold text-foreground">Incident & Health Log</h1>
      <p class="text-muted-foreground">
        Log incidents, health observations, and medication records
      </p>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Incidents"
        :value="String(totalIncidents)"
        :icon="FileWarning"
        icon-bg="bg-[#0891B2]/10"
        icon-color="text-[#0891B2]"
      />
      <StatCard
        label="Open (Parent Not Notified)"
        :value="String(openIncidents)"
        :icon="AlertTriangle"
        icon-bg="bg-danger/10"
        icon-color="text-danger"
      />
      <StatCard
        label="Medium / High Severity"
        :value="`${severityBreakdown.medium + severityBreakdown.high}`"
        :icon="ShieldAlert"
        icon-bg="bg-warning/10"
        icon-color="text-warning"
      />
      <StatCard
        label="Low Severity"
        :value="String(severityBreakdown.low)"
        :icon="CheckCircle"
        icon-bg="bg-success/10"
        icon-color="text-success"
      />
    </div>

    <!-- Recent Incidents Table -->
    <div class="rounded-xl border border-border bg-card p-6">
      <h2 class="mb-4 text-lg font-semibold text-foreground">Recent Incidents</h2>
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
      </DataTable>
    </div>

    <!-- New Incident Form -->
    <div class="rounded-xl border border-border bg-card p-6">
      <div class="mb-5 flex items-center gap-2">
        <Plus class="h-5 w-5 text-[#0891B2]" />
        <h2 class="text-lg font-semibold text-foreground">Report New Incident</h2>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <!-- Student Selector -->
        <div>
          <label
            class="mb-1.5 block text-sm font-medium text-foreground"
            for="incident-student"
          >
            Student
          </label>
          <select
            id="incident-student"
            v-model="newIncident.studentId"
            class="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-[#0891B2] focus:outline-none focus:ring-1 focus:ring-[#0891B2]"
          >
            <option
              v-for="student in classStudents"
              :key="student.id"
              :value="student.id"
            >
              {{ student.firstName }} {{ student.lastName }}
            </option>
          </select>
        </div>

        <!-- Type Selector -->
        <div>
          <label
            class="mb-1.5 block text-sm font-medium text-foreground"
            for="incident-type"
          >
            Type
          </label>
          <select
            id="incident-type"
            v-model="newIncident.type"
            class="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-[#0891B2] focus:outline-none focus:ring-1 focus:ring-[#0891B2]"
          >
            <option value="injury">Injury</option>
            <option value="health">Health</option>
            <option value="behavioral">Behavioral</option>
            <option value="other">Other</option>
          </select>
        </div>

        <!-- Severity Selector -->
        <div>
          <label
            class="mb-1.5 block text-sm font-medium text-foreground"
            for="incident-severity"
          >
            Severity
          </label>
          <select
            id="incident-severity"
            v-model="newIncident.severity"
            class="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-[#0891B2] focus:outline-none focus:ring-1 focus:ring-[#0891B2]"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <!-- Notify Parent -->
        <div class="flex items-end">
          <label class="flex items-center gap-2 rounded-lg border border-border px-3 py-2 cursor-pointer">
            <input
              v-model="newIncident.parentNotified"
              type="checkbox"
              class="h-4 w-4 rounded border-border text-[#0891B2] focus:ring-[#0891B2]"
            />
            <span class="text-sm font-medium text-foreground">Notify Parent</span>
          </label>
        </div>

        <!-- Description -->
        <div class="md:col-span-2">
          <label
            class="mb-1.5 block text-sm font-medium text-foreground"
            for="incident-desc"
          >
            Description
          </label>
          <textarea
            id="incident-desc"
            v-model="newIncident.description"
            rows="3"
            placeholder="Describe what happened..."
            class="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#0891B2] focus:outline-none focus:ring-1 focus:ring-[#0891B2]"
          />
        </div>

        <!-- Action Taken -->
        <div class="md:col-span-2">
          <label
            class="mb-1.5 block text-sm font-medium text-foreground"
            for="incident-action"
          >
            Action Taken
          </label>
          <textarea
            id="incident-action"
            v-model="newIncident.actionTaken"
            rows="2"
            placeholder="Describe the action taken..."
            class="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#0891B2] focus:outline-none focus:ring-1 focus:ring-[#0891B2]"
          />
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <button
          :disabled="!newIncident.description.trim()"
          :class="[
            'inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors',
            newIncident.description.trim()
              ? 'bg-[#0891B2] hover:bg-[#0891B2]/90'
              : 'bg-muted-foreground/30 cursor-not-allowed',
          ]"
          @click="submitIncident"
        >
          <Plus class="h-4 w-4" />
          Submit Incident
        </button>
      </div>
    </div>
  </div>
</template>
