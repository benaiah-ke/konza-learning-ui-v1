<script setup lang="ts">
import { computed } from 'vue'
import {
  Clock,
  CheckCircle2,
  CalendarDays,
  UserMinus,
  Check,
  X,
  Plus,
} from 'lucide-vue-next'

import StatCard from '@/components/shared/StatCard.vue'
import DataTable from '@/components/shared/DataTable.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { useStaffStore } from '@/stores/staff'

const staffStore = useStaffStore()

// ── Stats ───────────────────────────────────────────────────
const pendingCount = computed(() => staffStore.pendingLeaveRequests.length)

const approvedThisMonth = computed(() =>
  staffStore.leaveRequests.filter((lr) => {
    if (lr.status !== 'approved') return false
    const start = new Date(lr.startDate)
    return start.getMonth() === 2 && start.getFullYear() === 2026
  }).length,
)

const totalLeaveDays = computed(() =>
  staffStore.leaveRequests
    .filter((lr) => lr.status === 'approved')
    .reduce((sum, lr) => sum + lr.days, 0),
)

const staffOnLeaveToday = computed(() =>
  staffStore.staff.filter((s) => s.status === 'on-leave').length,
)

// ── Table Columns ───────────────────────────────────────────
const columns = [
  { key: 'staffName', label: 'Staff Name' },
  { key: 'role', label: 'Role' },
  { key: 'leaveType', label: 'Leave Type', align: 'center' as const },
  { key: 'startDate', label: 'Start Date' },
  { key: 'endDate', label: 'End Date' },
  { key: 'days', label: 'Days', align: 'center' as const },
  { key: 'status', label: 'Status', align: 'center' as const },
  { key: 'actions', label: 'Actions', align: 'center' as const },
]

// ── Leave Type Status Map ───────────────────────────────────
const leaveTypeStatus: Record<string, 'info' | 'warning' | 'success' | 'neutral'> = {
  annual: 'info',
  sick: 'warning',
  maternity: 'success',
  paternity: 'success',
  personal: 'neutral',
}

const leaveTypeLabel: Record<string, string> = {
  annual: 'Annual',
  sick: 'Sick',
  maternity: 'Maternity',
  paternity: 'Paternity',
  personal: 'Personal',
}

const requestStatusMap: Record<string, 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  declined: 'danger',
}

const requestStatusLabel: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  declined: 'Declined',
}

// ── Table Data ──────────────────────────────────────────────
const tableData = computed(() => {
  return staffStore.leaveRequests
    .map((lr) => {
      const staff = staffStore.getStaffById(lr.staffId)
      return {
        id: lr.id,
        staffName: staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown',
        role: staff?.role ?? 'N/A',
        leaveType: lr.type,
        startDate: lr.startDate,
        endDate: lr.endDate,
        days: lr.days,
        status: lr.status,
        reason: lr.reason,
      }
    })
    .sort((a, b) => {
      // Pending first, then by start date
      if (a.status === 'pending' && b.status !== 'pending') return -1
      if (a.status !== 'pending' && b.status === 'pending') return 1
      return a.startDate.localeCompare(b.startDate)
    })
})

// ── Leave Calendar Data ─────────────────────────────────────
// Simple visualization of approved/pending leave for March 2026
const leaveCalendarStaff = computed(() => {
  const marchStart = new Date(2026, 2, 1)
  const marchEnd = new Date(2026, 2, 31)

  const relevantRequests = staffStore.leaveRequests.filter((lr) => {
    if (lr.status === 'declined') return false
    const start = new Date(lr.startDate)
    const end = new Date(lr.endDate)
    return start <= marchEnd && end >= marchStart
  })

  return relevantRequests.map((lr) => {
    const staff = staffStore.getStaffById(lr.staffId)
    const start = new Date(lr.startDate)
    const end = new Date(lr.endDate)

    // Calculate which March days are covered
    const days: number[] = []
    for (let d = 1; d <= 31; d++) {
      const current = new Date(2026, 2, d)
      if (current >= start && current <= end) {
        days.push(d)
      }
    }

    return {
      id: lr.id,
      staffName: staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown',
      type: lr.type,
      status: lr.status,
      days,
    }
  })
})

const marchDays = Array.from({ length: 31 }, (_, i) => i + 1)

// ── Helpers ─────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function handleApprove(id: string) {
  staffStore.approveLeave(id)
}

