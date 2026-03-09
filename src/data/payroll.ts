import type { PayrollRecord } from '@/types'

export const payrollRecords: PayrollRecord[] = [
  // ── February 2026 — All paid ──────────────────────────────
  // Karen Campus
  { id: 'pay-001', staffId: 'stf-001', month: '2026-02', basicSalary: 95000, allowances: 15000, deductions: 8500, netPay: 101500, status: 'paid', payDate: '2026-02-28' },
  { id: 'pay-002', staffId: 'stf-002', month: '2026-02', basicSalary: 95000, allowances: 15000, deductions: 8500, netPay: 101500, status: 'paid', payDate: '2026-02-28' },
  { id: 'pay-003', staffId: 'stf-003', month: '2026-02', basicSalary: 65000, allowances: 10000, deductions: 5800, netPay: 69200, status: 'paid', payDate: '2026-02-28' },
  { id: 'pay-004', staffId: 'stf-004', month: '2026-02', basicSalary: 65000, allowances: 10000, deductions: 5800, netPay: 69200, status: 'paid', payDate: '2026-02-28' },
  { id: 'pay-005', staffId: 'stf-005', month: '2026-02', basicSalary: 80000, allowances: 12000, deductions: 7200, netPay: 84800, status: 'paid', payDate: '2026-02-28' },
  { id: 'pay-006', staffId: 'stf-006', month: '2026-02', basicSalary: 120000, allowances: 20000, deductions: 11000, netPay: 129000, status: 'paid', payDate: '2026-02-28' },
  { id: 'pay-007', staffId: 'stf-007', month: '2026-02', basicSalary: 35000, allowances: 5000, deductions: 3000, netPay: 37000, status: 'paid', payDate: '2026-02-28' },
  { id: 'pay-008', staffId: 'stf-008', month: '2026-02', basicSalary: 45000, allowances: 8000, deductions: 4000, netPay: 49000, status: 'paid', payDate: '2026-02-28' },
  { id: 'pay-009', staffId: 'stf-009', month: '2026-02', basicSalary: 40000, allowances: 5000, deductions: 3500, netPay: 41500, status: 'paid', payDate: '2026-02-28' },
  // Westlands Campus
  { id: 'pay-010', staffId: 'stf-010', month: '2026-02', basicSalary: 95000, allowances: 15000, deductions: 8500, netPay: 101500, status: 'paid', payDate: '2026-02-28' },
  { id: 'pay-011', staffId: 'stf-011', month: '2026-02', basicSalary: 95000, allowances: 15000, deductions: 8500, netPay: 101500, status: 'paid', payDate: '2026-02-28' },
  { id: 'pay-012', staffId: 'stf-012', month: '2026-02', basicSalary: 65000, allowances: 10000, deductions: 5800, netPay: 69200, status: 'paid', payDate: '2026-02-28' },
  { id: 'pay-013', staffId: 'stf-013', month: '2026-02', basicSalary: 80000, allowances: 12000, deductions: 7200, netPay: 84800, status: 'paid', payDate: '2026-02-28' },
  { id: 'pay-014', staffId: 'stf-014', month: '2026-02', basicSalary: 120000, allowances: 20000, deductions: 11000, netPay: 129000, status: 'paid', payDate: '2026-02-28' },
  { id: 'pay-015', staffId: 'stf-015', month: '2026-02', basicSalary: 35000, allowances: 5000, deductions: 3000, netPay: 37000, status: 'paid', payDate: '2026-02-28' },

  // ── March 2026 — Mixed statuses ───────────────────────────
  // Karen Campus
  { id: 'pay-016', staffId: 'stf-001', month: '2026-03', basicSalary: 95000, allowances: 15000, deductions: 8500, netPay: 101500, status: 'approved' },
  { id: 'pay-017', staffId: 'stf-002', month: '2026-03', basicSalary: 95000, allowances: 15000, deductions: 8500, netPay: 101500, status: 'approved' },
  { id: 'pay-018', staffId: 'stf-003', month: '2026-03', basicSalary: 65000, allowances: 10000, deductions: 5800, netPay: 69200, status: 'approved' },
  { id: 'pay-019', staffId: 'stf-004', month: '2026-03', basicSalary: 65000, allowances: 10000, deductions: 5800, netPay: 69200, status: 'approved' },
  { id: 'pay-020', staffId: 'stf-005', month: '2026-03', basicSalary: 80000, allowances: 12000, deductions: 7200, netPay: 84800, status: 'pending' },
  { id: 'pay-021', staffId: 'stf-006', month: '2026-03', basicSalary: 120000, allowances: 20000, deductions: 11000, netPay: 129000, status: 'pending' },
  { id: 'pay-022', staffId: 'stf-007', month: '2026-03', basicSalary: 35000, allowances: 5000, deductions: 3000, netPay: 37000, status: 'pending' },
  { id: 'pay-023', staffId: 'stf-008', month: '2026-03', basicSalary: 45000, allowances: 8000, deductions: 4000, netPay: 49000, status: 'pending' },
  { id: 'pay-024', staffId: 'stf-009', month: '2026-03', basicSalary: 40000, allowances: 5000, deductions: 3500, netPay: 41500, status: 'draft' },
  // Westlands Campus
  { id: 'pay-025', staffId: 'stf-010', month: '2026-03', basicSalary: 95000, allowances: 15000, deductions: 8500, netPay: 101500, status: 'pending' },
  { id: 'pay-026', staffId: 'stf-011', month: '2026-03', basicSalary: 95000, allowances: 15000, deductions: 8500, netPay: 101500, status: 'pending' },
  { id: 'pay-027', staffId: 'stf-012', month: '2026-03', basicSalary: 65000, allowances: 10000, deductions: 5800, netPay: 69200, status: 'draft' },
  { id: 'pay-028', staffId: 'stf-013', month: '2026-03', basicSalary: 80000, allowances: 12000, deductions: 7200, netPay: 84800, status: 'pending' },
  { id: 'pay-029', staffId: 'stf-014', month: '2026-03', basicSalary: 120000, allowances: 20000, deductions: 11000, netPay: 129000, status: 'pending' },
  { id: 'pay-030', staffId: 'stf-015', month: '2026-03', basicSalary: 35000, allowances: 5000, deductions: 3000, netPay: 37000, status: 'draft' },
]
