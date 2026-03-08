import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { staff as staffData } from '@/data/staff'
import { leaveRequests as leaveData } from '@/data/admissions'
import type { StaffMember, LeaveRequest } from '@/types'

export const useStaffStore = defineStore('staff', () => {
  const staff = ref<StaffMember[]>([...staffData])
  const leaveRequests = ref<LeaveRequest[]>([...leaveData])

  // ── Computed ────────────────────────────────────────────────

  const getStaffByCampus = computed(() => {
    return (campusId: string) => staff.value.filter((s) => s.campusId === campusId)
  })

  const activeStaff = computed(() =>
    staff.value.filter((s) => s.status === 'active'),
  )

  const pendingLeaveRequests = computed(() =>
    leaveRequests.value.filter((lr) => lr.status === 'pending'),
  )

  const approvedLeaveRequests = computed(() =>
    leaveRequests.value.filter((lr) => lr.status === 'approved'),
  )

  const getStaffById = computed(() => {
    return (id: string) => staff.value.find((s) => s.id === id)
  })

  // ── Actions ─────────────────────────────────────────────────

  function approveLeave(id: string) {
    const request = leaveRequests.value.find((lr) => lr.id === id)
    if (request) {
      request.status = 'approved'
    }
  }

  function declineLeave(id: string) {
    const request = leaveRequests.value.find((lr) => lr.id === id)
    if (request) {
      request.status = 'declined'
    }
  }

  return {
    staff,
    leaveRequests,
    getStaffByCampus,
    activeStaff,
    pendingLeaveRequests,
    approvedLeaveRequests,
    getStaffById,
    approveLeave,
    declineLeave,
  }
})
