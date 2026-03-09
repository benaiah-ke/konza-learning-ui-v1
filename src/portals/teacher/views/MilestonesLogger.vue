<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { students } from '@/data/students'
import { milestones as allMilestones } from '@/data/milestones'
import type { Milestone } from '@/types'
import AppModal from '@/components/shared/AppModal.vue'
import FormField from '@/components/shared/FormField.vue'
import FormSelect from '@/components/shared/FormSelect.vue'
import FormTextarea from '@/components/shared/FormTextarea.vue'
import { useToast } from '@/composables/useToast'
import { generateId } from '@/utils/generateId'
import {
  Award,
  CheckCircle,
  Circle,
  Star,
  Brain,
  Heart,
  MessageSquare,
  Palette,
  Dumbbell,
  CalendarDays,
  Plus,
  Pencil,
} from 'lucide-vue-next'

// Filter students for Butterfly class at Karen campus
const classStudents = computed(() =>
  students.filter(
    (s) => s.className === 'Butterfly' && s.campusId === 'campus-karen',
  ),
)

// Reactive milestones copy for demo toggling
const milestonesData = ref<Milestone[]>([...allMilestones])

// Selected student
const selectedStudentId = ref<string | null>(classStudents.value[0]?.id ?? null)

const selectedStudent = computed(() =>
  classStudents.value.find((s) => s.id === selectedStudentId.value),
)

// Domain tabs
const domains = [
  { key: 'physical', label: 'Physical', icon: Dumbbell },
  { key: 'cognitive', label: 'Cognitive', icon: Brain },
  { key: 'social', label: 'Social', icon: Heart },
  { key: 'language', label: 'Language', icon: MessageSquare },
  { key: 'creative', label: 'Creative', icon: Palette },
] as const

type DomainKey = (typeof domains)[number]['key']

const activeDomain = ref<DomainKey>('physical')

// Milestones for selected student + domain
const filteredMilestones = computed(() =>
  milestonesData.value.filter(
    (m) =>
      m.studentId === selectedStudentId.value &&
      m.domain === activeDomain.value,
  ),
)

// Quick stats for selected student
const studentMilestoneStats = computed(() => {
  const studentMilestones = milestonesData.value.filter(
    (m) => m.studentId === selectedStudentId.value,
  )
  const achieved = studentMilestones.filter((m) => m.achieved).length
  const total = studentMilestones.length
  return { achieved, total }
})

// Avatar colors
const avatarColors = [
  'bg-primary',
  'bg-primary/80',
  'bg-primary-light',
  'bg-info',
  'bg-muted-foreground',
  'bg-foreground/70',
]

function getAvatarColor(index: number): string {
  return avatarColors[index % avatarColors.length] ?? ''
}

const toast = useToast()

// ── Log Achievement Modal (existing, refactored to use AppModal) ────
const showLogModal = ref(false)
const loggingMilestoneId = ref<string | null>(null)
const logDate = ref(new Date().toISOString().slice(0, 10))
const logNotes = ref('')

function openLogModal(milestoneId: string) {
  loggingMilestoneId.value = milestoneId
  logDate.value = new Date().toISOString().slice(0, 10)
  logNotes.value = ''
  showLogModal.value = true
}

function closeLogModal() {
  showLogModal.value = false
  loggingMilestoneId.value = null
}

function saveMilestoneAchievement() {
  if (!loggingMilestoneId.value) return
  const index = milestonesData.value.findIndex(
    (m) => m.id === loggingMilestoneId.value,
  )
  const existing = index !== -1 ? milestonesData.value[index] : undefined
  if (existing) {
    milestonesData.value[index] = {
      ...existing,
      achieved: true,
      achievedDate: logDate.value,
      notes: logNotes.value || existing.notes,
      loggedBy: 'stf-001',
    }
  }
  closeLogModal()
  toast.success('Milestone achievement logged')
}

// ── Add Milestone Modal ─────────────────────────────────────
const showAddModal = ref(false)

const studentOptions = computed(() =>
  classStudents.value.map((s) => ({
    value: s.id,
    label: `${s.firstName} ${s.lastName}`,
  })),
)

const domainOptions = domains.map((d) => ({
  value: d.key,
  label: d.label,
}))

const defaultMilestoneForm = () => ({
  studentId: selectedStudentId.value ?? classStudents.value[0]?.id ?? '',
  domain: activeDomain.value as Milestone['domain'],
  title: '',
  description: '',
  notes: '',
})

const milestoneForm = reactive(defaultMilestoneForm())

function openAddModal() {
  Object.assign(milestoneForm, defaultMilestoneForm())
  showAddModal.value = true
}

