<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  BookOpen,
  Receipt,
  Wallet,
  AlertTriangle,
  Smartphone,
  Landmark,
  User,
  Phone,
  Mail,
  Plus,
} from 'lucide-vue-next'
import { format } from 'date-fns'

import StatCard from '@/components/shared/StatCard.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import SearchInput from '@/components/shared/SearchInput.vue'
import PageHeader from '@/components/shared/PageHeader.vue'
import AppModal from '@/components/shared/AppModal.vue'
import FormField from '@/components/shared/FormField.vue'
import FormSelect from '@/components/shared/FormSelect.vue'
import { useFinanceStore } from '@/stores/finance'
import { useCurrency } from '@/composables/useCurrency'
import { useToast } from '@/composables/useToast'
import { generateId } from '@/utils/generateId'
import { students } from '@/data/students'
import { parents } from '@/data/parents'
import type { Transaction } from '@/types'

const financeStore = useFinanceStore()
const { format: formatCurrency } = useCurrency()
const toast = useToast()

// ── Record Payment Modal State ──────────────────────────────
const showPaymentModal = ref(false)

const defaultPaymentForm = () => ({
  studentId: '',
  amount: 0,
  method: '' as string,
  reference: '',
  date: new Date().toISOString().slice(0, 10),
})

const paymentForm = ref(defaultPaymentForm())

const studentOptions = computed(() =>
  students.map((s) => ({
    value: s.id,
    label: `${s.firstName} ${s.lastName} - ${s.className}`,
  })),
)

const methodOptions = [
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'bank', label: 'Bank Transfer' },
]

function openPaymentModal() {
  paymentForm.value = defaultPaymentForm()
  // Pre-select current student if one is selected
  if (selectedStudentId.value) {
    paymentForm.value.studentId = selectedStudentId.value
  }
  showPaymentModal.value = true
}

function savePayment() {
  const form = paymentForm.value
  if (!form.studentId || !form.amount || !form.method || !form.reference || !form.date) {
    toast.error('Please fill in all required fields')
    return
  }

  const transaction: Transaction = {
    id: generateId('tx'),
    invoiceId: '',
    studentId: form.studentId,
    amount: form.amount,
    method: form.method as 'mpesa' | 'bank',
    reference: form.reference,
    date: form.date,
    status: 'pending',
  }

  financeStore.addTransaction(transaction)
  toast.success('Payment recorded successfully')
  showPaymentModal.value = false
}

// ── State ───────────────────────────────────────────────────
const searchQuery = ref('')
const selectedStudentId = ref<string>(students[0]?.id ?? '')

// ── Campus display map ──────────────────────────────────────
const campusNames: Record<string, string> = {
  'campus-karen': 'Karen Campus',
  'campus-westlands': 'Westlands Campus',
}

// ── Filtered student list ───────────────────────────────────
const filteredStudents = computed(() => {
  if (!searchQuery.value.trim()) return students
  const q = searchQuery.value.toLowerCase()
  return students.filter(
    (s) =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      s.className.toLowerCase().includes(q),
  )
})

// ── Selected student details ────────────────────────────────
const selectedStudent = computed(() =>
  students.find((s) => s.id === selectedStudentId.value),
)

const selectedParent = computed(() => {
  if (!selectedStudent.value) return undefined
  return parents.find((p) => p.id === selectedStudent.value!.parentId)
})

// ── Financial data for selected student ─────────────────────
const studentInvoice = computed(() =>
  financeStore.invoices.find((inv) => inv.studentId === selectedStudentId.value),
)

const studentTransactions = computed(() =>
  financeStore.transactions
    .filter((tx) => tx.studentId === selectedStudentId.value)
    .sort((a, b) => b.date.localeCompare(a.date)),
)

const totalBilled = computed(() => studentInvoice.value?.totalAmount ?? 0)
const totalPaid = computed(() => studentInvoice.value?.paidAmount ?? 0)
const outstandingBalance = computed(() => studentInvoice.value?.balance ?? 0)
const paymentStatus = computed(() => studentInvoice.value?.status ?? 'unpaid')

const paymentStatusMap: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  paid: 'success',
  partial: 'warning',
  overdue: 'danger',
  unpaid: 'neutral',
}

const paymentStatusLabel: Record<string, string> = {
  paid: 'Fully Paid',
  partial: 'Partially Paid',
  overdue: 'Overdue',
  unpaid: 'Unpaid',
}

function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'dd MMM yyyy')
}

