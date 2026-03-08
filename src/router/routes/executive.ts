import type { RouteRecordRaw } from 'vue-router'

export const executiveRoutes: RouteRecordRaw[] = [
  {
    path: '/executive',
    component: () => import('@/layouts/ExecutiveLayout.vue'),
    meta: { portal: 'executive' },
    children: [
      {
        path: '',
        name: 'executive-dashboard',
        component: () => import('@/portals/executive/views/CommandDashboard.vue'),
        meta: { title: 'Command Dashboard' },
      },
      {
        path: 'campus-performance',
        name: 'executive-campus',
        component: () => import('@/portals/executive/views/CampusPerformance.vue'),
        meta: { title: 'Campus Performance' },
      },
      {
        path: 'revenue-forecasting',
        name: 'executive-revenue',
        component: () => import('@/portals/executive/views/RevenueForecasting.vue'),
        meta: { title: 'Revenue Forecasting' },
      },
      {
        path: 'arrears-aging',
        name: 'executive-arrears',
        component: () => import('@/portals/executive/views/ArrearsAging.vue'),
        meta: { title: 'Arrears Aging' },
      },
    ],
  },
]
