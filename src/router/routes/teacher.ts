import type { RouteRecordRaw } from 'vue-router'

export const teacherRoutes: RouteRecordRaw[] = [
  {
    path: '/teacher',
    component: () => import('@/layouts/TeacherLayout.vue'),
    meta: { portal: 'teacher' },
    children: [
      {
        path: '',
        name: 'teacher-dashboard',
        component: () => import('@/portals/teacher/views/ClassDashboard.vue'),
        meta: { title: 'My Class' },
      },
      {
        path: 'milestones',
        name: 'teacher-milestones',
        component: () => import('@/portals/teacher/views/MilestonesLogger.vue'),
        meta: { title: 'Milestones' },
      },
      {
        path: 'incidents',
        name: 'teacher-incidents',
        component: () => import('@/portals/teacher/views/IncidentHealthLog.vue'),
        meta: { title: 'Incident & Health Log' },
      },
      {
        path: 'communication',
        name: 'teacher-comms',
        component: () => import('@/portals/teacher/views/ParentComms.vue'),
        meta: { title: 'Parent Communication' },
      },
      {
        path: 'grades',
        name: 'teacher-grades',
        component: () => import('@/portals/teacher/views/GradeRecording.vue'),
        meta: { title: 'Grade Recording' },
      },
    ],
  },
]
