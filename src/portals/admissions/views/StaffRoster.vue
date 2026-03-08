<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Users,
  MapPin,
  UserMinus,
  Phone,
  Mail,
  Calendar,
} from 'lucide-vue-next'

import StatCard from '@/components/shared/StatCard.vue'
import SearchInput from '@/components/shared/SearchInput.vue'
import { useStaffStore } from '@/stores/staff'
import { campuses } from '@/data/campuses'

const staffStore = useStaffStore()

// ── Search & Filters ────────────────────────────────────────
const searchQuery = ref('')
const campusFilter = ref('all')
const roleFilter = ref('all')

// ── Stats ───────────────────────────────────────────────────
const totalStaff = computed(() => staffStore.staff.length)

const karenStaff = computed(
  () => staffStore.staff.filter((s) => s.campusId === 'campus-karen').length,
)

const westlandsStaff = computed(
  () => staffStore.staff.filter((s) => s.campusId === 'campus-westlands').length,
)

const onLeaveCount = computed(
  () => staffStore.staff.filter((s) => s.status === 'on-leave').length,
)

// ── Unique roles for filter ─────────────────────────────────
const uniqueRoles = computed(() => {
  const roles = new Set(staffStore.staff.map((s) => s.role))
  return Array.from(roles).sort()
})

// ── Filtered Staff ──────────────────────────────────────────
const filteredStaff = computed(() => {
  let result = [...staffStore.staff]

  if (campusFilter.value !== 'all') {
    result = result.filter((s) => s.campusId === campusFilter.value)
  }

  if (roleFilter.value !== 'all') {
    result = result.filter((s) => s.role === roleFilter.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(
      (s) =>
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q),
    )
  }

  return result
})

// ── Role Color Map ──────────────────────────────────────────
const roleColors: Record<string, { bg: string; text: string; avatarBg: string }> = {
  'Lead Teacher': { bg: 'bg-blue-100', text: 'text-blue-700', avatarBg: 'bg-blue-500' },
  'Assistant Teacher': { bg: 'bg-teal-100', text: 'text-teal-700', avatarBg: 'bg-teal-500' },
  'School Nurse': { bg: 'bg-rose-100', text: 'text-rose-700', avatarBg: 'bg-rose-500' },
  'Campus Manager': { bg: 'bg-purple-100', text: 'text-purple-700', avatarBg: 'bg-purple-500' },
  Cook: { bg: 'bg-amber-100', text: 'text-amber-700', avatarBg: 'bg-amber-500' },
  Driver: { bg: 'bg-sky-100', text: 'text-sky-700', avatarBg: 'bg-sky-500' },
  Security: { bg: 'bg-gray-100', text: 'text-gray-700', avatarBg: 'bg-gray-500' },
}

function getRoleColor(role: string) {
  return roleColors[role] ?? { bg: 'bg-gray-100', text: 'text-gray-700', avatarBg: 'bg-gray-500' }
}

// ── Helpers ─────────────────────────────────────────────────
function getCampusName(campusId: string): string {
  const campus = campuses.find((c) => c.id === campusId)
  return campus ? campus.name.replace('Konza ', '').replace(' Campus', '') : campusId
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-foreground">Staff Roster</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        View and manage staff across all campuses
      </p>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Staff"
        :value="totalStaff.toString()"
        :icon="Users"
        icon-bg="bg-[#C2410C]/10"
        icon-color="text-[#C2410C]"
      />
      <StatCard
        label="Karen Campus"
        :value="karenStaff.toString()"
        :icon="MapPin"
        icon-bg="bg-primary/10"
        icon-color="text-primary"
      />
      <StatCard
        label="Westlands Campus"
        :value="westlandsStaff.toString()"
        :icon="MapPin"
        icon-bg="bg-info/10"
        icon-color="text-info"
      />
      <StatCard
        label="On Leave"
        :value="onLeaveCount.toString()"
        :icon="UserMinus"
        icon-bg="bg-warning/10"
        icon-color="text-warning"
      />
    </div>

    <!-- Search & Filters -->
    <div class="rounded-xl border border-border bg-card p-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          v-model="searchQuery"
          placeholder="Search staff by name, role, or department..."
          class="flex-1"
        />
        <select
          v-model="campusFilter"
          class="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-[#C2410C] focus:outline-none focus:ring-1 focus:ring-[#C2410C]"
        >
          <option value="all">All Campuses</option>
          <option v-for="campus in campuses" :key="campus.id" :value="campus.id">
            {{ campus.name.replace('Konza ', '').replace(' Campus', '') }}
          </option>
        </select>
        <select
          v-model="roleFilter"
          class="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-[#C2410C] focus:outline-none focus:ring-1 focus:ring-[#C2410C]"
        >
          <option value="all">All Roles</option>
          <option v-for="role in uniqueRoles" :key="role" :value="role">
            {{ role }}
          </option>
        </select>
      </div>
      <p class="mt-2 text-xs text-muted-foreground">
        Showing {{ filteredStaff.length }} of {{ totalStaff }} staff members
      </p>
    </div>

    <!-- Staff Grid -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="member in filteredStaff"
        :key="member.id"
        class="group rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md hover:border-[#C2410C]/30"
      >
        <!-- Top Row: Avatar + Name + Status -->
        <div class="flex items-start gap-4">
          <!-- Avatar -->
          <div
            :class="[
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white',
              getRoleColor(member.role).avatarBg,
            ]"
          >
            {{ member.photoInitials }}
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h4 class="text-sm font-semibold text-card-foreground truncate">
                {{ member.firstName }} {{ member.lastName }}
              </h4>
              <!-- Status dot -->
              <span
                :class="[
                  'inline-block h-2 w-2 shrink-0 rounded-full',
                  member.status === 'active' ? 'bg-success' : 'bg-warning',
                ]"
                :title="member.status === 'active' ? 'Active' : 'On Leave'"
              />
            </div>
            <!-- Role Badge -->
            <span
              :class="[
                'mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                getRoleColor(member.role).bg,
                getRoleColor(member.role).text,
              ]"
            >
              {{ member.role }}
            </span>
          </div>
        </div>

        <!-- Details -->
        <div class="mt-4 space-y-2 pl-16">
          <div class="text-xs text-muted-foreground">
            <span class="font-medium text-card-foreground">{{ member.department }}</span>
          </div>

          <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin class="h-3.5 w-3.5 shrink-0" />
            {{ getCampusName(member.campusId) }}
          </div>

          <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone class="h-3.5 w-3.5 shrink-0" />
            {{ member.phone }}
          </div>

          <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail class="h-3.5 w-3.5 shrink-0" />
            <span class="truncate">{{ member.email }}</span>
          </div>

          <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar class="h-3.5 w-3.5 shrink-0" />
            Joined {{ formatDate(member.joinDate) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredStaff.length === 0"
      class="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16"
    >
      <Users class="h-10 w-10 text-muted-foreground/40 mb-3" />
      <p class="text-sm text-muted-foreground">No staff members match your filters</p>
      <button
        class="mt-3 text-sm font-medium text-[#C2410C] hover:underline"
        @click="searchQuery = ''; campusFilter = 'all'; roleFilter = 'all'"
      >
        Clear all filters
      </button>
    </div>
  </div>
</template>
