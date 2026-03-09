import type { AcademicRecord } from '@/types'

function gradeFromScore(score: number): AcademicRecord['grade'] {
  if (score === 5) return 'Exceeding'
  if (score === 4) return 'Meeting'
  if (score === 3) return 'Approaching'
  if (score === 2) return 'Developing'
  return 'Beginning'
}

function rec(
  id: string,
  studentId: string,
  subject: AcademicRecord['subject'],
  score: number,
  assessedBy: string,
  comments?: string,
): AcademicRecord {
  return {
    id,
    studentId,
    term: 'Term 1 2026',
    subject,
    score,
    grade: gradeFromScore(score),
    comments,
    assessedBy,
    assessedDate: '2026-03-07',
  }
}

const subjects: AcademicRecord['subject'][] = [
  'numeracy', 'literacy', 'kiswahili', 'science', 'creative-arts', 'social-skills', 'physical-development',
]

// Generate records for a subset of students with realistic scores
// Karen Campus students assessed by Anne Njeri (stf-001)
const karenRecords: AcademicRecord[] = [
  // stu-001 Amani Wanjiku — strong all-round
  rec('acr-001', 'stu-001', 'numeracy', 4, 'Anne Njeri', 'Good number recognition'),
  rec('acr-002', 'stu-001', 'literacy', 5, 'Anne Njeri', 'Excellent letter sounds'),
  rec('acr-003', 'stu-001', 'kiswahili', 4, 'Anne Njeri'),
  rec('acr-004', 'stu-001', 'science', 4, 'Anne Njeri', 'Curious about nature'),
  rec('acr-005', 'stu-001', 'creative-arts', 5, 'Anne Njeri', 'Beautiful artwork'),
  rec('acr-006', 'stu-001', 'social-skills', 4, 'Anne Njeri'),
  rec('acr-007', 'stu-001', 'physical-development', 4, 'Anne Njeri'),

  // stu-002 Baraka Ochieng — developing
  rec('acr-008', 'stu-002', 'numeracy', 3, 'Anne Njeri', 'Needs practice with counting'),
  rec('acr-009', 'stu-002', 'literacy', 3, 'Anne Njeri'),
  rec('acr-010', 'stu-002', 'kiswahili', 2, 'Anne Njeri', 'Struggles with pronunciation'),
  rec('acr-011', 'stu-002', 'science', 3, 'Anne Njeri'),
  rec('acr-012', 'stu-002', 'creative-arts', 4, 'Anne Njeri', 'Enjoys painting'),
  rec('acr-013', 'stu-002', 'social-skills', 3, 'Anne Njeri'),
  rec('acr-014', 'stu-002', 'physical-development', 4, 'Anne Njeri'),

  // stu-004 Diana Kamau — strong in STEM
  rec('acr-015', 'stu-004', 'numeracy', 5, 'Lucy Wairimu', 'Exceptional pattern recognition'),
  rec('acr-016', 'stu-004', 'literacy', 4, 'Lucy Wairimu'),
  rec('acr-017', 'stu-004', 'kiswahili', 3, 'Lucy Wairimu'),
  rec('acr-018', 'stu-004', 'science', 5, 'Lucy Wairimu', 'Asks great questions'),
  rec('acr-019', 'stu-004', 'creative-arts', 3, 'Lucy Wairimu'),
  rec('acr-020', 'stu-004', 'social-skills', 4, 'Lucy Wairimu'),
  rec('acr-021', 'stu-004', 'physical-development', 4, 'Lucy Wairimu'),

  // stu-007 Grace Muthoni — balanced learner
  rec('acr-022', 'stu-007', 'numeracy', 4, 'Anne Njeri'),
  rec('acr-023', 'stu-007', 'literacy', 4, 'Anne Njeri', 'Enjoys reading corner'),
  rec('acr-024', 'stu-007', 'kiswahili', 4, 'Anne Njeri', 'Good conversational skills'),
  rec('acr-025', 'stu-007', 'science', 3, 'Anne Njeri'),
  rec('acr-026', 'stu-007', 'creative-arts', 5, 'Anne Njeri', 'Outstanding creativity'),
  rec('acr-027', 'stu-007', 'social-skills', 5, 'Anne Njeri', 'Natural leader'),
  rec('acr-028', 'stu-007', 'physical-development', 4, 'Anne Njeri'),

  // stu-010 Joy Akinyi — needs support
  rec('acr-029', 'stu-010', 'numeracy', 2, 'Lucy Wairimu', 'Extra support recommended'),
  rec('acr-030', 'stu-010', 'literacy', 2, 'Lucy Wairimu', 'Working on letter recognition'),
  rec('acr-031', 'stu-010', 'kiswahili', 3, 'Lucy Wairimu'),
  rec('acr-032', 'stu-010', 'science', 3, 'Lucy Wairimu'),
  rec('acr-033', 'stu-010', 'creative-arts', 4, 'Lucy Wairimu', 'Very expressive artistically'),
  rec('acr-034', 'stu-010', 'social-skills', 3, 'Lucy Wairimu'),
  rec('acr-035', 'stu-010', 'physical-development', 3, 'Lucy Wairimu'),

  // stu-013 Mwangi Njoroge — excelling
  rec('acr-036', 'stu-013', 'numeracy', 5, 'Anne Njeri', 'Advanced for age group'),
  rec('acr-037', 'stu-013', 'literacy', 5, 'Anne Njeri', 'Reading simple words'),
  rec('acr-038', 'stu-013', 'kiswahili', 4, 'Anne Njeri'),
  rec('acr-039', 'stu-013', 'science', 5, 'Anne Njeri'),
  rec('acr-040', 'stu-013', 'creative-arts', 4, 'Anne Njeri'),
  rec('acr-041', 'stu-013', 'social-skills', 4, 'Anne Njeri', 'Works well with peers'),
  rec('acr-042', 'stu-013', 'physical-development', 5, 'Anne Njeri'),
]

