<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import {
  Home,
  Wallet,
  TrendingUp,
  MessageCircle,
  Bell,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()

const userInitials = computed(() => auth.currentUser.avatar)

const tabs = [
  { label: 'Home', to: '/parent', icon: Home },
  { label: 'Payments', to: '/parent/payments', icon: Wallet },
  { label: 'Progress', to: '/parent/progress', icon: TrendingUp },
  { label: 'Messages', to: '/parent/messages', icon: MessageCircle },
]

function isActive(to: string): boolean {
  if (to === '/parent') {
    return route.path === '/parent'
  }
  return route.path.startsWith(to)
}
</script>

<template>
  <div class="mx-auto flex h-screen max-w-lg flex-col overflow-hidden">
    <!-- Top header -->
    <header class="flex h-14 items-center justify-between border-b bg-white px-4">
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold text-white">
          K
        </div>
      </div>
      <div class="text-center">
        <p class="text-sm font-semibold text-gray-900">Amani Muthoni</p>
        <p class="text-xs text-gray-500">Butterfly Class</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <Bell class="h-5 w-5" />
          <span class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div
          class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
          style="background-color: #7C3AED"
        >
          {{ userInitials }}
        </div>
      </div>
    </header>

    <!-- Content area -->
    <main class="flex-1 overflow-y-auto bg-gray-50 p-4">
      <RouterView />
    </main>

    <!-- Bottom tab bar -->
    <nav class="flex h-16 items-stretch border-t bg-white">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors"
        :class="
          isActive(tab.to)
            ? 'text-violet-600'
            : 'text-gray-400 hover:text-gray-600'
        "
      >
        <component
          :is="tab.icon"
          class="h-5 w-5"
          :class="isActive(tab.to) ? 'text-violet-600' : ''"
        />
        {{ tab.label }}
      </RouterLink>
    </nav>
  </div>
</template>
