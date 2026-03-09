<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useStudentsStore } from '@/stores/students'
import { useAcademicsStore } from '@/stores/academics'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { generateId } from '@/utils/generateId'
import type { AcademicRecord } from '@/types'
import { Save } from 'lucide-vue-next'

const studentsStore = useStudentsStore()
const academicsStore = useAcademicsStore()
const auth = useAuthStore()
const toast = useToast()

// ── Constants ───────────────────────────────────────────────
const CURRENT_TERM = 'Term 1 2026'

const subjects: { key: AcademicRecord['subject']; label: string }[] = [
  { key: 'numeracy', label: 'Numeracy' },
  { key: 'literacy', label: 'Literacy' },
  { key: 'kiswahili', label: 'Kiswahili' },
  { key: 'science', label: 'Science' },
  { key: 'creative-arts', label: 'Creative Arts' },
  { key: 'social-skills', label: 'Social Skills' },
  { key: 'physical-development', label: 'Physical Development' },
]

const scoreLabels: Record<number, AcademicRecord['grade']> = {
  5: 'Exceeding',
  4: 'Meeting',
  3: 'Approaching',
  2: 'Developing',
  1: 'Beginning',
}

function gradeFromScore(score: number): AcademicRecord['grade'] {
  return scoreLabels[score] ?? 'Beginning'
}

// Score button colors
function scoreColor(score: number, isSelected: boolean): string {
  if (!isSelected) return 'bg-muted text-muted-foreground hover:bg-muted/80'
  switch (score) {
    case 5: return 'bg-emerald-500 text-white'
    case 4: return 'bg-blue-500 text-white'
    case 3: return 'bg-amber-400 text-white'
    case 2: return 'bg-orange-500 text-white'
    case 1: return 'bg-red-500 text-white'
    default: return 'bg-muted text-muted-foreground'
  }
}

function gradeTagColor(grade: AcademicRecord['grade']): string {
  switch (grade) {
    case 'Exceeding': return 'text-emerald-700 bg-emerald-50'
    case 'Meeting': return 'text-blue-700 bg-blue-50'
    case 'Approaching': return 'text-amber-700 bg-amber-50'
    case 'Developing': return 'text-orange-700 bg-orange-50'
    case 'Beginning': return 'text-red-700 bg-red-50'
    default: return 'text-muted-foreground bg-muted'
  }
}

// ── Teacher's classroom ─────────────────────────────────────
// Extract classroom name from role (e.g. "Lead Teacher - Butterfly Class" -> "Butterfly")
const classroom = computed(() => {
  const role = auth.currentUser.role
  const match = role.match(/-\s*(.+?)\s*Class/)
  return match?.[1] ?? 'Butterfly'
})

// ── Students ────────────────────────────────────────────────
const classStudents = computed(() => studentsStore.getStudentsByClass(classroom.value))

// ── Selected student ────────────────────────────────────────
const selectedStudentId = ref<string | null>(null)

// Set initial selected student
watch(classStudents, (students) => {
  if (!selectedStudentId.value && students.length > 0) {
    selectedStudentId.value = students[0]?.id ?? null
  }
}, { immediate: true })

const selectedStudent = computed(() =>
  classStudents.value.find((s) => s.id === selectedStudentId.value),
)

// ── Form state ──────────────────────────────────────────────
interface SubjectFormEntry {
  score: number | null
  grade: AcademicRecord['grade'] | ''
  comments: string
}

type FormState = Record<AcademicRecord['subject'], SubjectFormEntry>

function createEmptyForm(): FormState {
  const form = {} as FormState
  for (const s of subjects) {
    form[s.key] = { score: null, grade: '', comments: '' }
  }
  return form
}

const formState = reactive<FormState>(createEmptyForm())

// When a score changes, auto-calculate grade
function setScore(subject: AcademicRecord['subject'], score: number) {
  formState[subject].score = score
  formState[subject].grade = gradeFromScore(score)
}

// ── Pre-fill form when student changes ──────────────────────
watch(selectedStudentId, (studentId) => {
  // Reset form
  const empty = createEmptyForm()
  for (const s of subjects) {
    Object.assign(formState[s.key], empty[s.key])
  }

  if (!studentId) return

  // Load existing records
  const records = academicsStore.getRecordsByStudent(studentId)
  for (const record of records) {
    if (record.term === CURRENT_TERM && formState[record.subject]) {
      formState[record.subject].score = record.score
      formState[record.subject].grade = record.grade
      formState[record.subject].comments = record.comments ?? ''
    }
  }
}, { immediate: true })

// ── Completion count per student ────────────────────────────
function getCompletionCount(studentId: string): number {
  const records = academicsStore.getRecordsByStudent(studentId)
  const termRecords = records.filter((r) => r.term === CURRENT_TERM)
  const uniqueSubjects = new Set(termRecords.map((r) => r.subject))
  return uniqueSubjects.size
}

// ── Avatar colors ───────────────────────────────────────────
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

// ── Save ────────────────────────────────────────────────────
const isSaving = ref(false)