// Westlands Campus students assessed by Caroline Nyokabi (stf-010)
const westlandsRecords: AcademicRecord[] = [
  // stu-016 Purity Mwikali — strong
  rec('acr-043', 'stu-016', 'numeracy', 4, 'Caroline Nyokabi'),
  rec('acr-044', 'stu-016', 'literacy', 5, 'Caroline Nyokabi', 'Fluent reader'),
  rec('acr-045', 'stu-016', 'kiswahili', 4, 'Caroline Nyokabi'),
  rec('acr-046', 'stu-016', 'science', 4, 'Caroline Nyokabi'),
  rec('acr-047', 'stu-016', 'creative-arts', 4, 'Caroline Nyokabi'),
  rec('acr-048', 'stu-016', 'social-skills', 5, 'Caroline Nyokabi', 'Very cooperative'),
  rec('acr-049', 'stu-016', 'physical-development', 4, 'Caroline Nyokabi'),

  // stu-019 Samuel Kiptoo — average
  rec('acr-050', 'stu-019', 'numeracy', 3, 'Brian Rop'),
  rec('acr-051', 'stu-019', 'literacy', 3, 'Brian Rop'),
  rec('acr-052', 'stu-019', 'kiswahili', 4, 'Brian Rop', 'Strong Kiswahili speaker'),
  rec('acr-053', 'stu-019', 'science', 3, 'Brian Rop'),
  rec('acr-054', 'stu-019', 'creative-arts', 3, 'Brian Rop'),
  rec('acr-055', 'stu-019', 'social-skills', 4, 'Brian Rop'),
  rec('acr-056', 'stu-019', 'physical-development', 5, 'Brian Rop', 'Very active and coordinated'),

  // stu-021 Umi Abdalla — developing
  rec('acr-057', 'stu-021', 'numeracy', 3, 'Caroline Nyokabi'),
  rec('acr-058', 'stu-021', 'literacy', 2, 'Caroline Nyokabi', 'Needs more reading time'),
  rec('acr-059', 'stu-021', 'kiswahili', 3, 'Caroline Nyokabi'),
  rec('acr-060', 'stu-021', 'science', 4, 'Caroline Nyokabi', 'Loves experiments'),
  rec('acr-061', 'stu-021', 'creative-arts', 4, 'Caroline Nyokabi'),
  rec('acr-062', 'stu-021', 'social-skills', 3, 'Caroline Nyokabi'),
  rec('acr-063', 'stu-021', 'physical-development', 3, 'Caroline Nyokabi'),

  // stu-024 Wambui Gichuki — top performer
  rec('acr-064', 'stu-024', 'numeracy', 5, 'Brian Rop', 'Counts to 100'),
  rec('acr-065', 'stu-024', 'literacy', 5, 'Brian Rop', 'Writing short sentences'),
  rec('acr-066', 'stu-024', 'kiswahili', 5, 'Brian Rop'),
  rec('acr-067', 'stu-024', 'science', 5, 'Brian Rop', 'Excellent observation skills'),
  rec('acr-068', 'stu-024', 'creative-arts', 4, 'Brian Rop'),
  rec('acr-069', 'stu-024', 'social-skills', 5, 'Brian Rop'),
  rec('acr-070', 'stu-024', 'physical-development', 5, 'Brian Rop'),

  // stu-026 Yusuf Noor — mixed
  rec('acr-071', 'stu-026', 'numeracy', 4, 'Caroline Nyokabi'),
  rec('acr-072', 'stu-026', 'literacy', 3, 'Caroline Nyokabi'),
  rec('acr-073', 'stu-026', 'kiswahili', 3, 'Caroline Nyokabi'),
  rec('acr-074', 'stu-026', 'science', 4, 'Caroline Nyokabi'),
  rec('acr-075', 'stu-026', 'creative-arts', 5, 'Caroline Nyokabi', 'Talented in music'),
  rec('acr-076', 'stu-026', 'social-skills', 3, 'Caroline Nyokabi'),
  rec('acr-077', 'stu-026', 'physical-development', 4, 'Caroline Nyokabi'),
]

export const academicRecords: AcademicRecord[] = [...karenRecords, ...westlandsRecords]

// Unused helper kept for reference — the subjects array can be used by views
export { subjects }
