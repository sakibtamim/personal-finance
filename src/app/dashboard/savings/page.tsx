"use client";

import { useMemo } from "react";

import { DashboardAuthGate } from "@/components/dashboard/dashboard-auth-gate";
import { DashboardSection } from "@/components/layout/dashboard-section";
import { DashboardStatCard } from "@/components/layout/dashboard-stat-card";
import { useDashboardFinance } from "@/components/providers/dashboard-finance-provider";
import { Card, CardContent } from "@/components/ui/card";
import { formatMonthIdLabel } from "@/lib/dashboard/view-utils";
import { useSettingsStore } from "@/store/use-settings-store";

export default function SavingsPage() {
  const currency = useSettingsStore((state) => state.currency);
  const { totalSavings, activities } = useDashboardFinance();

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }),
    [currency],
  );

  return (
    <DashboardAuthGate>
      <DashboardSection
        title="Savings"
        description="See total savings at a glance and review save or withdrawal activity."
      >
        <DashboardStatCard
          label="Total savings"
          value={currencyFormatter.format(totalSavings)}
          hint="Includes monthly net + manual save/withdraw activity."
          className="rounded-2xl border-primary/30 bg-card/95"
          valueClassName="text-4xl"
        />

        {activities.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/20 p-3 text-sm text-muted-foreground">
            No savings activity yet. Use Save or Withdraw in Current Month to
            create activity.
          </div>
        ) : null}

        <Card className="rounded-2xl border-border/80 bg-background/70">
          <CardContent className="p-3 md:p-0">
            <div className="space-y-2 md:hidden">
              {activities.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-muted/20 p-3 text-sm text-muted-foreground">
                  No savings activity yet.
                </div>
              ) : (
                activities.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-xl border bg-background/70 p-3"
                  >
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {row.type === "save" ? "Manual Save" : "Withdrawal"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatMonthIdLabel(row.monthId)}
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {row.type === "save" ? "+" : "-"}
                      {currencyFormatter.format(row.amount)}
                    </p>
                  </div>
                ))
              )}
            </div>

            <table className="hidden w-full min-w-130 text-sm md:table">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Month</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {activities.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4 text-muted-foreground" colSpan={3}>
                      No savings activity yet.
                    </td>
                  </tr>
                ) : (
                  activities.map((row) => (
                    <tr key={row.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3">
                        {row.type === "save" ? "Manual Save" : "Withdrawal"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatMonthIdLabel(row.monthId)}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {row.type === "save" ? "+" : "-"}
                        {currencyFormatter.format(row.amount)}
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
