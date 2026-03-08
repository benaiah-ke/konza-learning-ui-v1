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
    <header class="border-b border-border bg-white/95 backdrop-blur-sm">
      <div class="flex h-16 items-center justify-between px-4 lg:px-6">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <RouterLink to="/" class="flex items-center gap-2">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-teacher font-bold text-white"
            >
              K
            </div>
            <span class="hidden text-lg font-semibold tracking-tight text-foreground sm:inline">Konza Learning</span>
          </RouterLink>
        </div>

        <!-- Nav links (desktop) -->
        <nav class="hidden items-center gap-1 md:flex">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200"
            :class="
              isActive(item.to)
                ? 'bg-primary/5 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            "
          >
            <component :is="item.icon" class="h-5 w-5" />
            {{ item.label }}
          </RouterLink>
        </nav>

        <!-- User info -->
        <div class="flex items-center gap-3">
          <button class="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Bell class="h-5 w-5" />
            <span class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-white" />
          </button>
          <div class="hidden items-center gap-3 sm:flex">
            <div class="text-right">
              <p class="text-sm font-medium text-foreground">{{ userName }}</p>
              <p class="text-xs text-muted-foreground">{{ userRole }}</p>
            </div>
            <div
              class="flex h-9 w-9 items-center justify-center rounded-full bg-teacher text-sm font-semibold text-white ring-2 ring-border"
            >
              {{ userInitials }}
            </div>
          </div>
          <div
            class="flex h-9 w-9 items-center justify-center rounded-full bg-teacher text-sm font-semibold text-white ring-2 ring-border sm:hidden"
          >
            {{ userInitials }}
          </div>
        </div>
      </div>

      <!-- Mobile nav -->
      <nav class="flex items-center border-t border-border md:hidden">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-all duration-200"
          :class="
            isActive(item.to)
              ? 'bg-primary/5 text-primary'
              : 'text-muted-foreground hover:text-foreground'
          "
        >
          <component :is="item.icon" class="h-5 w-5" />
          {{ item.label }}
        </RouterLink>
      </nav>
    </header>

    <!-- Content -->
    <main class="flex-1 overflow-y-auto bg-background p-6">
      <RouterView v-slot="{ Component, route: matchedRoute }">
        <component :is="Component" :key="matchedRoute.fullPath" />
      </RouterView>
    </main>
  </div>
</template>
