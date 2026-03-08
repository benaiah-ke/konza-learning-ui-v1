<script setup lang="ts">
import { ref, computed } from 'vue'
import { students } from '@/data/students'
import { milestones, incidents } from '@/data/milestones'
import StatCard from '@/components/shared/StatCard.vue'
import {
  Users,
  CheckCircle,
  Award,
  AlertTriangle,
  Check,
  X,
  Clock,
  MapPin,
  Calendar,
} from 'lucide-vue-next'

// Filter students for Butterfly class at Karen campus
const classStudents = computed(() =>
  students.filter(
    (s) => s.className === 'Butterfly' && s.campusId === 'campus-karen',
  ),
)

// Attendance state
type AttendanceStatus = 'present' | 'absent' | 'late'

const attendance = ref<Record<string, AttendanceStatus>>(
  Object.fromEntries(
    classStudents.value.map((s, i) => [
      s.id,
      i === 1 ? 'absent' : i === 2 ? 'late' : 'present',
    ]),
  ),
)

function setAttendance(studentId: string, status: AttendanceStatus) {
  attendance.value[studentId] = status
}

const presentCount = computed(
  () =>
    Object.values(attendance.value).filter((s) => s === 'present').length,
)

const lateCount = computed(
  () =>
    Object.values(attendance.value).filter((s) => s === 'late').length,
)

// Stats
const totalStudents = computed(() => classStudents.value.length)

const attendingCount = computed(() => presentCount.value + lateCount.value)

const milestonesThisMonth = computed(() =>
  milestones.filter(
    (m) =>
      classStudents.value.some((s) => s.id === m.studentId) &&
      m.achieved &&
      m.achievedDate &&
      m.achievedDate.startsWith('2026-03'),
  ).length,
)

const pendingIncidents = computed(() =>
  incidents.filter(
    (inc) =>
      classStudents.value.some((s) => s.id === inc.studentId) &&
      !inc.parentNotified,
  ).length,
)

// Avatar background colors
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

// Today's schedule
const schedule = [
  { time: '8:00 AM', activity: 'Circle Time', description: 'Morning greetings, songs, and calendar' },
  { time: '8:30 AM', activity: 'Breakfast', description: 'Healthy morning meal' },
  { time: '9:00 AM', activity: 'Free Play', description: 'Indoor play stations and exploration' },
  { time: '9:30 AM', activity: 'Learning Activity: Colors & Shapes', description: 'Structured learning session' },
  { time: '10:30 AM', activity: 'Outdoor Play', description: 'Playground and physical activities' },
  { time: '11:00 AM', activity: 'Snack Time', description: 'Mid-morning snack' },
  { time: '11:30 AM', activity: 'Story Time', description: 'Group story reading and discussion' },
  { time: '12:00 PM', activity: 'Lunch', description: 'Main meal of the day' },
  { time: '12:30 PM', activity: 'Nap Time', description: 'Rest period for all children' },
  { time: '2:00 PM', activity: 'Art & Craft', description: 'Creative expression and fine motor skills' },
  { time: '2:30 PM', activity: 'Music & Movement', description: 'Songs, instruments, and dance' },
  { time: '3:00 PM', activity: 'Home Time', description: 'Parent pick-up begins' },
]

// Determine current schedule item (simulate around 10:00 AM for demo)
const currentScheduleIndex = 5 // Snack Time (11:00 AM) as a reasonable "current" item

