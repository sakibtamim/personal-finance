import { describe, expect, it } from "vitest";

import {
  calculateNetContribution,
  calculateRemaining,
  calculateSpendingBreakdown,
  getCurrentMonthId,
} from "@/lib/firebase/finance";

describe("finance calculations", () => {
  it("calculates monthly remaining", () => {
    expect(
      calculateRemaining({
        income: 50000,
        expense: 32000,
        manualSaved: 0,
        manualWithdrawn: 0,
      }),
    ).toBe(18000);
  });

  it("calculates net savings contribution", () => {
    expect(
      calculateNetContribution({
        income: 50000,
        expense: 32000,
        manualSaved: 2000,
        manualWithdrawn: 500,
      }),
    ).toBe(19500);
  });

  it("splits spending using current month first", () => {
    expect(
      calculateSpendingBreakdown(
        {
          income: 30000,
          expense: 10000,
          manualSaved: 0,
          manualWithdrawn: 0,
        },
        15000,
      ),
    ).toEqual({
      fromCurrentMonth: 15000,
      fromSavings: 0,
    });
  });

  it("uses savings when current month is insufficient", () => {
    expect(
      calculateSpendingBreakdown(
        {
          income: 30000,
          expense: 26000,
          manualSaved: 0,
          manualWithdrawn: 0,
        },
        10000,
      ),
    ).toEqual({
      fromCurrentMonth: 4000,
      fromSavings: 6000,
    });
  });

  it("returns zero split for invalid negative amount", () => {
    expect(
      calculateSpendingBreakdown(
        {
          income: 30000,
          expense: 10000,
          manualSaved: 0,
          manualWithdrawn: 0,
        },
        -100,
      ),
    ).toEqual({
      fromCurrentMonth: 0,
      fromSavings: 0,
    });
  });

  it("formats current month id as YYYY-MM", () => {
    expect(getCurrentMonthId(new Date("2026-04-10T00:00:00.000Z"))).toBe(
      "2026-04",
    );
  });
});
