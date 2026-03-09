import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { admissionLeads as leadsData } from '@/data/admissions'
import type { AdmissionLead } from '@/types'

export const useAdmissionsStore = defineStore('admissions', () => {
  const admissionLeads = ref<AdmissionLead[]>([...leadsData])

  // ── Computed ────────────────────────────────────────────────

  const leadsByStage = computed(() => {
    const grouped: Record<string, AdmissionLead[]> = {}
    for (const lead of admissionLeads.value) {
      const arr = (grouped[lead.stage] ??= [])
      arr.push(lead)
    }
    return grouped
  })

  const totalInquiries = computed(() => admissionLeads.value.length)

  const conversionRate = computed(() => {
    const enrolled = admissionLeads.value.filter((l) => l.stage === 'enrolled').length
    if (totalInquiries.value === 0) return 0
    return Math.round((enrolled / totalInquiries.value) * 100 * 10) / 10
  })

  const leadsBySource = computed(() => {
    const grouped: Record<string, number> = {}
    for (const lead of admissionLeads.value) {
      grouped[lead.source] = (grouped[lead.source] || 0) + 1
    }
    return grouped
  })

  const activePipeline = computed(() =>
    admissionLeads.value.filter(
      (l) => l.stage !== 'enrolled' && l.stage !== 'waitlisted',
    ),
  )

  // ── Actions ─────────────────────────────────────────────────

  function moveLeadToStage(id: string, newStage: AdmissionLead['stage']) {
    const lead = admissionLeads.value.find((l) => l.id === id)
    if (lead) {
      lead.stage = newStage
    }
  }

  function addLead(lead: AdmissionLead) {
    admissionLeads.value.push(lead)
  }

  function updateLead(id: string, updates: Partial<AdmissionLead>) {
    const lead = admissionLeads.value.find((l) => l.id === id)
    if (lead) Object.assign(lead, updates)
  }

  function deleteLead(id: string) {
    const index = admissionLeads.value.findIndex((l) => l.id === id)
    if (index !== -1) admissionLeads.value.splice(index, 1)
  }

  return {
    admissionLeads,
    leadsByStage,
    totalInquiries,
    conversionRate,
    leadsBySource,
    activePipeline,
    moveLeadToStage,
    addLead,
    updateLead,
    deleteLead,
  }
})
