"use client";

import { useState } from "react";
import { Banknote, Moon, Palette, Sun } from "lucide-react";

import { DashboardAuthGate } from "@/components/dashboard/dashboard-auth-gate";
import { DashboardSection } from "@/components/layout/dashboard-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DashboardStatCard } from "@/components/layout/dashboard-stat-card";
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
        actions={
          <span className="inline-flex items-center rounded-full border border-cyan-500/35 bg-cyan-500/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.13em] text-cyan-700 dark:text-cyan-300">
            Preferences
          </span>
        }
      >
        <div className="animate-rise-fade-delay-1 grid gap-3 sm:grid-cols-2">
          <DashboardStatCard
            label="Currency"
            value={currency}
            hint="Used across dashboard summaries"
            icon={Banknote}
            tone="primary"
          />
          <DashboardStatCard
            label="Theme"
            value={theme === "light" ? "Light" : "Dark"}
            hint="Persisted per account"
            icon={Palette}
            tone="indigo"
          />
        </div>

        <div className="animate-rise-fade-delay-2 grid gap-4 lg:grid-cols-2">
          <Card className="rounded-3xl border-cyan-500/25 bg-linear-to-br from-cyan-500/10 to-card/90 shadow-sm">
            <CardContent className="space-y-3 p-5 md:p-6">
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
                className="flex h-11 w-full rounded-xl border border-input bg-background/80 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
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

          <Card className="rounded-3xl border-indigo-500/25 bg-linear-to-br from-indigo-500/10 to-card/90 shadow-sm">
            <CardContent className="space-y-4 p-5 md:p-6">
              <p className="text-sm font-semibold text-foreground">Theme</p>
              <p className="text-sm text-muted-foreground">
                Choose the interface appearance.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  className="h-11 rounded-xl"
                  onClick={() => handleThemeChange("light")}
                  disabled={isSavingTheme || theme === "light"}
                >
                  <Sun className="size-4" aria-hidden="true" />
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  className="h-11 rounded-xl"
                  onClick={() => handleThemeChange("dark")}
                  disabled={isSavingTheme || theme === "dark"}
                >
                  <Moon className="size-4" aria-hidden="true" />
                  Dark
                </Button>
              </div>
              <div className="flex gap-2 border-t border-border/60 pt-3">
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
                <p className="text-sm text-muted-foreground">
                  Quick toggle between modes.
                </p>
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
          <p className="animate-in fade-in-0 slide-in-from-bottom-1 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive/90 duration-200">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="animate-in fade-in-0 slide-in-from-bottom-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 duration-200 dark:text-emerald-300">
            {successMessage}
          </p>
        ) : null}
      </DashboardSection>
    </DashboardAuthGate>
  );
}
