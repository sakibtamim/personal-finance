"use client";

import { useMemo, useState } from "react";

import { DashboardAuthGate } from "@/components/dashboard/dashboard-auth-gate";
import { DashboardSection } from "@/components/layout/dashboard-section";
import { DashboardStatCard } from "@/components/layout/dashboard-stat-card";
import { useDashboardFinance } from "@/components/providers/dashboard-finance-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDownLeft, ArrowUpRight, Landmark, PiggyBank } from "lucide-react";
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
  const { filteredSavedTotal, filteredWithdrawnTotal, filteredNet } = useMemo(
    () =>
      filteredMonthRows.reduce(
        (acc, row) => {
          acc.filteredSavedTotal += row.saved;
          acc.filteredWithdrawnTotal += row.withdrawn;
          acc.filteredNet += row.net;
          return acc;
        },
        { filteredSavedTotal: 0, filteredWithdrawnTotal: 0, filteredNet: 0 },
      ),
    [filteredMonthRows],
  );

  return (
    <DashboardAuthGate>
      <DashboardSection
        title="Savings"
        description="Track total savings performance and inspect month-wise save and withdrawal movement with focused filters."
        actions={
          <span className="inline-flex items-center rounded-full border border-emerald-500/35 bg-emerald-500/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.13em] text-emerald-700 dark:text-emerald-300">
            Trend view
          </span>
        }
      >
        <div className="animate-rise-fade-delay-1 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard
            label="Total savings"
            value={currencyFormatter.format(totalSavings)}
            hint="All-time cumulative balance"
            className="sm:col-span-2"
            icon={PiggyBank}
            tone="emerald"
          />
          <DashboardStatCard
            label="Filtered saved"
            value={currencyFormatter.format(filteredSavedTotal)}
            hint="Saved in active filter"
            icon={ArrowUpRight}
            tone="primary"
          />
          <DashboardStatCard
            label="Filtered withdrawn"
            value={currencyFormatter.format(filteredWithdrawnTotal)}
            hint="Withdrawn in active filter"
            icon={ArrowDownLeft}
            tone="rose"
          />
        </div>

        <div className="grid gap-3 rounded-2xl border border-emerald-500/25 bg-linear-to-br from-emerald-500/10 to-teal-500/8 p-3 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-500/25 bg-linear-to-br from-emerald-500/12 to-card/80 p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <Landmark className="size-3.5" aria-hidden="true" />
              Activity months
            </p>
            <p className="mt-1 text-xl font-semibold">
              {filteredMonthRows.length}
            </p>
          </div>
          <div className="rounded-xl border border-cyan-500/25 bg-linear-to-br from-cyan-500/10 to-card/80 p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
              Saved volume
            </p>
            <p className="mt-1 text-xl font-semibold">
              {currencyFormatter.format(filteredSavedTotal)}
            </p>
          </div>
          <div className="rounded-xl border border-amber-500/25 bg-linear-to-br from-amber-500/10 to-card/80 p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <ArrowDownLeft className="size-3.5" aria-hidden="true" />
              Net movement
            </p>
            <p className="mt-1 text-xl font-semibold">
              {filteredNet >= 0 ? "+" : "-"}
              {currencyFormatter.format(Math.abs(filteredNet))}
            </p>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl border border-border/60 bg-background/75 p-4 md:grid-cols-[auto_1fr_1fr] md:items-end">
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
              className="flex h-10 w-full rounded-xl border border-input bg-background/80 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
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
                className="flex h-10 w-full rounded-xl border border-input bg-background/80 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
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
                  className="h-10 rounded-xl"
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
                  className="h-10 rounded-xl"
                />
              </div>
            </>
          ) : null}

          {filterMode !== "all" ? (
            <div className="md:col-span-3 md:flex md:justify-end">
              <Button
                variant="outline"
                className="h-10 rounded-xl"
                onClick={() => {
                  setFilterMode("all");
                  setSelectedMonthId("");
                  setRangeStartMonthId("");
                  setRangeEndMonthId("");
                }}
              >
                Reset filters
              </Button>
            </div>
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

        <Card className="animate-rise-fade-delay-2 rounded-3xl border-emerald-500/25 bg-linear-to-br from-emerald-500/8 via-card/92 to-cyan-500/8 shadow-sm">
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
                    className="rounded-2xl border border-border/60 bg-background/80 p-3 shadow-sm"
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
                <tr className="border-b border-border/60 text-left text-muted-foreground">
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em]">
                    Month
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em]">
                    Saved
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em]">
                    Withdrawn
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em]">
                    Net
                  </th>
                </tr>
              </thead>
              <tbody>
                {hasNoRows || hasNoFilteredRows ? (
                  <tr>
                    <td className="px-5 py-4 text-muted-foreground" colSpan={4}>
                      No savings activity yet.
                    </td>
                  </tr>
                ) : (
                  filteredMonthRows.map((row) => (
                    <tr
                      key={row.monthId}
                      className="border-b border-border/50 last:border-b-0"
                    >
                      <td className="px-5 py-3 text-muted-foreground">
                        {formatMonthIdLabel(row.monthId)}
                      </td>
                      <td className="px-5 py-3 font-medium">
                        {currencyFormatter.format(row.saved)}
                      </td>
                      <td className="px-5 py-3 font-medium">
                        {currencyFormatter.format(row.withdrawn)}
                      </td>
                      <td className="px-5 py-3 font-medium">
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
