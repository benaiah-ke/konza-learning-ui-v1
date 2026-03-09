import type { RouteRecordRaw } from 'vue-router'

export const admissionsRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { portal: 'admissions' },
    children: [
      {
        path: '',
        name: 'admissions-kanban',
        component: () => import('@/portals/admissions/views/KanbanBoard.vue'),
        meta: { title: 'Admissions Pipeline' },
      },
      {
        path: 'tours',
        name: 'admissions-tours',
        component: () => import('@/portals/admissions/views/TourScheduling.vue'),
        meta: { title: 'Tour Scheduling' },
      },
      {
        path: 'staff',
        name: 'admissions-staff',
        component: () => import('@/portals/admissions/views/StaffRoster.vue'),
        meta: { title: 'Staff Roster' },
      },
      {
        path: 'leave',
        name: 'admissions-leave',
        component: () => import('@/portals/admissions/views/LeaveManagement.vue'),
        meta: { title: 'Leave Management' },
      },
      {
        path: 'payroll',
        name: 'admissions-payroll',
        component: () => import('@/portals/admissions/views/PayrollManagement.vue'),
        meta: { title: 'Payroll Management' },
      },
    ],
  },
]
