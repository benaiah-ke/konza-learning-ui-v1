import type { RouteRecordRaw } from 'vue-router'

export const financeRoutes: RouteRecordRaw[] = [
  {
    path: '/finance',
    component: () => import('@/layouts/FinanceLayout.vue'),
    meta: { portal: 'finance' },
    children: [
      {
        path: '',
        name: 'finance-reconciliation',
        component: () => import('@/portals/finance/views/ReconciliationHub.vue'),
        meta: { title: 'Reconciliation Hub' },
      },
      {
        path: 'student-ledger',
        name: 'finance-ledger',
        component: () => import('@/portals/finance/views/StudentLedger.vue'),
        meta: { title: 'Student Ledger' },
      },
      {
        path: 'billing',
        name: 'finance-billing',
        component: () => import('@/portals/finance/views/BillingInvoice.vue'),
        meta: { title: 'Billing & Invoices' },
      },
      {
        path: 'arrears',
        name: 'finance-arrears',
        component: () => import('@/portals/finance/views/ArrearsQueue.vue'),
        meta: { title: 'Arrears Management' },
      },
    ],
  },
]