const today = new Date().toLocaleDateString('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
</script>

<template>
  <div class="space-y-6">
    <!-- Class Info Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-foreground">My Class Dashboard</h1>
        <p class="text-sm text-muted-foreground">Overview of your class, attendance, and daily schedule</p>
      </div>
      <div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span class="inline-flex items-center gap-1.5">
          <Users class="h-4 w-4 text-primary" />
          Butterfly Class
        </span>
        <span class="inline-flex items-center gap-1.5">
          <MapPin class="h-4 w-4 text-primary" />
          Karen Campus
        </span>
        <span class="inline-flex items-center gap-1.5">
          <Calendar class="h-4 w-4 text-primary" />
          {{ today }}
        </span>
      </div>
    </div>

    <!-- Quick Stats Row -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Students"
        :value="String(totalStudents)"
        :icon="Users"
        variant="primary"
      />
      <StatCard
        label="Present Today"
        :value="`${attendingCount}/${totalStudents}`"
        :icon="CheckCircle"
        variant="success"
      />
      <StatCard
        label="Milestones This Month"
        :value="String(milestonesThisMonth)"
        :icon="Award"
        variant="warning"
      />
      <StatCard
        label="Pending Incidents"
        :value="String(pendingIncidents)"
        :icon="AlertTriangle"
        variant="danger"
      />
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Attendance Grid -->
      <div class="lg:col-span-2">
        <div class="card p-6">
          <h2 class="mb-4 text-lg font-semibold tracking-tight text-foreground">Attendance</h2>
          <div class="space-y-3">
            <div
              v-for="(student, index) in classStudents"
              :key="student.id"
              class="flex items-center justify-between rounded-xl border border-border p-3 transition-all duration-200 hover:bg-muted/30"
            >
              <div class="flex items-center gap-3">
                <div
                  :class="[
                    'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white',
                    getAvatarColor(index),
                  ]"
                >
                  {{ student.photoInitials }}
                </div>
                <div>
                  <p class="font-medium text-foreground">
                    {{ student.firstName }} {{ student.lastName }}
                  </p>
                  <p class="text-sm text-muted-foreground">Age {{ student.age }}</p>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  :class="[
                    'inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200',
                    attendance[student.id] === 'present'
                      ? 'bg-success text-white shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-success/20 hover:text-success',
                  ]"
                  @click="setAttendance(student.id, 'present')"
                >
                  <Check class="h-3.5 w-3.5" />
                  Present
                </button>
                <button
                  :class="[
                    'inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200',
                    attendance[student.id] === 'absent'
                      ? 'bg-danger text-white shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-danger/20 hover:text-danger',
                  ]"
                  @click="setAttendance(student.id, 'absent')"
                >
                  <X class="h-3.5 w-3.5" />
                  Absent
                </button>
                <button
                  :class="[
                    'inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200',
                    attendance[student.id] === 'late'
                      ? 'bg-warning text-white shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-warning/20 hover:text-warning',
                  ]"
                  @click="setAttendance(student.id, 'late')"
                >
                  <Clock class="h-3.5 w-3.5" />
                  Late
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Today's Schedule -->
      <div>
        <div class="card p-6">
          <h2 class="mb-4 text-lg font-semibold tracking-tight text-foreground">Today's Schedule</h2>
          <div class="relative space-y-0">
            <div
              v-for="(item, index) in schedule"
              :key="index"
              class="relative flex gap-4 pb-6 last:pb-0"
            >
              <!-- Timeline line -->
              <div class="flex flex-col items-center">
                <div
                  :class="[
                    'z-10 h-3 w-3 rounded-full border-2 transition-all duration-200',
                    index === currentScheduleIndex
                      ? 'border-primary bg-primary'
                      : index < currentScheduleIndex
                        ? 'border-primary/40 bg-primary/40'
                        : 'border-border bg-white',
                  ]"
                />
                <div
                  v-if="index < schedule.length - 1"
                  :class="[
                    'w-0.5 flex-1',
                    index < currentScheduleIndex ? 'bg-primary/30' : 'bg-border',
                  ]"
                />
              </div>
              <!-- Content -->
              <div :class="['flex-1 -mt-0.5', index === currentScheduleIndex ? '' : '']">
                <div
                  :class="[
                    'rounded-xl p-2.5 transition-all duration-200',
                    index === currentScheduleIndex
                      ? 'bg-primary/5 ring-1 ring-primary/20'
                      : '',
                  ]"
                >
                  <p
                    :class="[
                      'text-xs font-medium',
                      index === currentScheduleIndex ? 'text-primary' : 'text-muted-foreground',
                    ]"
                  >
                    {{ item.time }}
                    <span
                      v-if="index === currentScheduleIndex"
                      class="ml-1.5 inline-flex items-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-white"
                    >
                      NOW
                    </span>
                  </p>
                  <p
                    :class="[
                      'text-sm font-medium',
                      index === currentScheduleIndex ? 'text-primary' : 'text-foreground',
                      index < currentScheduleIndex ? 'text-muted-foreground' : '',
                    ]"
                  >
                    {{ item.activity }}
                  </p>
                  <p class="text-sm text-muted-foreground">{{ item.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