function saveGrades() {
  if (!selectedStudentId.value) return

  isSaving.value = true
  const studentId = selectedStudentId.value
  const existingRecords = academicsStore.getRecordsByStudent(studentId)
    .filter((r) => r.term === CURRENT_TERM)

  let updatedCount = 0
  let createdCount = 0

  for (const s of subjects) {
    const entry = formState[s.key]
    if (entry.score === null) continue

    const existing = existingRecords.find((r) => r.subject === s.key)

    if (existing) {
      academicsStore.updateRecord(existing.id, {
        score: entry.score,
        grade: gradeFromScore(entry.score),
        comments: entry.comments || undefined,
        assessedBy: auth.currentUser.name,
        assessedDate: new Date().toISOString().slice(0, 10),
      })
      updatedCount++
    } else {
      const newRecord: AcademicRecord = {
        id: generateId('acr'),
        studentId,
        term: CURRENT_TERM,
        subject: s.key,
        score: entry.score,
        grade: gradeFromScore(entry.score),
        comments: entry.comments || undefined,
        assessedBy: auth.currentUser.name,
        assessedDate: new Date().toISOString().slice(0, 10),
      }
      academicsStore.addRecord(newRecord)
      createdCount++
    }
  }

  isSaving.value = false

  const totalSaved = updatedCount + createdCount
  if (totalSaved > 0) {
    toast.success(`Saved grades for ${selectedStudent.value?.firstName ?? 'student'} (${totalSaved} subject${totalSaved > 1 ? 's' : ''})`)
  } else {
    toast.info('No scores to save. Select at least one score.')
  }
}

// ── Track if any scores are set ─────────────────────────────
const hasAnyScore = computed(() =>
  subjects.some((s) => formState[s.key].score !== null),
)
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-foreground">Grade Recording</h1>
      <p class="text-sm text-muted-foreground">
        {{ classroom }} Class &middot; {{ CURRENT_TERM }}
      </p>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
      <!-- Left Panel: Student Selector -->
      <div class="lg:col-span-1">
        <div class="card p-4">
          <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
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
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white',
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
                <p class="text-xs text-muted-foreground">
                  {{ getCompletionCount(student.id) }}/7 subjects graded
                </p>
              </div>
              <!-- Completion badge -->
              <span
                v-if="getCompletionCount(student.id) === 7"
                class="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
              >
                Done
              </span>
              <span
                v-else-if="getCompletionCount(student.id) > 0"
                class="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
              >
                {{ getCompletionCount(student.id) }}/7
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Right Panel: Grade Form -->
      <div class="lg:col-span-3 space-y-6">
        <!-- No student selected -->
        <div v-if="!selectedStudent" class="card p-10 text-center">
          <p class="text-sm text-muted-foreground">Select a student to begin grading.</p>
        </div>

        <template v-if="selectedStudent">
          <!-- Student header -->
          <div class="card p-5">
            <h2 class="text-lg font-semibold tracking-tight text-foreground">
              {{ selectedStudent.firstName }} {{ selectedStudent.lastName }}
            </h2>
            <p class="text-sm text-muted-foreground">
              Age {{ selectedStudent.age }} &middot; {{ classroom }} Class
            </p>
          </div>

          <!-- Subject cards grid -->
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div
              v-for="subject in subjects"
              :key="subject.key"
              class="card space-y-4 p-5"
            >
              <!-- Subject name -->
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-semibold text-foreground">{{ subject.label }}</h3>
                <span
                  v-if="formState[subject.key].grade"
                  :class="[
                    'rounded-full px-2.5 py-0.5 text-xs font-medium',
                    gradeTagColor(formState[subject.key].grade as AcademicRecord['grade']),
                  ]"
                >
                  {{ formState[subject.key].grade }}
                </span>
              </div>

              <!-- Score selector (segmented buttons 1-5) -->
              <div>
                <label class="mb-1.5 block text-xs font-medium text-muted-foreground">Score</label>
                <div class="flex gap-1.5">
                  <button
                    v-for="score in [1, 2, 3, 4, 5]"
                    :key="score"
                    :class="[
                      'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200',
                      scoreColor(score, formState[subject.key].score === score),
                    ]"
                    @click="setScore(subject.key, score)"
                  >
                    {{ score }}
                  </button>
                </div>
              </div>

              <!-- Comments -->
              <div>
                <label class="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Comments <span class="font-normal text-muted-foreground/60">(optional)</span>
                </label>
                <textarea
                  v-model="formState[subject.key].comments"
                  class="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  :rows="2"
                  placeholder="Add comments..."
                />
              </div>
            </div>
          </div>

          <!-- Save button -->
          <div class="flex justify-end">
            <button
              :disabled="!hasAnyScore || isSaving"
              :class="[
                'inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200',
                hasAnyScore && !isSaving
                  ? 'bg-primary hover:bg-primary/90'
                  : 'cursor-not-allowed bg-muted-foreground/30',
              ]"
              @click="saveGrades"
            >
              <Save class="h-4 w-4" />
              {{ isSaving ? 'Saving...' : 'Save Grades' }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
