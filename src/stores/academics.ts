import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { academicRecords as recordData } from '@/data/academics'
import type { AcademicRecord } from '@/types'

export const useAcademicsStore = defineStore('academics', () => {
  const academicRecords = ref<AcademicRecord[]>([...recordData])

  // ── Computed ────────────────────────────────────────────────

  const getRecordsByStudent = computed(() => {
    return (studentId: string) => academicRecords.value.filter((r) => r.studentId === studentId)
  })

  const getRecordsByTerm = computed(() => {
    return (term: string) => academicRecords.value.filter((r) => r.term === term)
  })

  const averageScoreBySubject = computed(() => {
    const subjectTotals: Record<string, { sum: number; count: number }> = {}
    for (const r of academicRecords.value) {
      const entry = (subjectTotals[r.subject] ??= { sum: 0, count: 0 })
      entry.sum += r.score
      entry.count++
    }
    const result: Record<string, number> = {}
    for (const [subject, { sum, count }] of Object.entries(subjectTotals)) {
      result[subject] = Math.round((sum / count) * 10) / 10
    }
    return result
  })

  const gradeDistribution = computed(() => {
    const dist: Record<string, number> = {
      Exceeding: 0,
      Meeting: 0,
      Approaching: 0,
      Developing: 0,
      Beginning: 0,
    }
    for (const r of academicRecords.value) {
      dist[r.grade] = (dist[r.grade] ?? 0) + 1
    }
    return dist
  })

  const classPerformanceSummary = computed(() => {
    const studentScores: Record<string, number[]> = {}
    for (const r of academicRecords.value) {
      const arr = (studentScores[r.studentId] ??= [])
      arr.push(r.score)
    }
    const averages = Object.entries(studentScores).map(([studentId, scores]) => ({
      studentId,
      average: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
    }))
    averages.sort((a, b) => b.average - a.average)
    return averages
  })

  const assessedStudentCount = computed(() => {
    return new Set(academicRecords.value.map((r) => r.studentId)).size
  })

  const overallAverageScore = computed(() => {
    if (academicRecords.value.length === 0) return 0
    const total = academicRecords.value.reduce((sum, r) => sum + r.score, 0)
    return Math.round((total / academicRecords.value.length) * 10) / 10
  })

  // ── Actions ─────────────────────────────────────────────────

  function addRecord(record: AcademicRecord) {
    academicRecords.value.push(record)
  }

  function updateRecord(id: string, updates: Partial<AcademicRecord>) {
    const record = academicRecords.value.find((r) => r.id === id)
    if (record) Object.assign(record, updates)
  }

  function deleteRecord(id: string) {
    const index = academicRecords.value.findIndex((r) => r.id === id)
    if (index !== -1) academicRecords.value.splice(index, 1)
  }

  function bulkAddRecords(records: AcademicRecord[]) {
    academicRecords.value.push(...records)
  }

  return {
    academicRecords,
    getRecordsByStudent,
    getRecordsByTerm,
    averageScoreBySubject,
    gradeDistribution,
    classPerformanceSummary,
    assessedStudentCount,
    overallAverageScore,
    addRecord,
    updateRecord,
    deleteRecord,
    bulkAddRecords,
  }
})
