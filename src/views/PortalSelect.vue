<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore, type PortalType } from '@/stores/auth'
import {
  LayoutDashboard,
  Wallet,
  Users,
  GraduationCap,
  UserPlus,
  ArrowRight,
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
  route: string
}

const portals: PortalCard[] = [
  {
    id: 'executive',
    title: 'Executive Dashboard',
    subtitle: 'MD / CFO Portal',
    description: 'Real-time metrics, revenue tracking, campus performance, and strategic oversight across all branches.',
    icon: LayoutDashboard,
    color: '#1B4D3E',
    route: '/executive',
  },
  {
    id: 'finance',
    title: 'Finance & Operations',
    subtitle: 'Finance Team Portal',
    description: 'M-Pesa reconciliation, student billing, invoice management, and arrears follow-up workflows.',
    icon: Wallet,
    color: '#1E3A5F',
    route: '/finance',
  },
  {
    id: 'parent',
    title: 'Parent App',
    subtitle: 'Mobile-First Experience',
    description: 'Child activity updates, M-Pesa payments, learning progress tracking, and school communication.',
    icon: Users,
    color: '#7C3AED',
    route: '/parent',
  },
  {
    id: 'teacher',
    title: 'Teacher Interface',
    subtitle: 'Classroom Management',
    description: 'Attendance logging, milestone tracking, incident reports, and parent communication tools.',
    icon: GraduationCap,
    color: '#0891B2',
    route: '/teacher',
  },
  {
    id: 'admissions',
    title: 'Admissions & HR',
    subtitle: 'Growth & People',
    description: 'Admissions pipeline, tour scheduling, staff roster, and leave management workflows.',
    icon: UserPlus,
    color: '#C2410C',
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
    <header class="border-b border-border bg-white/80 backdrop-blur-md sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span class="text-white font-bold text-lg">K</span>
          </div>
          <div>
            <h1 class="text-lg font-bold text-foreground tracking-tight">Konza Learning Centre</h1>
            <p class="text-xs text-muted-foreground">Digital School Management System</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <main class="flex-1 flex items-center justify-center px-6 py-16">
      <div class="max-w-6xl w-full">
        <!-- Hero text -->
        <div class="text-center mb-14">
          <div class="inline-flex items-center gap-2 bg-primary/5 text-primary text-sm font-medium px-4 py-2 rounded-full mb-6 border border-primary/10">
            <span class="w-2 h-2 bg-primary rounded-full"></span>
            Premium Early Years Education Technology
          </div>
          <h2 class="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
            Select Your <span class="text-primary">Portal</span>
          </h2>
          <p class="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Choose a user role to explore the full platform experience.
          </p>
        </div>

        <!-- Portal Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          <button
            v-for="portal in portals"
            :key="portal.id"
            @click="selectPortal(portal)"
            :class="[
              'group relative bg-white rounded-xl border border-border p-6 text-left',
              'transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5',
              'focus:outline-none focus:ring-2 focus:ring-primary/20',
            ]"
          >
            <!-- Icon -->
            <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110" :style="{ backgroundColor: portal.color + '15' }">
              <component :is="portal.icon" class="w-6 h-6" :style="{ color: portal.color }" />
            </div>

            <!-- Content -->
            <h3 class="text-lg font-semibold text-foreground mb-1 tracking-tight">{{ portal.title }}</h3>
            <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">{{ portal.subtitle }}</p>
            <p class="text-sm text-muted-foreground leading-relaxed mb-5">{{ portal.description }}</p>

            <!-- Enter button -->
            <div class="flex items-center gap-2 text-sm font-semibold" :style="{ color: portal.color }">
              <span>Enter Portal</span>
              <ArrowRight class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </div>
          </button>
        </div>

        <!-- Footer -->
        <div class="text-center mt-16">
          <div class="inline-flex items-center gap-6 text-xs text-muted-foreground">
            <span>2 Campuses</span>
            <span class="w-1 h-1 bg-border rounded-full"></span>
            <span>170 Students</span>
            <span class="w-1 h-1 bg-border rounded-full"></span>
            <span>30 Staff</span>
          </div>
          <p class="text-xs text-muted-foreground mt-3">
            &copy; 2026 Konza Learning Centre.
          </p>
        </div>
      </div>
    </main>
  </div>
</template>
