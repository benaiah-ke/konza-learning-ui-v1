<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FilePlus,
} from 'lucide-vue-next'
import { format } from 'date-fns'

import StatCard from '@/components/shared/StatCard.vue'
import DataTable from '@/components/shared/DataTable.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import SearchInput from '@/components/shared/SearchInput.vue'
import PageHeader from '@/components/shared/PageHeader.vue'
import { useFinanceStore } from '@/stores/finance'
import { useStudentsStore } from '@/stores/students'
import { useCurrency } from '@/composables/useCurrency'

const financeStore = useFinanceStore()
const studentsStore = useStudentsStore()
const { format: formatCurrency } = useCurrency()

// ── Search & Filter State ───────────────────────────────────
const searchQuery = ref('')
const statusFilter = ref<'all' | 'paid' | 'partial' | 'overdue' | 'unpaid'>('all')

// ── Stats ───────────────────────────────────────────────────
const totalInvoices = computed(() => financeStore.invoices.length)

const paidCount = computed(
  () => financeStore.invoices.filter((inv) => inv.status === 'paid').length,
)

const partialCount = computed(
  () => financeStore.invoices.filter((inv) => inv.status === 'partial').length,
)

const overdueCount = computed(
  () => financeStore.invoices.filter((inv) => inv.status === 'overdue').length,
)

// ── Table Columns ───────────────────────────────────────────
const columns = [
  { key: 'invoiceId', label: 'Invoice #' },
  { key: 'studentName', label: 'Student Name' },
  { key: 'className', label: 'Class' },
  { key: 'totalAmount', label: 'Total Amount', align: 'right' as const },
  { key: 'paidAmount', label: 'Paid Amount', align: 'right' as const },
  { key: 'balance', label: 'Balance', align: 'right' as const },
  { key: 'status', label: 'Status', align: 'center' as const },
  { key: 'dueDate', label: 'Due Date' },
]

// ── Status Helpers ──────────────────────────────────────────
const invoiceStatusMap: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  paid: 'success',
  partial: 'warning',
  overdue: 'danger',
  unpaid: 'neutral',
}

const invoiceStatusLabel: Record<string, string> = {
  paid: 'Paid',
  partial: 'Partial',
  overdue: 'Overdue',
  unpaid: 'Unpaid',
}

// ── Table Data ──────────────────────────────────────────────
const tableData = computed(() => {
  let data = financeStore.invoices.map((inv) => {
    const student = studentsStore.getStudentById(inv.studentId)
    return {
      invoiceId: inv.id.toUpperCase(),
      studentName: student
        ? `${student.firstName} ${student.lastName}`
        : 'Unknown Student',
      className: student?.className ?? '-',
      totalAmount: inv.totalAmount,
      paidAmount: inv.paidAmount,
      balance: inv.balance,
      status: inv.status,
      dueDate: inv.dueDate,
    }
  })

  // Apply status filter
  if (statusFilter.value !== 'all') {
    data = data.filter((row) => row.status === statusFilter.value)
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    data = data.filter(
      (row) =>
        row.studentName.toLowerCase().includes(q) ||
        row.invoiceId.toLowerCase().includes(q) ||
        row.className.toLowerCase().includes(q),
    )
  }

  return data
})

const totalFiltered = computed(() => tableData.value.length)

function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'dd MMM yyyy')
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Billing & Invoice Generator"
      subtitle="Create, preview, and send invoices to parents"
    >
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-primary/90"
      >
        <FilePlus class="h-4 w-4" />
        Generate Invoice
      </button>
    </PageHeader>

    <!-- Summary Stats Row -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Invoices"
        :value="totalInvoices.toString()"
        :icon="FileText"
        variant="primary"
      />
      <StatCard
        label="Paid"
        :value="paidCount.toString()"
        :icon="CheckCircle2"
        variant="success"
      />
      <StatCard
        label="Partial"
        :value="partialCount.toString()"
        :icon="Clock"
        variant="warning"
      />
      <StatCard
        label="Overdue"
        :value="overdueCount.toString()"
        :icon="AlertTriangle"
        variant="danger"
      />
    </div>

    <!-- Invoice Table Section -->
    <div class="card p-6">
      <div class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="font-semibold tracking-tight text-card-foreground">All Invoices</h3>
          <p class="mt-0.5 text-sm text-muted-foreground">
            Showing {{ totalFiltered }} of {{ totalInvoices }} invoices
          </p>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            v-model="searchQuery"
            placeholder="Search by student, ID, or class..."
            class="w-full sm:w-64"
          />
          <select
            v-model="statusFilter"
            class="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="overdue">Overdue</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      <DataTable :columns="columns" :data="tableData">
        <template #cell-invoiceId="{ value }">
          <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-medium text-card-foreground">
            {{ value }}
          </code>
        </template>

        <template #cell-studentName="{ value }">
          <span class="font-medium text-card-foreground">{{ value }}</span>
        </template>

        <template #cell-className="{ value }">
          <span class="text-sm text-muted-foreground">{{ value }}</span>
        </template>

        <template #cell-totalAmount="{ value }">
          <span class="font-medium text-card-foreground">{{ formatCurrency(value) }}</span>
        </template>

        <template #cell-paidAmount="{ value }">
          <span class="text-success">{{ formatCurrency(value) }}</span>
        </template>

        <template #cell-balance="{ value }">
          <span :class="['font-semibold', value > 0 ? 'text-danger' : 'text-card-foreground']">
            {{ formatCurrency(value) }}
          </span>
        </template>

        <template #cell-status="{ row }">
          <StatusBadge
            :status="invoiceStatusMap[row.status] ?? 'neutral'"
            :label="invoiceStatusLabel[row.status] ?? row.status"
            size="sm"
          />
        </template>

        <template #cell-dueDate="{ value }">
          <span class="text-sm text-muted-foreground">{{ formatDate(value) }}</span>
        </template>
      </DataTable>
    </div>
  </div>
</template>
