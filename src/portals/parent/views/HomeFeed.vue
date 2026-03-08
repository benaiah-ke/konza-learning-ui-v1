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
  meal: { icon: UtensilsCrossed, color: 'text-warning', bg: 'bg-warning-light' },
  nap: { icon: Moon, color: 'text-muted-foreground', bg: 'bg-muted' },
  activity: { icon: Palette, color: 'text-info', bg: 'bg-info-light' },
  learning: { icon: BookOpen, color: 'text-success', bg: 'bg-success-light' },
  outdoor: { icon: TreePine, color: 'text-primary', bg: 'bg-primary/10' },
}

function formatTime(time: string): string {
  const [h, m] = time.split(':')
  const hour = parseInt(h ?? '')
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:${m} ${ampm}`
}

const upcomingEvents = [
  { title: 'Sports Day', date: 'March 15, 2026', icon: Trophy, color: 'text-muted-foreground', bg: 'bg-muted' },
  { title: 'Parent-Teacher Conference', date: 'March 22, 2026', icon: CalendarDays, color: 'text-muted-foreground', bg: 'bg-muted' },
  { title: 'End of Term 1', date: 'April 3, 2026', icon: CalendarDays, color: 'text-muted-foreground', bg: 'bg-muted' },
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
  info: 'border-l-info bg-info-light',
  warning: 'border-l-warning bg-warning-light',
  success: 'border-l-success bg-success-light',
  danger: 'border-l-danger bg-danger-light',
}

const notifIconColor: Record<string, string> = {
  info: 'text-info',
  warning: 'text-warning',
  success: 'text-success',
  danger: 'text-danger',
}
</script>

<template>
  <div class="space-y-5 pb-4">
    <!-- Greeting Banner -->
    <div class="rounded-xl bg-parent p-4 text-white shadow-lg">
      <div class="flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
          GM
        </div>
        <div class="flex-1">
          <h1 class="text-lg font-bold tracking-tight">{{ greeting }}, {{ parentName }}</h1>
          <p class="text-sm text-white/70">{{ formattedDate }}</p>
        </div>
        <Sun class="h-8 w-8 text-white/80" />
      </div>
      <div class="mt-3 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
        <div class="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
          AW
        </div>
        <span class="text-sm font-medium">{{ childName }}'s Day</span>
        <span class="ml-auto text-xs text-white/70">Butterfly Class</span>
      </div>
    </div>

    <!-- Quick Stats Row -->
    <div class="grid grid-cols-3 gap-2">
      <div class="card p-3">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-warning-light">
          <Flame class="h-4 w-4 text-warning" />
        </div>
        <p class="mt-2 text-lg font-bold tracking-tight text-foreground">12</p>
        <p class="text-xs text-muted-foreground">Day streak</p>
      </div>
      <div class="card p-3">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
          <Trophy class="h-4 w-4 text-muted-foreground" />
        </div>
        <p class="mt-2 text-xs font-semibold tracking-tight text-foreground leading-tight">Sports Day</p>
        <p class="text-xs text-muted-foreground">Mar 15</p>
      </div>
      <div class="card p-3">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-success-light">
          <CreditCard class="h-4 w-4 text-success" />
        </div>
        <StatusBadge status="success" label="Paid" size="sm" class="mt-2" />
        <p class="text-xs text-muted-foreground mt-0.5">Fee status</p>
      </div>
    </div>

    <!-- Today's Activities -->
    <div>
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-sm font-semibold tracking-tight text-foreground">Today's Activities</h2>
        <span class="text-sm text-muted-foreground">{{ todayActivities.length }} updates</span>
      </div>
      <div class="space-y-2">
        <div
          v-for="activity in todayActivities"
          :key="activity.id"
          class="flex gap-3 card p-3 transition-all duration-200"
        >
          <div class="flex flex-col items-center pt-0.5">
            <span class="text-xs font-medium text-muted-foreground">{{ formatTime(activity.time) }}</span>
            <div class="mt-1.5 h-full w-px bg-border" />
          </div>
          <div
            :class="[
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
              activityConfig[activity.type]?.bg ?? 'bg-muted',
            ]"
          >
            <component
              :is="activityConfig[activity.type]?.icon ?? BookOpen"
              :class="['h-4 w-4', activityConfig[activity.type]?.color ?? 'text-muted-foreground']"
            />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-foreground">{{ activity.title }}</p>
            <p class="mt-0.5 text-xs leading-relaxed text-muted-foreground">{{ activity.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Upcoming Events -->
    <div>
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-sm font-semibold tracking-tight text-foreground">Upcoming Events</h2>
        <button class="flex items-center text-xs font-medium text-parent transition-all duration-200 hover:text-parent/80">
          View all
          <ChevronRight class="h-3.5 w-3.5" />
        </button>
      </div>
      <div class="space-y-2">
        <div
          v-for="event in upcomingEvents"
          :key="event.title"
          class="flex items-center gap-3 card p-3 transition-all duration-200"
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
            <p class="text-sm font-medium text-foreground">{{ event.title }}</p>
            <p class="text-sm text-muted-foreground">{{ event.date }}</p>
          </div>
          <ChevronRight class="h-4 w-4 text-muted-foreground/50" />
        </div>
      </div>
    </div>

    <!-- Announcements -->
    <div>
      <h2 class="mb-3 text-sm font-semibold tracking-tight text-foreground">Announcements</h2>
      <div class="space-y-2">
        <div
          v-for="notif in parentNotifications"
          :key="notif.id"
          :class="[
            'rounded-xl border-l-4 p-3 shadow-sm',
            notifStyle[notif.type],
          ]"
        >
          <div class="flex items-start gap-2.5">
            <component
              :is="notifIcon[notif.type]"
              :class="['mt-0.5 h-4 w-4 shrink-0', notifIconColor[notif.type]]"
            />
            <div>
              <p class="text-sm font-medium text-foreground">{{ notif.title }}</p>
              <p class="mt-0.5 text-xs leading-relaxed text-muted-foreground">{{ notif.message }}</p>
              <p class="mt-1.5 text-xs text-muted-foreground/70">{{ notif.date }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
