"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CircleDollarSign, Plus, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DASHBOARD_NAV_ITEMS } from "@/components/layout/dashboard-navigation";
import { useDashboardFinance } from "@/components/providers/dashboard-finance-provider";
import { cn } from "@/lib/utils";

export function DashboardTopbar() {
  const pathname = usePathname();
  const { currentMonthId } = useDashboardFinance();

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 px-4 py-2.5 backdrop-blur md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-2.5 md:gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/90 px-3 py-1.5 text-sm shadow-sm">
          <CalendarDays
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Active month
          </span>
          <span className="text-sm font-semibold text-foreground">
            {currentMonthId}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button asChild size="sm" className="gap-1.5 rounded-xl text-[13px]">
            <Link href="/dashboard/current-month">
              <CircleDollarSign className="size-4" aria-hidden="true" />
              Current Month
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="gap-1.5 rounded-xl text-[13px]"
          >
            <Link href="/dashboard/current-month#quick-income-section">
              <Plus className="size-4" aria-hidden="true" />
              Add income
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="gap-1.5 rounded-xl text-[13px]"
          >
            <Link href="/dashboard/current-month#quick-expense-section">
              <Wallet className="size-4" aria-hidden="true" />
              Add expense
            </Link>
          </Button>
        </div>
      </div>

      <nav
        className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 md:hidden"
        aria-label="Mobile dashboard navigation"
      >
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Button
              key={item.href}
              asChild
              size="sm"
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "rounded-lg border border-transparent",
                isActive && "border-border bg-secondary font-medium",
              )}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          );
        })}
      </nav>
    </header>
  );
}
