import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { students as studentData } from '@/data/students'
import { parents as parentData } from '@/data/parents'
import type { Student, Parent } from '@/types'

export const useStudentsStore = defineStore('students', () => {
  const students = ref<Student[]>([...studentData])
  const parents = ref<Parent[]>([...parentData])

  const getStudentById = computed(() => {
    return (id: string) => students.value.find((s) => s.id === id)
  })

  const getStudentsByClass = computed(() => {
    return (className: string) =>
      students.value.filter((s) => s.className === className && s.status === 'active')
  })

  const getStudentsByCampus = computed(() => {
    return (campusId: string) =>
      students.value.filter((s) => s.campusId === campusId && s.status === 'active')
  })

  const getParentById = computed(() => {
    return (id: string) => parents.value.find((p) => p.id === id)
  })

  const activeStudents = computed(() =>
    students.value.filter((s) => s.status === 'active'),
  )

  const studentsByClassName = computed(() => {
    const grouped: Record<string, Student[]> = {}
    for (const student of students.value.filter((s) => s.status === 'active')) {
      if (!grouped[student.className]) {
        grouped[student.className] = []
      }
      grouped[student.className].push(student)
    }
    return grouped
  })

  return {
    students,
    parents,
    getStudentById,
    getStudentsByClass,
    getStudentsByCampus,
    getParentById,
    activeStudents,
    studentsByClassName,
  }
})
