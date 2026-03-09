<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  CircleDollarSign,
  Clock,
  CheckCircle2,
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
} from 'lucide-vue-next'
import type { ApexOptions } from 'apexcharts'
import { format } from 'date-fns'

import StatCard from '@/components/shared/StatCard.vue'
import DataTable from '@/components/shared/DataTable.vue'
import ChartCard from '@/components/shared/ChartCard.vue'
import SafeChart from '@/components/shared/SafeChart.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import SearchInput from '@/components/shared/SearchInput.vue'
import PageHeader from '@/components/shared/PageHeader.vue'
import AppModal from '@/components/shared/AppModal.vue'
import FormField from '@/components/shared/FormField.vue'
import FormSelect from '@/components/shared/FormSelect.vue'
import { useFinanceStore } from '@/stores/finance'
import { useCurrency } from '@/composables/useCurrency'
import { useChartTheme } from '@/composables/useChartTheme'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { generateId } from '@/utils/generateId'
import type { Expense } from '@/types'

const financeStore = useFinanceStore()
const { format: formatCurrency, formatCompact } = useCurrency()
const { baseOptions, colors } = useChartTheme()
const toast = useToast()
const { confirm } = useConfirm()

// ── Modal State ─────────────────────────────────────────────
const showModal = ref(false)
const editingExpenseId = ref<string | null>(null)
const isEditing = computed(() => editingExpenseId.value !== null)

const defaultForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  category: '' as string,
  description: '',
  amount: 0,
  campusId: '' as string,
  vendor: '',
  reference: '',
})

const form = ref(defaultForm())

// ── Options ─────────────────────────────────────────────────
const categoryOptions = [
  { value: 'salaries', label: 'Salaries' },
  { value: 'rent', label: 'Rent' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'transport', label: 'Transport' },
  { value: 'food', label: 'Food' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'other', label: 'Other' },
]

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const campusOptions = [
  { value: 'campus-karen', label: 'Karen Campus' },
  { value: 'campus-westlands', label: 'Westlands Campus' },
]

const categoryLabelMap: Record<string, string> = {
  salaries: 'Salaries',
  rent: 'Rent',
  utilities: 'Utilities',
  supplies: 'Supplies',
  transport: 'Transport',
  food: 'Food',
  maintenance: 'Maintenance',
  marketing: 'Marketing',
  other: 'Other',
}

const campusLabelMap: Record<string, string> = {
  'campus-karen': 'Karen',
  'campus-westlands': 'Westlands',
}

const statusStyleMap: Record<string, 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

const statusLabelMap: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
}

// ── Filters ─────────────────────────────────────────────────
const searchQuery = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const campusFilter = ref('')

// ── Stats ───────────────────────────────────────────────────
const pendingCount = computed(() => financeStore.pendingExpenses.length)
const approvedCount = computed(() => financeStore.approvedExpenses.length)

const largestCategory = computed(() => {
  const byCategory = financeStore.expensesByCategory
  let maxKey = ''
  let maxVal = 0
  for (const [key, val] of Object.entries(byCategory)) {
    if (val > maxVal) {
      maxVal = val
      maxKey = key
    }
  }
  return maxKey ? categoryLabelMap[maxKey] ?? maxKey : '-'
})

// ── Table ───────────────────────────────────────────────────
const columns = [
  { key: 'date', label: 'Date' },
  { key: 'category', label: 'Category' },
  { key: 'description', label: 'Description' },
  { key: 'vendor', label: 'Vendor' },
  { key: 'amount', label: 'Amount', align: 'right' as const },
  { key: 'campus', label: 'Campus' },
  { key: 'status', label: 'Status', align: 'center' as const },
  { key: 'actions', label: '', align: 'center' as const },
]

