"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CircleDollarSign } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DASHBOARD_NAV_ITEMS } from "@/components/layout/dashboard-navigation";
import { useDashboardFinance } from "@/components/providers/dashboard-finance-provider";
import { cn } from "@/lib/utils";

export function DashboardTopbar() {
  const pathname = usePathname();
  const { currentMonthId } = useDashboardFinance();

  return (
    <header className="sticky top-0 z-20 border-b border-border/50 bg-background/90 px-4 py-3 backdrop-blur md:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-card px-3 py-2 text-sm shadow-sm">
          <CalendarDays
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="text-sm text-muted-foreground">Active month</span>
          <span className="text-sm font-semibold text-foreground">
            {currentMonthId}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="lg" className="rounded-xl">
            <Link
              href="/dashboard/current-month"
              className="flex items-center gap-1.5 leading-none"
            >
              <CircleDollarSign className="size-4" aria-hidden="true" />
              Current Month
            </Link>
          </Button>
        </div>
      </div>

      <nav
        className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 md:hidden"
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
