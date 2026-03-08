import type { RouteRecordRaw } from 'vue-router'

export const parentRoutes: RouteRecordRaw[] = [
  {
    path: '/parent',
    component: () => import('@/layouts/ParentLayout.vue'),
    meta: { portal: 'parent' },
    children: [
      {
        path: '',
        name: 'parent-home',
        component: () => import('@/portals/parent/views/HomeFeed.vue'),
        meta: { title: 'Home' },
      },
      {
        path: 'payments',
        name: 'parent-payments',
        component: () => import('@/portals/parent/views/PaymentsBilling.vue'),
        meta: { title: 'Payments' },
      },
      {
        path: 'progress',
        name: 'parent-progress',
        component: () => import('@/portals/parent/views/ChildProgress.vue'),
        meta: { title: 'Progress' },
      },
      {
        path: 'messages',
        name: 'parent-messages',
        component: () => import('@/portals/parent/views/Messaging.vue'),
        meta: { title: 'Messages' },
      },
    ],
  },
]
