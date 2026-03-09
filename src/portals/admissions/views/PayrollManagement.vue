<script setup lang="ts">
import { computed, ref, reactive, watch } from 'vue'
import {
  DollarSign,
  Clock,
  CheckCircle2,
  TrendingUp,
  Plus,
  Pencil,
  ArrowRight,
  Check,
  Banknote,
} from 'lucide-vue-next'

import StatCard from '@/components/shared/StatCard.vue'
import DataTable from '@/components/shared/DataTable.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import SearchInput from '@/components/shared/SearchInput.vue'
import AppModal from '@/components/shared/AppModal.vue'
import FormField from '@/components/shared/FormField.vue'
import FormSelect from '@/components/shared/FormSelect.vue'
import { useStaffStore } from '@/stores/staff'
import { useToast } from '@/composables/useToast'
import { useCurrency } from '@/composables/useCurrency'
import { generateId } from '@/utils/generateId'
import { campuses } from '@/data/campuses'
import type { PayrollRecord } from '@/types'

const staffStore = useStaffStore()
const toast = useToast()
const { format } = useCurrency()

// ── Month Selector ──────────────────────────────────────────
const availableMonths = computed(() => {
  const months = new Set(staffStore.payrollRecords.map((p) => p.month))
  return Array.from(months).sort().reverse()
})

const selectedMonth = ref(availableMonths.value[0] ?? '2026-03')

function formatMonth(month: string): string {
  const [year, m] = month.split('-')
  const date = new Date(Number(year), Number(m) - 1)
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

// ── Stats ───────────────────────────────────────────────────
const monthRecords = computed(() =>
  staffStore.payrollRecords.filter((p) => p.month === selectedMonth.value),
)

const totalPayrollForMonth = computed(() =>
  monthRecords.value.reduce((sum, p) => sum + p.netPay, 0),
)

const pendingApprovalCount = computed(() =>
  monthRecords.value.filter((p) => p.status === 'pending').length,
)

const paidThisMonthCount = computed(() =>
  monthRecords.value.filter((p) => p.status === 'paid').length,
)

const averageNetPay = computed(() => {
  if (monthRecords.value.length === 0) return 0
  return Math.round(totalPayrollForMonth.value / monthRecords.value.length)
})

// ── Filters ─────────────────────────────────────────────────
const searchQuery = ref('')
const campusFilter = ref('all')
const statusFilter = ref('all')

const campusOptions = [
  { value: 'all', label: 'All Campuses' },
  ...campuses.map((c) => ({
    value: c.id,
    label: c.name.replace('Konza ', '').replace(' Campus', ''),
  })),
]

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' },
]

// ── Table Columns ───────────────────────────────────────────
const columns = [
  { key: 'staffName', label: 'Staff Name' },
  { key: 'role', label: 'Role' },
  { key: 'campus', label: 'Campus' },
  { key: 'basicSalary', label: 'Basic Salary', align: 'right' as const },
  { key: 'allowances', label: 'Allowances', align: 'right' as const },
  { key: 'deductions', label: 'Deductions', align: 'right' as const },
  { key: 'netPay', label: 'Net Pay', align: 'right' as const },
  { key: 'status', label: 'Status', align: 'center' as const },
  { key: 'actions', label: 'Actions', align: 'center' as const },
]

// ── Status Styles ───────────────────────────────────────────
const statusStyleMap: Record<string, 'neutral' | 'warning' | 'info' | 'success'> = {
  draft: 'neutral',
  pending: 'warning',
  approved: 'info',
  paid: 'success',
}

const statusLabelMap: Record<string, string> = {
  draft: 'Draft',
  pending: 'Pending',
  approved: 'Approved',
  paid: 'Paid',
}

// ── Helpers ─────────────────────────────────────────────────
function getCampusName(campusId: string): string {
  const campus = campuses.find((c) => c.id === campusId)
  return campus ? campus.name.replace('Konza ', '').replace(' Campus', '') : campusId
}

