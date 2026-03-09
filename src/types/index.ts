export interface Campus {
  id: string
  name: string
  location: string
  capacity: number
  currentEnrollment: number
  staffCount: number
  established: string
}

export interface Student {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  age: number
  gender: 'M' | 'F'
  campusId: string
  className: string
  parentId: string
  enrollmentDate: string
  status: 'active' | 'withdrawn' | 'graduated'
  photoInitials: string
}

export interface Parent {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  studentIds: string[]
}

export interface StaffMember {
  id: string
  firstName: string
  lastName: string
  role: string
  department: string
  campusId: string
  email: string
  phone: string
  joinDate: string
  status: 'active' | 'on-leave' | 'terminated'
  photoInitials: string
}

export interface Invoice {
  id: string
  studentId: string
  term: string
  items: InvoiceItem[]
  totalAmount: number
  paidAmount: number
  balance: number
  status: 'paid' | 'partial' | 'unpaid' | 'overdue'
  issuedDate: string
  dueDate: string
}

export interface InvoiceItem {
  description: string
  amount: number
}

export interface Transaction {
  id: string
  invoiceId: string
  studentId: string
  amount: number
  method: 'mpesa' | 'bank'
  reference: string
  date: string
  status: 'matched' | 'unmatched' | 'pending'
  mpesaCode?: string
}

export interface ArrearsRecord {
  id: string
  studentId: string
  parentId: string
  totalOwed: number
  agingBucket: 'current' | '30days' | '60days' | '90plus'
  lastContactDate?: string
  lastContactMethod?: string
  status: 'new' | 'contacted' | 'promise-to-pay' | 'escalated'
  notes?: string
}

export interface AdmissionLead {
  id: string
  childName: string
  childAge: number
  parentName: string
  parentPhone: string
  parentEmail: string
  source: 'website' | 'referral' | 'social-media' | 'walk-in' | 'event'
  stage: 'inquiry' | 'tour-scheduled' | 'tour-completed' | 'application' | 'assessment' | 'offered' | 'enrolled' | 'waitlisted'
  campusPreference: string
  date: string
  notes?: string
}

export interface LeaveRequest {
  id: string
  staffId: string
  type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity'
  startDate: string
  endDate: string
  days: number
  status: 'pending' | 'approved' | 'declined'
  reason: string
}

export interface Milestone {
  id: string
  studentId: string
  domain: 'physical' | 'cognitive' | 'social' | 'language' | 'creative'
  title: string
  description: string
  achieved: boolean
  achievedDate?: string
  notes?: string
  loggedBy: string
}

export interface DailyActivity {
  id: string
  studentId: string
  date: string
  type: 'meal' | 'nap' | 'activity' | 'learning' | 'outdoor'
  title: string
  description: string
  time: string
}

export interface Message {
  id: string
  senderId: string
  senderName: string
  senderRole: 'teacher' | 'parent' | 'admin'
  recipientId: string
  content: string
  timestamp: string
  read: boolean
}

export interface Incident {
  id: string
  studentId: string
  type: 'injury' | 'health' | 'behavioral' | 'other'
  severity: 'low' | 'medium' | 'high'
  description: string
  actionTaken: string
  reportedBy: string
  date: string
  parentNotified: boolean
}

export interface MonthlyRevenue {
  month: string
  expected: number
  collected: number
  arrears: number
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'danger'
  date: string
  read: boolean
}

export interface Expense {
  id: string
  date: string
  category: 'salaries' | 'rent' | 'utilities' | 'supplies' | 'transport' | 'food' | 'maintenance' | 'marketing' | 'other'
  description: string
  amount: number
  campusId: string
  vendor?: string
  reference?: string
  status: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  createdBy: string
}

export interface PayrollRecord {
  id: string
  staffId: string
  month: string
  basicSalary: number
  allowances: number
  deductions: number
  netPay: number
  status: 'draft' | 'pending' | 'approved' | 'paid'
  payDate?: string
}

export interface AcademicRecord {
  id: string
  studentId: string
  term: string
  subject: 'numeracy' | 'literacy' | 'kiswahili' | 'science' | 'creative-arts' | 'social-skills' | 'physical-development'
  score: number
  grade: 'Exceeding' | 'Meeting' | 'Approaching' | 'Developing' | 'Beginning'
  comments?: string
  assessedBy: string
  assessedDate: string
}

export interface MonthlyExpense {
  month: string
  totalExpenses: number
  byCategory: Record<string, number>
}