function saveNewMilestone() {
  if (!milestoneForm.title.trim()) return

  const newMilestone: Milestone = {
    id: generateId('ms'),
    studentId: milestoneForm.studentId,
    domain: milestoneForm.domain,
    title: milestoneForm.title,
    description: milestoneForm.description,
    achieved: false,
    notes: milestoneForm.notes || undefined,
    loggedBy: 'stf-001',
  }

  milestonesData.value.push(newMilestone)
  showAddModal.value = false
  toast.success('Milestone added successfully')
}

// ── Edit Notes Modal ────────────────────────────────────────
const showEditNotesModal = ref(false)
const editingMilestoneId = ref<string | null>(null)
const editNotes = ref('')

function openEditNotesModal(milestone: Milestone) {
  editingMilestoneId.value = milestone.id
  editNotes.value = milestone.notes ?? ''
  showEditNotesModal.value = true
}

function saveEditedNotes() {
  if (!editingMilestoneId.value) return
  const index = milestonesData.value.findIndex(
    (m) => m.id === editingMilestoneId.value,
  )
  const existing = index !== -1 ? milestonesData.value[index] : undefined
  if (existing) {
    milestonesData.value[index] = {
      ...existing,
      notes: editNotes.value || undefined,
    }
  }
  showEditNotesModal.value = false
  editingMilestoneId.value = null
  toast.success('Notes updated')
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-foreground">Milestones Logger</h1>
        <p class="text-sm text-muted-foreground">
          Record and track child developmental milestones
        </p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-primary/90"
        @click="openAddModal"
      >
        <Plus class="h-4 w-4" />
        Add Milestone
      </button>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
      <!-- Student Selector (left sidebar) -->
      <div class="lg:col-span-1">
        <div class="card p-4">
          <h2 class="mb-3 text-sm font-semibold tracking-tight uppercase tracking-wide text-muted-foreground">
            Select Student
          </h2>
          <div class="space-y-2">
            <button
              v-for="(student, index) in classStudents"
              :key="student.id"
              :class="[
                'flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-200',
                selectedStudentId === student.id
                  ? 'bg-primary/5 ring-1 ring-primary/20'
                  : 'hover:bg-muted/50',
              ]"
              @click="selectedStudentId = student.id"
            >
              <div
                :class="[
                  'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white',
                  getAvatarColor(index),
                ]"
              >
                {{ student.photoInitials }}
              </div>
              <div class="min-w-0 flex-1">
                <p
                  :class="[
                    'truncate text-sm font-medium',
                    selectedStudentId === student.id
                      ? 'text-primary'
                      : 'text-foreground',
                  ]"
                >
                  {{ student.firstName }} {{ student.lastName }}
                </p>
                <p class="text-sm text-muted-foreground">Age {{ student.age }}</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="lg:col-span-3 space-y-6">
        <!-- Selected Student Card -->
        <div
          v-if="selectedStudent"
          class="flex items-center gap-4 card p-5"
        >
          <div
            :class="[
              'flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white',
              getAvatarColor(
                classStudents.findIndex((s) => s.id === selectedStudent?.id),
              ),
            ]"
          >
            {{ selectedStudent.photoInitials }}
          </div>
          <div class="flex-1">
            <h2 class="text-lg font-semibold tracking-tight text-foreground">
              {{ selectedStudent.firstName }} {{ selectedStudent.lastName }}
            </h2>
            <p class="text-sm text-muted-foreground">
              Age {{ selectedStudent.age }} &middot; Butterfly Class
            </p>
          </div>
          <div class="flex items-center gap-6">
            <div class="text-center">
              <p class="text-2xl font-bold tracking-tight text-primary">
                {{ studentMilestoneStats.achieved }}
              </p>
              <p class="text-sm text-muted-foreground">Achieved</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold tracking-tight text-foreground">
                {{ studentMilestoneStats.total }}
              </p>
              <p class="text-sm text-muted-foreground">Total</p>
            </div>
            <div class="text-center">
              <div class="flex items-center gap-1">
                <Star class="h-5 w-5 text-warning" />
                <p class="text-2xl font-bold tracking-tight text-warning">
                  {{
                    studentMilestoneStats.total > 0
                      ? Math.round(
                          (studentMilestoneStats.achieved /
                            studentMilestoneStats.total) *
                            100,
                        )
                      : 0
                  }}%
                </p>
              </div>
              <p class="text-sm text-muted-foreground">Progress</p>
            </div>
          </div>
        </div>

        <!-- Domain Tabs -->
        <div class="flex gap-1 overflow-x-auto rounded-xl bg-muted p-1">
          <button
            v-for="domain in domains"
            :key="domain.key"
            :class="[
              'flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200',
              activeDomain === domain.key
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            ]"
            @click="activeDomain = domain.key"
          >
            <component :is="domain.icon" class="h-4 w-4" />
            {{ domain.label }}
          </button>
        </div>

        <!-- Milestones List -->
        <div class="space-y-3">
          <div
            v-if="filteredMilestones.length === 0"
            class="card p-10 text-center"
          >
            <Award class="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p class="text-sm text-muted-foreground">
              No milestones recorded for this domain yet.
            </p>
          </div>

          <div
            v-for="milestone in filteredMilestones"
            :key="milestone.id"
            :class="[
              'flex items-start gap-4 rounded-xl border p-4 transition-all duration-200',
              milestone.achieved
                ? 'border-success/30 bg-success/5'
                : 'border-border bg-white shadow-sm',
            ]"
          >
            <!-- Checkbox -->
            <div class="mt-0.5">
              <CheckCircle
                v-if="milestone.achieved"
                class="h-6 w-6 text-success"
              />
              <Circle v-else class="h-6 w-6 text-muted-foreground/40" />
            </div>

            <!-- Content -->
            <div class="flex-1 space-y-1">
              <h3
                :class="[
                  'text-sm font-semibold tracking-tight',
                  milestone.achieved ? 'text-success' : 'text-foreground',
                ]"
              >
                {{ milestone.title }}
              </h3>
              <p class="text-sm text-muted-foreground">
                {{ milestone.description }}
              </p>
              <div
                v-if="milestone.achieved && milestone.achievedDate"
                class="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <span class="inline-flex items-center gap-1">
                  <CalendarDays class="h-3.5 w-3.5" />
                  {{ milestone.achievedDate }}
                </span>
                <span>Logged by: Teacher Anne</span>
              </div>
              <p
                v-if="milestone.notes"
                class="text-sm italic text-muted-foreground"
              >
                "{{ milestone.notes }}"
              </p>
            </div>

            <!-- Action -->
            <div class="flex flex-col gap-2">
              <button
                v-if="!milestone.achieved"
                class="whitespace-nowrap rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:bg-primary/90"
                @click="openLogModal(milestone.id)"
              >
                Log Achievement
              </button>
              <button
                v-if="milestone.achieved"
                class="inline-flex items-center gap-1 whitespace-nowrap rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
                @click="openEditNotesModal(milestone)"
              >
                <Pencil class="h-3 w-3" />
                Edit Notes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Log Achievement Modal -->
    <AppModal
      :open="showLogModal"
      title="Log Achievement"
      subtitle="Record when this milestone was achieved"
      size="sm"
      @update:open="showLogModal = $event"
    >
      <div class="space-y-4">
        <FormField
          v-model="logDate"
          label="Date Achieved"
          type="date"
          required
        />
        <FormTextarea
          v-model="logNotes"
          label="Notes (optional)"
          placeholder="Add any observations or comments..."
          :rows="3"
        />
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            class="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted"
            @click="closeLogModal"
          >
            Cancel
          </button>
          <button
            class="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-primary/90"
            @click="saveMilestoneAchievement"
          >
            Save
          </button>
        </div>
      </template>
    </AppModal>

    <!-- Add Milestone Modal -->
    <AppModal
      :open="showAddModal"
      title="Add Milestone"
      subtitle="Create a new developmental milestone to track"
      size="md"
      @update:open="showAddModal = $event"
    >
      <div class="space-y-4">
        <FormSelect
          v-model="milestoneForm.studentId"
          label="Student"
          :options="studentOptions"
          required
        />
        <FormSelect
          v-model="milestoneForm.domain"
          label="Domain"
          :options="domainOptions"
          required
        />
        <FormField
          v-model="milestoneForm.title"
          label="Title"
          placeholder="e.g. Hops on one foot"
          required
        />
        <FormTextarea
          v-model="milestoneForm.description"
          label="Description"
          placeholder="Describe the milestone expectation..."
          :rows="3"
        />
        <FormTextarea
          v-model="milestoneForm.notes"
          label="Notes (optional)"
          placeholder="Any additional observations..."
          :rows="2"
        />
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            class="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted"
            @click="showAddModal = false"
          >
            Cancel
          </button>
          <button
            :disabled="!milestoneForm.title.trim()"
            :class="[
              'rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200',
              milestoneForm.title.trim()
                ? 'bg-primary hover:bg-primary/90'
                : 'bg-muted-foreground/30 cursor-not-allowed',
            ]"
            @click="saveNewMilestone"
          >
            Add Milestone
          </button>
        </div>
      </template>
    </AppModal>

    <!-- Edit Notes Modal -->
    <AppModal
      :open="showEditNotesModal"
      title="Edit Notes"
      subtitle="Update observations for this milestone"
      size="sm"
      @update:open="showEditNotesModal = $event"
    >
      <FormTextarea
        v-model="editNotes"
        label="Notes"
        placeholder="Add any observations or comments..."
        :rows="4"
      />
      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            class="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted"
            @click="showEditNotesModal = false"
          >
            Cancel
          </button>
          <button
            class="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-primary/90"
            @click="saveEditedNotes"
          >
            Save Notes
          </button>
        </div>
      </template>
    </AppModal>
  </div>
</template>
