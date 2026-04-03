"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signOutUser } from "@/lib/firebase/auth";
import {
  applyExpenseWithSpendingRule,
  calculateRemaining,
  calculateSpendingBreakdown,
  getCurrentMonthId,
  subscribeToMonthlyFlow,
  subscribeToTotalSavings,
  upsertMonthlyFlow,
} from "@/lib/firebase/finance";
import { upsertUserSettings } from "@/lib/firebase/settings";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/use-settings-store";
import { useAuthStore } from "@/store/use-auth-store";
import { DEFAULT_MONTHLY_FLOW } from "@/types/finance";
import {
  CURRENCY_OPTIONS,
  THEME_OPTIONS,
  type AppTheme,
  type CurrencyCode,
} from "@/types/settings";

type FinanceFormState = {
  income: string;
  expense: string;
  manualSaved: string;
  manualWithdrawn: string;
};

const defaultFormState: FinanceFormState = {
  income: "0",
  expense: "0",
  manualSaved: "0",
  manualWithdrawn: "0",
};

function parseAmount(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isNonNegativeNumber(value: string): boolean {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0;
}

export function HomeAuthPanel() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const clear = useAuthStore((state) => state.clear);
  const currency = useSettingsStore((state) => state.currency);
  const theme = useSettingsStore((state) => state.theme);
  const setCurrency = useSettingsStore((state) => state.setCurrency);
  const setTheme = useSettingsStore((state) => state.setTheme);

  const [monthly, setMonthly] = useState(DEFAULT_MONTHLY_FLOW);
  const [totalSavings, setTotalSavings] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FinanceFormState>(defaultFormState);
  const [quickExpenseAmount, setQuickExpenseAmount] = useState("0");
  const [isApplyingExpense, setIsApplyingExpense] = useState(false);

  const monthId = useMemo(() => getCurrentMonthId(), []);

  const remaining = useMemo(() => calculateRemaining(monthly), [monthly]);

  const spendPreview = useMemo(
    () => calculateSpendingBreakdown(monthly, parseAmount(quickExpenseAmount)),
    [monthly, quickExpenseAmount],
  );

  const isMonthlyFormValid = useMemo(
    () =>
      [form.income, form.expense, form.manualSaved, form.manualWithdrawn].every(
        isNonNegativeNumber,
      ),
    [form.expense, form.income, form.manualSaved, form.manualWithdrawn],
  );

  const isQuickExpenseValid = useMemo(
    () =>
      isNonNegativeNumber(quickExpenseAmount) &&
      parseAmount(quickExpenseAmount) > 0,
    [quickExpenseAmount],
  );

  const hasAnyFinanceData = useMemo(
    () =>
      monthly.income > 0 ||
      monthly.expense > 0 ||
      monthly.manualSaved > 0 ||
      monthly.manualWithdrawn > 0,
    [
      monthly.expense,
      monthly.income,
      monthly.manualSaved,
      monthly.manualWithdrawn,
    ],
  );

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }),
    [currency],
  );

  useEffect(() => {
    if (!user) {
      setMonthly(DEFAULT_MONTHLY_FLOW);
      setTotalSavings(0);
      setForm(defaultFormState);
      return;
    }

    const unsubscribeMonthly = subscribeToMonthlyFlow(
      user.uid,
      monthId,
      (next) => {
        setMonthly(next);
        setForm({
          income: String(next.income),
          expense: String(next.expense),
          manualSaved: String(next.manualSaved),
          manualWithdrawn: String(next.manualWithdrawn),
        });
      },
    );

    const unsubscribeSavings = subscribeToTotalSavings(
      user.uid,
      (nextTotal) => {
        setTotalSavings(nextTotal);
      },
    );

    return () => {
      unsubscribeMonthly();
      unsubscribeSavings();
    };
  }, [monthId, user]);

  async function handleSignOut() {
    await signOutUser();
    clear();
  }

  async function handleSaveFinance() {
    if (!user) {
      return;
    }

    if (!isMonthlyFormValid) {
      setErrorMessage("Use valid non-negative amounts for all monthly fields.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      await upsertMonthlyFlow(user.uid, monthId, {
        income: parseAmount(form.income),
        expense: parseAmount(form.expense),
        manualSaved: parseAmount(form.manualSaved),
        manualWithdrawn: parseAmount(form.manualWithdrawn),
      });
      setSuccessMessage("Monthly data saved.");
    } catch {
      setErrorMessage("Unable to save monthly finance data.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleApplyQuickExpense() {
    if (!user) {
      return;
    }

    const amount = parseAmount(quickExpenseAmount);
    if (!isQuickExpenseValid) {
      setErrorMessage("Expense amount must be greater than zero.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsApplyingExpense(true);

    try {
      const breakdown = await applyExpenseWithSpendingRule(
        user.uid,
        monthId,
        monthly,
        amount,
      );
      setSuccessMessage(
        `Expense applied. Current month: ${currencyFormatter.format(breakdown.fromCurrentMonth)}, savings: ${currencyFormatter.format(breakdown.fromSavings)}.`,
      );
      setQuickExpenseAmount("0");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to apply expense by spending rule.");
      }
    } finally {
      setIsApplyingExpense(false);
    }
  }

  async function handleCurrencyChange(nextCurrency: CurrencyCode) {
    setCurrency(nextCurrency);

    if (!user) {
      return;
    }

    try {
      await upsertUserSettings(user.uid, {
        currency: nextCurrency,
        theme,
      });
    } catch {
      setErrorMessage("Unable to update currency setting.");
    }
  }

  async function handleThemeChange(nextTheme: AppTheme) {
    setTheme(nextTheme);

    if (!user) {
      return;
    }

    try {
      await upsertUserSettings(user.uid, {
        currency,
        theme: nextTheme,
      });
    } catch {
      setErrorMessage("Unable to update theme setting.");
    }
  }

  if (status === "loading") {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 items-center px-4 py-10">
        <div className="w-full rounded-2xl border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 items-center px-4 py-10">
        <div className="w-full rounded-2xl border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Personal Finance</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to use your monthly flow and savings dashboard.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/auth/sign-in" className={cn(buttonVariants())}>
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className={cn(buttonVariants({ variant: "secondary" }))}
            >
              Sign up
            </Link>
            <Link
              href="/auth/reset-password"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Reset password
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 items-center px-4 py-10">
      <div className="w-full space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Personal Finance</h1>
        <p className="text-muted-foreground">
          Month: <span className="font-medium text-foreground">{monthId}</span>
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border p-4">
            <p className="text-xs uppercase text-muted-foreground">Income</p>
            <p className="text-xl font-semibold">
              {currencyFormatter.format(monthly.income)}
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs uppercase text-muted-foreground">Expense</p>
            <p className="text-xl font-semibold">
              {currencyFormatter.format(monthly.expense)}
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs uppercase text-muted-foreground">Remaining</p>
            <p className="text-xl font-semibold">
              {currencyFormatter.format(remaining)}
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs uppercase text-muted-foreground">
              Total Savings
            </p>
            <p className="text-xl font-semibold">
              {currencyFormatter.format(totalSavings)}
            </p>
          </div>
        </div>

        {!hasAnyFinanceData ? (
          <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            No monthly data yet. Enter your values and save to start tracking.
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              className="flex h-8 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={currency}
              onChange={(event) =>
                handleCurrencyChange(event.target.value as CurrencyCode)
              }
            >
              {CURRENCY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <select
              id="theme"
              className="flex h-8 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={theme}
              onChange={(event) =>
                handleThemeChange(event.target.value as AppTheme)
              }
            >
              {THEME_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="income">Income</Label>
            <Input
              id="income"
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
            <Label htmlFor="expense">Expense</Label>
            <Input
              id="expense"
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
            <Label htmlFor="manualSaved">Manual Save</Label>
            <Input
              id="manualSaved"
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
            <Label htmlFor="manualWithdrawn">Manual Withdraw</Label>
            <Input
              id="manualWithdrawn"
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

        <div className="space-y-3 rounded-xl border p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Spending Rule
          </h2>
          <p className="text-sm text-muted-foreground">
            Expense uses current month remaining first, then savings.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quickExpense">Expense amount</Label>
              <Input
                id="quickExpense"
                inputMode="decimal"
                value={quickExpenseAmount}
                onChange={(event) => setQuickExpenseAmount(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Preview breakdown</p>
              <p className="text-sm">
                From current month:{" "}
                {currencyFormatter.format(spendPreview.fromCurrentMonth)}
              </p>
              <p className="text-sm">
                From savings:{" "}
                {currencyFormatter.format(spendPreview.fromSavings)}
              </p>
            </div>
          </div>
          <Button
            onClick={handleApplyQuickExpense}
            disabled={isApplyingExpense || !isQuickExpenseValid}
          >
            {isApplyingExpense ? "Applying..." : "Apply expense by rule"}
          </Button>
        </div>

        {errorMessage ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
            {successMessage}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleSaveFinance}
            disabled={isSaving || !isMonthlyFormValid}
          >
            {isSaving ? "Saving..." : "Save monthly values"}
          </Button>
          <Button variant="destructive" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
