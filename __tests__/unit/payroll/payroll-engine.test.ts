/**
 * ───────────────────────────────────────────────────────────
 * Payroll Engine – Unit Tests
 * ───────────────────────────────────────────────────────────
 *
 * Pure-logic tests that validate the payroll calculation rules
 * defined in app/api/payroll/route.ts without touching the
 * database or HTTP layer.
 *
 * Business rules under test (source: app/api/payroll/route.ts):
 *   • perDaySalary   = basicSalary / 26
 *   • absentDeduction = absentDays × perDaySalary
 *   • lateDeduction   = floor(lateDays / 3) × perDaySalary
 *   • unpaidLeaveDed  = unpaidLeaveDays × perDaySalary
 *   • netSalary       = basic − absentDed − lateDed − unpaidLeaveDed
 *   • presentDays     = present + late + (halfDays × 0.5)
 *   • bonuses added   → netSalary = basic − deductions + bonuses
 */

import {
  calculatePayroll,
  calculatePresentDays,
  WORKING_DAYS_PER_MONTH,
} from "@/lib/payroll";

// ── Test Suites ────────────────────────────────────────────

describe("Payroll Engine", () => {
  // ────────────────────────────────────────────
  // 1. Basic Salary (gaji pokok)
  // ────────────────────────────────────────────
  describe("Basic Salary Calculation", () => {
    it("should compute per-day salary as basicSalary / 26", () => {
      const result = calculatePayroll({
        basicSalary: 5_200_000,
        absentDays: 0,
        lateDays: 0,
        unpaidLeaveDays: 0,
      });
      expect(result.perDaySalary).toBe(200_000);
    });

    it("should return full salary when no deductions apply", () => {
      const result = calculatePayroll({
        basicSalary: 5_200_000,
        absentDays: 0,
        lateDays: 0,
        unpaidLeaveDays: 0,
      });
      expect(result.netSalary).toBe(5_200_000);
      expect(result.totalDeductions).toBe(0);
    });

    it("should handle zero salary gracefully", () => {
      const result = calculatePayroll({
        basicSalary: 0,
        absentDays: 3,
        lateDays: 5,
        unpaidLeaveDays: 1,
      });
      expect(result.perDaySalary).toBe(0);
      expect(result.netSalary).toBe(0);
      expect(result.totalDeductions).toBe(0);
    });
  });

  // ────────────────────────────────────────────
  // 2. Absent Deductions (potongan absen)
  // ────────────────────────────────────────────
  describe("Absent Deduction", () => {
    it("should deduct perDaySalary for each absent day", () => {
      const result = calculatePayroll({
        basicSalary: 5_200_000,
        absentDays: 2,
        lateDays: 0,
        unpaidLeaveDays: 0,
      });
      expect(result.absentDeduction).toBe(400_000);
      expect(result.netSalary).toBe(4_800_000);
    });

    it("should deduct full salary when absent for 26 days", () => {
      const result = calculatePayroll({
        basicSalary: 5_200_000,
        absentDays: 26,
        lateDays: 0,
        unpaidLeaveDays: 0,
      });
      expect(result.absentDeduction).toBe(5_200_000);
      expect(result.netSalary).toBe(0);
    });

    it("should handle single absent day correctly", () => {
      const result = calculatePayroll({
        basicSalary: 2_600_000,
        absentDays: 1,
        lateDays: 0,
        unpaidLeaveDays: 0,
      });
      expect(result.absentDeduction).toBe(100_000);
      expect(result.netSalary).toBe(2_500_000);
    });
  });

  // ────────────────────────────────────────────
  // 3. Late Deductions (3 keterlambatan = 1 hari absen)
  // ────────────────────────────────────────────
  describe("Late Deduction", () => {
    it("should not deduct for less than 3 late days", () => {
      const result = calculatePayroll({
        basicSalary: 5_200_000,
        absentDays: 0,
        lateDays: 2,
        unpaidLeaveDays: 0,
      });
      expect(result.lateDeduction).toBe(0);
      expect(result.netSalary).toBe(5_200_000);
    });

    it("should deduct 1 day salary for exactly 3 late days", () => {
      const result = calculatePayroll({
        basicSalary: 5_200_000,
        absentDays: 0,
        lateDays: 3,
        unpaidLeaveDays: 0,
      });
      expect(result.lateDeduction).toBe(200_000);
      expect(result.netSalary).toBe(5_000_000);
    });

    it("should floor the late division (7 late → 2 deductions)", () => {
      const result = calculatePayroll({
        basicSalary: 5_200_000,
        absentDays: 0,
        lateDays: 7,
        unpaidLeaveDays: 0,
      });
      expect(result.lateDeduction).toBe(400_000);
      expect(result.netSalary).toBe(4_800_000);
    });

    it("should handle 1 late day with no deduction", () => {
      const result = calculatePayroll({
        basicSalary: 5_200_000,
        absentDays: 0,
        lateDays: 1,
        unpaidLeaveDays: 0,
      });
      expect(result.lateDeduction).toBe(0);
    });
  });

  // ────────────────────────────────────────────
  // 4. Unpaid Leave Deductions
  // ────────────────────────────────────────────
  describe("Unpaid Leave Deduction", () => {
    it("should deduct perDaySalary for each unpaid leave day", () => {
      const result = calculatePayroll({
        basicSalary: 5_200_000,
        absentDays: 0,
        lateDays: 0,
        unpaidLeaveDays: 3,
      });
      expect(result.unpaidLeaveDeduction).toBe(600_000);
      expect(result.netSalary).toBe(4_600_000);
    });
  });

  // ────────────────────────────────────────────
  // 5. Bonus Calculation
  // ────────────────────────────────────────────
  describe("Bonus", () => {
    it("should add bonuses to net salary", () => {
      const result = calculatePayroll({
        basicSalary: 5_200_000,
        absentDays: 0,
        lateDays: 0,
        unpaidLeaveDays: 0,
        bonuses: 1_000_000,
      });
      expect(result.netSalary).toBe(6_200_000);
    });

    it("should offset deductions when bonuses are present", () => {
      const result = calculatePayroll({
        basicSalary: 5_200_000,
        absentDays: 2,
        lateDays: 3,
        unpaidLeaveDays: 0,
        bonuses: 500_000,
      });
      // absent: 400k + late: 200k = 600k deducted; +500k bonus
      expect(result.netSalary).toBe(5_100_000);
    });

    it("should default bonuses to 0 when not provided", () => {
      const result = calculatePayroll({
        basicSalary: 5_200_000,
        absentDays: 0,
        lateDays: 0,
        unpaidLeaveDays: 0,
      });
      expect(result.netSalary).toBe(5_200_000);
    });
  });

  // ────────────────────────────────────────────
  // 6. Combined Deductions
  // ────────────────────────────────────────────
  describe("Combined Deductions", () => {
    it("should accumulate absent, late, and unpaid leave deductions", () => {
      const result = calculatePayroll({
        basicSalary: 5_200_000,
        absentDays: 2, // 400k
        lateDays: 6, // floor(6/3) = 2 → 400k
        unpaidLeaveDays: 1, // 200k
      });
      expect(result.absentDeduction).toBe(400_000);
      expect(result.lateDeduction).toBe(400_000);
      expect(result.unpaidLeaveDeduction).toBe(200_000);
      expect(result.totalDeductions).toBe(1_000_000);
      expect(result.netSalary).toBe(4_200_000);
    });

    it("should go negative when deductions exceed salary", () => {
      // This verifies the route.ts behavior (no floor-to-zero guard).
      const result = calculatePayroll({
        basicSalary: 1_000_000,
        absentDays: 26,
        lateDays: 9,
        unpaidLeaveDays: 5,
      });
      expect(result.netSalary).toBeLessThan(0);
    });
  });

  // ────────────────────────────────────────────
  // 7. Present Days Calculation
  // ────────────────────────────────────────────
  describe("Present Days Calculation", () => {
    it("should sum present + late + half-day×0.5", () => {
      const days = calculatePresentDays({ present: 18, late: 4, halfDays: 2 });
      expect(days).toBe(23); // 18 + 4 + 1
    });

    it("should return 0 when everything is zero", () => {
      const days = calculatePresentDays({ present: 0, late: 0, halfDays: 0 });
      expect(days).toBe(0);
    });

    it("should handle odd number of half days (fractional result)", () => {
      const days = calculatePresentDays({ present: 10, late: 0, halfDays: 3 });
      expect(days).toBe(11.5);
    });
  });

  // ────────────────────────────────────────────
  // 8. Extreme & Validation Edge Cases
  // ────────────────────────────────────────────
  describe("Extreme & Validation Edge Cases", () => {
    it("should throw error if basic salary is negative", () => {
      expect(() =>
        calculatePayroll({
          basicSalary: -1000,
          absentDays: 0,
          lateDays: 0,
          unpaidLeaveDays: 0,
        })
      ).toThrow("Basic salary cannot be negative");
    });

    it("should throw error if present days is negative", () => {
      expect(() =>
        calculatePresentDays({
          present: -1,
          late: 0,
          halfDays: 0,
        })
      ).toThrow("Attendance inputs cannot be negative");
    });

    it("should throw error if absent days is negative", () => {
      expect(() =>
        calculatePayroll({
          basicSalary: 5000000,
          absentDays: -1,
          lateDays: 0,
          unpaidLeaveDays: 0,
        })
      ).toThrow("Absent days cannot be negative");
    });

    it("should throw error if late days is negative", () => {
      expect(() =>
        calculatePayroll({
          basicSalary: 5000000,
          absentDays: 0,
          lateDays: -1,
          unpaidLeaveDays: 0,
        })
      ).toThrow("Late days cannot be negative");
    });

    it("should throw error if unpaid leave days is negative", () => {
      expect(() =>
        calculatePayroll({
          basicSalary: 5000000,
          absentDays: 0,
          lateDays: 0,
          unpaidLeaveDays: -1,
        })
      ).toThrow("Unpaid leave days cannot be negative");
    });
  });
});
