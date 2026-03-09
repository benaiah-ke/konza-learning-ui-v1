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
      const arr = (grouped[student.className] ??= [])
      arr.push(student)
    }
    return grouped
  })

  // ── Actions ─────────────────────────────────────────────────

  function addStudent(student: Student) {
    students.value.push(student)
  }

  function updateStudent(id: string, updates: Partial<Student>) {
    const student = students.value.find((s) => s.id === id)
    if (student) Object.assign(student, updates)
  }

  function deleteStudent(id: string) {
    const index = students.value.findIndex((s) => s.id === id)
    if (index !== -1) students.value.splice(index, 1)
  }

  function addParent(parent: Parent) {
    parents.value.push(parent)
  }

  function updateParent(id: string, updates: Partial<Parent>) {
    const parent = parents.value.find((p) => p.id === id)
    if (parent) Object.assign(parent, updates)
  }

  return {
    students,
    parents,
    getStudentById,
    getStudentsByClass,
    getStudentsByCampus,
    getParentById,
    activeStudents,
    studentsByClassName,
    addStudent,
    updateStudent,
    deleteStudent,
    addParent,
    updateParent,
  }
})
