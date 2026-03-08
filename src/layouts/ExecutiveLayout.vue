<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  AlertTriangle,
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
  { label: 'Command Dashboard', to: '/executive', icon: LayoutDashboard },
  { label: 'Campus Performance', to: '/executive/campus-performance', icon: Building2 },
  { label: 'Revenue Forecasting', to: '/executive/revenue-forecasting', icon: TrendingUp },
  { label: 'Arrears Aging', to: '/executive/arrears-aging', icon: AlertTriangle },
]
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
        'fixed inset-y-0 left-0 z-40 flex w-64 flex-col shadow-xl shadow-black/10 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
      style="background: linear-gradient(180deg, #1B4D3E 0%, #143D31 100%)"
    >
      <!-- Logo -->
      <div class="px-5 pb-4 pt-6">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 font-bold text-white ring-1 ring-white/20 backdrop-blur-sm">
            K
          </div>
          <span class="text-lg font-semibold tracking-tight text-white">Konza Learning</span>
        </div>
        <div class="mt-4 border-b border-white/10" />
      </div>

      <!-- Nav items -->
      <nav class="flex-1 space-y-1 px-3 py-2">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-white/60 transition-all duration-200 hover:bg-white/[0.08] hover:text-white"
          active-class="!bg-white/[0.12] !text-white shadow-sm shadow-black/10"
          @click="sidebarOpen = false"
        >
          <span
            class="absolute left-0 h-6 w-[3px] rounded-r-full bg-emerald-400 opacity-0 transition-opacity duration-200"
            :class="{ '!opacity-100': $route.path === item.to || (item.to !== '/executive' && $route.path.startsWith(item.to)) || (item.to === '/executive' && $route.path === '/executive') }"
          />
          <component :is="item.icon" class="h-[18px] w-[18px] shrink-0" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <!-- Back to portal -->
      <div class="px-3 pb-5 pt-2">
        <div class="mb-3 border-t border-white/10" />
        <RouterLink
          to="/"
          class="group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-white/50 transition-all duration-200 hover:bg-white/[0.08] hover:text-white"
        >
          <ArrowLeft class="h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Back to Portal
        </RouterLink>
      </div>
    </aside>

    <!-- Main area -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Top bar -->
      <header class="flex h-16 items-center justify-between border-b border-border/40 bg-white/95 px-4 backdrop-blur-sm lg:px-6">
        <div class="flex items-center gap-3">
          <button
            class="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            @click="sidebarOpen = !sidebarOpen"
          >
            <Menu v-if="!sidebarOpen" class="h-5 w-5" />
            <X v-else class="h-5 w-5" />
          </button>
          <h1 class="text-lg font-semibold tracking-tight text-foreground lg:hidden">Dashboard</h1>
        </div>
        <div class="flex items-center gap-3">
          <button class="relative rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Bell class="h-5 w-5" />
            <span class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
          <div
            class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white ring-2 ring-white/20"
            style="background-color: #1B4D3E"
          >
            {{ userInitials }}
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-y-auto bg-background p-6 lg:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
