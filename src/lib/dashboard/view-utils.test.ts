import { describe, expect, it } from "vitest";

import {
  deriveSavingsActivities,
  formatMonthIdLabel,
  isNonNegativeAmount,
  isPositiveAmount,
  parseNonNegativeAmount,
  shiftMonth,
} from "@/lib/dashboard/view-utils";

describe("dashboard view utils", () => {
  it("shifts month forward and backward", () => {
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
  });

  it("parses and clamps amounts", () => {
    expect(parseNonNegativeAmount("12.5")).toBe(12.5);
    expect(parseNonNegativeAmount("-2")).toBe(0);
    expect(parseNonNegativeAmount("invalid")).toBe(0);
  });

  it("validates positive and non-negative amounts", () => {
    expect(isNonNegativeAmount("0")).toBe(true);
    expect(isNonNegativeAmount("3")).toBe(true);
    expect(isNonNegativeAmount("-1")).toBe(false);
    expect(isPositiveAmount("0")).toBe(false);
    expect(isPositiveAmount("0.01")).toBe(true);
  });

  it("formats month id labels", () => {
    expect(formatMonthIdLabel("2026-04")).toContain("2026");
  });

  it("derives savings activity rows from monthly entries", () => {
    const rows = deriveSavingsActivities([
      {
        monthId: "2026-02",
        monthly: {
          income: 100,
          expense: 90,
          manualSaved: 5,
          manualWithdrawn: 0,
        },
      },
      {
        monthId: "2026-03",
        monthly: {
          income: 100,
          expense: 70,
          manualSaved: 0,
          manualWithdrawn: 7,
        },
      },
    ]);

    expect(rows).toEqual([
      {
        id: "2026-03-monthly-net",
        monthId: "2026-03",
        type: "monthly-net",
        amount: 30,
      },
      {
        id: "2026-03-withdraw",
        monthId: "2026-03",
        type: "withdraw",
        amount: 7,
      },
      {
        id: "2026-02-monthly-net",
        monthId: "2026-02",
        type: "monthly-net",
        amount: 10,
      },
      { id: "2026-02-save", monthId: "2026-02", type: "save", amount: 5 },
    ]);
  });
});