function selectStudent(id: string) {
  selectedStudentId.value = id
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Student Ledger & Billing"
      subtitle="Individual student financial records and billing history"
    >
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-primary/90"
        @click="openPaymentModal"
      >
        <Plus class="h-4 w-4" />
        Record Payment
      </button>
    </PageHeader>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <!-- Left sidebar - Student selector -->
      <div class="lg:col-span-4 xl:col-span-3">
        <div class="card p-4">
          <h3 class="mb-3 text-sm font-semibold tracking-tight text-card-foreground">Select Student</h3>
          <SearchInput
            v-model="searchQuery"
            placeholder="Search by name or class..."
            class="mb-3"
          />
          <div class="max-h-[520px] space-y-1 overflow-y-auto pr-1">
            <button
              v-for="student in filteredStudents"
              :key="student.id"
              :class="[
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200',
                selectedStudentId === student.id
                  ? 'bg-primary/10 ring-1 ring-primary/20'
                  : 'hover:bg-muted/50',
              ]"
              @click="selectStudent(student.id)"
            >
              <div
                :class="[
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  selectedStudentId === student.id
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground',
                ]"
              >
                {{ student.photoInitials }}
              </div>
              <div class="min-w-0 flex-1">
                <p
                  :class="[
                    'truncate text-sm font-medium',
                    selectedStudentId === student.id
                      ? 'text-primary'
                      : 'text-card-foreground',
                  ]"
                >
                  {{ student.firstName }} {{ student.lastName }}
                </p>
                <p class="truncate text-xs text-muted-foreground">
                  {{ student.className }} &middot; {{ campusNames[student.campusId] ?? student.campusId }}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Right content - Student ledger details -->
      <div class="space-y-6 lg:col-span-8 xl:col-span-9">
        <template v-if="selectedStudent">
          <!-- Student profile card -->
          <div class="card p-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                {{ selectedStudent.photoInitials }}
              </div>
              <div class="flex-1">
                <h2 class="text-xl font-bold tracking-tight text-card-foreground">
                  {{ selectedStudent.firstName }} {{ selectedStudent.lastName }}
                </h2>
                <p class="mt-0.5 text-sm text-muted-foreground">
                  {{ selectedStudent.className }} Class &middot; {{ campusNames[selectedStudent.campusId] ?? selectedStudent.campusId }}
                </p>
                <div v-if="selectedParent" class="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span class="inline-flex items-center gap-1.5">
                    <User class="h-3.5 w-3.5" />
                    {{ selectedParent.firstName }} {{ selectedParent.lastName }}
                  </span>
                  <span class="inline-flex items-center gap-1.5">
                    <Phone class="h-3.5 w-3.5" />
                    {{ selectedParent.phone }}
                  </span>
                  <span class="inline-flex items-center gap-1.5">
                    <Mail class="h-3.5 w-3.5" />
                    {{ selectedParent.email }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Financial Summary Cards -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Billed"
              :value="formatCurrency(totalBilled)"
              :icon="Receipt"
              variant="primary"
            />
            <StatCard
              label="Total Paid"
              :value="formatCurrency(totalPaid)"
              :icon="Wallet"
              variant="success"
            />
            <StatCard
              label="Outstanding Balance"
              :value="formatCurrency(outstandingBalance)"
              :icon="AlertTriangle"
              :variant="outstandingBalance > 0 ? 'danger' : 'neutral'"
            />
            <div class="flex flex-col justify-center card p-6">
              <p class="text-sm text-muted-foreground">Payment Status</p>
              <div class="mt-2">
                <StatusBadge
                  :status="paymentStatusMap[paymentStatus] ?? 'neutral'"
                  :label="paymentStatusLabel[paymentStatus] ?? paymentStatus"
                />
              </div>
            </div>
          </div>

          <!-- Invoice Line Items -->
          <div v-if="studentInvoice" class="card p-6">
            <div class="mb-4 flex items-start justify-between">
              <div>
                <h3 class="font-semibold tracking-tight text-card-foreground">
                  Invoice {{ studentInvoice.id.toUpperCase() }}
                </h3>
                <p class="mt-0.5 text-sm text-muted-foreground">
                  {{ studentInvoice.term }} &middot; Issued {{ formatDate(studentInvoice.issuedDate) }} &middot; Due {{ formatDate(studentInvoice.dueDate) }}
                </p>
              </div>
              <StatusBadge
                :status="paymentStatusMap[studentInvoice.status] ?? 'neutral'"
                :label="paymentStatusLabel[studentInvoice.status] ?? studentInvoice.status"
              />
            </div>
            <div class="overflow-hidden rounded-xl border border-border">
              <table class="w-full">
                <thead>
                  <tr class="bg-muted/50">
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Description
                    </th>
                    <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, idx) in studentInvoice.items"
                    :key="idx"
                    class="border-b border-border last:border-b-0"
                  >
                    <td class="px-4 py-3 text-sm text-card-foreground">
                      {{ item.description }}
                    </td>
                    <td class="px-4 py-3 text-right text-sm text-card-foreground">
                      {{ formatCurrency(item.amount) }}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="border-t-2 border-border bg-muted/30">
                    <td class="px-4 py-3 text-sm font-semibold text-card-foreground">
                      Total
                    </td>
                    <td class="px-4 py-3 text-right text-sm font-bold tracking-tight text-card-foreground">
                      {{ formatCurrency(studentInvoice.totalAmount) }}
                    </td>
                  </tr>
                  <tr v-if="studentInvoice.paidAmount > 0" class="bg-muted/30">
                    <td class="px-4 py-3 text-sm text-success">
                      Paid
                    </td>
                    <td class="px-4 py-3 text-right text-sm font-medium text-success">
                      -{{ formatCurrency(studentInvoice.paidAmount) }}
                    </td>
                  </tr>
                  <tr v-if="studentInvoice.balance > 0" class="bg-muted/30">
                    <td class="px-4 py-3 text-sm font-semibold text-danger">
                      Balance Due
                    </td>
                    <td class="px-4 py-3 text-right text-sm font-bold tracking-tight text-danger">
                      {{ formatCurrency(studentInvoice.balance) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Payment History Timeline -->
          <div class="card p-6">
            <h3 class="mb-4 font-semibold tracking-tight text-card-foreground">Payment History</h3>
            <div v-if="studentTransactions.length > 0" class="relative">
              <!-- Timeline line -->
              <div class="absolute left-4 top-2 bottom-2 w-px bg-border" />
              <!-- Timeline items -->
              <div class="space-y-6">
                <div
                  v-for="tx in studentTransactions"
                  :key="tx.id"
                  class="relative flex items-start gap-4 pl-10"
                >
                  <!-- Timeline dot -->
                  <div
                    :class="[
                      'absolute left-2.5 top-1.5 h-3 w-3 rounded-full border-2 border-card',
                      tx.status === 'matched' ? 'bg-success' : tx.status === 'pending' ? 'bg-info' : 'bg-warning',
                    ]"
                  />
                  <!-- Content -->
                  <div class="flex-1 rounded-xl border border-border bg-muted/30 p-4">
                    <div class="flex items-start justify-between">
                      <div>
                        <p class="text-sm font-medium text-card-foreground">
                          {{ formatCurrency(tx.amount) }}
                        </p>
                        <p class="mt-0.5 text-xs text-muted-foreground">
                          {{ formatDate(tx.date) }}
                        </p>
                      </div>
                      <span
                        :class="[
                          'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ring-1',
                          tx.method === 'mpesa'
                            ? 'bg-success-light text-success ring-success/10'
                            : 'bg-info-light text-info ring-info/10',
                        ]"
                      >
                        <Smartphone v-if="tx.method === 'mpesa'" class="h-3 w-3" />
                        <Landmark v-else class="h-3 w-3" />
                        {{ tx.method === 'mpesa' ? 'M-Pesa' : 'Bank' }}
                      </span>
                    </div>
                    <div class="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        Ref: <code class="rounded bg-muted px-1 py-0.5 font-mono">{{ tx.reference }}</code>
                      </span>
                      <StatusBadge
                        :status="tx.status === 'matched' ? 'success' : tx.status === 'pending' ? 'info' : 'warning'"
                        :label="tx.status === 'matched' ? 'Matched' : tx.status === 'pending' ? 'Pending' : 'Unmatched'"
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen class="h-10 w-10 text-muted-foreground/50" />
              <p class="mt-3 text-sm text-muted-foreground">
                No payment transactions recorded for this student.
              </p>
            </div>
          </div>
        </template>

        <!-- No student selected state -->
        <div v-else class="flex flex-col items-center justify-center card py-24 text-center">
          <BookOpen class="h-12 w-12 text-muted-foreground/40" />
          <p class="mt-4 text-lg font-medium tracking-tight text-muted-foreground">Select a Student</p>
          <p class="mt-1 text-sm text-muted-foreground">
            Choose a student from the list to view their financial ledger.
          </p>
        </div>
      </div>
    </div>

    <!-- Record Payment Modal -->
    <AppModal
      v-model:open="showPaymentModal"
      title="Record Payment"
      subtitle="Add a new payment for a student"
      size="md"
    >
      <div class="space-y-4">
        <FormSelect
          v-model="paymentForm.studentId"
          label="Student"
          :options="studentOptions"
          placeholder="Select student..."
          required
        />
        <FormField
          v-model="paymentForm.amount"
          label="Amount"
          type="number"
          placeholder="Enter payment amount"
          required
        />
        <FormSelect
          v-model="paymentForm.method"
          label="Payment Method"
          :options="methodOptions"
          placeholder="Select method..."
          required
        />
        <FormField
          v-model="paymentForm.reference"
          label="Reference"
          placeholder="Enter payment reference"
          required
        />
        <FormField
          v-model="paymentForm.date"
          label="Date"
          type="date"
          required
        />
      </div>
      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <button
            class="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            @click="showPaymentModal = false"
          >
            Cancel
          </button>
          <button
            class="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-primary/90"
            @click="savePayment"
          >
            Record Payment
          </button>
        </div>
      </template>
    </AppModal>
  </div>
</template>
