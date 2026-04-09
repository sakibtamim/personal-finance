"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Moon, Sun } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DASHBOARD_NAV_ITEMS } from "@/components/layout/dashboard-navigation";
import { signOutUser } from "@/lib/firebase/auth";
import { upsertUserSettings } from "@/lib/firebase/settings";
import { useAuthStore } from "@/store/use-auth-store";
import { useSettingsStore } from "@/store/use-settings-store";
import type { AppTheme } from "@/types/settings";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const clear = useAuthStore((state) => state.clear);
  const currency = useSettingsStore((state) => state.currency);
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const nextTheme: AppTheme = theme === "light" ? "dark" : "light";
  const toggleLabel =
    theme === "light" ? "Switch to dark theme" : "Switch to light theme";

  async function handleToggleTheme() {
    if (isSavingTheme) {
      return;
    }

    const previousTheme = theme;
    setTheme(nextTheme);

    if (!user) {
      return;
    }

    setIsSavingTheme(true);
    try {
      await upsertUserSettings(user.uid, {
        currency,
        theme: nextTheme,
      });
    } catch {
      setTheme(previousTheme);
    } finally {
      setIsSavingTheme(false);
    }
  }

  async function handleLogout() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await signOutUser();
      clear();
      router.replace("/auth/sign-in");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border/60 bg-card/88 px-4 py-6 backdrop-blur md:block">
      <div className="flex h-full flex-col">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-xl px-2 py-1"
          aria-label="Go to dashboard"
        >
          <span className="relative inline-flex size-9 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm">
            <Image
              src="/logo.png"
              alt="Finance Hub"
              fill
              sizes="36px"
              className="object-cover scale-[1]"
              priority
            />
          </span>
          <span className="text-sm font-semibold tracking-wide text-foreground">
            Finance Hub
          </span>
        </Link>

        <nav
          className="mt-8 flex flex-1 flex-col gap-2"
          aria-label="Main navigation"
        >
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Button
                key={item.label}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "h-11 justify-start rounded-xl px-3 text-sm transition-colors",
                  isActive &&
                    "border border-border/60 bg-secondary/90 font-medium shadow-sm",
                )}
              >
                <Link
                  href={item.href}
                  className="flex w-full items-center gap-2.5 leading-none"
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="mb-3 flex items-center justify-between rounded-xl border border-border/60 bg-background/75 px-3 py-2">
          <span className="text-xs text-muted-foreground">Theme</span>
          <Button
            size="icon-sm"
            variant="outline"
            className="rounded-lg border-border/60 bg-card"
            aria-label={toggleLabel}
            title={toggleLabel}
            onClick={handleToggleTheme}
            disabled={isSavingTheme}
          >
            {theme === "light" ? (
              <Moon className="size-4" aria-hidden="true" />
            ) : (
              <Sun className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>

        <Button
          variant="outline"
          className="mb-3 h-10 w-full justify-start gap-2.5 rounded-xl border-border/60 bg-background/70"
          onClick={handleLogout}
          disabled={isSigningOut}
        >
          <LogOut className="size-4" aria-hidden="true" />
          {isSigningOut ? "Signing out..." : "Logout"}
        </Button>
      </div>
    </aside>
  );
}
