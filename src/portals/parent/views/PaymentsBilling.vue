<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Phone,
  Wallet,
  Receipt,
  CreditCard,
  X,
  Loader2,
  CircleCheck,
  Landmark,
  Smartphone,
} from 'lucide-vue-next'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { useCurrency } from '@/composables/useCurrency'
import { useFinanceStore } from '@/stores/finance'

const { format } = useCurrency()
const financeStore = useFinanceStore()

const studentInvoice = computed(() =>
  financeStore.invoices.find((inv) => inv.studentId === 'stu-001'),
)

const studentTransactions = computed(() =>
  financeStore.transactions
    .filter((tx) => tx.studentId === 'stu-001' && tx.status === 'matched')
    .sort((a, b) => b.date.localeCompare(a.date)),
)

const balance = computed(() => studentInvoice.value?.balance ?? 0)
const isPaid = computed(() => balance.value === 0)

// Invoice accordion
const invoiceExpanded = ref(false)

// M-Pesa payment modal
const showPaymentModal = ref(false)
const phoneNumber = ref('+254 712 345 678')
const paymentAmount = ref('')
const paymentStep = ref<'form' | 'processing' | 'success'>('form')

function openPaymentModal() {
  paymentAmount.value = balance.value.toString()
  paymentStep.value = 'form'
  showPaymentModal.value = true
}

function closePaymentModal() {
  showPaymentModal.value = false
  paymentStep.value = 'form'
}

