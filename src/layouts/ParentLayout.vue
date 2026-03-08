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
  <div class="mx-auto flex h-screen max-w-none flex-col overflow-hidden lg:max-w-lg">
    <!-- Top header -->
    <header class="flex h-14 items-center justify-between border-b border-border bg-white/95 px-4 backdrop-blur-sm">
      <div class="flex items-center gap-2">
        <div
          class="flex h-8 w-8 items-center justify-center rounded-lg bg-parent text-sm font-bold text-white"
        >
          K
        </div>
      </div>
      <div class="text-center">
        <p class="text-sm font-semibold tracking-tight text-foreground">Amani Muthoni</p>
        <p class="text-xs text-muted-foreground">Butterfly Class</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Bell class="h-5 w-5" />
          <span class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-white" />
        </button>
        <div
          class="flex h-8 w-8 items-center justify-center rounded-full bg-parent text-xs font-semibold text-white ring-2 ring-border"
        >
          {{ userInitials }}
        </div>
      </div>
    </header>

    <!-- Content area -->
    <main class="flex-1 overflow-y-auto bg-background p-5">
      <RouterView />
    </main>

    <!-- Bottom tab bar -->
    <nav class="flex h-16 items-stretch border-t border-border bg-white/95 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)] backdrop-blur-sm">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors"
        :class="
          isActive(tab.to)
            ? 'text-parent'
            : 'text-muted-foreground hover:text-foreground'
        "
      >
        <!-- Active dot indicator -->
        <span
          class="mb-0.5 h-1 w-1 rounded-full transition-all duration-200"
          :class="isActive(tab.to) ? 'bg-parent' : 'bg-transparent'"
        />
        <component
          :is="tab.icon"
          class="h-5 w-5 transition-colors duration-200"
          :class="isActive(tab.to) ? 'text-parent' : ''"
        />
        {{ tab.label }}
      </RouterLink>
    </nav>
  </div>
</template>
