import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  invoices as invoiceData,
  transactions as transactionData,
  arrearsRecords as arrearsData,
  monthlyRevenue as revenueData,
} from '@/data/financial'
import { expenses as expenseData } from '@/data/expenses'
import type { Invoice, Transaction, ArrearsRecord, MonthlyRevenue, Expense } from '@/types'

export const useFinanceStore = defineStore('finance', () => {
  const invoices = ref<Invoice[]>([...invoiceData])
  const transactions = ref<Transaction[]>([...transactionData])
  const arrearsRecords = ref<ArrearsRecord[]>([...arrearsData])
  const monthlyRevenue = ref<MonthlyRevenue[]>([...revenueData])
  const expenses = ref<Expense[]>([...expenseData])

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

  const totalExpenses = computed(() =>
    expenses.value.reduce((sum, e) => sum + e.amount, 0),
  )

  const approvedExpenses = computed(() =>
    expenses.value.filter((e) => e.status === 'approved'),
  )

  const pendingExpenses = computed(() =>
    expenses.value.filter((e) => e.status === 'pending'),
  )

  const expensesByCategory = computed(() => {
    const grouped: Record<string, number> = {}
    for (const e of expenses.value) {
      grouped[e.category] = (grouped[e.category] ?? 0) + e.amount
    }
    return grouped
  })

  const netIncome = computed(() => totalCollected.value - totalExpenses.value)

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
      record.lastContactDate = new Date().toISOString().slice(0, 10)
      record.lastContactMethod = 'SMS'
      record.status = 'contacted'
    }
  }

  function addInvoice(invoice: Invoice) {
    invoices.value.push(invoice)
  }

  function updateInvoice(id: string, updates: Partial<Invoice>) {
    const invoice = invoices.value.find((inv) => inv.id === id)
    if (invoice) Object.assign(invoice, updates)
  }

  function deleteInvoice(id: string) {
    const index = invoices.value.findIndex((inv) => inv.id === id)
    if (index !== -1) invoices.value.splice(index, 1)
  }

  function addTransaction(transaction: Transaction) {
    transactions.value.push(transaction)
  }

  function addExpense(expense: Expense) {
    expenses.value.push(expense)
  }

  function updateExpense(id: string, updates: Partial<Expense>) {
    const expense = expenses.value.find((e) => e.id === id)
    if (expense) Object.assign(expense, updates)
  }

  function deleteExpense(id: string) {
    const index = expenses.value.findIndex((e) => e.id === id)
    if (index !== -1) expenses.value.splice(index, 1)
  }

  function approveExpense(id: string, approvedBy: string) {
    const expense = expenses.value.find((e) => e.id === id)
    if (expense) {
      expense.status = 'approved'
      expense.approvedBy = approvedBy
    }
  }

  return {
    invoices,
    transactions,
    arrearsRecords,
    monthlyRevenue,
    expenses,
    totalRevenue,
    totalCollected,
    totalArrears,
    collectionRate,
    arrearsByBucket,
    unmatchedTransactions,
    pendingTransactions,
    overdueInvoices,
    totalExpenses,
    approvedExpenses,
    pendingExpenses,
    expensesByCategory,
    netIncome,
    markAsReconciled,
    sendFollowUp,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    addTransaction,
    addExpense,
    updateExpense,
    deleteExpense,
    approveExpense,
  }
})
