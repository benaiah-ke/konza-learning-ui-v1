<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore, type PortalType } from '@/stores/auth'
import {
  LayoutDashboard,
  Wallet,
  Users,
  GraduationCap,
  UserPlus,
} from 'lucide-vue-next'
import { type Component } from 'vue'

const router = useRouter()
const auth = useAuthStore()

interface PortalCard {
  id: PortalType
  title: string
  subtitle: string
  description: string
  icon: Component
  color: string
  bgColor: string
  route: string
}

const portals: PortalCard[] = [
  {
    id: 'executive',
    title: 'Executive Dashboard',
    subtitle: 'MD / CFO Portal',
    description: 'Real-time metrics, revenue tracking, campus performance, and strategic oversight across all branches.',
    icon: LayoutDashboard,
    color: 'text-[#1B4D3E]',
    bgColor: 'bg-[#1B4D3E]/10',
    route: '/executive',
  },
  {
    id: 'finance',
    title: 'Finance & Operations',
    subtitle: 'Finance Team Portal',
    description: 'M-Pesa reconciliation, student billing, invoice management, and arrears follow-up workflows.',
    icon: Wallet,
    color: 'text-[#1E3A5F]',
    bgColor: 'bg-[#1E3A5F]/10',
    route: '/finance',
  },
  {
    id: 'parent',
    title: 'Parent App',
    subtitle: 'Mobile-First Experience',
    description: 'Child activity updates, M-Pesa payments, learning progress tracking, and school communication.',
    icon: Users,
    color: 'text-[#7C3AED]',
    bgColor: 'bg-[#7C3AED]/10',
    route: '/parent',
  },
  {
    id: 'teacher',
    title: 'Teacher Interface',
    subtitle: 'Classroom Management',
    description: 'Attendance logging, milestone tracking, incident reports, and parent communication tools.',
    icon: GraduationCap,
    color: 'text-[#0891B2]',
    bgColor: 'bg-[#0891B2]/10',
    route: '/teacher',
  },
  {
    id: 'admissions',
    title: 'Admissions & HR',
    subtitle: 'Growth & People',
    description: 'Admissions pipeline, tour scheduling, staff roster, and leave management workflows.',
    icon: UserPlus,
    color: 'text-[#C2410C]',
    bgColor: 'bg-[#C2410C]/10',
    route: '/admin',
  },
]

function selectPortal(portal: PortalCard) {
  auth.switchPortal(portal.id)
  router.push(portal.route)
}
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col">
    <!-- Header -->
    <header class="border-b border-border bg-white">
      <div class="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span class="text-white font-bold text-lg">K</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-foreground">Konza Learning Centre</h1>
            <p class="text-sm text-muted-foreground">Digital School Management System</p>
          </div>
        </div>
        <span class="text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full">Demo Platform</span>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex items-center justify-center px-6 py-12">
      <div class="max-w-6xl w-full">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-foreground mb-3">Select Your Portal</h2>
          <p class="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose a user role to explore the platform. Each portal is tailored to its user's needs.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            v-for="portal in portals"
            :key="portal.id"
            @click="selectPortal(portal)"
            class="group bg-white rounded-xl border border-border p-6 text-left transition-all duration-200 hover:shadow-lg hover:border-transparent hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <div :class="[portal.bgColor, 'w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110']">
              <component :is="portal.icon" :class="[portal.color, 'w-6 h-6']" />
            </div>
            <h3 class="text-lg font-semibold text-foreground mb-1">{{ portal.title }}</h3>
            <p class="text-sm font-medium text-muted-foreground mb-3">{{ portal.subtitle }}</p>
            <p class="text-sm text-muted-foreground leading-relaxed">{{ portal.description }}</p>
            <div class="mt-4 flex items-center gap-2 text-sm font-medium" :class="portal.color">
              <span>Enter Portal</span>
              <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        <div class="text-center mt-12">
          <p class="text-xs text-muted-foreground">
            All data shown is for demonstration purposes only. &copy; 2026 Konza Learning Centre.
          </p>
        </div>
      </div>
    </main>
  </div>
</template>