function submitPayment() {
  paymentStep.value = 'processing'
  setTimeout(() => {
    paymentStep.value = 'success'
  }, 2000)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="space-y-5 pb-4">
    <!-- Balance Card -->
    <div
      :class="[
        'rounded-xl p-5 shadow-lg',
        isPaid
          ? 'bg-success'
          : 'bg-parent',
      ]"
    >
      <div class="flex items-center gap-2">
        <Wallet class="h-5 w-5 text-white/80" />
        <p class="text-sm font-medium text-white/80">Outstanding Balance</p>
      </div>
      <p class="mt-2 text-3xl font-bold tracking-tight text-white">{{ format(balance) }}</p>

      <div v-if="isPaid" class="mt-4 flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5">
        <CircleCheck class="h-5 w-5 text-white" />
        <span class="text-sm font-semibold tracking-tight text-white">All Paid - Term 1 2026</span>
      </div>
      <button
        v-else
        class="mt-4 w-full rounded-xl bg-success px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 active:bg-success/90"
        @click="openPaymentModal"
      >
        Pay Now via M-Pesa
      </button>
    </div>

    <!-- Current Invoice -->
    <div class="card">
      <button
        class="flex w-full items-center justify-between p-4 transition-all duration-200"
        @click="invoiceExpanded = !invoiceExpanded"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
            <Receipt class="h-5 w-5 text-muted-foreground" />
          </div>
          <div class="text-left">
            <p class="text-sm font-semibold tracking-tight text-foreground">Term 1 2026 Invoice</p>
            <p class="text-sm text-muted-foreground">{{ format(studentInvoice?.totalAmount ?? 0) }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <StatusBadge
            :status="isPaid ? 'success' : 'warning'"
            :label="isPaid ? 'Paid' : 'Partial'"
            size="sm"
          />
          <ChevronDown
            v-if="!invoiceExpanded"
            class="h-5 w-5 text-muted-foreground/50"
          />
          <ChevronUp v-else class="h-5 w-5 text-muted-foreground/50" />
        </div>
      </button>

      <div v-if="invoiceExpanded" class="border-t border-border px-4 pb-4">
        <div class="mt-3 space-y-2.5">
          <div
            v-for="item in studentInvoice?.items"
            :key="item.description"
            class="flex items-center justify-between"
          >
            <span class="text-sm text-muted-foreground">{{ item.description }}</span>
            <span class="text-sm font-medium text-foreground">{{ format(item.amount) }}</span>
          </div>
        </div>
        <div class="mt-3 border-t border-border pt-3">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold tracking-tight text-foreground">Total</span>
            <span class="text-sm font-bold tracking-tight text-foreground">{{ format(studentInvoice?.totalAmount ?? 0) }}</span>
          </div>
          <div class="mt-1 flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Amount Paid</span>
            <span class="text-sm font-medium text-success">-{{ format(studentInvoice?.paidAmount ?? 0) }}</span>
          </div>
          <div class="mt-1 flex items-center justify-between">
            <span class="text-sm font-semibold tracking-tight text-foreground">Balance</span>
            <span
              :class="[
                'text-sm font-bold tracking-tight',
                isPaid ? 'text-success' : 'text-danger',
              ]"
            >
              {{ format(balance) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment History -->
    <div>
      <h2 class="mb-3 text-sm font-semibold tracking-tight text-foreground">Payment History</h2>
      <div class="space-y-2">
        <div
          v-for="tx in studentTransactions"
          :key="tx.id"
          class="flex items-center gap-3 card p-3 transition-all duration-200"
        >
          <div
            :class="[
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              tx.method === 'mpesa' ? 'bg-success-light' : 'bg-info-light',
            ]"
          >
            <Smartphone
              v-if="tx.method === 'mpesa'"
              class="h-5 w-5 text-success"
            />
            <Landmark v-else class="h-5 w-5 text-info" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-foreground">{{ format(tx.amount) }}</p>
              <StatusBadge status="success" label="Confirmed" size="sm" />
            </div>
            <div class="mt-0.5 flex items-center justify-between">
              <span class="text-sm text-muted-foreground">{{ formatDate(tx.date) }}</span>
              <span class="font-mono text-xs text-muted-foreground/70">{{ tx.reference }}</span>
            </div>
            <div class="mt-1">
              <span
                :class="[
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                  tx.method === 'mpesa'
                    ? 'bg-success-light text-success-foreground'
                    : 'bg-info-light text-info-foreground',
                ]"
              >
                {{ tx.method === 'mpesa' ? 'M-Pesa' : 'Bank Transfer' }}
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="studentTransactions.length === 0"
          class="card p-6 text-center"
        >
          <CreditCard class="mx-auto h-8 w-8 text-muted-foreground/30" />
          <p class="mt-2 text-sm text-muted-foreground">No payment history yet</p>
        </div>
      </div>
    </div>

    <!-- M-Pesa Payment Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showPaymentModal"
          class="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          @click.self="closePaymentModal"
        >
          <Transition name="slide-up">
            <div
              v-if="showPaymentModal"
              class="w-full max-w-lg rounded-t-3xl bg-white px-5 pb-8 pt-3"
            >
              <!-- Handle bar -->
              <div class="mx-auto mb-4 h-1 w-10 rounded-full bg-muted-foreground/20" />

              <!-- Form Step -->
              <template v-if="paymentStep === 'form'">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-bold tracking-tight text-foreground">M-Pesa Payment</h3>
                  <button
                    class="rounded-xl p-1 text-muted-foreground transition-all duration-200 hover:bg-muted"
                    @click="closePaymentModal"
                  >
                    <X class="h-5 w-5" />
                  </button>
                </div>

                <div class="mt-5 space-y-4">
                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-foreground">
                      Phone Number
                    </label>
                    <div class="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-primary/10">
                      <Phone class="h-4 w-4 text-muted-foreground" />
                      <input
                        v-model="phoneNumber"
                        type="tel"
                        class="flex-1 text-sm text-foreground outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-foreground">
                      Amount (KES)
                    </label>
                    <div class="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-primary/10">
                      <span class="text-sm font-medium text-muted-foreground">KES</span>
                      <input
                        v-model="paymentAmount"
                        type="number"
                        class="flex-1 text-sm text-foreground outline-none"
                      />
                    </div>
                  </div>

                  <div class="rounded-xl bg-warning-light p-3">
                    <p class="text-xs text-warning-foreground">
                      An M-Pesa STK push will be sent to your phone. Please enter your M-Pesa PIN to complete the payment.
                    </p>
                  </div>

                  <button
                    class="w-full rounded-xl bg-success py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 active:bg-success/90"
                    @click="submitPayment"
                  >
                    Send M-Pesa Request
                  </button>
                </div>
              </template>

              <!-- Processing Step -->
              <template v-if="paymentStep === 'processing'">
                <div class="flex flex-col items-center py-8">
                  <Loader2 class="h-12 w-12 animate-spin text-success" />
                  <p class="mt-4 text-lg font-semibold tracking-tight text-foreground">Processing Payment...</p>
                  <p class="mt-1 text-sm text-muted-foreground">Check your phone for the M-Pesa prompt</p>
                </div>
              </template>

              <!-- Success Step -->
              <template v-if="paymentStep === 'success'">
                <div class="flex flex-col items-center py-8">
                  <div class="flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
                    <CheckCircle class="h-10 w-10 text-success" />
                  </div>
                  <p class="mt-4 text-lg font-bold tracking-tight text-foreground">Payment Successful!</p>
                  <p class="mt-1 text-sm text-muted-foreground">
                    KES {{ Number(paymentAmount).toLocaleString('en-KE') }} received
                  </p>
                  <p class="mt-3 rounded-xl bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
                    Ref: QKL7MPWX92
                  </p>
                  <button
                    class="mt-6 w-full rounded-xl bg-parent py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 active:bg-parent/90"
                    @click="closePaymentModal"
                  >
                    Done
                  </button>
                </div>
              </template>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-up-enter-active {
  transition: transform 0.3s ease-out;
}
.slide-up-leave-active {
  transition: transform 0.2s ease-in;
}
.slide-up-enter-from {
  transform: translateY(100%);
}
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
