<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import {
  ArrowLeftRight,
  BookOpen,
  Receipt,
  AlertCircle,
  Bell,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()
const sidebarOpen = ref(false)

const pageTitle = computed(() => (route.meta?.title as string) ?? 'Dashboard')
const userInitials = computed(() => auth.currentUser.avatar)

const navItems = [
  { label: 'Reconciliation Hub', to: '/finance', icon: ArrowLeftRight },
  { label: 'Student Ledger', to: '/finance/student-ledger', icon: BookOpen },
  { label: 'Billing & Invoices', to: '/finance/billing', icon: Receipt },
  { label: 'Arrears Management', to: '/finance/arrears', icon: AlertCircle },
]
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-30 bg-black/50 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-40 flex w-60 flex-col transition-transform duration-200 lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
      style="background-color: #1E3A5F"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-5 py-6">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 font-bold text-white">
          K
        </div>
        <span class="text-lg font-semibold text-white">Konza Learning</span>
      </div>

      <!-- Nav items -->
      <nav class="flex-1 space-y-1 px-3 py-4">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          active-class="!bg-white/15 !text-white"
          @click="sidebarOpen = false"
        >
          <component :is="item.icon" class="h-5 w-5 shrink-0" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <!-- Back to portal -->
      <div class="px-3 py-4">
        <RouterLink
          to="/"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft class="h-5 w-5 shrink-0" />
          Back to Portal
        </RouterLink>
      </div>
    </aside>

    <!-- Main area -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Top bar -->
      <header class="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
        <div class="flex items-center gap-3">
          <button
            class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            @click="sidebarOpen = !sidebarOpen"
          >
            <Menu v-if="!sidebarOpen" class="h-5 w-5" />
            <X v-else class="h-5 w-5" />
          </button>
          <h1 class="text-lg font-semibold text-gray-900">{{ pageTitle }}</h1>
        </div>
        <div class="flex items-center gap-4">
          <button class="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
            <Bell class="h-5 w-5" />
            <span class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <div
            class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
            style="background-color: #1E3A5F"
          >
            {{ userInitials }}
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-y-auto bg-gray-50 p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
