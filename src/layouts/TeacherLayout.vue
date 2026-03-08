<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import {
  Users,
  Target,
  ShieldAlert,
  MessageSquare,
  Bell,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()

const pageTitle = computed(() => (route.meta?.title as string) ?? 'Dashboard')
const userInitials = computed(() => auth.currentUser.avatar)
const userName = computed(() => auth.currentUser.name)
const userRole = computed(() => auth.currentUser.role)

const navItems = [
  { label: 'My Class', to: '/teacher', icon: Users },
  { label: 'Milestones', to: '/teacher/milestones', icon: Target },
  { label: 'Incidents', to: '/teacher/incidents', icon: ShieldAlert },
  { label: 'Communication', to: '/teacher/communication', icon: MessageSquare },
]

function isActive(to: string): boolean {
  if (to === '/teacher') {
    return route.path === '/teacher'
  }
  return route.path.startsWith(to)
}
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden">
    <!-- Top navigation bar -->
    <header class="border-b bg-white">
      <div class="flex h-16 items-center justify-between px-4 lg:px-6">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <RouterLink to="/" class="flex items-center gap-2">
            <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 font-bold text-white">
              K
            </div>
            <span class="hidden text-lg font-semibold text-gray-900 sm:inline">Konza Learning</span>
          </RouterLink>
        </div>

        <!-- Nav links (desktop) -->
        <nav class="hidden items-center gap-1 md:flex">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-2 border-b-2 px-3 py-4 text-sm font-medium transition-colors"
            :class="
              isActive(item.to)
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            "
          >
            <component :is="item.icon" class="h-4 w-4" />
            {{ item.label }}
          </RouterLink>
        </nav>

        <!-- User info -->
        <div class="flex items-center gap-4">
          <button class="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
            <Bell class="h-5 w-5" />
            <span class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <div class="hidden items-center gap-3 sm:flex">
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
              <p class="text-xs text-gray-500">{{ userRole }}</p>
            </div>
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-sm font-semibold text-white">
              {{ userInitials }}
            </div>
          </div>
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-sm font-semibold text-white sm:hidden">
            {{ userInitials }}
          </div>
        </div>
      </div>

      <!-- Mobile nav -->
      <nav class="flex items-center border-t md:hidden">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex flex-1 flex-col items-center gap-0.5 border-b-2 py-2 text-xs font-medium transition-colors"
          :class="
            isActive(item.to)
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          "
        >
          <component :is="item.icon" class="h-4 w-4" />
          {{ item.label }}
        </RouterLink>
      </nav>
    </header>

    <!-- Content -->
    <main class="flex-1 overflow-y-auto bg-gray-50 p-6">
      <RouterView />
    </main>
  </div>
</template>
