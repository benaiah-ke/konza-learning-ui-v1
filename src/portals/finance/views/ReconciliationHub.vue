<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ArrowLeftRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Smartphone,
  Landmark,
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
const statusFilter = ref<'all' | 'matched' | 'unmatched' | 'pending'>('all')

// ── Stats ───────────────────────────────────────────────────
const totalTransactions = computed(() => financeStore.transactions.length)

const matchedCount = computed(
  () => financeStore.transactions.filter((t) => t.status === 'matched').length,
)

const unmatchedCount = computed(
  () => financeStore.transactions.filter((t) => t.status === 'unmatched').length,
)

const pendingCount = computed(
  () => financeStore.transactions.filter((t) => t.status === 'pending').length,
)

// ── Table Columns ───────────────────────────────────────────
const columns = [
  { key: 'date', label: 'Date' },
  { key: 'reference', label: 'Reference' },
  { key: 'method', label: 'Method' },
  { key: 'amount', label: 'Amount', align: 'right' as const },
  { key: 'studentName', label: 'Student' },
  { key: 'status', label: 'Status', align: 'center' as const },
  { key: 'action', label: '', align: 'center' as const },
]

// ── Table Data ──────────────────────────────────────────────
const tableData = computed(() => {
  let filtered = financeStore.transactions.map((tx) => {
    const student = tx.studentId
      ? studentsStore.getStudentById(tx.studentId)
      : undefined
    const studentName = student
      ? `${student.firstName} ${student.lastName}`
      : 'Unknown'

    return {
      id: tx.id,
      date: tx.date,
      reference: tx.reference,
      method: tx.method,
      amount: tx.amount,
      studentName,
      status: tx.status,
    }
  })

  // Apply status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter((row) => row.status === statusFilter.value)
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (row) =>
        row.reference.toLowerCase().includes(q) ||
        row.studentName.toLowerCase().includes(q),
    )
  }

  // Sort by date descending
  return filtered.sort((a, b) => b.date.localeCompare(a.date))
})

const totalFiltered = computed(() => tableData.value.length)

// ── Status Helpers ──────────────────────────────────────────
const statusMap: Record<string, 'success' | 'warning' | 'info'> = {
  matched: 'success',
  unmatched: 'warning',
  pending: 'info',
}

const statusLabelMap: Record<string, string> = {
  matched: 'Matched',
  unmatched: 'Unmatched',
  pending: 'Pending',
}

function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'dd MMM yyyy')
}

function handleReconcile(txId: string) {
  financeStore.markAsReconciled(txId)
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Financial Reconciliation Hub"
      subtitle="Match payments to invoices and reconcile accounts"
    />

    <!-- Stats Row -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Transactions"
        :value="totalTransactions.toString()"
        :icon="ArrowLeftRight"
        icon-bg="bg-primary/10"
        icon-color="text-primary"
      />
      <StatCard
        label="Matched"
        :value="matchedCount.toString()"
        :icon="CheckCircle2"
        icon-bg="bg-success/10"
        icon-color="text-success"
      />
      <StatCard
        label="Unmatched"
        :value="unmatchedCount.toString()"
        :icon="AlertCircle"
        icon-bg="bg-warning/10"
        icon-color="text-warning"
      />
      <StatCard
        label="Pending"
        :value="pendingCount.toString()"
        :icon="Clock"
        icon-bg="bg-info/10"
        icon-color="text-info"
      />
    </div>

    <!-- Table Section -->
    <div class="rounded-xl border border-border bg-card p-6">
      <div class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="font-semibold text-card-foreground">Transaction Log</h3>
          <p class="mt-0.5 text-sm text-muted-foreground">
            Showing {{ totalFiltered }} of {{ totalTransactions }} transactions
          </p>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            v-model="searchQuery"
            placeholder="Search by reference or student..."
            class="w-full sm:w-64"
          />
          <select
            v-model="statusFilter"
            class="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Statuses</option>
            <option value="matched">Matched</option>
            <option value="unmatched">Unmatched</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <DataTable :columns="columns" :data="tableData">
        <template #cell-date="{ value }">
          <span class="text-sm text-card-foreground">{{ formatDate(value) }}</span>
        </template>

        <template #cell-reference="{ value }">
          <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-card-foreground">
            {{ value }}
          </code>
        </template>

        <template #cell-method="{ row }">
          <span
            :class="[
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
              row.method === 'mpesa'
                ? 'bg-success-light text-success'
                : 'bg-info-light text-info',
            ]"
          >
            <Smartphone v-if="row.method === 'mpesa'" class="h-3 w-3" />
            <Landmark v-else class="h-3 w-3" />
            {{ row.method === 'mpesa' ? 'M-Pesa' : 'Bank' }}
          </span>
        </template>

        <template #cell-amount="{ value }">
          <span class="font-semibold text-card-foreground">{{ formatCurrency(value) }}</span>
        </template>

        <template #cell-studentName="{ value }">
          <span class="font-medium text-card-foreground">{{ value }}</span>
        </template>

        <template #cell-status="{ row }">
          <StatusBadge
            :status="statusMap[row.status] ?? 'neutral'"
            :label="statusLabelMap[row.status] ?? row.status"
            size="sm"
          />
        </template>

        <template #cell-action="{ row }">
          <button
            v-if="row.status === 'unmatched'"
            class="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary/90"
            @click="handleReconcile(row.id)"
          >
            Reconcile
          </button>
        </template>
      </DataTable>
    </div>
  </div>
</template>
