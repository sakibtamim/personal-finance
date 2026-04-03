"use client";

import Link from "next/link";
import { CircleCheck, CircleDashed } from "lucide-react";

import { DashboardAuthGate } from "@/components/dashboard/dashboard-auth-gate";
import { DASHBOARD_NAV_ITEMS } from "@/components/layout/dashboard-navigation";
import { DashboardSection } from "@/components/layout/dashboard-section";
import { DashboardStatCard } from "@/components/layout/dashboard-stat-card";
import { useDashboardFinance } from "@/components/providers/dashboard-finance-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSettingsStore } from "@/store/use-settings-store";

export default function DashboardPage() {
  const currency = useSettingsStore((state) => state.currency);
  const {
    currentMonthId,
    currentMonthly,
    remainingCurrent,
    totalSavings,
    activities,
  } = useDashboardFinance();

  const currencyFormatter = new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });

  const requiredChecks = [
    {
      label: "Income added for this month",
      isDone: currentMonthly.income > 0,
    },
    {
      label: "Expense tracking started",
      isDone: currentMonthly.expense > 0,
    },
    {
      label: "Savings action recorded",
      isDone:
        currentMonthly.manualSaved > 0 || currentMonthly.manualWithdrawn > 0,
    },
  ];

  return (
    <DashboardAuthGate>
      <DashboardSection
        title="Dashboard"
        description="Your monthly snapshot, required inputs, and quick access to each section."
        actions={
          <Button asChild size="lg" className="rounded-xl">
            <Link href="/dashboard/current-month">Update current month</Link>
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard label="Active month" value={currentMonthId} />
          <DashboardStatCard
            label="Remaining"
            value={currencyFormatter.format(remainingCurrent)}
            hint="Income minus expense for active month"
          />
          <DashboardStatCard
            label="Total savings"
            value={currencyFormatter.format(totalSavings)}
          />
          <DashboardStatCard
            label="Activity records"
            value={String(activities.length)}
            hint="Manual save and withdrawal entries"
          />
        </div>

        <Card className="rounded-xl border border-border/50 bg-card shadow-sm">
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-semibold text-foreground">
              What this month needs
            </p>
            <ul className="space-y-2">
              {requiredChecks.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-2.5 text-sm text-foreground"
                >
                  {item.isDone ? (
                    <CircleCheck
                      className="size-4 text-emerald-600 dark:text-emerald-400"
                      aria-hidden="true"
                    />
                  ) : (
                    <CircleDashed
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <Button
                key={item.href}
                asChild
                variant="outline"
                className="h-11 justify-start rounded-xl"
              >
                <Link
                  href={item.href}
                  className="flex w-full items-center gap-2 leading-none"
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </DashboardSection>
    </DashboardAuthGate>
  );
}
