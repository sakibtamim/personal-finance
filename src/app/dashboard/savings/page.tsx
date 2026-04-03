"use client";

import { useMemo, useState } from "react";

import { DashboardAuthGate } from "@/components/dashboard/dashboard-auth-gate";
import { DashboardSection } from "@/components/layout/dashboard-section";
import { DashboardStatCard } from "@/components/layout/dashboard-stat-card";
import { useDashboardFinance } from "@/components/providers/dashboard-finance-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMonthIdLabel } from "@/lib/dashboard/view-utils";
import { useSettingsStore } from "@/store/use-settings-store";

type FilterMode = "all" | "month" | "range";

export default function SavingsPage() {
  const currency = useSettingsStore((state) => state.currency);
  const { totalSavings, monthlyEntries } = useDashboardFinance();
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedMonthId, setSelectedMonthId] = useState("");
  const [rangeStartMonthId, setRangeStartMonthId] = useState("");
  const [rangeEndMonthId, setRangeEndMonthId] = useState("");

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }),
    [currency],
  );

  const monthRows = useMemo(
    () =>
      monthlyEntries
        .slice()
        .sort((a, b) => b.monthId.localeCompare(a.monthId))
        .map((entry) => {
          const monthlyNet = entry.monthly.income - entry.monthly.expense;
          const saved = entry.monthly.manualSaved + Math.max(monthlyNet, 0);
          const withdrawn =
            entry.monthly.manualWithdrawn + Math.max(-monthlyNet, 0);

          return {
            monthId: entry.monthId,
            saved,
            withdrawn,
            net: saved - withdrawn,
          };
        })
        .filter((row) => row.saved > 0 || row.withdrawn > 0),
    [monthlyEntries],
  );

  const monthOptions = useMemo(
    () => monthRows.map((row) => row.monthId),
    [monthRows],
  );

  const filteredMonthRows = useMemo(() => {
    if (filterMode === "all") {
      return monthRows;
    }

    if (filterMode === "month") {
      const activeMonthId = selectedMonthId || monthOptions[0] || "";
      return monthRows.filter((row) => row.monthId === activeMonthId);
    }

    return monthRows.filter(
      (row) =>
        (!rangeStartMonthId || row.monthId >= rangeStartMonthId) &&
        (!rangeEndMonthId || row.monthId <= rangeEndMonthId),
    );
  }, [
    filterMode,
    monthOptions,
    monthRows,
    rangeEndMonthId,
    rangeStartMonthId,
    selectedMonthId,
  ]);

  const hasNoRows = monthRows.length === 0;
  const hasNoFilteredRows = !hasNoRows && filteredMonthRows.length === 0;

  return (
    <DashboardAuthGate>
      <DashboardSection
        title="Savings"
        description="See total savings at a glance and review month-wise save and withdrawal activity."
      >
        <DashboardStatCard
          label="Total savings"
          value={currencyFormatter.format(totalSavings)}
          hint="Includes monthly net + manual save/withdraw activity."
          className="rounded-2xl border-border/50 bg-card"
          valueClassName="text-4xl"
        />

        <div className="grid gap-3 rounded-xl border border-border/50 bg-background/70 p-3 md:grid-cols-[auto_1fr_1fr] md:items-end">
          <div className="space-y-1.5 md:min-w-42">
            <Label
              htmlFor="savings-filter-mode"
              className="text-xs text-muted-foreground"
            >
              Filter
            </Label>
            <select
              id="savings-filter-mode"
              value={filterMode}
              onChange={(event) => {
                const nextMode = event.target.value as FilterMode;
                setFilterMode(nextMode);

                if (
                  nextMode === "month" &&
                  !selectedMonthId &&
                  monthOptions[0]
                ) {
                  setSelectedMonthId(monthOptions[0]);
                }
              }}
              className="flex h-9 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <option value="all">All months</option>
              <option value="month">Single month</option>
              <option value="range">Custom range</option>
            </select>
          </div>

          {filterMode === "month" ? (
            <div className="space-y-1.5">
              <Label
                htmlFor="savings-single-month"
                className="text-xs text-muted-foreground"
              >
                Month
              </Label>
              <select
                id="savings-single-month"
                value={selectedMonthId || monthOptions[0] || ""}
                onChange={(event) => setSelectedMonthId(event.target.value)}
                className="flex h-9 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                {monthOptions.map((monthId) => (
                  <option key={monthId} value={monthId}>
                    {formatMonthIdLabel(monthId)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {filterMode === "range" ? (
            <>
              <div className="space-y-1.5">
                <Label
                  htmlFor="savings-range-start"
                  className="text-xs text-muted-foreground"
                >
                  From month
                </Label>
                <Input
                  id="savings-range-start"
                  type="month"
                  value={rangeStartMonthId}
                  onChange={(event) => setRangeStartMonthId(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="savings-range-end"
                  className="text-xs text-muted-foreground"
                >
                  To month
                </Label>
                <Input
                  id="savings-range-end"
                  type="month"
                  value={rangeEndMonthId}
                  onChange={(event) => setRangeEndMonthId(event.target.value)}
                />
              </div>
            </>
          ) : null}
        </div>

        {hasNoRows ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-3 text-sm text-muted-foreground">
            No savings activity yet. Add month data, Save, or Withdraw to create
            activity.
          </div>
        ) : null}

        {hasNoFilteredRows ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-3 text-sm text-muted-foreground">
            No savings activity for the selected filter.
          </div>
        ) : null}

        <Card className="rounded-2xl border-border/50 bg-card shadow-sm">
          <CardContent className="p-3 md:p-0">
            <div className="space-y-2 md:hidden">
              {hasNoRows || hasNoFilteredRows ? (
                <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-3 text-sm text-muted-foreground">
                  No savings activity yet.
                </div>
              ) : (
                filteredMonthRows.map((row) => (
                  <div
                    key={row.monthId}
                    className="rounded-xl border border-border/50 bg-background/80 p-3 shadow-sm"
                  >
                    <p className="text-xs font-medium text-muted-foreground">
                      {formatMonthIdLabel(row.monthId)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Saved: {currencyFormatter.format(row.saved)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Withdrawn: {currencyFormatter.format(row.withdrawn)}
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      Net: {row.net >= 0 ? "+" : "-"}
                      {currencyFormatter.format(Math.abs(row.net))}
                    </p>
                  </div>
                ))
              )}
            </div>

            <table className="hidden w-full min-w-130 text-sm md:table">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Month</th>
                  <th className="px-4 py-3 font-medium">Saved</th>
                  <th className="px-4 py-3 font-medium">Withdrawn</th>
                  <th className="px-4 py-3 font-medium">Net</th>
                </tr>
              </thead>
              <tbody>
                {hasNoRows || hasNoFilteredRows ? (
                  <tr>
                    <td className="px-4 py-4 text-muted-foreground" colSpan={4}>
                      No savings activity yet.
                    </td>
                  </tr>
                ) : (
                  filteredMonthRows.map((row) => (
                    <tr key={row.monthId} className="border-b last:border-b-0">
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatMonthIdLabel(row.monthId)}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {currencyFormatter.format(row.saved)}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {currencyFormatter.format(row.withdrawn)}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {row.net >= 0 ? "+" : "-"}
                        {currencyFormatter.format(Math.abs(row.net))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </DashboardSection>
    </DashboardAuthGate>
  );
}
