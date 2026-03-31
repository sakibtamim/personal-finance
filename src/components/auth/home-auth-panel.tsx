"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signOutUser } from "@/lib/firebase/auth";
import {
  calculateRemaining,
  getCurrentMonthId,
  subscribeToMonthlyFlow,
  subscribeToTotalSavings,
  upsertMonthlyFlow,
} from "@/lib/firebase/finance";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/use-settings-store";
import { useAuthStore } from "@/store/use-auth-store";
import { DEFAULT_MONTHLY_FLOW } from "@/types/finance";

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

export function HomeAuthPanel() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const clear = useAuthStore((state) => state.clear);
  const currency = useSettingsStore((state) => state.currency);

  const [monthly, setMonthly] = useState(DEFAULT_MONTHLY_FLOW);
  const [totalSavings, setTotalSavings] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FinanceFormState>(defaultFormState);

  const monthId = useMemo(() => getCurrentMonthId(), []);

  const remaining = useMemo(() => calculateRemaining(monthly), [monthly]);

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
          <Button onClick={handleSaveFinance} disabled={isSaving}>
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
