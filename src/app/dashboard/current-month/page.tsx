"use client";

import { useMemo, useState } from "react";

import { DashboardAuthGate } from "@/components/dashboard/dashboard-auth-gate";
import { DashboardSection } from "@/components/layout/dashboard-section";
import { DashboardStatCard } from "@/components/layout/dashboard-stat-card";
import { useDashboardFinance } from "@/components/providers/dashboard-finance-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CalendarCheck2, HandCoins, PiggyBank, Wallet } from "lucide-react";
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
    removeIncomeEntryCurrent,
    removeExpenseEntryCurrent,
    removeWithdrawEntryCurrent,
  } = useDashboardFinance();

  const [incomeAmount, setIncomeAmount] = useState("0");
  const [incomeDescription, setIncomeDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("0");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("0");
  const [withdrawDescription, setWithdrawDescription] = useState("");
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null);
  const [optimisticIncome, setOptimisticIncome] = useState(0);
  const [optimisticExpense, setOptimisticExpense] = useState(0);
  const [optimisticSaved, setOptimisticSaved] = useState(0);
  const [optimisticWithdrawn, setOptimisticWithdrawn] = useState(0);
  const [isRemovingEntry, setIsRemovingEntry] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canResetForm =
    incomeAmount !== "0" ||
    incomeDescription !== "" ||
    expenseAmount !== "0" ||
    expenseDescription !== "" ||
    withdrawAmount !== "0" ||
    withdrawDescription !== "";

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
  const canSubmitWithdraw =
    isPositiveAmount(withdrawAmount) && pendingAction === null;

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
    const trimmedIncomeDescription = incomeDescription.trim();
    const trimmedExpenseDescription = expenseDescription.trim();

    const amountValue =
      action === "income"
        ? incomeAmount
        : action === "save"
          ? incomeAmount
          : action === "withdraw"
            ? withdrawAmount
            : expenseAmount;

    if (!isPositiveAmount(amountValue)) {
      setErrorMessage("Enter an amount greater than zero.");
      return;
    }

    const trimmedWithdrawDescription = withdrawDescription.trim();

    if (action === "expense" && !trimmedExpenseDescription) {
      setErrorMessage("Enter a short reason for this expense.");
      return;
    }

    if (action === "income" && !trimmedIncomeDescription) {
      setErrorMessage("Enter a short source for this income.");
      return;
    }

    if (action === "withdraw" && !trimmedWithdrawDescription) {
      setErrorMessage("Enter a short reason for this withdraw.");
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
        await addIncomeCurrent(amount, trimmedIncomeDescription);
        setSuccessMessage("Income added to current month.");
        setIncomeAmount("0");
        setIncomeDescription("");
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
        await addWithdrawCurrent(amount, trimmedWithdrawDescription);
        setSuccessMessage("Amount withdrawn from savings.");
        setWithdrawAmount("0");
        setWithdrawDescription("");
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

  function handleResetForm() {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIncomeAmount("0");
    setIncomeDescription("");
    setExpenseAmount("0");
    setExpenseDescription("");
    setWithdrawAmount("0");
    setWithdrawDescription("");
  }

  async function handleRemoveIncomeEntry(entryId: string) {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsRemovingEntry(true);

    try {
      await removeIncomeEntryCurrent(entryId);
      setSuccessMessage("Income entry removed.");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to remove income entry.");
      }
    } finally {
      setIsRemovingEntry(false);
    }
  }

  async function handleRemoveExpenseEntry(entryId: string) {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsRemovingEntry(true);

    try {
      await removeExpenseEntryCurrent(entryId);
      setSuccessMessage("Expense entry removed.");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to remove expense entry.");
      }
    } finally {
      setIsRemovingEntry(false);
    }
  }

  async function handleRemoveWithdrawEntry(entryId: string) {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsRemovingEntry(true);

    try {
      await removeWithdrawEntryCurrent(entryId);
      setSuccessMessage("Withdraw entry removed.");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to remove withdraw entry.");
      }
    } finally {
      setIsRemovingEntry(false);
    }
  }

  return (
    <DashboardAuthGate>
      <DashboardSection
        title="Current Month"
        description="Control day-to-day cashflow with quick actions and instant visibility into your working month."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.13em] text-primary">
            <CalendarCheck2 className="size-3.5" />
            Live month workspace
          </span>
        }
      >
        <div className="animate-rise-fade-delay-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardStatCard
            label="Active month"
            value={currentMonthId}
            hint="Your primary month for daily transactions"
            className="sm:col-span-2"
          />
          <DashboardStatCard
            label="Remaining"
            value={currencyFormatter.format(optimisticRemaining)}
            hint="Income minus expense"
          />
          <DashboardStatCard
            label="Savings used"
            value={currencyFormatter.format(optimisticMonthly.manualWithdrawn)}
            hint="Manual withdrawals this month"
          />
          <DashboardStatCard
            label="Saved this month"
            value={currencyFormatter.format(optimisticMonthly.manualSaved)}
            hint="Manual savings contribution"
          />
        </div>

        {hasNoCurrentData ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-3 text-sm text-muted-foreground">
            Start with Add income, then track expense, save, or withdraw from
            this panel.
          </div>
        ) : null}

        <Card className="animate-rise-fade-delay-2 rounded-3xl border border-border/60 bg-card/90 shadow-sm">
          <div className="space-y-6 p-5 md:p-7">
            <div className="space-y-4">
              <div className="space-y-3 rounded-2xl border border-border/60 bg-background/75 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Wallet className="size-4 text-primary" />
                  Add income
                </p>
                <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto] md:items-end">
                  <Input
                    id="quick-income-input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Amount"
                    inputMode="decimal"
                    value={incomeAmount}
                    onChange={(event) => setIncomeAmount(event.target.value)}
                  />
                  <Input
                    id="quick-income-description-input"
                    placeholder="Source (for example: Salary, Freelance, Bonus)"
                    value={incomeDescription}
                    onChange={(event) =>
                      setIncomeDescription(event.target.value)
                    }
                  />
                  <Button
                    size="lg"
                    className="rounded-xl md:min-w-32"
                    onClick={() => handleAction("income")}
                    disabled={
                      !canSubmitIncome || incomeDescription.trim().length === 0
                    }
                  >
                    {pendingAction === "income" ? "Adding..." : "Add income"}
                  </Button>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-border/60 bg-background/75 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <HandCoins className="size-4 text-rose-500" />
                  Add expense entry
                </p>
                <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto] md:items-end">
                  <Input
                    id="quick-expense-input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Amount"
                    inputMode="decimal"
                    value={expenseAmount}
                    onChange={(event) => setExpenseAmount(event.target.value)}
                  />
                  <Input
                    id="quick-expense-description-input"
                    placeholder="Reason (for example: Bus fare, Dinner, Snacks)"
                    value={expenseDescription}
                    onChange={(event) =>
                      setExpenseDescription(event.target.value)
                    }
                  />
                  <Button
                    size="lg"
                    variant="secondary"
                    className="rounded-xl border border-border/60 bg-secondary/80 hover:bg-secondary md:min-w-32"
                    onClick={() => handleAction("expense")}
                    disabled={
                      !canSubmitExpense ||
                      expenseDescription.trim().length === 0
                    }
                  >
                    {pendingAction === "expense" ? "Adding..." : "Add expense"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-border/60 bg-background/75 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <PiggyBank className="size-4 text-amber-500" />
                Add withdraw entry
              </p>
              <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto] md:items-end">
                <Input
                  id="quick-withdraw-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Amount"
                  inputMode="decimal"
                  value={withdrawAmount}
                  onChange={(event) => setWithdrawAmount(event.target.value)}
                />
                <Input
                  id="quick-withdraw-description-input"
                  placeholder="Reason (for example: Family support, Emergency, Transfer)"
                  value={withdrawDescription}
                  onChange={(event) =>
                    setWithdrawDescription(event.target.value)
                  }
                />
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-xl border border-border/60 bg-secondary/80 hover:bg-secondary md:min-w-32"
                  onClick={() => handleAction("withdraw")}
                  disabled={
                    !canSubmitWithdraw ||
                    withdrawDescription.trim().length === 0
                  }
                >
                  {pendingAction === "withdraw" ? "Adding..." : "Add withdraw"}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-border/60 pt-3">
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl"
                onClick={handleResetForm}
                disabled={
                  !canResetForm || pendingAction !== null || isRemovingEntry
                }
              >
                Reset
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl"
                onClick={() => handleAction("save")}
                disabled={!canSubmitIncome || isRemovingEntry}
              >
                {pendingAction === "save" ? "Saving..." : "Save"}
              </Button>
            </div>

            {errorMessage ? (
              <p className="animate-in fade-in-0 slide-in-from-bottom-1 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive/90 duration-200">
                {errorMessage}
              </p>
            ) : null}

            {successMessage ? (
              <p className="animate-in fade-in-0 slide-in-from-bottom-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 duration-200 dark:text-emerald-300">
                {successMessage}
              </p>
            ) : null}

            <div className="grid gap-4 rounded-2xl border border-border/60 bg-background/75 p-4 lg:grid-cols-3">
              <div className="space-y-2 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3">
                <p className="text-sm font-semibold text-foreground">
                  Income entries ({currentMonthly.incomeItems?.length ?? 0})
                </p>
                {currentMonthly.incomeItems &&
                currentMonthly.incomeItems.length > 0 ? (
                  <ul className="space-y-1.5 text-sm">
                    {currentMonthly.incomeItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2"
                      >
                        <span className="text-foreground">
                          {item.description}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {currencyFormatter.format(item.amount)}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveIncomeEntry(item.id)}
                            disabled={pendingAction !== null || isRemovingEntry}
                          >
                            Remove
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No income entries yet.
                  </p>
                )}
              </div>

              <div className="space-y-2 rounded-xl border border-rose-500/25 bg-rose-500/5 p-3">
                <p className="text-sm font-semibold text-foreground">
                  Expense entries ({currentMonthly.expenseItems?.length ?? 0})
                </p>
                {currentMonthly.expenseItems &&
                currentMonthly.expenseItems.length > 0 ? (
                  <ul className="space-y-1.5 text-sm">
                    {currentMonthly.expenseItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2"
                      >
                        <span className="text-foreground">
                          {item.description}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {currencyFormatter.format(item.amount)}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveExpenseEntry(item.id)}
                            disabled={pendingAction !== null || isRemovingEntry}
                          >
                            Remove
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No expense entries yet.
                  </p>
                )}
              </div>

              <div className="space-y-2 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3">
                <p className="text-sm font-semibold text-foreground">
                  Withdraw entries ({currentMonthly.withdrawItems?.length ?? 0})
                </p>
                {currentMonthly.withdrawItems &&
                currentMonthly.withdrawItems.length > 0 ? (
                  <ul className="space-y-1.5 text-sm">
                    {currentMonthly.withdrawItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2"
                      >
                        <span className="text-foreground">
                          {item.description}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {currencyFormatter.format(item.amount)}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveWithdrawEntry(item.id)}
                            disabled={pendingAction !== null || isRemovingEntry}
                          >
                            Remove
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No withdraw entries yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </DashboardSection>
    </DashboardAuthGate>
  );
}