const tableData = computed(() => {
  let data = financeStore.expenses.map((e) => ({
    id: e.id,
    date: e.date,
    category: e.category,
    categoryLabel: categoryLabelMap[e.category] ?? e.category,
    description: e.description,
    vendor: e.vendor ?? '-',
    amount: e.amount,
    campusId: e.campusId,
    campus: campusLabelMap[e.campusId] ?? e.campusId,
    status: e.status,
  }))

  if (categoryFilter.value) {
    data = data.filter((row) => row.category === categoryFilter.value)
  }

  if (statusFilter.value) {
    data = data.filter((row) => row.status === statusFilter.value)
  }

  if (campusFilter.value) {
    data = data.filter((row) => row.campusId === campusFilter.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    data = data.filter(
      (row) =>
        row.description.toLowerCase().includes(q) ||
        row.vendor.toLowerCase().includes(q) ||
        row.categoryLabel.toLowerCase().includes(q),
    )
  }

  return data
})

const totalFiltered = computed(() => tableData.value.length)

// ── Donut Chart ─────────────────────────────────────────────
const donutSeries = computed(() => {
  const byCategory = financeStore.expensesByCategory
  return categoryOptions.map((opt) => byCategory[opt.value] ?? 0)
})

const donutOptions = computed<ApexOptions>(() => ({
  chart: {
    ...baseOptions.chart,
    type: 'donut',
    height: 280,
  },
  colors: colors.slice(0, categoryOptions.length),
  labels: categoryOptions.map((opt) => opt.label),
  plotOptions: {
    pie: {
      donut: {
        size: '72%',
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '13px',
            color: '#737373',
            offsetY: -8,
          },
          value: {
            show: true,
            fontSize: '20px',
            fontWeight: 700,
            color: '#1a1a1a',
            offsetY: 4,
            formatter: (val: string) => formatCompact(Number(val)),
          },
          total: {
            show: true,
            label: 'Total Expenses',
            fontSize: '12px',
            color: '#737373',
            formatter: () => formatCompact(financeStore.totalExpenses),
          },
        },
      },
    },
  },
  stroke: {
    width: 3,
    colors: ['#ffffff'],
  },
  legend: {
    ...baseOptions.legend,
    position: 'bottom',
  },
  tooltip: {
    ...baseOptions.tooltip,
    y: {
      formatter: (val: number) => formatCurrency(val),
    },
  },
  dataLabels: { enabled: false },
}))

// ── CRUD Actions ────────────────────────────────────────────
function openCreate() {
  editingExpenseId.value = null
  form.value = defaultForm()
  showModal.value = true
}

function openEdit(id: string) {
  const expense = financeStore.expenses.find((e) => e.id === id)
  if (!expense) return

  editingExpenseId.value = expense.id
  form.value = {
    date: expense.date,
    category: expense.category,
    description: expense.description,
    amount: expense.amount,
    campusId: expense.campusId,
    vendor: expense.vendor ?? '',
    reference: expense.reference ?? '',
  }
  showModal.value = true
}

function saveExpense() {
  const f = form.value
  if (!f.date || !f.category || !f.description || !f.amount || !f.campusId) {
    toast.error('Please fill in all required fields')
    return
  }

  if (isEditing.value && editingExpenseId.value) {
    financeStore.updateExpense(editingExpenseId.value, {
      date: f.date,
      category: f.category as Expense['category'],
      description: f.description,
      amount: Number(f.amount),
      campusId: f.campusId,
      vendor: f.vendor || undefined,
      reference: f.reference || undefined,
    })
    toast.success('Expense updated successfully')
  } else {
    const expense: Expense = {
      id: generateId('exp'),
      date: f.date,
      category: f.category as Expense['category'],
      description: f.description,
      amount: Number(f.amount),
      campusId: f.campusId,
      vendor: f.vendor || undefined,
      reference: f.reference || undefined,
      status: 'pending',
      createdBy: 'current-user',
    }
    financeStore.addExpense(expense)
    toast.success('Expense created successfully')
  }

  showModal.value = false
}

async function deleteExpense(id: string) {
  const ok = await confirm({
    title: 'Delete Expense',
    message: 'Are you sure you want to delete this expense? This action cannot be undone.',
    variant: 'danger',
  })
  if (!ok) return

  financeStore.deleteExpense(id)
  toast.success('Expense deleted successfully')
}

function approveExpense(id: string) {
  financeStore.approveExpense(id, 'current-user')
  toast.success('Expense approved successfully')
}

