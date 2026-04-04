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
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [newExpenseAmount, setNewExpenseAmount] = useState("0");
  const [newExpenseDescription, setNewExpenseDescription] = useState("");
  const [newWithdrawAmount, setNewWithdrawAmount] = useState("0");
  const [newWithdrawDescription, setNewWithdrawDescription] = useState("");
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

  const selectedMonthLabel = useMemo(() => {
    const [year, month] = selectedMonthId.split("-");
    const parsedMonth = Number(month) - 1;

    if (!year || !Number.isFinite(parsedMonth) || parsedMonth < 0) {
      return selectedMonthId;
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(new Date(Number(year), parsedMonth, 1));
  }, [selectedMonthId]);

  const monthLabels = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) =>
        new Intl.DateTimeFormat("en-US", { month: "short" }).format(
          new Date(2026, index, 1),
        ),
      ),
    [],
  );

  const selectedYear = useMemo(() => {
    const year = Number(selectedMonthId.slice(0, 4));
    return Number.isFinite(year) ? year : new Date().getFullYear();
  }, [selectedMonthId]);

  const selectedMonthIndex = useMemo(() => {
    const month = Number(selectedMonthId.slice(5, 7));
    return Number.isFinite(month) ? month - 1 : new Date().getMonth();
  }, [selectedMonthId]);

  const currentMonthId = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);

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

  const canAddExpenseEntry =
    parseNonNegativeAmount(newExpenseAmount) > 0 &&
    newExpenseDescription.trim().length > 0 &&
    !isSaving;

  const canAddWithdrawEntry =
    parseNonNegativeAmount(newWithdrawAmount) > 0 &&
    newWithdrawDescription.trim().length > 0 &&
    !isSaving;

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
        expenseItems: selectedMonthly.expenseItems ?? [],
        withdrawItems: selectedMonthly.withdrawItems ?? [],
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
        expenseItems: [],
        withdrawItems: [],
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

  async function handleAddExpenseEntry() {
    const amount = parseNonNegativeAmount(newExpenseAmount);
    const description = newExpenseDescription.trim();

    if (amount <= 0) {
      setErrorMessage("Enter an expense amount greater than zero.");
      return;
    }

    if (!description) {
      setErrorMessage("Enter a short reason for this expense.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    const currentExpense = parseNonNegativeAmount(form.expense);

    try {
      await saveSelectedMonth({
        income: parseNonNegativeAmount(form.income),
        expense: currentExpense + amount,
        manualSaved: parseNonNegativeAmount(form.manualSaved),
        manualWithdrawn: parseNonNegativeAmount(form.manualWithdrawn),
        expenseItems: [
          ...(selectedMonthly.expenseItems ?? []),
          {
            id: `expense-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            description,
            amount,
          },
        ],
        withdrawItems: selectedMonthly.withdrawItems ?? [],
      });

      setForm((previous) => ({
        ...previous,
        expense: String(currentExpense + amount),
      }));
      setNewExpenseAmount("0");
      setNewExpenseDescription("");
      setSuccessMessage("Expense entry added.");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to add expense entry.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddWithdrawEntry() {
    const amount = parseNonNegativeAmount(newWithdrawAmount);
    const description = newWithdrawDescription.trim();

    if (amount <= 0) {
      setErrorMessage("Enter a withdraw amount greater than zero.");
      return;
    }

    if (!description) {
      setErrorMessage("Enter a short reason for this withdraw.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    const currentWithdrawn = parseNonNegativeAmount(form.manualWithdrawn);

    try {
      await saveSelectedMonth({
        income: parseNonNegativeAmount(form.income),
        expense: parseNonNegativeAmount(form.expense),
        manualSaved: parseNonNegativeAmount(form.manualSaved),
        manualWithdrawn: currentWithdrawn + amount,
        expenseItems: selectedMonthly.expenseItems ?? [],
        withdrawItems: [
          ...(selectedMonthly.withdrawItems ?? []),
          {
            id: `withdraw-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            description,
            amount,
          },
        ],
      });

      setForm((previous) => ({
        ...previous,
        manualWithdrawn: String(currentWithdrawn + amount),
      }));
      setNewWithdrawAmount("0");
      setNewWithdrawDescription("");
      setSuccessMessage("Withdraw entry added.");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to add withdraw entry.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  function selectMonth(monthIndex: number) {
    const nextMonth = String(monthIndex + 1).padStart(2, "0");
    setSelectedMonthId(`${selectedYear}-${nextMonth}`);
  }

  return (
    <DashboardAuthGate>
      <DashboardSection
        title="Monthly Flow"
        description="Review any past or current month and manually update values for historical records."
        actions={
          <span className="rounded-lg border border-border/50 bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Monthly ledger mode
          </span>
        }
      >
        <div className="rounded-2xl border border-border/50 bg-background/70 p-4 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Month filter
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Pick a month using compact dashboard controls.
                  </span>
                </div>
                <div className="space-y-1">
                  <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
                    <CalendarDays className="size-4 text-muted-foreground" />
                    {selectedMonthLabel}
                  </h2>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/80 p-1 shadow-sm transition-colors duration-200">
                <Button
                  size="icon-sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() =>
                    setSelectedMonthId(shiftMonth(selectedMonthId, -1))
                  }
                  disabled={isSaving}
                  aria-label="Previous month"
                >
                  <ChevronLeft />
                </Button>
                <Button
                  size="icon-sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() =>
                    setSelectedMonthId(shiftMonth(selectedMonthId, 1))
                  }
                  disabled={isSaving}
                  aria-label="Next month"
                >
                  <ChevronRight />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-xl px-3"
                  onClick={() => setSelectedMonthId(currentMonthId)}
                  disabled={isSaving}
                >
                  This month
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/80 p-4 shadow-sm transition-colors duration-200">
              <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Select month
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Choose a period within {selectedYear}.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 p-1">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="rounded-full"
                    onClick={() =>
                      setSelectedMonthId(shiftMonth(selectedMonthId, -12))
                    }
                    disabled={isSaving}
                    aria-label="Previous year"
                  >
                    <ChevronLeft />
                  </Button>
                  <span className="min-w-14 px-1 text-center text-sm font-medium text-foreground">
                    {selectedYear}
                  </span>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="rounded-full"
                    onClick={() =>
                      setSelectedMonthId(shiftMonth(selectedMonthId, 12))
                    }
                    disabled={isSaving}
                    aria-label="Next year"
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12">
                {monthLabels.map((label, index) => {
                  const isActive = index === selectedMonthIndex;

                  return (
                    <Button
                      key={label}
                      size="sm"
                      variant={isActive ? "default" : "outline"}
                      className={`rounded-xl px-3 py-5 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "ring-1 ring-primary/40 shadow-sm shadow-primary/25"
                          : "hover:border-primary/30 hover:bg-muted/60"
                      }`}
                      onClick={() => selectMonth(index)}
                      disabled={isSaving}
                      aria-pressed={isActive}
                    >
                      {label}
                    </Button>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3">
                <p className="text-sm text-muted-foreground">
                  Active month:{" "}
                  <span className="font-medium text-foreground">
                    {selectedMonthLabel}
                  </span>
                </p>
                <span className="rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  Tap month chip to switch
                </span>
              </div>
            </div>
          </div>
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
          <CardContent className="space-y-5 p-5 md:p-6">
            <div className="space-y-3 rounded-xl border border-border/50 bg-background/70 p-4">
              <p className="text-sm font-semibold text-foreground">
                Manual month adjustments
              </p>
              <p className="text-sm text-muted-foreground">
                Edit totals directly, or add expense and withdraw entries below.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="monthly-income-input"
                    className="text-sm text-muted-foreground"
                  >
                    Income
                  </Label>
                  <Input
                    id="monthly-income-input"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={form.income}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        income: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="monthly-expense-input"
                    className="text-sm text-muted-foreground"
                  >
                    Expense total
                  </Label>
                  <Input
                    id="monthly-expense-input"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={form.expense}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        expense: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="monthly-save-input"
                    className="text-sm text-muted-foreground"
                  >
                    Manual save
                  </Label>
                  <Input
                    id="monthly-save-input"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={form.manualSaved}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        manualSaved: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="monthly-withdraw-input"
                    className="text-sm text-muted-foreground"
                  >
                    Manual withdraw
                  </Label>
                  <Input
                    id="monthly-withdraw-input"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={form.manualWithdrawn}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        manualWithdrawn: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-border/50 bg-background/70 p-4">
              <p className="text-sm font-semibold text-foreground">
                Add expense entry
              </p>
              <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto] md:items-end">
                <Input
                  id="monthly-expense-entry-amount-input"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="Amount"
                  value={newExpenseAmount}
                  onChange={(event) => setNewExpenseAmount(event.target.value)}
                />
                <Input
                  id="monthly-expense-entry-reason-input"
                  placeholder="Reason (for example: Bus fare, Dinner, Snacks)"
                  value={newExpenseDescription}
                  onChange={(event) =>
                    setNewExpenseDescription(event.target.value)
                  }
                />
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-xl md:min-w-32"
                  onClick={handleAddExpenseEntry}
                  disabled={!canAddExpenseEntry}
                >
                  {isSaving ? "Adding..." : "Add expense"}
                </Button>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-border/50 bg-background/70 p-4">
              <p className="text-sm font-semibold text-foreground">
                Add withdraw entry
              </p>
              <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto] md:items-end">
                <Input
                  id="monthly-withdraw-entry-amount-input"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="Amount"
                  value={newWithdrawAmount}
                  onChange={(event) => setNewWithdrawAmount(event.target.value)}
                />
                <Input
                  id="monthly-withdraw-entry-reason-input"
                  placeholder="Reason (for example: Family support, Emergency, Transfer)"
                  value={newWithdrawDescription}
                  onChange={(event) =>
                    setNewWithdrawDescription(event.target.value)
                  }
                />
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-xl md:min-w-32"
                  onClick={handleAddWithdrawEntry}
                  disabled={!canAddWithdrawEntry}
                >
                  {isSaving ? "Adding..." : "Add withdraw"}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-border/50 pt-2">
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

            <div className="space-y-2 rounded-xl border border-border/50 bg-background/70 p-4">
              <p className="text-sm font-semibold text-foreground">
                Expense entries ({selectedMonthly.expenseItems?.length ?? 0})
              </p>
              {selectedMonthly.expenseItems &&
              selectedMonthly.expenseItems.length > 0 ? (
                <ul className="space-y-1.5 text-sm">
                  {selectedMonthly.expenseItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-rose-500/20 bg-rose-500/8 px-3 py-2"
                    >
                      <span className="text-foreground">
                        {item.description}
                      </span>
                      <span className="font-medium text-foreground">
                        {currencyFormatter.format(item.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No expense entries in this month yet.
                </p>
              )}
            </div>

            <div className="space-y-2 rounded-xl border border-border/50 bg-background/70 p-4">
              <p className="text-sm font-semibold text-foreground">
                Withdraw entries ({selectedMonthly.withdrawItems?.length ?? 0})
              </p>
              {selectedMonthly.withdrawItems &&
              selectedMonthly.withdrawItems.length > 0 ? (
                <ul className="space-y-1.5 text-sm">
                  {selectedMonthly.withdrawItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2"
                    >
                      <span className="text-foreground">
                        {item.description}
                      </span>
                      <span className="font-medium text-foreground">
                        {currencyFormatter.format(item.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No withdraw entries in this month yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </DashboardSection>
    </DashboardAuthGate>
  );
}
