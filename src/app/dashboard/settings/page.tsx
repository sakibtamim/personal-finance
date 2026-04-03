"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";

import { DashboardAuthGate } from "@/components/dashboard/dashboard-auth-gate";
import { DashboardSection } from "@/components/layout/dashboard-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { upsertUserSettings } from "@/lib/firebase/settings";
import { useAuthStore } from "@/store/use-auth-store";
import { useSettingsStore } from "@/store/use-settings-store";
import {
  CURRENCY_OPTIONS,
  type AppTheme,
  type CurrencyCode,
} from "@/types/settings";

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const currency = useSettingsStore((state) => state.currency);
  const theme = useSettingsStore((state) => state.theme);
  const setCurrency = useSettingsStore((state) => state.setCurrency);
  const setTheme = useSettingsStore((state) => state.setTheme);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSavingCurrency, setIsSavingCurrency] = useState(false);
  const [isSavingTheme, setIsSavingTheme] = useState(false);

  async function handleCurrencyChange(nextCurrency: CurrencyCode) {
    setErrorMessage(null);
    setSuccessMessage(null);
    const previousCurrency = currency;
    setCurrency(nextCurrency);
    setIsSavingCurrency(true);

    if (!user) {
      setIsSavingCurrency(false);
      return;
    }

    try {
      await upsertUserSettings(user.uid, {
        currency: nextCurrency,
        theme,
      });
      setSuccessMessage("Currency updated.");
    } catch {
      setCurrency(previousCurrency);
      setErrorMessage("Unable to update currency setting.");
    } finally {
      setIsSavingCurrency(false);
    }
  }

  async function handleThemeChange(nextTheme: AppTheme) {
    setErrorMessage(null);
    setSuccessMessage(null);
    const previousTheme = theme;
    setTheme(nextTheme);
    setIsSavingTheme(true);

    if (!user) {
      setIsSavingTheme(false);
      return;
    }

    try {
      await upsertUserSettings(user.uid, {
        currency,
        theme: nextTheme,
      });
      setSuccessMessage("Theme updated.");
    } catch {
      setTheme(previousTheme);
      setErrorMessage("Unable to update theme setting.");
    } finally {
      setIsSavingTheme(false);
    }
  }

  const nextTheme: AppTheme = theme === "light" ? "dark" : "light";
  const nextThemeLabel =
    theme === "light" ? "Switch to dark theme" : "Switch to light theme";

  return (
    <DashboardAuthGate>
      <DashboardSection
        title="Settings"
        description="Configure global preferences such as currency and light or dark theme."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-2xl border-border/50 bg-card shadow-sm">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm font-semibold text-foreground">Currency</p>
              <Label
                htmlFor="currency"
                className="text-sm text-muted-foreground"
              >
                Global display currency
              </Label>
              <select
                id="currency"
                value={currency}
                onChange={(event) =>
                  handleCurrencyChange(event.target.value as CurrencyCode)
                }
                disabled={isSavingCurrency}
                className="flex h-9 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                {CURRENCY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <p className="text-sm text-muted-foreground">
                Applies across all dashboard sections.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/50 bg-card shadow-sm">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm font-semibold text-foreground">Theme</p>
              <p className="text-sm text-muted-foreground">
                Choose the interface appearance.
              </p>
              <div className="flex gap-2">
                <Button
                  size="icon-lg"
                  variant="outline"
                  className="rounded-xl border-border/60 bg-card"
                  aria-label={nextThemeLabel}
                  title={nextThemeLabel}
                  onClick={() => handleThemeChange(nextTheme)}
                  disabled={isSavingTheme}
                >
                  {theme === "light" ? (
                    <Moon className="size-4" aria-hidden="true" />
                  ) : (
                    <Sun className="size-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {isSavingTheme
                  ? "Saving theme..."
                  : "Theme preference is global and persistent."}
              </p>
            </CardContent>
          </Card>
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
      </DashboardSection>
    </DashboardAuthGate>
  );
}
