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
  Sparkles,
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
  gradient: string
  borderHover: string
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
    gradient: 'from-[#1B4D3E] to-[#2D7A5F]',
    borderHover: 'hover:border-[#1B4D3E]/30',
    route: '/executive',
  },
  {
    id: 'finance',
    title: 'Finance & Operations',
    subtitle: 'Finance Team Portal',
    description: 'M-Pesa reconciliation, student billing, invoice management, and arrears follow-up workflows.',
    icon: Wallet,
    color: '#1E3A5F',
    gradient: 'from-[#1E3A5F] to-[#2563EB]',
    borderHover: 'hover:border-[#1E3A5F]/30',
    route: '/finance',
  },
  {
    id: 'parent',
    title: 'Parent App',
    subtitle: 'Mobile-First Experience',
    description: 'Child activity updates, M-Pesa payments, learning progress tracking, and school communication.',
    icon: Users,
    color: '#7C3AED',
    gradient: 'from-[#7C3AED] to-[#A78BFA]',
    borderHover: 'hover:border-[#7C3AED]/30',
    route: '/parent',
  },
  {
    id: 'teacher',
    title: 'Teacher Interface',
    subtitle: 'Classroom Management',
    description: 'Attendance logging, milestone tracking, incident reports, and parent communication tools.',
    icon: GraduationCap,
    color: '#0891B2',
    gradient: 'from-[#0891B2] to-[#22D3EE]',
    borderHover: 'hover:border-[#0891B2]/30',
    route: '/teacher',
  },
  {
    id: 'admissions',
    title: 'Admissions & HR',
    subtitle: 'Growth & People',
    description: 'Admissions pipeline, tour scheduling, staff roster, and leave management workflows.',
    icon: UserPlus,
    color: '#C2410C',
    gradient: 'from-[#C2410C] to-[#F97316]',
    borderHover: 'hover:border-[#C2410C]/30',
    route: '/admin',
  },
]

function selectPortal(portal: PortalCard) {
  auth.switchPortal(portal.id)
  router.push(portal.route)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex flex-col">
    <!-- Header -->
    <header class="border-b border-border/60 bg-white/80 backdrop-blur-md sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span class="text-white font-bold text-lg">K</span>
          </div>
          <div>
            <h1 class="text-lg font-bold text-foreground tracking-tight">Konza Learning Centre</h1>
            <p class="text-xs text-muted-foreground">Digital School Management System</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <Sparkles class="w-4 h-4 text-secondary" />
          <span class="text-xs font-semibold text-muted-foreground bg-secondary/10 text-secondary px-3 py-1.5 rounded-full border border-secondary/20">Demo Platform</span>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <main class="flex-1 flex items-center justify-center px-6 py-16">
      <div class="max-w-6xl w-full">
        <!-- Hero text -->
        <div class="text-center mb-14">
          <div class="inline-flex items-center gap-2 bg-primary/5 text-primary text-sm font-medium px-4 py-2 rounded-full mb-6 border border-primary/10">
            <span class="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            Premium Early Years Education Technology
          </div>
          <h2 class="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
            Select Your <span class="gradient-text">Portal</span>
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
              'group relative bg-white rounded-2xl border border-border/60 p-6 text-left',
              'transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1',
              portal.borderHover,
              'focus:outline-none focus:ring-2 focus:ring-primary/20',
              'overflow-hidden'
            ]"
          >
            <!-- Top gradient accent line -->
            <div :class="['absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300', portal.gradient]" />

            <!-- Icon -->
            <div
              :class="['w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-gradient-to-br shadow-lg transition-transform duration-300 group-hover:scale-110', portal.gradient]"
            >
              <component :is="portal.icon" class="w-6 h-6 text-white" />
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
          <p class="text-xs text-muted-foreground/60 mt-3">
            All data shown is for demonstration purposes only. &copy; 2026 Konza Learning Centre.
          </p>
        </div>
      </div>
    </main>
  </div>
</template>