// ── Table Data ──────────────────────────────────────────────
const tableData = computed(() => {
  let records = monthRecords.value

  return records
    .map((record) => {
      const staff = staffStore.getStaffById(record.staffId)
      return {
        id: record.id,
        staffId: record.staffId,
        staffName: staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown',
        photoInitials: staff?.photoInitials ?? '??',
        role: staff?.role ?? 'N/A',
        campusId: staff?.campusId ?? '',
        campus: staff ? getCampusName(staff.campusId) : 'N/A',
        basicSalary: record.basicSalary,
        allowances: record.allowances,
        deductions: record.deductions,
        netPay: record.netPay,
        status: record.status,
      }
    })
    .filter((row) => {
      if (campusFilter.value !== 'all' && row.campusId !== campusFilter.value) return false
      if (statusFilter.value !== 'all' && row.status !== statusFilter.value) return false
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase()
        if (
          !row.staffName.toLowerCase().includes(q) &&
          !row.role.toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
    .sort((a, b) => {
      const order: Record<string, number> = { draft: 0, pending: 1, approved: 2, paid: 3 }
      return (order[a.status] ?? 4) - (order[b.status] ?? 4)
    })
})

// ── Actions ─────────────────────────────────────────────────
function submitPayroll(id: string) {
  staffStore.updatePayrollRecord(id, { status: 'pending' })
  toast.success('Payroll record submitted for approval')
}

function approvePayroll(id: string) {
  staffStore.approvePayroll(id)
  toast.success('Payroll record approved')
}

function markPaid(id: string) {
  staffStore.markPayrollPaid(id)
  toast.success('Payroll record marked as paid')
}

// ── Create / Edit Modal ─────────────────────────────────────
const showModal = ref(false)
const editingRecord = ref<PayrollRecord | null>(null)

const payrollForm = reactive({
  staffId: '' as string,
  month: selectedMonth.value,
  basicSalary: 0,
  allowances: 0,
  deductions: 0,
})

const computedNetPay = computed(
  () => payrollForm.basicSalary + payrollForm.allowances - payrollForm.deductions,
)

const staffOptions = computed(() =>
  staffStore.staff
    .filter((s) => s.status === 'active')
    .map((s) => ({
      value: s.id,
      label: `${s.firstName} ${s.lastName}`,
    })),
)

function openCreateModal() {
  editingRecord.value = null
  payrollForm.staffId = ''
  payrollForm.month = selectedMonth.value
  payrollForm.basicSalary = 0
  payrollForm.allowances = 0
  payrollForm.deductions = 0
  showModal.value = true
}

function openEditModal(row: Record<string, unknown>) {
  const record = staffStore.payrollRecords.find((p) => p.id === row.id)
  if (!record) return
  editingRecord.value = record
  payrollForm.staffId = record.staffId
  payrollForm.month = record.month
  payrollForm.basicSalary = record.basicSalary
  payrollForm.allowances = record.allowances
  payrollForm.deductions = record.deductions
  showModal.value = true
}

function savePayroll() {
  if (!payrollForm.staffId || !payrollForm.month || payrollForm.basicSalary <= 0) return

  if (editingRecord.value) {
    staffStore.updatePayrollRecord(editingRecord.value.id, {
      staffId: payrollForm.staffId,
      month: payrollForm.month,
      basicSalary: payrollForm.basicSalary,
      allowances: payrollForm.allowances,
      deductions: payrollForm.deductions,
      netPay: computedNetPay.value,
    })
    toast.success('Payroll record updated successfully')
  } else {
    const newRecord: PayrollRecord = {
      id: generateId('pay'),
      staffId: payrollForm.staffId,
      month: payrollForm.month,
      basicSalary: payrollForm.basicSalary,
      allowances: payrollForm.allowances,
      deductions: payrollForm.deductions,
      netPay: computedNetPay.value,
      status: 'draft',
    }
    staffStore.addPayrollRecord(newRecord)
    toast.success('Payroll record created successfully')
  }

  showModal.value = false
}

// Keep modal month in sync when selectedMonth changes
watch(selectedMonth, (newMonth) => {
  if (!showModal.value) {
    payrollForm.month = newMonth
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-foreground">Payroll Management</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Process, approve, and track staff payroll records
        </p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-[#C2410C] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#C2410C]/90"
        @click="openCreateModal"
      >
        <Plus class="h-4 w-4" />
        Generate Payroll
      </button>
    </div>

    <!-- Month Selector -->
    <div class="card p-4">
      <div class="flex items-center gap-3">
        <label class="text-sm font-medium text-muted-foreground">Payroll Month</label>
        <select
          v-model="selectedMonth"
          class="rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium text-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option v-for="month in availableMonths" :key="month" :value="month">
            {{ formatMonth(month) }}
          </option>
        </select>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Payroll"
        :value="format(totalPayrollForMonth)"
        :icon="DollarSign"
        icon-bg="bg-[#C2410C]/10"
        icon-color="text-[#C2410C]"
      />
      <StatCard
        label="Pending Approval"
        :value="pendingApprovalCount.toString()"
        :icon="Clock"
        icon-bg="bg-warning/10"
        icon-color="text-warning"
      />
      <StatCard
        label="Paid This Month"
        :value="paidThisMonthCount.toString()"
        :icon="CheckCircle2"
        icon-bg="bg-success/10"
        icon-color="text-success"
      />
      <StatCard
        label="Average Net Pay"
        :value="format(averageNetPay)"
        :icon="TrendingUp"
        icon-bg="bg-info/10"
        icon-color="text-info"
      />
    </div>

    <!-- Filters -->
    <div class="card p-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          v-model="searchQuery"
          placeholder="Search by staff name or role..."
          class="flex-1"
        />
        <select
          v-model="campusFilter"
          class="rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option v-for="opt in campusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <select
          v-model="statusFilter"
          class="rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      <p class="mt-2 text-sm text-muted-foreground">
        Showing {{ tableData.length }} of {{ monthRecords.length }} payroll records for
        {{ formatMonth(selectedMonth) }}
      </p>
    </div>

    <!-- Payroll Table -->
    <DataTable :columns="columns" :data="tableData">
      <template #cell-staffName="{ row }">
        <div class="flex items-center gap-3">
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C2410C] text-xs font-bold text-white"
          >
            {{ row.photoInitials }}
          </div>
          <span class="font-medium text-foreground">{{ row.staffName }}</span>
        </div>
      </template>

      <template #cell-role="{ value }">
        <span class="text-sm text-muted-foreground">{{ value }}</span>
      </template>

      <template #cell-campus="{ value }">
        <span class="text-sm text-muted-foreground">{{ value }}</span>
      </template>

      <template #cell-basicSalary="{ value }">
        <span class="text-sm tabular-nums text-foreground">{{ format(value as number) }}</span>
      </template>

      <template #cell-allowances="{ value }">
        <span class="text-sm tabular-nums text-success">{{ format(value as number) }}</span>
      </template>

      <template #cell-deductions="{ value }">
        <span class="text-sm tabular-nums text-danger">{{ format(value as number) }}</span>
      </template>

      <template #cell-netPay="{ value }">
        <span class="text-sm font-semibold tabular-nums text-foreground">{{ format(value as number) }}</span>
      </template>

      <template #cell-status="{ row }">
        <StatusBadge
          :status="statusStyleMap[row.status as string] ?? 'neutral'"
          :label="statusLabelMap[row.status as string] ?? (row.status as string)"
          size="sm"
        />
      </template>

      <template #cell-actions="{ row }">
        <div class="flex items-center justify-center gap-2">
          <!-- Draft: Submit for approval -->
          <button
            v-if="row.status === 'draft'"
            class="inline-flex items-center gap-1 rounded-xl bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning transition-all duration-200 hover:bg-warning/20"
            title="Submit for Approval"
            @click="submitPayroll(row.id as string)"
          >
            <ArrowRight class="h-3.5 w-3.5" />
            Submit
          </button>

          <!-- Pending: Approve -->
          <button
            v-if="row.status === 'pending'"
            class="inline-flex items-center gap-1 rounded-xl bg-info/10 px-2.5 py-1 text-xs font-medium text-info transition-all duration-200 hover:bg-info/20"
            title="Approve"
            @click="approvePayroll(row.id as string)"
          >
            <Check class="h-3.5 w-3.5" />
            Approve
          </button>

          <!-- Approved: Mark Paid -->
          <button
            v-if="row.status === 'approved'"
            class="inline-flex items-center gap-1 rounded-xl bg-success/10 px-2.5 py-1 text-xs font-medium text-success transition-all duration-200 hover:bg-success/20"
            title="Mark as Paid"
            @click="markPaid(row.id as string)"
          >
            <Banknote class="h-3.5 w-3.5" />
            Mark Paid
          </button>

          <!-- Edit (only for draft/pending) -->
          <button
            v-if="row.status === 'draft' || row.status === 'pending'"
            class="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary"
            title="Edit"
            @click="openEditModal(row)"
          >
            <Pencil class="h-3.5 w-3.5" />
          </button>

          <!-- Paid: no actions -->
          <span v-if="row.status === 'paid'" class="text-sm text-muted-foreground">--</span>
        </div>
      </template>
    </DataTable>

    <!-- Empty State -->
    <div
      v-if="tableData.length === 0"
      class="flex flex-col items-center justify-center card py-16"
    >
      <DollarSign class="h-10 w-10 text-muted-foreground/40 mb-3" />
      <p class="text-sm text-muted-foreground">No payroll records match your filters</p>
      <button
        class="mt-3 text-sm font-medium text-primary transition-all duration-200 hover:underline"
        @click="searchQuery = ''; campusFilter = 'all'; statusFilter = 'all'"
      >
        Clear all filters
      </button>
    </div>

    <!-- Create / Edit Modal -->
    <AppModal
      :open="showModal"
      @update:open="showModal = $event"
      :title="editingRecord ? 'Edit Payroll Record' : 'Generate Payroll Record'"
      :subtitle="editingRecord ? 'Update payroll details for this staff member' : 'Create a new payroll entry for a staff member'"
      size="md"
    >
      <div class="space-y-4">
        <FormSelect
          v-model="payrollForm.staffId"
          label="Staff Member"
          :options="staffOptions"
          placeholder="Select staff member..."
          required
        />
        <FormField
          v-model="payrollForm.month"
          label="Month"
          type="month"
          required
        />
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            v-model="payrollForm.basicSalary"
            label="Basic Salary (KES)"
            type="number"
            placeholder="0"
            required
          />
          <FormField
            v-model="payrollForm.allowances"
            label="Allowances (KES)"
            type="number"
            placeholder="0"
          />
          <FormField
            v-model="payrollForm.deductions"
            label="Deductions (KES)"
            type="number"
            placeholder="0"
          />
        </div>
        <!-- Auto-calculated Net Pay -->
        <div class="rounded-xl border border-border bg-muted/50 p-4">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-muted-foreground">Net Pay</span>
            <span class="text-lg font-bold tracking-tight text-foreground">
              {{ format(computedNetPay) }}
            </span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <button
            class="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            @click="showModal = false"
          >
            Cancel
          </button>
          <button
            class="rounded-xl bg-[#C2410C] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#C2410C]/90 disabled:opacity-50"
            :disabled="!payrollForm.staffId || !payrollForm.month || payrollForm.basicSalary <= 0"
            @click="savePayroll"
          >
            {{ editingRecord ? 'Update Record' : 'Create Record' }}
          </button>
        </div>
      </template>
    </AppModal>
  </div>
</template>
