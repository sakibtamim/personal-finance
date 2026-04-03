"use client";

import { useMemo, useState } from "react";

import { DashboardAuthGate } from "@/components/dashboard/dashboard-auth-gate";
import { DashboardSection } from "@/components/layout/dashboard-section";
import { DashboardStatCard } from "@/components/layout/dashboard-stat-card";
import { useDashboardFinance } from "@/components/providers/dashboard-finance-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  isPositiveAmount,
  parseNonNegativeAmount,
} from "@/lib/dashboard/view-utils";
import { useSettingsStore } from "@/store/use-settings-store";

type ActionType = "income" | "expense" | "save" | "withdraw";

export default function CurrentMonthPage() {
  const currency = useSettingsStore((state) => state.currency);
  const {
    currentMonthId,
    currentMonthly,
    addIncomeCurrent,
    addExpenseCurrent,
    addSavedCurrent,
    addWithdrawCurrent,
  } = useDashboardFinance();

  const [incomeAmount, setIncomeAmount] = useState("0");
  const [expenseAmount, setExpenseAmount] = useState("0");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null);
  const [optimisticIncome, setOptimisticIncome] = useState(0);
  const [optimisticExpense, setOptimisticExpense] = useState(0);
  const [optimisticSaved, setOptimisticSaved] = useState(0);
  const [optimisticWithdrawn, setOptimisticWithdrawn] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const optimisticMonthly = useMemo(
    () => ({
      income: currentMonthly.income + optimisticIncome,
      expense: currentMonthly.expense + optimisticExpense,
      manualSaved: currentMonthly.manualSaved + optimisticSaved,
      manualWithdrawn: currentMonthly.manualWithdrawn + optimisticWithdrawn,
    }),
    [
      currentMonthly.expense,
      currentMonthly.income,
      currentMonthly.manualSaved,
      currentMonthly.manualWithdrawn,
      optimisticExpense,
      optimisticIncome,
      optimisticSaved,
      optimisticWithdrawn,
    ],
  );

  const optimisticRemaining =
    optimisticMonthly.income - optimisticMonthly.expense;
  const hasNoCurrentData =
    currentMonthly.income === 0 &&
    currentMonthly.expense === 0 &&
    currentMonthly.manualSaved === 0 &&
    currentMonthly.manualWithdrawn === 0;

  const canSubmitIncome =
    isPositiveAmount(incomeAmount) && pendingAction === null;
  const canSubmitExpense =
    isPositiveAmount(expenseAmount) && pendingAction === null;

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }),
    [currency],
  );

  async function handleAction(action: ActionType) {
    setErrorMessage(null);
    setSuccessMessage(null);
    const trimmedExpenseDescription = expenseDescription.trim();

    const amountValue =
      action === "income" || action === "save" ? incomeAmount : expenseAmount;

    if (!isPositiveAmount(amountValue)) {
      setErrorMessage("Enter an amount greater than zero.");
      return;
    }

    if (action === "expense" && !trimmedExpenseDescription) {
      setErrorMessage("Enter a short reason for this expense.");
      return;
    }

    const amount = parseNonNegativeAmount(amountValue);
    setPendingAction(action);

    if (action === "income") {
      setOptimisticIncome(amount);
    }
    if (action === "expense") {
      setOptimisticExpense(amount);
    }
    if (action === "save") {
      setOptimisticSaved(amount);
    }
    if (action === "withdraw") {
      setOptimisticWithdrawn(amount);
    }

    try {
      if (action === "income") {
        await addIncomeCurrent(amount);
        setSuccessMessage("Income added to current month.");
        setIncomeAmount("0");
      }

      if (action === "expense") {
        await addExpenseCurrent(amount, trimmedExpenseDescription);
        setSuccessMessage("Expense applied by spending rule.");
        setExpenseAmount("0");
        setExpenseDescription("");
      }

      if (action === "save") {
        await addSavedCurrent(amount);
        setSuccessMessage("Amount saved from current month.");
        setIncomeAmount("0");
      }

      if (action === "withdraw") {
        await addWithdrawCurrent(amount);
        setSuccessMessage("Amount withdrawn from savings.");
        setExpenseAmount("0");
      }
    } catch (error) {
      setOptimisticIncome(0);
      setOptimisticExpense(0);
      setOptimisticSaved(0);
      setOptimisticWithdrawn(0);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to complete this action.");
      }
    } finally {
      setPendingAction(null);
      setOptimisticIncome(0);
      setOptimisticExpense(0);
      setOptimisticSaved(0);
      setOptimisticWithdrawn(0);
    }
  }

  return (
    <DashboardAuthGate>
      <DashboardSection
        title="Current Month"
        description="Fast daily workflow for your active working month with quick finance actions."
        actions={
          <span className="rounded-lg border border-border/50 bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Working month mode
          </span>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardStatCard
            label="Active month"
            value={currentMonthId}
            hint="Salary can be from previous month and still used here."
            className="sm:col-span-2"
          />
          <DashboardStatCard
            label="Remaining"
            value={currencyFormatter.format(optimisticRemaining)}
          />
          <DashboardStatCard
            label="Savings used"
            value={currencyFormatter.format(optimisticMonthly.manualWithdrawn)}
          />
        </div>

        {hasNoCurrentData ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-3 text-sm text-muted-foreground">
            Start with Add income, then track expense, save, or withdraw from
            this panel.
          </div>
        ) : null}

        <Card className="rounded-2xl border-border/50 bg-card shadow-sm">
          <div className="space-y-4 p-5 md:p-6">
            <p className="text-sm font-semibold text-foreground">
              Quick actions
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2" id="quick-income-section">
                <Label
                  htmlFor="quick-income-input"
                  className="text-sm text-muted-foreground"
                >
                  Add income
                </Label>
                <Input
                  id="quick-income-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  inputMode="decimal"
                  value={incomeAmount}
                  onChange={(event) => setIncomeAmount(event.target.value)}
                />
              </div>
              <div className="space-y-2" id="quick-expense-section">
                <Label
                  htmlFor="quick-expense-input"
                  className="text-sm text-muted-foreground"
                >
                  Add expense
                </Label>
                <Input
                  id="quick-expense-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  inputMode="decimal"
                  value={expenseAmount}
                  onChange={(event) => setExpenseAmount(event.target.value)}
                />
                <Input
                  id="quick-expense-description-input"
                  placeholder="Reason (for example: Bus fare, Snacks, Dinner)"
                  value={expenseDescription}
                  onChange={(event) =>
                    setExpenseDescription(event.target.value)
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                size="lg"
                className="rounded-xl"
                onClick={() => handleAction("income")}
                disabled={!canSubmitIncome}
              >
                {pendingAction === "income" ? "Adding income..." : "Add income"}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="rounded-xl"
                onClick={() => handleAction("expense")}
                disabled={
                  !canSubmitExpense || expenseDescription.trim().length === 0
                }
              >
                {pendingAction === "expense"
                  ? "Adding expense..."
                  : "Add expense"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl"
                onClick={() => handleAction("save")}
                disabled={!canSubmitIncome}
              >
                {pendingAction === "save" ? "Saving..." : "Save"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl"
                onClick={() => handleAction("withdraw")}
                disabled={!canSubmitExpense}
              >
                {pendingAction === "withdraw" ? "Withdrawing..." : "Withdraw"}
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
                Expense entries ({currentMonthly.expenseItems?.length ?? 0})
              </p>
              {currentMonthly.expenseItems &&
              currentMonthly.expenseItems.length > 0 ? (
                <ul className="space-y-1.5 text-sm">
                  {currentMonthly.expenseItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card px-3 py-2"
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
                  No expense entries yet. Add your first one with an amount and
                  reason.
                </p>
              )}
            </div>
          </div>
        </Card>
      </DashboardSection>
    </DashboardAuthGate>
  );
}
