import { createRouter, createWebHistory } from 'vue-router'
import { executiveRoutes } from './routes/executive'
import { financeRoutes } from './routes/finance'
import { parentRoutes } from './routes/parent'
import { teacherRoutes } from './routes/teacher'
import { admissionsRoutes } from './routes/admissions'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'portal-select',
      component: () => import('@/views/PortalSelect.vue'),
      meta: { title: 'Select Portal' },
    },
    ...executiveRoutes,
    ...financeRoutes,
    ...parentRoutes,
    ...teacherRoutes,
    ...admissionsRoutes,
  ],
})

router.beforeEach((to) => {
  const title = (to.meta.title as string) || 'Konza Learning Centre'
  document.title = `${title} | Konza Learning Centre`
})

export default router
