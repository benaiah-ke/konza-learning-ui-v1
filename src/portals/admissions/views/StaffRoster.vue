<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import {
  Users,
  MapPin,
  UserMinus,
  Phone,
  Mail,
  Calendar,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-vue-next'

import StatCard from '@/components/shared/StatCard.vue'
import SearchInput from '@/components/shared/SearchInput.vue'
import AppModal from '@/components/shared/AppModal.vue'
import FormField from '@/components/shared/FormField.vue'
import FormSelect from '@/components/shared/FormSelect.vue'
import { useStaffStore } from '@/stores/staff'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { generateId } from '@/utils/generateId'
import { campuses } from '@/data/campuses'
import type { StaffMember } from '@/types'

const staffStore = useStaffStore()
const toast = useToast()
const { confirm } = useConfirm()

// ── CRUD Modal State ────────────────────────────────────────
const showStaffModal = ref(false)
const editingStaff = ref<StaffMember | null>(null)

const staffForm = reactive({
  firstName: '',
  lastName: '',
  role: '' as string,
  department: '' as string,
  campusId: '' as string,
  email: '',
  phone: '',
  joinDate: '',
})

const roleOptions = [
  { value: 'Lead Teacher', label: 'Lead Teacher' },
  { value: 'Assistant Teacher', label: 'Assistant Teacher' },
  { value: 'School Nurse', label: 'School Nurse' },
  { value: 'Campus Manager', label: 'Campus Manager' },
  { value: 'Cook', label: 'Cook' },
  { value: 'Driver', label: 'Driver' },
  { value: 'Security', label: 'Security' },
]

const departmentOptions = [
  { value: 'Teaching', label: 'Teaching' },
  { value: 'Administration', label: 'Administration' },
  { value: 'Health', label: 'Health' },
  { value: 'Catering', label: 'Catering' },
  { value: 'Transport', label: 'Transport' },
  { value: 'Security', label: 'Security' },
  { value: 'Facilities', label: 'Facilities' },
]

const campusOptions = campuses.map((c) => ({
  value: c.id,
  label: c.name.replace('Konza ', '').replace(' Campus', ''),
}))

function openNewStaffModal() {
  editingStaff.value = null
  staffForm.firstName = ''
  staffForm.lastName = ''
  staffForm.role = ''
  staffForm.department = ''
  staffForm.campusId = ''
  staffForm.email = ''
  staffForm.phone = ''
  staffForm.joinDate = ''
  showStaffModal.value = true
}

function openEditStaffModal(member: StaffMember) {
  editingStaff.value = member
  staffForm.firstName = member.firstName
  staffForm.lastName = member.lastName
  staffForm.role = member.role
  staffForm.department = member.department
  staffForm.campusId = member.campusId
  staffForm.email = member.email
  staffForm.phone = member.phone
  staffForm.joinDate = member.joinDate
  showStaffModal.value = true
}

function saveStaff() {
  if (!staffForm.firstName || !staffForm.lastName || !staffForm.role || !staffForm.department || !staffForm.campusId) return

  if (editingStaff.value) {
    staffStore.updateStaff(editingStaff.value.id, {
      firstName: staffForm.firstName,
      lastName: staffForm.lastName,
      role: staffForm.role,
      department: staffForm.department,
      campusId: staffForm.campusId,
      email: staffForm.email,
      phone: staffForm.phone,
      joinDate: staffForm.joinDate,
      photoInitials: `${staffForm.firstName[0]}${staffForm.lastName[0]}`.toUpperCase(),
    })
    toast.success('Staff member updated successfully')
  } else {
    const newMember: StaffMember = {
      id: generateId('staff'),
      firstName: staffForm.firstName,
      lastName: staffForm.lastName,
      role: staffForm.role,
      department: staffForm.department,
      campusId: staffForm.campusId,
      email: staffForm.email,
      phone: staffForm.phone,
      joinDate: staffForm.joinDate || new Date().toISOString().slice(0, 10),
      status: 'active',
      photoInitials: `${staffForm.firstName[0]}${staffForm.lastName[0]}`.toUpperCase(),
    }
    staffStore.addStaff(newMember)
    toast.success('Staff member added successfully')
  }

  showStaffModal.value = false
}

async function deleteStaffMember(member: StaffMember) {
  const ok = await confirm({
    title: 'Delete Staff Member',
    message: `Are you sure you want to delete ${member.firstName} ${member.lastName}? This action cannot be undone.`,
    variant: 'danger',
  })
  if (ok) {
    staffStore.deleteStaff(member.id)
    toast.success('Staff member deleted successfully')
  }
}

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
  'Lead Teacher': { bg: 'bg-primary/10', text: 'text-primary', avatarBg: 'bg-primary' },
  'Assistant Teacher': { bg: 'bg-success-light', text: 'text-success-foreground', avatarBg: 'bg-success' },
  'School Nurse': { bg: 'bg-danger-light', text: 'text-danger-foreground', avatarBg: 'bg-danger' },
  'Campus Manager': { bg: 'bg-muted', text: 'text-muted-foreground', avatarBg: 'bg-muted-foreground' },
  Cook: { bg: 'bg-warning-light', text: 'text-warning-foreground', avatarBg: 'bg-warning' },
  Driver: { bg: 'bg-info-light', text: 'text-info-foreground', avatarBg: 'bg-info' },
  Security: { bg: 'bg-muted', text: 'text-muted-foreground', avatarBg: 'bg-muted-foreground' },
}

