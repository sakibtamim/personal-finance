"use client";

import { useEffect, useMemo, useState } from "react";

import { DashboardAuthGate } from "@/components/dashboard/dashboard-auth-gate";
import { useDashboardFinance } from "@/components/providers/dashboard-finance-provider";
import { DashboardSection } from "@/components/layout/dashboard-section";
import { DashboardStatCard } from "@/components/layout/dashboard-stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  isNonNegativeAmount,
  parseNonNegativeAmount,
  shiftMonth,
} from "@/lib/dashboard/view-utils";
import { useSettingsStore } from "@/store/use-settings-store";

type MonthForm = {
  income: string;
  expense: string;
  manualSaved: string;
  manualWithdrawn: string;
};

export default function MonthlyFlowPage() {
  const currency = useSettingsStore((state) => state.currency);
  const {
    selectedMonthId,
    setSelectedMonthId,
    selectedMonthly,
    remainingSelected,
    savingsAtSelectedMonth,
    saveSelectedMonth,
  } = useDashboardFinance();

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [form, setForm] = useState<MonthForm>({
    income: "0",
    expense: "0",
    manualSaved: "0",
    manualWithdrawn: "0",
  });

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }),
    [currency],
  );

  const isFormValid = useMemo(
    () =>
      [form.income, form.expense, form.manualSaved, form.manualWithdrawn].every(
        isNonNegativeAmount,
      ),
    [form.expense, form.income, form.manualSaved, form.manualWithdrawn],
  );

  const hasNoMonthlyData = useMemo(
    () =>
      selectedMonthly.income === 0 &&
      selectedMonthly.expense === 0 &&
      selectedMonthly.manualSaved === 0 &&
      selectedMonthly.manualWithdrawn === 0,
    [
      selectedMonthly.expense,
      selectedMonthly.income,
      selectedMonthly.manualSaved,
      selectedMonthly.manualWithdrawn,
    ],
  );

  useEffect(() => {
    setForm({
      income: String(selectedMonthly.income),
      expense: String(selectedMonthly.expense),
      manualSaved: String(selectedMonthly.manualSaved),
      manualWithdrawn: String(selectedMonthly.manualWithdrawn),
    });
  }, [selectedMonthly]);

  async function handleSave() {
    if (!isFormValid) {
      setErrorMessage("Use valid non-negative numbers for all month fields.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      await saveSelectedMonth({
        income: parseNonNegativeAmount(form.income),
        expense: parseNonNegativeAmount(form.expense),
        manualSaved: parseNonNegativeAmount(form.manualSaved),
        manualWithdrawn: parseNonNegativeAmount(form.manualWithdrawn),
      });
      setSuccessMessage("Monthly flow saved.");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to save monthly flow.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleClearMonthData() {
    if (hasNoMonthlyData) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    const clearedValues: MonthForm = {
      income: "0",
      expense: "0",
      manualSaved: "0",
      manualWithdrawn: "0",
    };

    try {
      setForm(clearedValues);
      await saveSelectedMonth({
        income: 0,
        expense: 0,
        manualSaved: 0,
        manualWithdrawn: 0,
      });
      setSuccessMessage("Month data cleared.");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to clear month data.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <DashboardAuthGate>
      <DashboardSection
        title="Monthly Flow"
        description="Review any past or current month and manually update values for historical records."
        actions={
          <>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl"
              onClick={() =>
                setSelectedMonthId(shiftMonth(selectedMonthId, -1))
              }
              disabled={isSaving}
            >
              Previous
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl"
              onClick={() => setSelectedMonthId(shiftMonth(selectedMonthId, 1))}
              disabled={isSaving}
            >
              Next
            </Button>
          </>
        }
      >
        <div className="grid gap-4 rounded-xl border border-border/50 bg-background/70 p-4 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label
              htmlFor="month-selector"
              className="text-sm text-muted-foreground"
            >
              Month
            </Label>
            <Input
              id="month-selector"
              type="month"
              value={selectedMonthId}
              onChange={(event) => setSelectedMonthId(event.target.value)}
            />
          </div>
          <Button
            size="lg"
            variant="secondary"
            className="rounded-xl md:min-w-44"
          >
            Viewing {selectedMonthId}
          </Button>
        </div>

        {hasNoMonthlyData ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-3 text-sm text-muted-foreground">
            No data for this month yet. Add values below and save to start
            tracking.
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard
            label="Income"
            value={currencyFormatter.format(selectedMonthly.income)}
          />
          <DashboardStatCard
            label="Expense"
            value={currencyFormatter.format(selectedMonthly.expense)}
          />
          <DashboardStatCard
            label="Remaining"
            value={currencyFormatter.format(remainingSelected)}
          />
          <DashboardStatCard
            label="Savings"
            value={currencyFormatter.format(savingsAtSelectedMonth)}
            hint="Savings accumulated by selected month"
          />
        </div>

        <Card className="rounded-xl border border-border/50 bg-card shadow-sm">
          <CardContent className="space-y-4 p-5">
            <p className="text-sm font-semibold text-foreground">
              Manual month adjustments
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Input
                inputMode="decimal"
                placeholder="Income"
                value={form.income}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    income: event.target.value,
                  }))
                }
              />
              <Input
                inputMode="decimal"
                placeholder="Expense"
                value={form.expense}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    expense: event.target.value,
                  }))
                }
              />
              <Input
                inputMode="decimal"
                placeholder="Save"
                value={form.manualSaved}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    manualSaved: event.target.value,
                  }))
                }
              />
              <Input
                inputMode="decimal"
                placeholder="Withdraw"
                value={form.manualWithdrawn}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    manualWithdrawn: event.target.value,
                  }))
                }
              />
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl"
                onClick={handleClearMonthData}
                disabled={isSaving || hasNoMonthlyData}
              >
                {isSaving ? "Updating month..." : "Clear month data"}
              </Button>
              <Button
                size="lg"
                className="rounded-xl"
                onClick={handleSave}
                disabled={isSaving || !isFormValid}
              >
                {isSaving ? "Saving monthly edit..." : "Save monthly edit"}
              </Button>
            </div>

            {errorMessage ? (
              <p className="animate-in fade-in-0 slide-in-from-bottom-1 rounded-lg border border-destructive/20 bg-destructive/6 px-3 py-2.5 text-sm text-destructive/90 duration-200">
                {errorMessage}
              </p>
            ) : null}

            {successMessage ? (
              <p className="animate-in fade-in-0 slide-in-from-bottom-1 rounded-lg border border-emerald-500/20 bg-emerald-500/6 px-3 py-2.5 text-sm text-emerald-700 duration-200 dark:text-emerald-300">
                {successMessage}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </DashboardSection>
    </DashboardAuthGate>
  );
}
