<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import {
  LayoutGrid,
  Calendar,
  Users,
  CalendarOff,
  Banknote,
  Bell,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()
const sidebarOpen = ref(false)

const userInitials = computed(() => auth.currentUser.avatar)

const navItems = [
  { label: 'Admissions Pipeline', to: '/admin', icon: LayoutGrid },
  { label: 'Tour Scheduling', to: '/admin/tours', icon: Calendar },
  { label: 'Staff Roster', to: '/admin/staff', icon: Users },
  { label: 'Leave Management', to: '/admin/leave', icon: CalendarOff },
  { label: 'Payroll', to: '/admin/payroll', icon: Banknote },
]

function isActive(to: string): boolean {
  if (to === '/admin') return route.path === '/admin'
  return route.path.startsWith(to)
}
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col shadow-xl shadow-black/10 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
      style="background: linear-gradient(180deg, #C2410C 0%, #9A3309 100%)"
    >
      <!-- Logo -->
      <div class="px-6 py-6">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 font-bold text-white ring-1 ring-white/20 backdrop-blur-sm">
            K
          </div>
          <span class="text-lg font-bold tracking-tight text-white">Konza Learning</span>
        </div>
        <div class="mt-5 border-b border-white/10" />
      </div>

      <!-- Nav items -->
      <nav class="flex-1 space-y-1 px-4 py-4">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
            isActive(item.to)
              ? 'bg-white/[0.15] text-white shadow-sm shadow-black/10'
              : 'text-white/60 hover:bg-white/[0.08] hover:text-white',
          ]"
          @click="sidebarOpen = false"
        >
          <component :is="item.icon" class="h-5 w-5 shrink-0" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <!-- Back to portal -->
      <div class="px-4 pb-6">
        <div class="mb-3 border-t border-white/10" />
        <RouterLink
          to="/"
          class="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/50 transition-all duration-200 hover:bg-white/[0.08] hover:text-white"
        >
          <ArrowLeft class="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Back to Portal
        </RouterLink>
      </div>
    </aside>

    <!-- Main area -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Top bar -->
      <header class="flex h-16 items-center justify-between border-b border-border bg-white/95 px-6 backdrop-blur-sm lg:px-8">
        <div class="flex items-center gap-3">
          <button
            class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            @click="sidebarOpen = !sidebarOpen"
          >
            <Menu v-if="!sidebarOpen" class="h-5 w-5" />
            <X v-else class="h-5 w-5" />
          </button>
          <h1 class="text-lg font-semibold tracking-tight text-foreground lg:hidden">Dashboard</h1>
        </div>
        <div class="flex items-center gap-3">
          <button class="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Bell class="h-5 w-5" />
            <span class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-white" />
          </button>
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full bg-admissions text-sm font-semibold text-white ring-2 ring-border"
          >
            {{ userInitials }}
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-y-auto bg-background p-6 lg:p-8">
        <RouterView v-slot="{ Component, route: matchedRoute }">
          <component :is="Component" :key="matchedRoute.path" />
        </RouterView>
      </main>
    </div>
  </div>
</template>
