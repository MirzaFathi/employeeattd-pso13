/**
 * ───────────────────────────────────────────────────────────
 * Payroll Calculation Engine
 * ───────────────────────────────────────────────────────────
 *
 * Pure business-logic functions for payroll calculations.
 * Extracted from app/api/payroll/route.ts so they can be
 * unit-tested (and coverage-tracked) independently of
 * the HTTP / DB layers.
 *
 * Business rules:
 *   • perDaySalary      = basicSalary / WORKING_DAYS_PER_MONTH
 *   • absentDeduction   = absentDays × perDaySalary
 *   • lateDeduction     = floor(lateDays / 3) × perDaySalary
 *   • unpaidLeaveDed    = unpaidLeaveDays × perDaySalary
 *   • netSalary         = basic − deductions + bonuses
 *   • presentDays       = present + late + (halfDays × 0.5)
 */

export const WORKING_DAYS_PER_MONTH = 26;

export interface PayrollInput {
  basicSalary: number;
  absentDays: number;
  lateDays: number;
  unpaidLeaveDays: number;
  bonuses?: number;
}

export interface PayrollResult {
  perDaySalary: number;
  absentDeduction: number;
  lateDeduction: number;
  unpaidLeaveDeduction: number;
  totalDeductions: number;
  netSalary: number;
}

export interface PresentDaysInput {
  present: number;
  late: number;
  halfDays: number;
}

/**
 * Calculate payroll deductions and net salary from the given input.
 */
export function calculatePayroll(input: PayrollInput): PayrollResult {
  // Input Validation
  if (input.basicSalary < 0) {
    throw new Error("Basic salary cannot be negative");
  }
  if (input.absentDays < 0) {
    throw new Error("Absent days cannot be negative");
  }
  if (input.absentDays > 31) {
    throw new Error("Absent days cannot exceed 31");
  }
  if (input.lateDays < 0) {
    throw new Error("Late days cannot be negative");
  }
  if (input.unpaidLeaveDays < 0) {
    throw new Error("Unpaid leave days cannot be negative");
  }
  if (input.unpaidLeaveDays > 31) {
    throw new Error("Unpaid leave days cannot exceed 31");
  }
  if (input.bonuses !== undefined && input.bonuses < 0) {
    throw new Error("Bonuses cannot be negative");
  }

  const perDaySalary = input.basicSalary / WORKING_DAYS_PER_MONTH;
  const absentDeduction = input.absentDays * perDaySalary;
  const lateDeduction = Math.floor(input.lateDays / 3) * perDaySalary;
  const unpaidLeaveDeduction = input.unpaidLeaveDays * perDaySalary;
  const totalDeductions =
    absentDeduction + lateDeduction + unpaidLeaveDeduction;
  const bonuses = input.bonuses ?? 0;
  const netSalary = input.basicSalary - totalDeductions + bonuses;

  // Warning check for high deductions
  if (totalDeductions > input.basicSalary) {
    console.warn(`Total deductions (${totalDeductions}) exceed basic salary (${input.basicSalary}).`);
  }

  // Warning check for negative net salary
  if (netSalary < 0) {
    console.warn(`Net salary is negative: ${netSalary}`);
  }

  return {
    perDaySalary,
    absentDeduction,
    lateDeduction,
    unpaidLeaveDeduction,
    totalDeductions,
    netSalary,
  };
}

/**
 * Calculate the effective number of present days.
 * Half-days count as 0.5.
 */
export function calculatePresentDays(input: PresentDaysInput): number {
  if (input.present < 0 || input.late < 0 || input.halfDays < 0) {
    throw new Error("Attendance inputs cannot be negative");
  }
  if (input.present + input.late + input.halfDays > 31) {
    throw new Error("Total attendance days cannot exceed 31");
  }
  return input.present + input.late + input.halfDays * 0.5;
}