function handleDecline(id: string) {
  staffStore.declineLeave(id)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-foreground">Leave Management</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Submit, approve, and track staff leave requests
        </p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-[#C2410C] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#C2410C]/90"
        disabled
      >
        <Plus class="h-4 w-4" />
        New Request
      </button>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Pending Requests"
        :value="pendingCount.toString()"
        :icon="Clock"
        icon-bg="bg-warning/10"
        icon-color="text-warning"
      />
      <StatCard
        label="Approved (March)"
        :value="approvedThisMonth.toString()"
        :icon="CheckCircle2"
        icon-bg="bg-success/10"
        icon-color="text-success"
      />
      <StatCard
        label="Total Leave Days Used"
        :value="totalLeaveDays.toString()"
        :icon="CalendarDays"
        icon-bg="bg-[#C2410C]/10"
        icon-color="text-[#C2410C]"
      />
      <StatCard
        label="Staff on Leave Today"
        :value="staffOnLeaveToday.toString()"
        :icon="UserMinus"
        icon-bg="bg-info/10"
        icon-color="text-info"
      />
    </div>

    <!-- Leave Requests Table -->
    <div class="card p-6">
      <div class="mb-5">
        <h3 class="font-semibold tracking-tight text-foreground">Leave Requests</h3>
        <p class="mt-0.5 text-sm text-muted-foreground">
          {{ tableData.length }} total requests &middot; {{ pendingCount }} pending review
        </p>
      </div>

      <DataTable :columns="columns" :data="tableData">
        <template #cell-staffName="{ value }">
          <span class="font-medium text-foreground">{{ value }}</span>
        </template>

        <template #cell-role="{ value }">
          <span class="text-sm text-muted-foreground">{{ value }}</span>
        </template>

        <template #cell-leaveType="{ row }">
          <StatusBadge
            :status="leaveTypeStatus[row.leaveType] ?? 'neutral'"
            :label="leaveTypeLabel[row.leaveType] ?? row.leaveType"
            size="sm"
          />
        </template>

        <template #cell-startDate="{ value }">
          <span class="text-sm text-foreground">{{ formatDate(value) }}</span>
        </template>

        <template #cell-endDate="{ value }">
          <span class="text-sm text-foreground">{{ formatDate(value) }}</span>
        </template>

        <template #cell-days="{ value }">
          <span class="text-sm font-semibold tracking-tight text-foreground">{{ value }}</span>
        </template>

        <template #cell-status="{ row }">
          <StatusBadge
            :status="requestStatusMap[row.status] ?? 'neutral'"
            :label="requestStatusLabel[row.status] ?? row.status"
            size="sm"
          />
        </template>

        <template #cell-actions="{ row }">
          <div v-if="row.status === 'pending'" class="flex items-center justify-center gap-2">
            <button
              class="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-success/10 text-success transition-all duration-200 hover:bg-success/20"
              title="Approve"
              @click="handleApprove(row.id)"
            >
              <Check class="h-4 w-4" />
            </button>
            <button
              class="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-danger/10 text-danger transition-all duration-200 hover:bg-danger/20"
              title="Decline"
              @click="handleDecline(row.id)"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
          <span v-else class="text-sm text-muted-foreground">--</span>
        </template>
      </DataTable>
    </div>

    <!-- Leave Calendar Visualization -->
    <div class="card p-6">
      <div class="mb-5">
        <h3 class="font-semibold tracking-tight text-foreground">Leave Calendar - March 2026</h3>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Staff leave overview for the current month
        </p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[800px]">
          <thead>
            <tr>
              <th class="sticky left-0 z-10 bg-white px-3 py-2 text-left text-sm font-medium text-muted-foreground uppercase tracking-wide min-w-[160px]">
                Staff
              </th>
              <th
                v-for="day in marchDays"
                :key="day"
                :class="[
                  'px-0 py-2 text-center text-sm font-medium min-w-[28px]',
                  day === 8 ? 'text-info font-bold' : 'text-muted-foreground',
                ]"
              >
                {{ day }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="entry in leaveCalendarStaff"
              :key="entry.id"
              class="border-t border-border"
            >
              <td class="sticky left-0 z-10 bg-white px-3 py-2">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-foreground whitespace-nowrap">
                    {{ entry.staffName }}
                  </span>
                  <StatusBadge
                    :status="leaveTypeStatus[entry.type] ?? 'neutral'"
                    :label="leaveTypeLabel[entry.type] ?? entry.type"
                    size="sm"
                  />
                </div>
              </td>
              <td
                v-for="day in marchDays"
                :key="day"
                class="px-0 py-2 text-center"
              >
                <div
                  v-if="entry.days.includes(day)"
                  :class="[
                    'mx-auto h-5 w-5 rounded-md transition-all duration-200',
                    entry.status === 'approved' ? 'bg-warning-light' : 'bg-warning/20',
                  ]"
                  :title="`${entry.staffName} - ${leaveTypeLabel[entry.type]} (${entry.status})`"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Legend -->
      <div class="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
        <span class="inline-flex items-center gap-1.5">
          <span class="inline-block h-3 w-3 rounded-md bg-warning-light"></span>
          Approved Leave
        </span>
        <span class="inline-flex items-center gap-1.5">
          <span class="inline-block h-3 w-3 rounded-md bg-warning/20"></span>
          Pending Approval
        </span>
        <span class="inline-flex items-center gap-1.5">
          <span class="inline-block h-3 w-5 rounded-md bg-info/20"></span>
          Today (8th)
        </span>
      </div>
    </div>
  </div>
</template>
