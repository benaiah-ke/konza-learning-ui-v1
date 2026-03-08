import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  invoices as invoiceData,
  transactions as transactionData,
  arrearsRecords as arrearsData,
  monthlyRevenue as revenueData,
} from '@/data/financial'
import type { Invoice, Transaction, ArrearsRecord, MonthlyRevenue } from '@/types'

export const useFinanceStore = defineStore('finance', () => {
  const invoices = ref<Invoice[]>([...invoiceData])
  const transactions = ref<Transaction[]>([...transactionData])
  const arrearsRecords = ref<ArrearsRecord[]>([...arrearsData])
  const monthlyRevenue = ref<MonthlyRevenue[]>([...revenueData])

  // ── Computed ────────────────────────────────────────────────

  const totalRevenue = computed(() =>
    invoices.value.reduce((sum, inv) => sum + inv.totalAmount, 0),
  )

  const totalCollected = computed(() =>
    invoices.value.reduce((sum, inv) => sum + inv.paidAmount, 0),
  )

  const totalArrears = computed(() =>
    invoices.value.reduce((sum, inv) => sum + inv.balance, 0),
  )

  const collectionRate = computed(() => {
    if (totalRevenue.value === 0) return 0
    return Math.round((totalCollected.value / totalRevenue.value) * 100 * 10) / 10
  })

  const arrearsByBucket = computed(() => {
    const buckets: Record<string, number> = {
      current: 0,
      '30days': 0,
      '60days': 0,
      '90plus': 0,
    }
    for (const record of arrearsRecords.value) {
      buckets[record.agingBucket] = (buckets[record.agingBucket] ?? 0) + 1
    }
    return buckets
  })

  const unmatchedTransactions = computed(() =>
    transactions.value.filter((t) => t.status === 'unmatched'),
  )

  const pendingTransactions = computed(() =>
    transactions.value.filter((t) => t.status === 'pending'),
  )

  const overdueInvoices = computed(() =>
    invoices.value.filter((inv) => inv.status === 'overdue'),
  )

  // ── Actions ─────────────────────────────────────────────────

  function markAsReconciled(txId: string) {
    const tx = transactions.value.find((t) => t.id === txId)
    if (tx) {
      tx.status = 'matched'
    }
  }

  function sendFollowUp(arrearsId: string) {
    const record = arrearsRecords.value.find((a) => a.id === arrearsId)
    if (record) {
      record.lastContactDate = new Date().toISOString().split('T')[0]
      record.lastContactMethod = 'SMS'
      record.status = 'contacted'
    }
  }

  return {
    invoices,
    transactions,
    arrearsRecords,
    monthlyRevenue,
    totalRevenue,
    totalCollected,
    totalArrears,
    collectionRate,
    arrearsByBucket,
    unmatchedTransactions,
    pendingTransactions,
    overdueInvoices,
    markAsReconciled,
    sendFollowUp,
  }
})