function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'dd MMM yyyy')
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Expense Tracking"
      subtitle="Track, manage, and approve campus expenses"
    >
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-primary/90"
        @click="openCreate"
      >
        <Plus class="h-4 w-4" />
        Add Expense
      </button>
    </PageHeader>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Expenses"
        :value="formatCompact(financeStore.totalExpenses)"
        :icon="CircleDollarSign"
        variant="primary"
      />
      <StatCard
        label="Pending Approval"
        :value="pendingCount.toString()"
        :icon="Clock"
        variant="warning"
      />
      <StatCard
        label="Approved"
        :value="approvedCount.toString()"
        :icon="CheckCircle2"
        variant="success"
      />
      <StatCard
        label="Largest Category"
        :value="largestCategory"
        :icon="TrendingUp"
        variant="info"
      />
    </div>

    <!-- Filters Row -->
    <div class="card p-4">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select
          v-model="categoryFilter"
          class="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Categories</option>
          <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <select
          v-model="statusFilter"
          class="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Statuses</option>
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <select
          v-model="campusFilter"
          class="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Campuses</option>
          <option v-for="opt in campusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <SearchInput
          v-model="searchQuery"
          placeholder="Search expenses..."
          class="w-full"
        />
      </div>
    </div>

    <!-- Data Table and Chart Row -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <!-- Expense Table -->
      <div class="xl:col-span-2">
        <div class="card p-6">
          <div class="mb-4">
            <h3 class="font-semibold tracking-tight text-card-foreground">All Expenses</h3>
            <p class="mt-0.5 text-sm text-muted-foreground">
              Showing {{ totalFiltered }} of {{ financeStore.expenses.length }} expenses
            </p>
          </div>

          <DataTable :columns="columns" :data="tableData">
            <template #cell-date="{ value }">
              <span class="text-sm text-muted-foreground">{{ formatDate(value) }}</span>
            </template>

            <template #cell-category="{ row }">
              <span class="font-medium text-card-foreground">{{ row.categoryLabel }}</span>
            </template>

            <template #cell-description="{ value }">
              <span class="text-sm text-card-foreground">{{ value }}</span>
            </template>

            <template #cell-vendor="{ value }">
              <span class="text-sm text-muted-foreground">{{ value }}</span>
            </template>

            <template #cell-amount="{ value }">
              <span class="font-medium text-card-foreground">{{ formatCurrency(value) }}</span>
            </template>

            <template #cell-campus="{ value }">
              <span class="text-sm text-muted-foreground">{{ value }}</span>
            </template>

            <template #cell-status="{ row }">
              <StatusBadge
                :status="statusStyleMap[row.status] ?? 'neutral'"
                :label="statusLabelMap[row.status] ?? row.status"
                size="sm"
              />
            </template>

            <template #cell-actions="{ row }">
              <div class="flex items-center justify-center gap-1.5">
                <button
                  v-if="row.status === 'pending'"
                  class="inline-flex items-center gap-1 rounded-lg bg-success/10 px-2 py-1 text-xs font-medium text-success ring-1 ring-success/10 transition-all duration-200 hover:bg-success/20"
                  title="Approve Expense"
                  @click="approveExpense(row.id)"
                >
                  <ShieldCheck class="h-3 w-3" />
                  Approve
                </button>
                <button
                  class="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-primary/10 transition-all duration-200 hover:bg-primary/20"
                  title="Edit Expense"
                  @click="openEdit(row.id)"
                >
                  <Pencil class="h-3 w-3" />
                  Edit
                </button>
                <button
                  class="inline-flex items-center gap-1 rounded-lg bg-danger/10 px-2 py-1 text-xs font-medium text-danger ring-1 ring-danger/10 transition-all duration-200 hover:bg-danger/20"
                  title="Delete Expense"
                  @click="deleteExpense(row.id)"
                >
                  <Trash2 class="h-3 w-3" />
                  Delete
                </button>
              </div>
            </template>
          </DataTable>
        </div>
      </div>

      <!-- Category Breakdown Chart -->
      <div>
        <ChartCard
          title="Category Breakdown"
          subtitle="Expenses by category (KES)"
        >
          <template #chart>
            <SafeChart
              type="donut"
              :height="280"
              :options="donutOptions"
              :series="donutSeries"
            />
          </template>
        </ChartCard>
      </div>
    </div>

    <!-- Create / Edit Expense Modal -->
    <AppModal
      v-model:open="showModal"
      :title="isEditing ? 'Edit Expense' : 'Add Expense'"
      :subtitle="isEditing ? 'Update expense details' : 'Record a new expense'"
      size="lg"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            v-model="form.date"
            label="Date"
            type="date"
            required
          />
          <FormSelect
            v-model="form.category"
            label="Category"
            :options="categoryOptions"
            placeholder="Select category..."
            required
          />
        </div>
        <FormField
          v-model="form.description"
          label="Description"
          placeholder="Brief description of the expense"
          required
        />
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            v-model="form.amount"
            label="Amount"
            type="number"
            placeholder="0"
            required
          />
          <FormSelect
            v-model="form.campusId"
            label="Campus"
            :options="campusOptions"
            placeholder="Select campus..."
            required
          />
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            v-model="form.vendor"
            label="Vendor"
            placeholder="Vendor name (optional)"
          />
          <FormField
            v-model="form.reference"
            label="Reference"
            placeholder="Reference number (optional)"
          />
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
            class="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-primary/90"
            @click="saveExpense"
          >
            {{ isEditing ? 'Update Expense' : 'Create Expense' }}
          </button>
        </div>
      </template>
    </AppModal>
  </div>
</template>
