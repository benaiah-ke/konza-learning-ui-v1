import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { staff as staffData } from '@/data/staff'
import { leaveRequests as leaveData } from '@/data/admissions'
import { payrollRecords as payrollData } from '@/data/payroll'
import type { StaffMember, LeaveRequest, PayrollRecord } from '@/types'

export const useStaffStore = defineStore('staff', () => {
  const staff = ref<StaffMember[]>([...staffData])
  const leaveRequests = ref<LeaveRequest[]>([...leaveData])
  const payrollRecords = ref<PayrollRecord[]>([...payrollData])

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

  const getPayrollByMonth = computed(() => {
    return (month: string) => payrollRecords.value.filter((p) => p.month === month)
  })

  const totalPayrollCost = computed(() =>
    payrollRecords.value.reduce((sum, p) => sum + p.netPay, 0),
  )

  const payrollByMonth = computed(() => {
    const grouped: Record<string, { total: number; count: number }> = {}
    for (const p of payrollRecords.value) {
      const entry = (grouped[p.month] ??= { total: 0, count: 0 })
      entry.total += p.netPay
      entry.count++
    }
    return grouped
  })

  const pendingPayroll = computed(() =>
    payrollRecords.value.filter((p) => p.status === 'pending'),
  )

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

  function addStaff(member: StaffMember) {
    staff.value.push(member)
  }

  function updateStaff(id: string, updates: Partial<StaffMember>) {
    const member = staff.value.find((s) => s.id === id)
    if (member) Object.assign(member, updates)
  }

  function deleteStaff(id: string) {
    const index = staff.value.findIndex((s) => s.id === id)
    if (index !== -1) staff.value.splice(index, 1)
  }

  function addLeaveRequest(request: LeaveRequest) {
    leaveRequests.value.push(request)
  }

  function addPayrollRecord(record: PayrollRecord) {
    payrollRecords.value.push(record)
  }

  function updatePayrollRecord(id: string, updates: Partial<PayrollRecord>) {
    const record = payrollRecords.value.find((p) => p.id === id)
    if (record) Object.assign(record, updates)
  }

  function approvePayroll(id: string) {
    const record = payrollRecords.value.find((p) => p.id === id)
    if (record) record.status = 'approved'
  }

  function markPayrollPaid(id: string) {
    const record = payrollRecords.value.find((p) => p.id === id)
    if (record) {
      record.status = 'paid'
      record.payDate = new Date().toISOString().slice(0, 10)
    }
  }

  return {
    staff,
    leaveRequests,
    payrollRecords,
    getStaffByCampus,
    activeStaff,
    pendingLeaveRequests,
    approvedLeaveRequests,
    getStaffById,
    getPayrollByMonth,
    totalPayrollCost,
    payrollByMonth,
    pendingPayroll,
    approveLeave,
    declineLeave,
    addStaff,
    updateStaff,
    deleteStaff,
    addLeaveRequest,
    addPayrollRecord,
    updatePayrollRecord,
    approvePayroll,
    markPayrollPaid,
  }
})
