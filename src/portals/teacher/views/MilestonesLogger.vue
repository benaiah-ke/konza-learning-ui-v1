<script setup lang="ts">
import { ref, computed } from 'vue'
import { students } from '@/data/students'
import { milestones as allMilestones } from '@/data/milestones'
import type { Milestone } from '@/types'
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
  X,
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
  return avatarColors[index % avatarColors.length]
}

// Log milestone modal
const showLogModal = ref(false)
const loggingMilestoneId = ref<string | null>(null)
const logDate = ref(new Date().toISOString().split('T')[0])
const logNotes = ref('')

function openLogModal(milestoneId: string) {
  loggingMilestoneId.value = milestoneId
  logDate.value = new Date().toISOString().split('T')[0]
  logNotes.value = ''
  showLogModal.value = true
}

function closeLogModal() {
  showLogModal.value = false
  loggingMilestoneId.value = null
}

function saveMilestone() {
  if (!loggingMilestoneId.value) return
  const index = milestonesData.value.findIndex(
    (m) => m.id === loggingMilestoneId.value,
  )
  if (index !== -1) {
    milestonesData.value[index] = {
      ...milestonesData.value[index],
      achieved: true,
      achievedDate: logDate.value,
      notes: logNotes.value || milestonesData.value[index].notes,
      loggedBy: 'stf-001',
    }
  }
  closeLogModal()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-foreground">Milestones Logger</h1>
      <p class="text-sm text-muted-foreground">
        Record and track child developmental milestones
      </p>
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
                classStudents.findIndex((s) => s.id === selectedStudent.id),
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
            <div v-if="!milestone.achieved">
              <button
                class="whitespace-nowrap rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:bg-primary/90"
                @click="openLogModal(milestone.id)"
              >
                Log Achievement
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Log Milestone Modal -->
    <Teleport to="body">
      <div
        v-if="showLogModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeLogModal"
      >
        <div class="w-full max-w-md card p-6 shadow-xl">
          <div class="mb-5 flex items-center justify-between">
            <h3 class="text-lg font-semibold tracking-tight text-foreground">Log Achievement</h3>
            <button
              class="rounded-xl p-1.5 text-muted-foreground transition-all duration-200 hover:bg-muted"
              @click="closeLogModal"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label
                class="mb-1.5 block text-sm font-medium text-foreground"
                for="log-date"
              >
                Date Achieved
              </label>
              <input
                id="log-date"
                v-model="logDate"
                type="date"
                class="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label
                class="mb-1.5 block text-sm font-medium text-foreground"
                for="log-notes"
              >
                Notes (optional)
              </label>
              <textarea
                id="log-notes"
                v-model="logNotes"
                rows="3"
                placeholder="Add any observations or comments..."
                class="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div class="flex justify-end gap-3">
              <button
                class="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted"
                @click="closeLogModal"
              >
                Cancel
              </button>
              <button
                class="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-primary/90"
                @click="saveMilestone"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
