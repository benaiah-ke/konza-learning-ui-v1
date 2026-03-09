<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FilePlus,
  Pencil,
  Trash2,
} from 'lucide-vue-next'
import { format } from 'date-fns'

import StatCard from '@/components/shared/StatCard.vue'
import DataTable from '@/components/shared/DataTable.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import SearchInput from '@/components/shared/SearchInput.vue'
import PageHeader from '@/components/shared/PageHeader.vue'
import AppModal from '@/components/shared/AppModal.vue'
import FormField from '@/components/shared/FormField.vue'
import FormSelect from '@/components/shared/FormSelect.vue'
import { useFinanceStore } from '@/stores/finance'
import { useStudentsStore } from '@/stores/students'
import { useCurrency } from '@/composables/useCurrency'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { generateId } from '@/utils/generateId'
import { students } from '@/data/students'
import type { Invoice } from '@/types'

const financeStore = useFinanceStore()
const studentsStore = useStudentsStore()
const { format: formatCurrency } = useCurrency()
const toast = useToast()
const { confirm } = useConfirm()

// ── Invoice Modal State ─────────────────────────────────────
const showInvoiceModal = ref(false)
const editingInvoiceId = ref<string | null>(null)
const isEditing = computed(() => editingInvoiceId.value !== null)

const defaultInvoiceForm = () => ({
  studentId: '',
  term: '',
  dueDate: '',
  items: [
    { description: '', amount: 0 },
    { description: '', amount: 0 },
    { description: '', amount: 0 },
  ],
})

const invoiceForm = ref(defaultInvoiceForm())

const studentOptions = computed(() =>
  students.map((s) => ({
    value: s.id,
    label: `${s.firstName} ${s.lastName} - ${s.className}`,
  })),
)

function openCreateInvoice() {
  editingInvoiceId.value = null
  invoiceForm.value = defaultInvoiceForm()
  showInvoiceModal.value = true
}

function openEditInvoice(invoiceId: string) {
  const invoice = financeStore.invoices.find((inv) => inv.id === invoiceId.toLowerCase())
  if (!invoice) return

  editingInvoiceId.value = invoice.id
  const items = [...invoice.items]
  while (items.length < 3) {
    items.push({ description: '', amount: 0 })
  }
  invoiceForm.value = {
    studentId: invoice.studentId,
    term: invoice.term,
    dueDate: invoice.dueDate,
    items: items.slice(0, 3).map((item) => ({ ...item })),
  }
  showInvoiceModal.value = true
}

function saveInvoice() {
  const form = invoiceForm.value
  if (!form.studentId || !form.term || !form.dueDate) {
    toast.error('Please fill in all required fields')
    return
  }

  const validItems = form.items.filter((item) => item.description.trim() && item.amount > 0)
  if (validItems.length === 0) {
    toast.error('Please add at least one line item')
    return
  }

  const totalAmount = validItems.reduce((sum, item) => sum + item.amount, 0)

  if (isEditing.value && editingInvoiceId.value) {
    financeStore.updateInvoice(editingInvoiceId.value, {
      studentId: form.studentId,
      term: form.term,
      dueDate: form.dueDate,
      items: validItems,
      totalAmount,
      balance: totalAmount - (financeStore.invoices.find((inv) => inv.id === editingInvoiceId.value)?.paidAmount ?? 0),
    })
    toast.success('Invoice updated successfully')
  } else {
    const invoice: Invoice = {
      id: generateId('inv'),
      studentId: form.studentId,
      term: form.term,
      items: validItems,
      totalAmount,
      paidAmount: 0,
      balance: totalAmount,
      status: 'unpaid',
      issuedDate: new Date().toISOString().slice(0, 10),
      dueDate: form.dueDate,
    }
    financeStore.addInvoice(invoice)
    toast.success('Invoice created successfully')
  }

  showInvoiceModal.value = false
}

async function deleteInvoice(invoiceId: string) {
  const ok = await confirm({
    title: 'Delete Invoice',
    message: 'Are you sure you want to delete this invoice? This action cannot be undone.',
    variant: 'danger',
  })
  if (!ok) return

  financeStore.deleteInvoice(invoiceId.toLowerCase())
  toast.success('Invoice deleted successfully')
}

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
  { key: 'actions', label: '', align: 'center' as const },
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
        @click="openCreateInvoice"
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

        <template #cell-actions="{ row }">
          <div class="flex items-center justify-center gap-1.5">
            <button
              class="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-primary/10 transition-all duration-200 hover:bg-primary/20"
              title="Edit Invoice"
              @click="openEditInvoice(row.invoiceId)"
            >
              <Pencil class="h-3 w-3" />
              Edit
            </button>
            <button
              class="inline-flex items-center gap-1 rounded-lg bg-danger/10 px-2 py-1 text-xs font-medium text-danger ring-1 ring-danger/10 transition-all duration-200 hover:bg-danger/20"
              title="Delete Invoice"
              @click="deleteInvoice(row.invoiceId)"
            >
              <Trash2 class="h-3 w-3" />
              Delete
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Create / Edit Invoice Modal -->
    <AppModal
      v-model:open="showInvoiceModal"
      :title="isEditing ? 'Edit Invoice' : 'Generate Invoice'"
      :subtitle="isEditing ? 'Update invoice details' : 'Create a new invoice for a student'"
      size="lg"
    >
      <div class="space-y-4">
        <FormSelect
          v-model="invoiceForm.studentId"
          label="Student"
          :options="studentOptions"
          placeholder="Select student..."
          required
        />
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            v-model="invoiceForm.term"
            label="Term"
            placeholder="e.g. Term 1 2026"
            required
          />
          <FormField
            v-model="invoiceForm.dueDate"
            label="Due Date"
            type="date"
            required
          />
        </div>

        <div>
          <p class="mb-2 text-sm font-medium text-foreground">Line Items</p>
          <div class="space-y-3">
            <div
              v-for="(item, idx) in invoiceForm.items"
              :key="idx"
              class="grid grid-cols-1 gap-3 sm:grid-cols-3"
            >
              <div class="sm:col-span-2">
                <FormField
                  v-model="item.description"
                  :label="`Item ${idx + 1} Description`"
                  :placeholder="`e.g. Tuition Fee`"
                />
              </div>
              <FormField
                v-model="item.amount"
                :label="`Amount`"
                type="number"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <button
            class="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            @click="showInvoiceModal = false"
          >
            Cancel
          </button>
          <button
            class="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-primary/90"
            @click="saveInvoice"
          >
            {{ isEditing ? 'Update Invoice' : 'Create Invoice' }}
          </button>
        </div>
      </template>
    </AppModal>
  </div>
</template>
