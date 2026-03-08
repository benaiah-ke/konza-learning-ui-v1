<script setup lang="ts">
import { computed } from 'vue'
import {
  Sun,
  CalendarDays,
  Flame,
  Trophy,
  CreditCard,
  UtensilsCrossed,
  Moon,
  Palette,
  BookOpen,
  TreePine,
  ChevronRight,
  Megaphone,
  Info,
  AlertTriangle,
} from 'lucide-vue-next'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { dailyActivities } from '@/data/milestones'
import { notifications } from '@/data/notifications'

const parentName = 'Grace'
const childName = 'Amani'

const today = new Date()
const greeting = computed(() => {
  const hour = today.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
})

const formattedDate = computed(() => {
  return today.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const todayActivities = computed(() => {
  return dailyActivities
    .filter((a) => a.studentId === 'stu-001')
    .sort((a, b) => a.time.localeCompare(b.time))
})

const activityConfig: Record<string, { icon: typeof UtensilsCrossed; color: string; bg: string }> = {
  meal: { icon: UtensilsCrossed, color: 'text-orange-600', bg: 'bg-orange-100' },
  nap: { icon: Moon, color: 'text-purple-600', bg: 'bg-purple-100' },
  activity: { icon: Palette, color: 'text-blue-600', bg: 'bg-blue-100' },
  learning: { icon: BookOpen, color: 'text-green-600', bg: 'bg-green-100' },
  outdoor: { icon: TreePine, color: 'text-teal-600', bg: 'bg-teal-100' },
}

function formatTime(time: string): string {
  const [h, m] = time.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:${m} ${ampm}`
}

const upcomingEvents = [
  { title: 'Sports Day', date: 'March 15, 2026', icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-100' },
  { title: 'Parent-Teacher Conference', date: 'March 22, 2026', icon: CalendarDays, color: 'text-violet-600', bg: 'bg-violet-100' },
  { title: 'End of Term 1', date: 'April 3, 2026', icon: CalendarDays, color: 'text-emerald-600', bg: 'bg-emerald-100' },
]

const parentNotifications = computed(() => {
  return notifications
    .filter((n) => n.type === 'info' || n.type === 'warning')
    .slice(0, 2)
})

const notifIcon: Record<string, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  success: Info,
  danger: AlertTriangle,
}

const notifStyle: Record<string, string> = {
  info: 'border-l-blue-500 bg-blue-50',
  warning: 'border-l-amber-500 bg-amber-50',
  success: 'border-l-green-500 bg-green-50',
  danger: 'border-l-red-500 bg-red-50',
}

const notifIconColor: Record<string, string> = {
  info: 'text-blue-500',
  warning: 'text-amber-500',
  success: 'text-green-500',
  danger: 'text-red-500',
}
</script>

<template>
  <div class="space-y-4 pb-4">
    <!-- Greeting Banner -->
    <div class="rounded-2xl bg-gradient-to-br from-violet-600 to-violet-700 p-4 text-white shadow-lg">
      <div class="flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
          GM
        </div>
        <div class="flex-1">
          <h1 class="text-lg font-bold">{{ greeting }}, {{ parentName }}</h1>
          <p class="text-sm text-violet-200">{{ formattedDate }}</p>
        </div>
        <Sun class="h-8 w-8 text-amber-300" />
      </div>
      <div class="mt-3 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
        <div class="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
          AW
        </div>
        <span class="text-sm font-medium">{{ childName }}'s Day</span>
        <span class="ml-auto text-xs text-violet-200">Butterfly Class</span>
      </div>
    </div>

    <!-- Quick Stats Row -->
    <div class="grid grid-cols-3 gap-2">
      <div class="rounded-2xl bg-white p-3 shadow-sm">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
          <Flame class="h-4 w-4 text-orange-600" />
        </div>
        <p class="mt-2 text-lg font-bold text-gray-900">12</p>
        <p class="text-[11px] text-gray-500">Day streak</p>
      </div>
      <div class="rounded-2xl bg-white p-3 shadow-sm">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100">
          <Trophy class="h-4 w-4 text-violet-600" />
        </div>
        <p class="mt-2 text-xs font-semibold text-gray-900 leading-tight">Sports Day</p>
        <p class="text-[11px] text-gray-500">Mar 15</p>
      </div>
      <div class="rounded-2xl bg-white p-3 shadow-sm">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
          <CreditCard class="h-4 w-4 text-green-600" />
        </div>
        <StatusBadge status="success" label="Paid" size="sm" class="mt-2" />
        <p class="text-[11px] text-gray-500 mt-0.5">Fee status</p>
      </div>
    </div>

    <!-- Today's Activities -->
    <div>
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-gray-900">Today's Activities</h2>
        <span class="text-xs text-gray-500">{{ todayActivities.length }} updates</span>
      </div>
      <div class="space-y-2">
        <div
          v-for="activity in todayActivities"
          :key="activity.id"
          class="flex gap-3 rounded-2xl bg-white p-3 shadow-sm"
        >
          <div class="flex flex-col items-center pt-0.5">
            <span class="text-[11px] font-medium text-gray-500">{{ formatTime(activity.time) }}</span>
            <div class="mt-1.5 h-full w-px bg-gray-200" />
          </div>
          <div
            :class="[
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
              activityConfig[activity.type]?.bg ?? 'bg-gray-100',
            ]"
          >
            <component
              :is="activityConfig[activity.type]?.icon ?? BookOpen"
              :class="['h-4 w-4', activityConfig[activity.type]?.color ?? 'text-gray-600']"
            />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
            <p class="mt-0.5 text-xs leading-relaxed text-gray-500">{{ activity.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Upcoming Events -->
    <div>
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-gray-900">Upcoming Events</h2>
        <button class="flex items-center text-xs font-medium text-violet-600">
          View all
          <ChevronRight class="h-3.5 w-3.5" />
        </button>
      </div>
      <div class="space-y-2">
        <div
          v-for="event in upcomingEvents"
          :key="event.title"
          class="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm"
        >
          <div
            :class="[
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              event.bg,
            ]"
          >
            <component :is="event.icon" :class="['h-5 w-5', event.color]" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900">{{ event.title }}</p>
            <p class="text-xs text-gray-500">{{ event.date }}</p>
          </div>
          <ChevronRight class="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>

    <!-- Announcements -->
    <div>
      <h2 class="mb-3 text-sm font-semibold text-gray-900">Announcements</h2>
      <div class="space-y-2">
        <div
          v-for="notif in parentNotifications"
          :key="notif.id"
          :class="[
            'rounded-2xl border-l-4 p-3 shadow-sm',
            notifStyle[notif.type],
          ]"
        >
          <div class="flex items-start gap-2.5">
            <component
              :is="notifIcon[notif.type]"
              :class="['mt-0.5 h-4 w-4 shrink-0', notifIconColor[notif.type]]"
            />
            <div>
              <p class="text-sm font-medium text-gray-900">{{ notif.title }}</p>
              <p class="mt-0.5 text-xs leading-relaxed text-gray-600">{{ notif.message }}</p>
              <p class="mt-1.5 text-[11px] text-gray-400">{{ notif.date }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
