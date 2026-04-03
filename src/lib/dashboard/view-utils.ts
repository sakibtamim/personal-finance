import type { MonthlyFlowEntry } from "@/lib/firebase/finance";

export type SavingsActivity = {
  id: string;
  monthId: string;
  type: "save" | "withdraw";
  amount: number;
};

export function shiftMonth(monthId: string, delta: number): string {
  const [year, month] = monthId.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  date.setMonth(date.getMonth() + delta);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  return `${nextYear}-${nextMonth}`;
}

export function parseNonNegativeAmount(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(parsed, 0) : 0;
}

export function isNonNegativeAmount(value: string): boolean {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0;
}

export function isPositiveAmount(value: string): boolean {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
}

export function formatMonthIdLabel(monthId: string): string {
  const [year, month] = monthId.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

export function deriveSavingsActivities(
  entries: MonthlyFlowEntry[],
): SavingsActivity[] {
  const rows: SavingsActivity[] = [];

  entries
    .slice()
    .sort((a, b) => b.monthId.localeCompare(a.monthId))
    .forEach((entry) => {
      if (entry.monthly.manualSaved > 0) {
        rows.push({
          id: `${entry.monthId}-save`,
          monthId: entry.monthId,
          type: "save",
          amount: entry.monthly.manualSaved,
        });
      }

      if (entry.monthly.manualWithdrawn > 0) {
        rows.push({
          id: `${entry.monthId}-withdraw`,
          monthId: entry.monthId,
          type: "withdraw",
          amount: entry.monthly.manualWithdrawn,
        });
      }
    });

  return rows;
}