function getRoleColor(role: string) {
  return roleColors[role] ?? { bg: 'bg-muted', text: 'text-muted-foreground', avatarBg: 'bg-muted-foreground' }
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
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-foreground">Staff Roster</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          View and manage staff across all campuses
        </p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-[#C2410C] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#C2410C]/90"
        @click="openNewStaffModal"
      >
        <Plus class="h-4 w-4" />
        Add Staff
      </button>
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
    <div class="card p-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          v-model="searchQuery"
          placeholder="Search staff by name, role, or department..."
          class="flex-1"
        />
        <select
          v-model="campusFilter"
          class="rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">All Campuses</option>
          <option v-for="campus in campuses" :key="campus.id" :value="campus.id">
            {{ campus.name.replace('Konza ', '').replace(' Campus', '') }}
          </option>
        </select>
        <select
          v-model="roleFilter"
          class="rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">All Roles</option>
          <option v-for="role in uniqueRoles" :key="role" :value="role">
            {{ role }}
          </option>
        </select>
      </div>
      <p class="mt-2 text-sm text-muted-foreground">
        Showing {{ filteredStaff.length }} of {{ totalStaff }} staff members
      </p>
    </div>

    <!-- Staff Grid -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="member in filteredStaff"
        :key="member.id"
        class="group card p-5 transition-all duration-200 hover:shadow-md hover:border-primary/30"
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
              <h4 class="text-sm font-semibold tracking-tight text-foreground truncate">
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
          <div class="text-sm text-muted-foreground">
            <span class="font-medium text-foreground">{{ member.department }}</span>
          </div>

          <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin class="h-3.5 w-3.5 shrink-0" />
            {{ getCampusName(member.campusId) }}
          </div>

          <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Phone class="h-3.5 w-3.5 shrink-0" />
            {{ member.phone }}
          </div>

          <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Mail class="h-3.5 w-3.5 shrink-0" />
            <span class="truncate">{{ member.email }}</span>
          </div>

          <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar class="h-3.5 w-3.5 shrink-0" />
            Joined {{ formatDate(member.joinDate) }}
          </div>

          <!-- Edit / Delete Actions -->
          <div class="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              class="inline-flex items-center gap-1.5 rounded-xl bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              @click="openEditStaffModal(member)"
            >
              <Pencil class="h-3 w-3" />
              Edit
            </button>
            <button
              class="inline-flex items-center gap-1.5 rounded-xl bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
              @click="deleteStaffMember(member)"
            >
              <Trash2 class="h-3 w-3" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredStaff.length === 0"
      class="flex flex-col items-center justify-center card py-16"
    >
      <Users class="h-10 w-10 text-muted-foreground/40 mb-3" />
      <p class="text-sm text-muted-foreground">No staff members match your filters</p>
      <button
        class="mt-3 text-sm font-medium text-primary transition-all duration-200 hover:underline"
        @click="searchQuery = ''; campusFilter = 'all'; roleFilter = 'all'"
      >
        Clear all filters
      </button>
    </div>

    <!-- Add / Edit Staff Modal -->
    <AppModal
      :open="showStaffModal"
      @update:open="showStaffModal = $event"
      :title="editingStaff ? 'Edit Staff Member' : 'Add Staff Member'"
      :subtitle="editingStaff ? 'Update staff member information' : 'Add a new staff member to the roster'"
      size="lg"
    >
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          v-model="staffForm.firstName"
          label="First Name"
          placeholder="Enter first name"
          required
        />
        <FormField
          v-model="staffForm.lastName"
          label="Last Name"
          placeholder="Enter last name"
          required
        />
        <FormSelect
          v-model="staffForm.role"
          label="Role"
          :options="roleOptions"
          placeholder="Select role..."
          required
        />
        <FormSelect
          v-model="staffForm.department"
          label="Department"
          :options="departmentOptions"
          placeholder="Select department..."
          required
        />
        <FormSelect
          v-model="staffForm.campusId"
          label="Campus"
          :options="campusOptions"
          placeholder="Select campus..."
          required
        />
        <FormField
          v-model="staffForm.email"
          label="Email"
          type="text"
          placeholder="staff@konza.ac.ke"
          required
        />
        <FormField
          v-model="staffForm.phone"
          label="Phone"
          placeholder="+254 7XX XXX XXX"
          required
        />
        <FormField
          v-model="staffForm.joinDate"
          label="Join Date"
          type="date"
        />
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <button
            class="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            @click="showStaffModal = false"
          >
            Cancel
          </button>
          <button
            class="rounded-xl bg-[#C2410C] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#C2410C]/90 disabled:opacity-50"
            :disabled="!staffForm.firstName || !staffForm.lastName || !staffForm.role || !staffForm.department || !staffForm.campusId"
            @click="saveStaff"
          >
            {{ editingStaff ? 'Update Staff' : 'Add Staff' }}
          </button>
        </div>
      </template>
    </AppModal>
  </div>
</template>
